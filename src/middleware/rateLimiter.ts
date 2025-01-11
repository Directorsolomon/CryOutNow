interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests allowed in the window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
}

const ENDPOINTS_CONFIG: Record<string, RateLimitConfig> = {
  '/api/auth': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts
  },
  '/api/prayer-chains': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  '/api/reports': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 requests per 5 minutes
  },
}

export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  // Find the most specific matching configuration
  const matchingEndpoint = Object.keys(ENDPOINTS_CONFIG)
    .find(key => endpoint.startsWith(key))

  return matchingEndpoint 
    ? ENDPOINTS_CONFIG[matchingEndpoint] 
    : DEFAULT_CONFIG
}

export function isRateLimited(endpoint: string, clientId: string): boolean {
  const now = Date.now()
  const config = getRateLimitConfig(endpoint)
  const key = `${endpoint}:${clientId}`
  const record = store[key]

  // Clean up expired records
  Object.keys(store).forEach(k => {
    if (store[k].resetTime < now) {
      delete store[k]
    }
  })

  if (!record || record.resetTime < now) {
    // First request or expired window
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    return false
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return true
  }

  // Increment request count
  record.count++
  return false
}

export function getRateLimitHeaders(endpoint: string, clientId: string) {
  const key = `${endpoint}:${clientId}`
  const record = store[key]
  const config = getRateLimitConfig(endpoint)

  if (!record) {
    return {
      'X-RateLimit-Limit': config.maxRequests,
      'X-RateLimit-Remaining': config.maxRequests,
      'X-RateLimit-Reset': Date.now() + config.windowMs,
    }
  }

  return {
    'X-RateLimit-Limit': config.maxRequests,
    'X-RateLimit-Remaining': Math.max(0, config.maxRequests - record.count),
    'X-RateLimit-Reset': record.resetTime,
  }
}

// Example usage in an API route handler:
// if (isRateLimited(req.path, req.ip)) {
//   const headers = getRateLimitHeaders(req.path, req.ip)
//   return res.status(429).set(headers).json({
//     error: 'Too Many Requests',
//     message: 'Please try again later',
//   })
// } 