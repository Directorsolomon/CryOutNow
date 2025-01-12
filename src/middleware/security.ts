import { NextFunction, Request, Response } from 'express';

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
};

export const securityMiddleware = {
  headers: (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  },

  validateInput: (req: Request, res: Response, next: NextFunction) => {
    const sanitizeInput = (input: any): any => {
      if (typeof input === 'string') {
        return input.replace(/[<>]/g, '');
      }
      return input;
    };

    req.body = JSON.parse(JSON.stringify(req.body), (_, value) => sanitizeInput(value));
    next();
  }
};

export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and sanitize filename
  return filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/^\.+|\.+$/g, '')
}