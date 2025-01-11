import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { monitoring } from './monitoring';

const execAsync = promisify(exec);

interface BackupConfig {
  backupDir: string;
  retentionDays: number;
  compressionLevel: number;
  schedule: {
    full: string; // cron expression for full backups
    incremental: string; // cron expression for incremental backups
  };
}

interface BackupMetadata {
  id: string;
  timestamp: number;
  type: 'full' | 'incremental';
  size: number;
  status: 'success' | 'failed';
  error?: string;
}

class BackupService {
  private static instance: BackupService;
  private backups: BackupMetadata[] = [];
  private isRunning = false;

  private config: BackupConfig = {
    backupDir: process.env.BACKUP_DIR || './backups',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    compressionLevel: 9,
    schedule: {
      full: '0 0 * * 0', // Every Sunday at midnight
      incremental: '0 0 * * 1-6', // Every other day at midnight
    },
  };

  private constructor() {
    this.initialize();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Create backup directory if it doesn't exist
      await fs.mkdir(this.config.backupDir, { recursive: true });
      
      // Load existing backup metadata
      await this.loadBackupMetadata();
      
      // Schedule cleanup of old backups
      setInterval(() => this.cleanupOldBackups(), 24 * 60 * 60 * 1000); // Daily
    } catch (error) {
      monitoring.logError(error as Error, { context: 'backup-service-init' });
    }
  }

  private async loadBackupMetadata(): Promise<void> {
    try {
      const metadataPath = path.join(this.config.backupDir, 'metadata.json');
      const exists = await fs.access(metadataPath).then(() => true).catch(() => false);
      
      if (exists) {
        const data = await fs.readFile(metadataPath, 'utf-8');
        this.backups = JSON.parse(data);
      }
    } catch (error) {
      monitoring.logError(error as Error, { context: 'backup-metadata-load' });
    }
  }

  private async saveBackupMetadata(): Promise<void> {
    try {
      const metadataPath = path.join(this.config.backupDir, 'metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(this.backups, null, 2));
    } catch (error) {
      monitoring.logError(error as Error, { context: 'backup-metadata-save' });
    }
  }

  public async createBackup(type: 'full' | 'incremental' = 'full'): Promise<BackupMetadata> {
    if (this.isRunning) {
      throw new Error('A backup is already in progress');
    }

    this.isRunning = true;
    const timestamp = Date.now();
    const id = `backup_${type}_${timestamp}`;
    const filename = `${id}.sql.gz`;
    const filepath = path.join(this.config.backupDir, filename);

    const backup: BackupMetadata = {
      id,
      timestamp,
      type,
      size: 0,
      status: 'failed',
    };

    try {
      monitoring.logInfo(`Starting ${type} backup`, { id });

      // Create backup using pg_dump
      const command = `pg_dump \${process.env.DATABASE_URL} | gzip -${this.config.compressionLevel} > ${filepath}`;
      await execAsync(command);

      // Get backup size
      const stats = await fs.stat(filepath);
      backup.size = stats.size;
      backup.status = 'success';

      // Add to backups list and save metadata
      this.backups.unshift(backup);
      await this.saveBackupMetadata();

      monitoring.logInfo(`Backup completed successfully`, { id, size: backup.size });
      return backup;
    } catch (error) {
      backup.error = (error as Error).message;
      monitoring.logError(error as Error, { context: 'backup-creation', id });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  public async restoreBackup(backupId: string): Promise<void> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    const filepath = path.join(this.config.backupDir, `${backupId}.sql.gz`);
    
    try {
      monitoring.logInfo(`Starting backup restoration`, { backupId });

      // Restore backup using psql
      const command = `gunzip -c ${filepath} | psql \${process.env.DATABASE_URL}`;
      await execAsync(command);

      monitoring.logInfo(`Backup restored successfully`, { backupId });
    } catch (error) {
      monitoring.logError(error as Error, { context: 'backup-restoration', backupId });
      throw error;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
      const oldBackups = this.backups.filter(backup => backup.timestamp < cutoffTime);

      for (const backup of oldBackups) {
        const filepath = path.join(this.config.backupDir, `${backup.id}.sql.gz`);
        await fs.unlink(filepath);
        
        this.backups = this.backups.filter(b => b.id !== backup.id);
      }

      if (oldBackups.length > 0) {
        await this.saveBackupMetadata();
        monitoring.logInfo(`Cleaned up ${oldBackups.length} old backups`);
      }
    } catch (error) {
      monitoring.logError(error as Error, { context: 'backup-cleanup' });
    }
  }

  public getBackups(): BackupMetadata[] {
    return this.backups;
  }

  public getBackupStats(): Record<string, any> {
    const totalSize = this.backups.reduce((sum, backup) => sum + backup.size, 0);
    const successfulBackups = this.backups.filter(b => b.status === 'success').length;
    const failedBackups = this.backups.filter(b => b.status === 'failed').length;

    return {
      totalBackups: this.backups.length,
      successfulBackups,
      failedBackups,
      totalSize,
      oldestBackup: this.backups[this.backups.length - 1]?.timestamp,
      newestBackup: this.backups[0]?.timestamp,
    };
  }
}

export const backupService = BackupService.getInstance();

// Example usage:
// await backupService.createBackup('full');
// const backups = backupService.getBackups();
// const stats = backupService.getBackupStats();
// await backupService.restoreBackup(backupId); 