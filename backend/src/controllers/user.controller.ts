import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error.middleware";
import { createUserSchema, updateUserSchema } from "../utils/schemas";

// Create user profile
export const createUserProfile: RequestHandler = async (req, res, next) => {
  try {
    const userData = createUserSchema.parse(req.body);

    // Check if user already exists with this clerkId or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId: userData.clerkId }, { email: userData.email }],
      },
    });

    if (existingUser) {
      throw new AppError(
        409,
        "User already exists with this Clerk ID or email"
      );
    }

    const user = await prisma.user.create({
      data: {
        clerkId: userData.clerkId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        bio: userData.bio,
        avatar: userData.avatar,
        phone: userData.phone,
        location: userData.location,
        portfolio: userData.portfolio || [],
        experience: userData.experience,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        phone: true,
        location: true,
        portfolio: true,
        experience: true,
        rating: true,
        totalReviews: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { user },
      message: "User profile created successfully",
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to create user profile",
    });
    return;
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
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        phone: true,
        location: true,
        portfolio: true,
        experience: true,
        rating: true,
        totalReviews: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new AppError(404, "User not found");
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

// Update user profile by ID
export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        phone: true,
        location: true,
        portfolio: true,
        experience: true,
        rating: true,
        totalReviews: true,
        totalEarnings: true,
        updatedAt: true,
      },
    });
    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
    return;
  }
};

// Delete user profile by ID
export const deleteUserProfile: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    // Check if user has any active jobs, bids, or payments
    const [activeJobs, activeBids, activePayments] = await Promise.all([
      prisma.job.count({
        where: {
          OR: [
            { customerId: user.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
            { vendorId: user.id, status: { in: ["IN_PROGRESS"] } },
          ],
        },
      }),
      prisma.bid.count({ where: { vendorId: user.id, status: "PENDING" } }),
      prisma.payment.count({
        where: {
          OR: [
            { customerId: user.id, status: { in: ["PENDING", "IN_ESCROW"] } },
            { vendorId: user.id, status: { in: ["IN_ESCROW"] } },
          ],
        },
      }),
    ]);
    if (activeJobs > 0 || activeBids > 0 || activePayments > 0) {
      throw new AppError(
        400,
        "Cannot delete user with active jobs, bids, or payments"
      );
    }
    await prisma.user.delete({ where: { id } });
    res.json({
      success: true,
      message: "User profile deleted successfully",
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user profile",
    });
    return;
  }
};

// Get all users (with pagination and filtering)
export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: "insensitive" } },
        { lastName: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          role: true,
          phone: true,
          location: true,
          portfolio: true,
          experience: true,
          rating: true,
          totalReviews: true,
          totalEarnings: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: parseInt(limit as string),
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
    return;
  }
};

// Get user reviews by ID
export const getReviews: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "User not found");
    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: { reviews } });
  } catch (error) {
    next(error);
  }
};

// Get user statistics by ID
export const getUserStats: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, "User not found");
    const [
      totalJobs,
      completedJobs,
      totalBids,
      acceptedBids,
      totalEarnings,
      totalReviews,
      averageRating,
    ] = await Promise.all([
      prisma.job.count({
        where:
          user.role === "CUSTOMER"
            ? { customerId: user.id }
            : { vendorId: user.id },
      }),
      prisma.job.count({
        where: {
          ...(user.role === "CUSTOMER"
            ? { customerId: user.id }
            : { vendorId: user.id }),
          status: "COMPLETED",
        },
      }),
      prisma.bid.count({ where: { vendorId: user.id } }),
      prisma.bid.count({
        where: {
          vendorId: user.id,
          status: "ACCEPTED",
        },
      }),
      prisma.payment.aggregate({
        where: {
          ...(user.role === "CUSTOMER"
            ? { customerId: user.id }
            : { vendorId: user.id }),
          status: "RELEASED",
        },
        _sum: { amount: true },
      }),
      prisma.review.count({ where: { userId: user.id } }),
      prisma.review.aggregate({
        where: { userId: user.id },
        _avg: { rating: true },
      }),
    ]);
    res.json({
      success: true,
      data: {
        totalJobs,
        completedJobs,
        totalBids,
        acceptedBids,
        totalEarnings: totalEarnings._sum.amount || 0,
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
      },
    });
    return;
  } catch (error) {
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
    return;
  }
};

// Get user profile by Clerk ID
export const getUserByClerkId: RequestHandler = async (req, res, next) => {
  try {
    const { clerkId } = req.params;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        role: true,
        phone: true,
        location: true,
        portfolio: true,
        experience: true,
        rating: true,
        totalReviews: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new AppError(404, "User not found");
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
