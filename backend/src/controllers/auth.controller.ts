import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// JWT configuration - Use centralized config
import { config } from '../config';
const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.expiresIn;
const REFRESH_TOKEN_EXPIRES_IN = config.jwt.refreshExpiresIn;

// Generate JWT token
const generateToken = (userId: string, expiresIn: string = JWT_EXPIRES_IN) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: expiresIn as any });
};

// Generate refresh token
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
  });
};

// User registration with email and password
export const register: RequestHandler = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role = 'CUSTOMER',
      bio,
      phone,
      location,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new AppError(
        400,
        'Email, password, firstName, and lastName are required'
      );
    }

    if (password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        bio: bio || null,
        phone: phone || null,
        location: location || null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    logger.info(`User registered: ${user.id} (${user.email})`);

    res.status(201).json({
      success: true,
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: JWT_EXPIRES_IN,
        },
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// User login with email and password
export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        password: true,
        bio: true,
        phone: true,
        location: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError(403, 'Account suspended');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.id} (${user.email})`);

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: JWT_EXPIRES_IN,
        },
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
export const refreshToken: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError(400, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || decoded.type !== 'refresh') {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'Refresh token expired or invalid');
    }

    // Generate new access token
    const newAccessToken = generateToken(storedToken.userId);

    logger.info(`Token refreshed for user: ${storedToken.userId}`);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: JWT_EXPIRES_IN,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Logout (revoke refresh token)
export const logout: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      // Revoke refresh token
      await prisma.refreshToken.deleteMany({
        where: { token },
      });
    }

    logger.info(`User logged out: ${req.user?.id}`);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Update current user profile
export const updateCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.id;
    delete updateData.email;
    delete updateData.role;
    delete updateData.status;
    delete updateData.password;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        status: true,
        updatedAt: true,
      },
    });

    logger.info(`User profile updated: ${user.id}`);

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get comprehensive profile data for current user
export const getProfileData: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const userId = req.user.id;

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Get user statistics based on role
    let stats: any = {};

    if (user.role === 'CUSTOMER') {
      // Customer stats
      const [postedJobs, completedJobs, activeJobs, totalSpent, recentJobs] =
        await Promise.all([
          prisma.job.count({ where: { customerId: userId } }),
          prisma.job.count({
            where: { customerId: userId, status: 'COMPLETED' },
          }),
          prisma.job.count({
            where: { customerId: userId, status: 'IN_PROGRESS' },
          }),
          prisma.payment.aggregate({
            where: { customerId: userId, status: 'RELEASED' },
            _sum: { amount: true },
          }),
          prisma.job.findMany({
            where: { customerId: userId },
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              budget: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
        ]);

      stats = {
        postedJobs,
        completedJobs,
        activeJobs,
        totalSpent: totalSpent._sum.amount || 0,
        recentJobs,
      };
    }

    // Get recent activity (payments, reviews, etc.)
    const [recentPayments, recentReviews] = await Promise.all([
      prisma.payment.findMany({
        where: { customerId: userId },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.review.findMany({
        where: { reviewerId: userId },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        user,
        stats,
        recentActivity: {
          payments: recentPayments,
          reviews: recentReviews,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture (placeholder for future implementation)
export const uploadProfilePicture: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // For now, just return success - file upload will be implemented later
    res.json({
      success: true,
      message: 'Profile picture upload endpoint ready',
      data: {
        profilePictureUrl: null, // Will be implemented with file upload
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete account
export const deleteAccount: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { password } = req.body;

    if (!password) {
      throw new AppError(400, 'Password is required to delete account');
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true, email: true },
    });

    if (!user?.password) {
      throw new AppError(400, 'User not found');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError(400, 'Invalid password');
    }

    // Soft delete - update status to DELETED
    await prisma.user.update({
      where: { id: req.user.id },
      data: { status: 'DELETED' },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user.id },
    });

    logger.info(`Account deleted: ${req.user.id} (${user.email})`);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError(400, 'Current and new password are required');
    }

    if (newPassword.length < 6) {
      throw new AppError(
        400,
        'New password must be at least 6 characters long'
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      throw new AppError(400, 'User not found or no password set');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new AppError(400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Request password reset
export const requestPasswordReset: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError(400, 'Email is required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (user) {
      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token
      await prisma.passwordReset.create({
        data: {
          token: resetToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // In production, send email here
      logger.info(`Password reset requested for user: ${user.id}`);
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password with token
export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new AppError(400, 'Token and new password are required');
    }

    if (newPassword.length < 6) {
      throw new AppError(
        400,
        'New password must be at least 6 characters long'
      );
    }

    // Verify reset token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || decoded.type !== 'reset') {
      throw new AppError(400, 'Invalid reset token');
    }

    // Check if token exists and is valid
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new AppError(400, 'Reset token expired or invalid');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    // Delete reset token
    await prisma.passwordReset.delete({
      where: { token },
    });

    logger.info(`Password reset for user: ${resetRecord.userId}`);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
