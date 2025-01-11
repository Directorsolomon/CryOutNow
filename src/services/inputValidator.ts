import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { monitoring } from './monitoring';

interface ValidationOptions {
  trim?: boolean;
  stripHtml?: boolean;
  maxLength?: number;
  customSanitizer?: (value: string) => string;
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

class InputValidator {
  private static instance: InputValidator;
  
  private sanitizeHtmlOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href', 'target']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  };

  private commonSchemas = {
    email: z.string().email().max(255),
    password: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    url: z.string().url(),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/),
    date: z.string().datetime(),
  };

  private constructor() {}

  public static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  public validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: ValidationError[] } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        monitoring.logWarning('Validation failed', { errors });
        return { success: false, errors };
      }
      monitoring.logError(error as Error, { context: 'validation' });
      throw error;
    }
  }

  public sanitize(value: string, options: ValidationOptions = {}): string {
    try {
      let sanitized = value;

      if (options.trim) {
        sanitized = sanitized.trim();
      }

      if (options.stripHtml) {
        sanitized = sanitizeHtml(sanitized, this.sanitizeHtmlOptions);
      }

      if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.slice(0, options.maxLength);
      }

      if (options.customSanitizer) {
        sanitized = options.customSanitizer(sanitized);
      }

      return sanitized;
    } catch (error) {
      monitoring.logError(error as Error, { context: 'sanitization' });
      return value;
    }
  }

  public validateAndSanitize<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    options: ValidationOptions = {}
  ): { success: boolean; data?: T; errors?: ValidationError[] } {
    try {
      // First sanitize string values
      const sanitizedData = this.sanitizeObject(data, options);
      
      // Then validate
      return this.validate(schema, sanitizedData);
    } catch (error) {
      monitoring.logError(error as Error, { context: 'validate-and-sanitize' });
      throw error;
    }
  }

  private sanitizeObject(data: unknown, options: ValidationOptions): unknown {
    if (typeof data === 'string') {
      return this.sanitize(data, options);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeObject(item, options));
    }

    if (data && typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.sanitizeObject(value, options);
      }
      return result;
    }

    return data;
  }

  public getCommonSchema(type: keyof typeof this.commonSchemas): z.ZodSchema {
    return this.commonSchemas[type];
  }

  public createSchema(definition: Record<string, z.ZodSchema>): z.ZodSchema {
    return z.object(definition);
  }

  public extendSchema<T extends z.ZodSchema>(
    baseSchema: T,
    extension: Partial<z.ZodSchema>
  ): z.ZodSchema {
    return baseSchema.extend(extension);
  }

  public validateEmail(email: string): boolean {
    return this.validate(this.commonSchemas.email, email).success;
  }

  public validatePassword(password: string): boolean {
    return this.validate(this.commonSchemas.password, password).success;
  }

  public validateUsername(username: string): boolean {
    return this.validate(this.commonSchemas.username, username).success;
  }

  public validateUrl(url: string): boolean {
    return this.validate(this.commonSchemas.url, url).success;
  }

  public validatePhone(phone: string): boolean {
    return this.validate(this.commonSchemas.phone, phone).success;
  }

  public validateDate(date: string): boolean {
    return this.validate(this.commonSchemas.date, date).success;
  }

  public escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  public stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }
}

export const inputValidator = InputValidator.getInstance();

// Example usage:
// const userSchema = inputValidator.createSchema({
//   email: inputValidator.getCommonSchema('email'),
//   password: inputValidator.getCommonSchema('password'),
//   username: inputValidator.getCommonSchema('username'),
// });
//
// const result = inputValidator.validateAndSanitize(userSchema, userData, {
//   trim: true,
//   stripHtml: true,
// });
//
// if (result.success) {
//   // Process validated and sanitized data
// } else {
//   // Handle validation errors
// } 