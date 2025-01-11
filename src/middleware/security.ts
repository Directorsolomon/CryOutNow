interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableNoSniff: boolean;
  enableXSSProtection: boolean;
  enableFrameGuard: boolean;
}

const DEFAULT_CONFIG: SecurityConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableNoSniff: true,
  enableXSSProtection: true,
  enableFrameGuard: true,
}

export function getSecurityHeaders(config: SecurityConfig = DEFAULT_CONFIG) {
  const headers: Record<string, string> = {}

  if (config.enableCSP) {
    // Content Security Policy
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // For development
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  }

  if (config.enableHSTS) {
    // HTTP Strict Transport Security
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
  }

  if (config.enableNoSniff) {
    // X-Content-Type-Options
    headers['X-Content-Type-Options'] = 'nosniff'
  }

  if (config.enableXSSProtection) {
    // X-XSS-Protection
    headers['X-XSS-Protection'] = '1; mode=block'
  }

  if (config.enableFrameGuard) {
    // X-Frame-Options
    headers['X-Frame-Options'] = 'DENY'
  }

  // Additional security headers
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  headers['Permissions-Policy'] = [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()',
  ].join(', ')

  return headers
}

export function validateInput(input: string): string {
  // Basic XSS prevention by escaping HTML special characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and sanitize filename
  return filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/^\.+|\.+$/g, '')
}

// Example usage in an API route handler:
// app.use((req, res, next) => {
//   const securityHeaders = getSecurityHeaders()
//   Object.entries(securityHeaders).forEach(([key, value]) => {
//     res.setHeader(key, value)
//   })
//   next()
// }) 