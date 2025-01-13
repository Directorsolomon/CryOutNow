import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { monitoring } from './monitoring';

interface SessionConfig {
  prefix: string;
  ttl: number; // Time-to-live in seconds
  renewThreshold: number; // Time in seconds before expiry to renew
  maxActiveSessions: number;
  cleanupInterval: number;
}

interface Session {
  id: string;
  userId: string;
  userAgent?: string;
  ip?: string;
  lastActivity: number;
  expiresAt: number;
  data: Record<string, any>;
}

class SessionManager {
  private static instance: SessionManager;
  private redis: Redis;
  private config: SessionConfig;

  private constructor() {
    this.config = {
      prefix: 'session:',
      ttl: 24 * 60 * 60, // 24 hours
      renewThreshold: 60 * 60, // 1 hour
      maxActiveSessions: 5,
      cleanupInterval: 60 * 60, // 1 hour
    };

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.initialize();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await this.redis.ping();
      setInterval(() => this.cleanupExpiredSessions(), this.config.cleanupInterval * 1000);
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-manager-init' });
    }
  }

  public async createSession(userId: string, metadata: { userAgent?: string; ip?: string } = {}): Promise<Session> {
    try {
      // Check number of active sessions for user
      const activeSessions = await this.getActiveSessions(userId);
      if (activeSessions.length >= this.config.maxActiveSessions) {
        // Remove oldest session
        const oldestSession = activeSessions[activeSessions.length - 1];
        await this.destroySession(oldestSession.id);
      }

      const now = Date.now();
      const session: Session = {
        id: uuidv4(),
        userId,
        userAgent: metadata.userAgent,
        ip: metadata.ip,
        lastActivity: now,
        expiresAt: now + (this.config.ttl * 1000),
        data: {},
      };

      const key = this.getSessionKey(session.id);
      await this.redis.setex(key, this.config.ttl, JSON.stringify(session));
      
      // Add to user's session list
      await this.redis.zadd(this.getUserSessionsKey(userId), now, session.id);

      monitoring.logInfo('Session created', { userId, sessionId: session.id });
      return session;
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-creation', userId });
      throw error;
    }
  }

  public async getSession(sessionId: string): Promise<Session | null> {
    try {
      const key = this.getSessionKey(sessionId);
      const data = await this.redis.get(key);
      
      if (!data) {
        return null;
      }

      const session: Session = JSON.parse(data);
      
      // Check if session needs renewal
      if (this.shouldRenewSession(session)) {
        await this.renewSession(sessionId);
      }

      return session;
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-retrieval', sessionId });
      return null;
    }
  }

  public async updateSession(sessionId: string, data: Record<string, any>): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.data = { ...session.data, ...data };
      session.lastActivity = Date.now();

      const key = this.getSessionKey(sessionId);
      await this.redis.setex(key, this.config.ttl, JSON.stringify(session));
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-update', sessionId });
      throw error;
    }
  }

  public async destroySession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (session) {
        const key = this.getSessionKey(sessionId);
        await this.redis.del(key);
        
        // Remove from user's session list
        await this.redis.zrem(this.getUserSessionsKey(session.userId), sessionId);
        
        monitoring.logInfo('Session destroyed', { sessionId, userId: session.userId });
      }
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-destruction', sessionId });
      throw error;
    }
  }

  public async destroyAllUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.getActiveSessions(userId);
      
      for (const session of sessions) {
        await this.destroySession(session.id);
      }
      
      monitoring.logInfo('All user sessions destroyed', { userId });
    } catch (error) {
      monitoring.logError(error as Error, { context: 'all-sessions-destruction', userId });
      throw error;
    }
  }

  private async getActiveSessions(userId: string): Promise<Session[]> {
    try {
      const sessionIds = await this.redis.zrange(this.getUserSessionsKey(userId), 0, -1);
      const sessions: Session[] = [];
      
      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      return sessions.sort((a, b) => b.lastActivity - a.lastActivity);
    } catch (error) {
      monitoring.logError(error as Error, { context: 'active-sessions-retrieval', userId });
      return [];
    }
  }

  private async renewSession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (session) {
        session.lastActivity = Date.now();
        session.expiresAt = Date.now() + (this.config.ttl * 1000);

        const key = this.getSessionKey(sessionId);
        await this.redis.setex(key, this.config.ttl, JSON.stringify(session));
        
        monitoring.logInfo('Session renewed', { sessionId });
      }
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-renewal', sessionId });
    }
  }

  private async cleanupExpiredSessions(): Promise<void> {
    try {
      const pattern = `${this.config.prefix}*`;
      const keys = await this.redis.keys(pattern);
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const session: Session = JSON.parse(data);
          if (session.expiresAt < Date.now()) {
            await this.destroySession(session.id);
          }
        }
      }
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-cleanup' });
    }
  }

  private shouldRenewSession(session: Session): boolean {
    const timeUntilExpiry = session.expiresAt - Date.now();
    return timeUntilExpiry > 0 && timeUntilExpiry <= (this.config.renewThreshold * 1000);
  }

  private getSessionKey(sessionId: string): string {
    return `${this.config.prefix}${sessionId}`;
  }

  private getUserSessionsKey(userId: string): string {
    return `${this.config.prefix}user:${userId}:sessions`;
  }

  public async getSessionStats(): Promise<Record<string, any>> {
    try {
      const pattern = `${this.config.prefix}*`;
      const keys = await this.redis.keys(pattern);
      const now = Date.now();
      let activeSessions = 0;
      let expiredSessions = 0;

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const session: Session = JSON.parse(data);
          if (session.expiresAt < now) {
            expiredSessions++;
          } else {
            activeSessions++;
          }
        }
      }

      return {
        totalSessions: keys.length,
        activeSessions,
        expiredSessions,
      };
    } catch (error) {
      monitoring.logError(error as Error, { context: 'session-stats' });
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
      };
    }
  }
}

export const sessionManager = SessionManager.getInstance();

// Example usage:
// const session = await sessionManager.createSession(userId, { userAgent, ip });
// const existingSession = await sessionManager.getSession(sessionId);
// await sessionManager.updateSession(sessionId, { key: 'value' });
// await sessionManager.destroySession(sessionId);
// await sessionManager.destroyAllUserSessions(userId);
// const stats = await sessionManager.getSessionStats(); 
