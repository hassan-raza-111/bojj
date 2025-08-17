import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error.middleware';

// Generic validation middleware using Zod schemas
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = schema.parse(req.body);
      }

      // Validate query parameters if schema has query validation
      if (req.query && Object.keys(req.query).length > 0) {
        // For query validation, you can create a separate schema
        // This is a basic example - you can extend this as needed
        const querySchema = z.object({
          page: z
            .string()
            .optional()
            .transform((val) => parseInt(val || '1')),
          limit: z
            .string()
            .optional()
            .transform((val) => parseInt(val || '10')),
          search: z.string().optional(),
          sortBy: z.string().optional(),
          sortOrder: z.enum(['asc', 'desc']).optional(),
        });

        req.query = querySchema.parse(req.query);
      }

      // Validate URL parameters if needed
      if (req.params && Object.keys(req.params).length > 0) {
        // You can create parameter-specific schemas here
        // For now, we'll just pass through
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return next(new AppError(400, 'Validation failed', validationErrors));
      }
      next(error);
    }
  };
};

// Validate specific parts of the request
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return next(
          new AppError(400, 'Request body validation failed', validationErrors)
        );
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return next(
          new AppError(
            400,
            'Query parameters validation failed',
            validationErrors
          )
        );
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return next(
          new AppError(
            400,
            'URL parameters validation failed',
            validationErrors
          )
        );
      }
      next(error);
    }
  };
};

// Custom validation for specific use cases
export const validatePagination = () => {
  const paginationSchema = z.object({
    page: z
      .string()
      .optional()
      .transform((val) => {
        const num = parseInt(val || '1');
        return num > 0 ? num : 1;
      }),
    limit: z
      .string()
      .optional()
      .transform((val) => {
        const num = parseInt(val || '10');
        return num > 0 && num <= 100 ? num : 10; // Max 100 items per page
      }),
  });

  return validateQuery(paginationSchema);
};

export const validateSearch = () => {
  const searchSchema = z.object({
    search: z
      .string()
      .optional()
      .transform((val) => val?.trim() || ''),
    category: z.string().optional(),
    location: z.string().optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => {
        const num = parseFloat(val || '0');
        return isNaN(num) ? 0 : num;
      }),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => {
        const num = parseFloat(val || '0');
        return isNaN(num) ? 0 : num;
      }),
  });

  return validateQuery(searchSchema);
};

// File upload validation
export const validateFileUpload = (
  maxSize: number = 5 * 1024 * 1024,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return next(new AppError(400, 'No files uploaded'));
      }

      const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files);

      for (const file of files) {
        if (file.size > maxSize) {
          return next(
            new AppError(
              400,
              `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
            )
          );
        }

        if (!allowedTypes.includes(file.mimetype)) {
          return next(
            new AppError(
              400,
              `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
            )
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Sanitize input data (basic XSS protection)
export const sanitizeInput = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize body
      if (req.body) {
        Object.keys(req.body).forEach((key) => {
          if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key]
              .replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                ''
              )
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
              .trim();
          }
        });
      }

      // Sanitize query parameters
      if (req.query) {
        Object.keys(req.query).forEach((key) => {
          if (typeof req.query[key] === 'string') {
            req.query[key] = req.query[key]
              .replace(
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                ''
              )
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
              .trim();
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
