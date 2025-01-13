import { api } from './api'

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
}

const DEFAULT_TTL = 300 // 5 minutes

class CacheService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  private generateKey(endpoint: string, params?: Record<string, any>): string {
    if (params) {
      return `${endpoint}:${JSON.stringify(params)}`
    }
    return endpoint
  }

  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl * 1000
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config: CacheConfig = {}
  ): Promise<T> {
    const key = config.key || this.generateKey(endpoint, params)
    const ttl = config.ttl || DEFAULT_TTL
    const cached = this.cache.get(key)

    if (cached && !this.isExpired(cached.timestamp, cached.ttl)) {
      return cached.data as T
    }

    const response = await api.get<T>(endpoint, { params })
    this.cache.set(key, {
      data: response.data,
      timestamp: Date.now(),
      ttl,
    })

    return response.data
  }

  async post<T>(
    endpoint: string,
    data: any,
    invalidatePatterns: string[] = []
  ): Promise<T> {
    const response = await api.post<T>(endpoint, data)
    
    // Invalidate related cache entries
    this.invalidateByPatterns(invalidatePatterns)
    
    return response.data
  }

  async put<T>(
    endpoint: string,
    data: any,
    invalidatePatterns: string[] = []
  ): Promise<T> {
    const response = await api.put<T>(endpoint, data)
    
    // Invalidate related cache entries
    this.invalidateByPatterns(invalidatePatterns)
    
    return response.data
  }

  async delete<T>(
    endpoint: string,
    invalidatePatterns: string[] = []
  ): Promise<T> {
    const response = await api.delete<T>(endpoint)
    
    // Invalidate related cache entries
    this.invalidateByPatterns(invalidatePatterns)
    
    return response.data
  }

  invalidateByPatterns(patterns: string[]): void {
    if (!patterns.length) return

    for (const [key] of this.cache) {
      if (patterns.some(pattern => key.startsWith(pattern))) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

export const cacheService = new CacheService()

// Example usage:
// const data = await cacheService.get('/prayer-chains', { status: 'active' }, { ttl: 600 })
// await cacheService.post('/prayer-chains', newChain, ['/prayer-chains'])
// await cacheService.put('/prayer-chains/123', updates, ['/prayer-chains'])
// await cacheService.delete('/prayer-chains/123', ['/prayer-chains']) 
