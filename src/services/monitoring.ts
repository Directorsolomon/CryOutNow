import { getPerformance, trace } from 'firebase/performance';
import { app } from '../lib/firebase';
import { trackError } from './analytics';

const perf = getPerformance(app);

// Performance monitoring
export const startTrace = (traceName: string) => {
  return trace(perf, traceName);
};

// Error monitoring
class ErrorMonitor {
  private static instance: ErrorMonitor;
  private isInitialized = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupErrorHandlers();
    }
  }

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  private setupErrorHandlers() {
    if (this.isInitialized) return;

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.logError('uncaught_error', error || new Error(message as string), {
        source,
        line: lineno,
        column: colno,
      });
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      this.logError('unhandled_promise_rejection', event.reason, {
        promise_value: event.reason,
      });
    };

    // React error boundary fallback
    this.isInitialized = true;
  }

  public logError(code: string, error: Error, context?: Record<string, any>) {
    console.error('[ErrorMonitor]', { code, error, context });

    trackError(code, error.message, {
      stack: error.stack,
      ...context,
    });

    // You can add additional error reporting services here
    // For example, Sentry, LogRocket, etc.
  }

  public setUser(userId: string) {
    // Set user context for error tracking
    this.logError('info', new Error('User context set'), { userId });
  }
}

export const errorMonitor = ErrorMonitor.getInstance();

// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    errorMonitor.logError(code, this, context);
  }
}

// Performance monitoring hooks
export const withPerformanceMonitoring = <T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    const perfTrace = startTrace(name);
    try {
      const result = await fn(...args);
      perfTrace.stop();
      return result;
    } catch (error) {
      perfTrace.stop();
      throw error;
    }
  }) as T;
}; 
