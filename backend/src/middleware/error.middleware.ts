import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { config } from '../config';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    const validationErrors = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      statusCode: 400,
      details: validationErrors,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      statusCode: 401,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      statusCode: 401,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Resource already exists',
        statusCode: 409,
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
        statusCode: 404,
      });
    }
  }

  // Default error
  const isProduction = config.env === 'production';

  return res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message,
    statusCode: 500,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
