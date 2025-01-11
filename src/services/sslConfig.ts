import fs from 'fs';
import path from 'path';
import { monitoring } from './monitoring';

interface SSLConfig {
  cert: string;
  key: string;
  ca?: string;
  ciphers?: string[];
  minVersion?: string;
  maxVersion?: string;
  preferServerCiphers?: boolean;
  sessionTimeout?: number;
  sessionTickets?: boolean;
}

class SSLConfigService {
  private static instance: SSLConfigService;
  private config: SSLConfig;

  private constructor() {
    this.config = {
      cert: process.env.SSL_CERT_PATH || path.join(__dirname, '../../ssl/cert.pem'),
      key: process.env.SSL_KEY_PATH || path.join(__dirname, '../../ssl/key.pem'),
      ca: process.env.SSL_CA_PATH,
      ciphers: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
      ],
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
      preferServerCiphers: true,
      sessionTimeout: 3600,
      sessionTickets: true,
    };
  }

  public static getInstance(): SSLConfigService {
    if (!SSLConfigService.instance) {
      SSLConfigService.instance = new SSLConfigService();
    }
    return SSLConfigService.instance;
  }

  public async validateCertificates(): Promise<boolean> {
    try {
      // Check if certificate files exist
      await fs.promises.access(this.config.cert);
      await fs.promises.access(this.config.key);
      
      if (this.config.ca) {
        await fs.promises.access(this.config.ca);
      }

      // Read certificate expiration
      const certContent = await fs.promises.readFile(this.config.cert);
      const cert = new (require('crypto').X509Certificate)(certContent);
      
      // Check if certificate is expired or about to expire
      const expirationDate = new Date(cert.validTo);
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiration <= 0) {
        monitoring.logError(new Error('SSL certificate has expired'), { context: 'ssl-config' });
        return false;
      }
      
      if (daysUntilExpiration <= 30) {
        monitoring.logWarning('SSL certificate will expire soon', { 
          context: 'ssl-config',
          daysUntilExpiration 
        });
      }

      return true;
    } catch (error) {
      monitoring.logError(error as Error, { context: 'ssl-config-validation' });
      return false;
    }
  }

  public getConfig(): SSLConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SSLConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  public getSecureContextOptions(): Record<string, any> {
    return {
      cert: fs.readFileSync(this.config.cert),
      key: fs.readFileSync(this.config.key),
      ca: this.config.ca ? fs.readFileSync(this.config.ca) : undefined,
      ciphers: this.config.ciphers?.join(':'),
      minVersion: this.config.minVersion,
      maxVersion: this.config.maxVersion,
      preferServerCiphers: this.config.preferServerCiphers,
      sessionTimeout: this.config.sessionTimeout,
      sessionTickets: this.config.sessionTickets,
    };
  }

  public async rotateCertificates(newCertPath: string, newKeyPath: string, newCaPath?: string): Promise<void> {
    try {
      // Validate new certificates
      await fs.promises.access(newCertPath);
      await fs.promises.access(newKeyPath);
      
      if (newCaPath) {
        await fs.promises.access(newCaPath);
      }

      // Backup current certificates
      const timestamp = Date.now();
      const backupDir = path.join(__dirname, '../../ssl/backup', timestamp.toString());
      await fs.promises.mkdir(backupDir, { recursive: true });

      await fs.promises.copyFile(this.config.cert, path.join(backupDir, 'cert.pem'));
      await fs.promises.copyFile(this.config.key, path.join(backupDir, 'key.pem'));
      
      if (this.config.ca) {
        await fs.promises.copyFile(this.config.ca, path.join(backupDir, 'ca.pem'));
      }

      // Update configuration with new certificates
      this.updateConfig({
        cert: newCertPath,
        key: newKeyPath,
        ca: newCaPath,
      });

      monitoring.logInfo('SSL certificates rotated successfully', { timestamp });
    } catch (error) {
      monitoring.logError(error as Error, { context: 'ssl-certificate-rotation' });
      throw error;
    }
  }
}

export const sslConfigService = SSLConfigService.getInstance();

// Example usage:
// await sslConfigService.validateCertificates();
// const config = sslConfigService.getConfig();
// const secureContext = sslConfigService.getSecureContextOptions();
// await sslConfigService.rotateCertificates(newCertPath, newKeyPath); 