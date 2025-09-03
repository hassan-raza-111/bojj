import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError } from './error.middleware';
import { logger } from '../utils/logger';
import { Socket } from 'socket.io';

// ... existing code ...

// Socket.IO authentication middleware
export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error'));
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || !decoded.userId) {
      return next(new Error('Invalid token'));
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return next(new Error('User not found'));
    }

    // Check if user is active
    if (user.status === 'SUSPENDED') {
      return next(new Error('Account suspended'));
    }

    // Attach user to socket
    socket.data.user = user;

    logger.info(`Socket authenticated: ${user.id} (${user.email})`);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new Error('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new Error('Token expired'));
    } else {
      next(new Error('Authentication error'));
    }
  }
};

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

// JWT Secret from centralized config
import { config } from '../config';
const JWT_SECRET = config.jwt.secret;

// Verify JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError(401, 'Access token required');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || !decoded.userId) {
      throw new AppError(401, 'Invalid token');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    // Check if user is active
    if (user.status === 'SUSPENDED') {
      throw new AppError(403, 'Account suspended');
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    logger.info(`User authenticated: ${user.id} (${user.email})`);
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

// Optional authentication (user can be authenticated but it's not required)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.userId) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
          },
        });
        if (user && user.status !== 'SUSPENDED') {
          req.user = user;
          req.token = token;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Access denied: User ${req.user.id} (${req.user.role}) tried to access ${req.method} ${req.path}`
      );
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};

// Specific role requirements
export const requireCustomer = requireRole(['CUSTOMER']);
export const requireVendor = requireRole(['VENDOR']);
export const requireAdmin = requireRole(['ADMIN']);
export const requireCustomerOrVendor = requireRole(['CUSTOMER', 'VENDOR']);
export const requireAuthenticated = requireRole([
  'CUSTOMER',
  'VENDOR',
  'ADMIN',
]);

// Check if user owns the resource
export const requireOwnership = (
  resourceType: string,
  idParam: string = 'id'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError(401, 'Authentication required'));
      }

      const resourceId = req.params[idParam];

      if (!resourceId) {
        return next(new AppError(400, 'Resource ID required'));
      }

      let resource;

      switch (resourceType) {
        case 'user':
          resource = await prisma.user.findUnique({
            where: { id: resourceId },
            select: { id: true, role: true },
          });
          break;
        case 'job':
          resource = await prisma.job.findUnique({
            where: { id: resourceId },
            select: { id: true, customerId: true, assignedVendorId: true },
          });
          break;
        case 'service':
          resource = await prisma.service.findUnique({
            where: { id: resourceId },
            select: { id: true, vendorId: true },
          });
          break;
        case 'payment':
          resource = await prisma.payment.findUnique({
            where: { id: resourceId },
            select: { id: true, customerId: true, vendorId: true },
          });
          break;
        default:
          return next(new AppError(400, 'Invalid resource type'));
      }

      if (!resource) {
        return next(new AppError(404, 'Resource not found'));
      }

      // Admin can access everything
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Check ownership based on resource type
      let hasAccess = false;

      switch (resourceType) {
        case 'user':
          hasAccess = resource.id === req.user.id;
          break;
        case 'job':
          if ('customerId' in resource && 'assignedVendorId' in resource) {
            hasAccess =
              resource.customerId === req.user.id ||
              resource.assignedVendorId === req.user.id;
          }
          break;
        case 'service':
          if ('vendorId' in resource) {
            hasAccess = resource.vendorId === req.user.id;
          }
          break;
        case 'payment':
          if ('customerId' in resource && 'vendorId' in resource) {
            hasAccess =
              resource.customerId === req.user.id ||
              resource.vendorId === req.user.id;
          }
          break;
      }

      if (!hasAccess) {
        logger.warn(
          `Access denied: User ${req.user.id} tried to access ${resourceType} ${resourceId}`
        );
        return next(new AppError(403, 'Access denied'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Rate limiting per user (more restrictive than IP-based)
export const userRateLimit = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated users
    }

    const userId = req.user.id;
    const now = Date.now();
    const userData = userRequests.get(userId);

    if (!userData || now > userData.resetTime) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userData.count >= maxRequests) {
      logger.warn(`Rate limit exceeded for user: ${userId}`);
      return next(
        new AppError(429, 'Rate limit exceeded. Please try again later.')
      );
    }

    userData.count++;
    next();
  };
};
