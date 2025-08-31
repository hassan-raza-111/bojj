import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient, JobStatus, PaymentStatus } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Get customer dashboard data
export const getCustomerDashboard: RequestHandler = async (req, res, next) => {
  try {
    const customerId = req.query.customerId as string;
    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
      return;
    }

    // Get comprehensive job statistics
    const [
      totalJobs,
      activeJobs,
      completedJobs,
      totalBids,
      totalSpent,
      pendingPayments,
      averageResponseTime,
      jobSuccessRate,
      recentActivity,
      topCategories,
      budgetUtilization,
    ] = await Promise.all([
      // Total jobs count
      prisma.job.count({ where: { customerId } }),

      // Active jobs count
      prisma.job.count({
        where: {
          customerId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),

      // Completed jobs count
      prisma.job.count({
        where: {
          customerId,
          status: 'COMPLETED',
        },
      }),

      // Total bids across all jobs
      prisma.bid.count({
        where: {
          job: { customerId },
        },
      }),

      // Total amount spent
      prisma.payment.aggregate({
        where: {
          customerId,
          status: { in: ['RELEASED', 'IN_ESCROW'] },
        },
        _sum: { amount: true },
      }),

      // Pending payments count
      prisma.payment.count({
        where: {
          customerId,
          status: 'PENDING',
        },
      }),

      // Average response time (time to first bid)
      prisma.jobAnalytics.aggregate({
        where: {
          job: { customerId },
          timeToFirstBid: { not: null },
        },
        _avg: { timeToFirstBid: true },
      }),

      // Job success rate
      prisma.job.aggregate({
        where: { customerId },
        _count: { id: true },
        _avg: { customerRating: true },
      }),

      // Recent activity (last 10 actions)
      prisma.job.findMany({
        where: { customerId },
        include: {
          bids: {
            select: { id: true, createdAt: true, status: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          payments: {
            select: { id: true, status: true, amount: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),

      // Top job categories
      prisma.job.groupBy({
        by: ['category'],
        where: { customerId },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 5,
      }),

      // Budget utilization
      prisma.job.aggregate({
        where: { customerId },
        _sum: { budget: true },
        _avg: { budget: true },
      }),
    ]);

    // Get recent jobs with enhanced details
    const recentJobs = await prisma.job.findMany({
      where: { customerId },
      include: {
        assignedVendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            vendorProfile: {
              select: {
                rating: true,
                companyName: true,
              },
            },
          },
        },
        bids: {
          select: { id: true, amount: true, status: true },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
        analytics: {
          select: {
            timeToFirstBid: true,
            totalBidCount: true,
            averageBidAmount: true,
            uniqueViewers: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate performance metrics
    const performanceMetrics = {
      averageResponseTime: averageResponseTime._avg.timeToFirstBid
        ? Math.round(averageResponseTime._avg.timeToFirstBid / 60) + 'h'
        : 'N/A',
      jobSuccessRate:
        completedJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
      averageJobRating: jobSuccessRate._avg.customerRating || 0,
      budgetEfficiency: budgetUtilization._sum.budget
        ? Math.round(
            ((totalSpent._sum.amount || 0) / budgetUtilization._sum.budget) *
              100
          )
        : 0,
    };

    // Format recent activity
    const formattedActivity = recentActivity.map((job) => ({
      id: job.id,
      type: 'JOB_UPDATE',
      title: job.title,
      status: job.status,
      updatedAt: job.updatedAt,
      bids: job.bids.length,
      payments: job.payments.length,
    }));

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
        performance: performanceMetrics,
        recentJobs,
        recentActivity: formattedActivity,
        topCategories: topCategories.map((cat) => ({
          category: cat.category,
          count: cat._count.category,
        })),
        budgetUtilization: {
          totalBudget: budgetUtilization._sum.budget || 0,
          averageBudget: budgetUtilization._avg.budget || 0,
          spentPercentage: performanceMetrics.budgetEfficiency,
        },
      },
    });
    return;
  } catch (error) {
    logger.error('Error fetching customer dashboard:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
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
        message: 'vendorId is required',
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
      prisma.job.count({ where: { assignedVendorId: vendorId } }),
      prisma.job.count({
        where: {
          assignedVendorId: vendorId,
          status: 'IN_PROGRESS',
        },
      }),
      prisma.job.count({
        where: {
          assignedVendorId: vendorId,
          status: 'COMPLETED',
        },
      }),
      prisma.payment.aggregate({
        where: {
          vendorId,
          status: 'RELEASED',
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          vendorId,
          status: 'IN_ESCROW',
        },
        _sum: { amount: true },
      }),
      prisma.bid.count({ where: { vendorId } }),
      prisma.bid.count({
        where: {
          vendorId,
          status: 'ACCEPTED',
        },
      }),
    ]);

    // Get recent jobs
    const recentJobs = await prisma.job.findMany({
      where: { assignedVendorId: vendorId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            customerProfile: {
              select: {
                totalJobsPosted: true,
                totalSpent: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Get available jobs for bidding
    const availableJobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
        customerId: { not: vendorId }, // Don't show own jobs
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            customerProfile: {
              select: {
                totalJobsPosted: true,
                totalSpent: true,
              },
            },
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
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
    logger.error('Error fetching vendor dashboard:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
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
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'VENDOR' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.job.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({
        where: { status: 'RELEASED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'IN_ESCROW' },
        _sum: { amount: true },
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
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
        assignedVendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
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
      orderBy: { createdAt: 'desc' },
    });

    const recentTickets = await prisma.supportTicket.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    // Get monthly revenue data (last 6 months)
    const monthlyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'RELEASED',
        createdAt: {
          gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // 6 months ago
        },
      },
      _sum: { amount: true },
      orderBy: { createdAt: 'asc' },
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
    logger.error('Error fetching admin dashboard:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
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
        message: 'userId is required',
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
        vendorProfile: {
          select: {
            rating: true,
            totalReviews: true,
            experience: true,
            portfolio: true,
          },
        },
        customerProfile: {
          select: {
            totalJobsPosted: true,
            totalSpent: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    let additionalStats = {};

    if (user.role === 'CUSTOMER') {
      const [totalJobs, completedJobs, totalSpent] = await Promise.all([
        prisma.job.count({ where: { customerId: userId } }),
        prisma.job.count({
          where: {
            customerId: userId,
            status: 'COMPLETED',
          },
        }),
        prisma.payment.aggregate({
          where: {
            customerId: userId,
            status: { in: ['RELEASED', 'IN_ESCROW'] },
          },
          _sum: { amount: true },
        }),
      ]);

      additionalStats = {
        totalJobs,
        completedJobs,
        totalSpent: totalSpent._sum.amount || 0,
      };
    } else if (user.role === 'VENDOR') {
      const [totalJobs, completedJobs, totalBids, acceptedBids] =
        await Promise.all([
          prisma.job.count({ where: { assignedVendorId: userId } }),
          prisma.job.count({
            where: {
              assignedVendorId: userId,
              status: 'COMPLETED',
            },
          }),
          prisma.bid.count({ where: { vendorId: userId } }),
          prisma.bid.count({
            where: {
              vendorId: userId,
              status: 'ACCEPTED',
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
    logger.error('Error fetching user stats:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
    });
    return;
  }
};

// Get detailed job analytics for a specific job
export const getJobAnalytics: RequestHandler = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const customerId = req.query.customerId as string;

    if (!jobId || !customerId) {
      res.status(400).json({
        success: false,
        message: 'jobId and customerId are required',
      });
      return;
    }

    // Verify job ownership
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        customerId,
      },
      include: {
        analytics: true,
        bids: {
          include: {
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                vendorProfile: {
                  select: {
                    rating: true,
                    companyName: true,
                    completedJobs: true,
                  },
                },
              },
            },
          },
          orderBy: { amount: 'asc' },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found or access denied',
      });
      return;
    }

    // Calculate bid statistics
    const bidStats = {
      total: job.bids.length,
      average:
        job.bids.length > 0
          ? job.bids.reduce((sum, bid) => sum + bid.amount, 0) / job.bids.length
          : 0,
      lowest: job.bids.length > 0 ? job.bids[0].amount : 0,
      highest: job.bids.length > 0 ? job.bids[job.bids.length - 1].amount : 0,
      accepted: job.bids.filter((bid) => bid.status === 'ACCEPTED').length,
      pending: job.bids.filter((bid) => bid.status === 'PENDING').length,
    };

    // Calculate engagement metrics
    const engagementMetrics = {
      viewCount: job.analytics?.uniqueViewers || 0,
      savedCount: job.analytics?.savedCount || 0,
      shareCount: job.analytics?.shareCount || 0,
      responseTime: job.analytics?.timeToFirstBid
        ? Math.round(job.analytics.timeToFirstBid / 60) + ' minutes'
        : 'N/A',
    };

    // Calculate performance metrics
    const performanceMetrics = {
      timeToCompletion: job.analytics?.timeToCompletion || 'N/A',
      customerSatisfaction: job.analytics?.customerSatisfaction || 0,
      rehireLikelihood: job.analytics?.rehireLikelihood || 0,
      budgetEfficiency: job.budget
        ? Math.round((bidStats.average / job.budget) * 100)
        : 0,
    };

    res.json({
      success: true,
      data: {
        job: {
          id: job.id,
          title: job.title,
          status: job.status,
          budget: job.budget,
          category: job.category,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
        analytics: {
          bidStats,
          engagementMetrics,
          performanceMetrics,
        },
        bids: job.bids,
        payments: job.payments,
      },
    });
    return;
  } catch (error) {
    logger.error('Error fetching job analytics:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job analytics',
    });
    return;
  }
};
