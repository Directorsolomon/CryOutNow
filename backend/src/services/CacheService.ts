import Redis from 'ioredis';
import { logger } from '../utils/logger';

class CacheService {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour in seconds

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  private generateKey(key: string): string {
    return `cryoutnow:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(this.generateKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(this.generateKey(key), ttl, serializedValue);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(this.generateKey(key));
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(this.generateKey(pattern));
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
    }
  }

  // Cache middleware for Express
  middleware(ttl: number = this.defaultTTL) {
    return async (req: any, res: any, next: any) => {
      if (req.method !== 'GET') {
        return next();
      }

      const key = `${req.originalUrl}`;

      try {
        const cachedData = await this.get(key);
        if (cachedData) {
          return res.json(cachedData);
        }

        // Store original res.json method
        const originalJson = res.json.bind(res);

        // Override res.json method to cache the response
        res.json = (data: any) => {
          this.set(key, data, ttl);
          return originalJson(data);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Helper methods for specific features
  async cacheUserProfile(userId: string, data: any): Promise<void> {
    await this.set(`user:${userId}:profile`, data, 3600); // 1 hour
  }

  async cachePrayerChain(chainId: string, data: any): Promise<void> {
    await this.set(`chain:${chainId}`, data, 300); // 5 minutes
  }

  async cacheGroupData(groupId: string, data: any): Promise<void> {
    await this.set(`group:${groupId}`, data, 600); // 10 minutes
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}:*`);
  }

  async invalidateChainCache(chainId: string): Promise<void> {
    await this.invalidatePattern(`chain:${chainId}:*`);
  }

  async invalidateGroupCache(groupId: string): Promise<void> {
    await this.invalidatePattern(`group:${groupId}:*`);
  }
}

export const cacheService = new CacheService(); 