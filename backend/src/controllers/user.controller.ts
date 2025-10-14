import { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Create user profile (for admin use)
export const createUserProfile: RequestHandler = async (req, res, next) => {
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
    if (!email || !firstName || !lastName) {
      throw new AppError(400, 'Email, firstName, and lastName are required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists with this email');
    }

    // Create user data
    const userData: any = {
      email,
      firstName,
      lastName,
      role,
      bio: bio || null,
      phone: phone || null,
      location: location || null,
      status: 'ACTIVE',
    };

    // Add password if provided
    if (password) {
      const bcrypt = require('bcrypt');
      userData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.create({
      data: userData,
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

    logger.info(`User profile created: ${user.id} (${user.email})`);

    res.status(201).json({
      success: true,
      data: { user },
      message: 'User profile created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile by ID
export const getUserProfile: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        role: true,
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

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.id;
    delete updateData.email;
    delete updateData.role;
    delete updateData.status;
    delete updateData.password;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        role: true,
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

// Delete user profile
export const deleteUserProfile: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Soft delete - update status to DELETED
    await prisma.user.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    logger.info(`User profile deleted: ${user.id} (${user.email})`);

    res.json({
      success: true,
      message: 'User profile deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (Admin only)
export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user reviews
export const getReviews: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { reviewerId: id },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          service: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { reviewerId: id } }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
export const getUserStats: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Get user statistics based on role
    let stats: any = {};

    if (user.role === 'CUSTOMER') {
      // Customer stats
      const [postedJobs, completedJobs, totalSpent] = await Promise.all([
        prisma.job.count({ where: { customerId: id } }),
        prisma.job.count({ where: { customerId: id, status: 'COMPLETED' } }),
        prisma.payment.aggregate({
          where: { customerId: id, status: 'RELEASED' },
          _sum: { amount: true },
        }),
      ]);

      stats = {
        postedJobs,
        completedJobs,
        totalSpent: totalSpent._sum.amount || 0,
      };
    } else if (user.role === 'VENDOR') {
      // Vendor stats
      const [totalBids, acceptedBids, completedJobs, totalEarnings] =
        await Promise.all([
          prisma.bid.count({ where: { vendorId: id } }),
          prisma.bid.count({ where: { vendorId: id, status: 'ACCEPTED' } }),
          prisma.job.count({
            where: { assignedVendorId: id, status: 'COMPLETED' },
          }),
          prisma.payment.aggregate({
            where: { vendorId: id, status: 'RELEASED' },
            _sum: { amount: true },
          }),
        ]);

      stats = {
        totalBids,
        acceptedBids,
        completedJobs,
        totalEarnings: totalEarnings._sum.amount || 0,
      };
    }

    // Common stats for all users
    const [totalReviews, avgRating, totalTickets] = await Promise.all([
      prisma.review.count({ where: { reviewerId: id } }),
      prisma.review.aggregate({
        where: { reviewerId: id },
        _avg: { rating: true },
      }),
      prisma.supportTicket.count({ where: { userId: id } }),
    ]);

    stats = {
      ...stats,
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
      totalTickets,
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

// Search users
export const searchUsers: RequestHandler = async (req, res, next) => {
  try {
    const { q, role, location, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    const where: any = {
      status: 'ACTIVE',
    };

    if (q) {
      where.OR = [
        { firstName: { contains: q as string, mode: 'insensitive' } },
        { lastName: { contains: q as string, mode: 'insensitive' } },
        { email: { contains: q as string, mode: 'insensitive' } },
        { bio: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (location)
      where.location = { contains: location as string, mode: 'insensitive' };

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          bio: true,
          location: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by email (for password reset)
export const getUserByEmail: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
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
      throw new AppError(404, 'User not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
