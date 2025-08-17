import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, JobStatus, PaymentStatus } from "../generated/prisma";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

// Get customer dashboard data
export const getCustomerDashboard: RequestHandler = async (req, res, next) => {
  try {
    const customerId = req.query.customerId as string;
    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "customerId is required",
      });
      return;
    }

    // Get job statistics
    const [
      totalJobs,
      activeJobs,
      completedJobs,
      totalBids,
      totalSpent,
      pendingPayments,
    ] = await Promise.all([
      prisma.job.count({ where: { customerId } }),
      prisma.job.count({
        where: {
          customerId,
          status: { in: ["IN_PROGRESS", "COMPLETED"] },
        },
      }),
      prisma.job.count({
        where: {
          customerId,
          status: "COMPLETED",
        },
      }),
      prisma.bid.count({
        where: {
          job: { customerId },
        },
      }),
      prisma.payment.aggregate({
        where: {
          customerId,
          status: { in: ["RELEASED", "IN_ESCROW"] },
        },
        _sum: { amount: true },
      }),
      prisma.payment.count({
        where: {
          customerId,
          status: "PENDING",
        },
      }),
    ]);

    // Get recent jobs
    const recentJobs = await prisma.job.findMany({
      where: { customerId },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
        bids: {
          select: { id: true },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          completedJobs,
          totalBids,
          totalSpent: totalSpent._sum.amount || 0,
          pendingPayments,
        },
        recentJobs,
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching customer dashboard:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
    return;
  }
};

// Get vendor dashboard data
export const getVendorDashboard: RequestHandler = async (req, res, next) => {
  try {
    const vendorId = req.query.vendorId as string;
    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: "vendorId is required",
      });
      return;
    }

    // Get job and earnings statistics
    const [
      totalJobs,
      activeJobs,
      completedJobs,
      totalEarnings,
      pendingEarnings,
      totalBids,
      acceptedBids,
    ] = await Promise.all([
      prisma.job.count({ where: { vendorId } }),
      prisma.job.count({
        where: {
          vendorId,
          status: "IN_PROGRESS",
        },
      }),
      prisma.job.count({
        where: {
          vendorId,
          status: "COMPLETED",
        },
      }),
      prisma.payment.aggregate({
        where: {
          vendorId,
          status: "RELEASED",
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          vendorId,
          status: "IN_ESCROW",
        },
        _sum: { amount: true },
      }),
      prisma.bid.count({ where: { vendorId } }),
      prisma.bid.count({
        where: {
          vendorId,
          status: "ACCEPTED",
        },
      }),
    ]);

    // Get recent jobs
    const recentJobs = await prisma.job.findMany({
      where: { vendorId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Get available jobs for bidding
    const availableJobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
        customerId: { not: vendorId }, // Don't show own jobs
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rating: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          completedJobs,
          totalEarnings: totalEarnings._sum.amount || 0,
          pendingEarnings: pendingEarnings._sum.amount || 0,
          totalBids,
          acceptedBids,
          acceptanceRate: totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0,
        },
        recentJobs,
        availableJobs,
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching vendor dashboard:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
    return;
  }
};

// Get admin dashboard data
export const getAdminDashboard: RequestHandler = async (req, res, next) => {
  try {
    // Get platform statistics
    const [
      totalUsers,
      totalCustomers,
      totalVendors,
      totalJobs,
      activeJobs,
      completedJobs,
      totalRevenue,
      pendingPayments,
      totalTickets,
      openTickets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "VENDOR" } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: "IN_PROGRESS" } }),
      prisma.job.count({ where: { status: "COMPLETED" } }),
      prisma.payment.aggregate({
        where: { status: "RELEASED" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: "IN_ESCROW" },
        _sum: { amount: true },
      }),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
    ]);

    // Get recent activities
    const recentJobs = await prisma.job.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const recentPayments = await prisma.payment.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const recentTickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // Get monthly revenue data (last 6 months)
    const monthlyRevenue = await prisma.payment.groupBy({
      by: ["createdAt"],
      where: {
        status: "RELEASED",
        createdAt: {
          gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // 6 months ago
        },
      },
      _sum: { amount: true },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCustomers,
          totalVendors,
          totalJobs,
          activeJobs,
          completedJobs,
          totalRevenue: totalRevenue._sum.amount || 0,
          pendingPayments: pendingPayments._sum.amount || 0,
          totalTickets,
          openTickets,
          completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
        },
        recentJobs,
        recentPayments,
        recentTickets,
        monthlyRevenue,
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching admin dashboard:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
    return;
  }
};

// Get user profile statistics
export const getUserStats: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "userId is required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        rating: true,
        totalReviews: true,
        totalEarnings: true,
        experience: true,
        portfolio: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    let additionalStats = {};

    if (user.role === "CUSTOMER") {
      const [totalJobs, completedJobs, totalSpent] = await Promise.all([
        prisma.job.count({ where: { customerId: userId } }),
        prisma.job.count({
          where: {
            customerId: userId,
            status: "COMPLETED",
          },
        }),
        prisma.payment.aggregate({
          where: {
            customerId: userId,
            status: { in: ["RELEASED", "IN_ESCROW"] },
          },
          _sum: { amount: true },
        }),
      ]);

      additionalStats = {
        totalJobs,
        completedJobs,
        totalSpent: totalSpent._sum.amount || 0,
      };
    } else if (user.role === "VENDOR") {
      const [totalJobs, completedJobs, totalBids, acceptedBids] =
        await Promise.all([
          prisma.job.count({ where: { vendorId: userId } }),
          prisma.job.count({
            where: {
              vendorId: userId,
              status: "COMPLETED",
            },
          }),
          prisma.bid.count({ where: { vendorId: userId } }),
          prisma.bid.count({
            where: {
              vendorId: userId,
              status: "ACCEPTED",
            },
          }),
        ]);

      additionalStats = {
        totalJobs,
        completedJobs,
        totalBids,
        acceptedBids,
        acceptanceRate: totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0,
      };
    }

    res.json({
      success: true,
      data: {
        user,
        stats: additionalStats,
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching user stats:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
    return;
  }
};
