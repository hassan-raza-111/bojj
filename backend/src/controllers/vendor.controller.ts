import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class VendorController {
  // Get vendor dashboard summary
  static async getDashboardSummary(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get available jobs count (jobs that match vendor skills and haven't been bid on)
      const availableJobsCount = await prisma.job.count({
        where: {
          status: 'OPEN',
          isDeleted: false,
          bids: {
            none: {
              vendorId: vendorId,
            },
          },
        },
      });

      // Get active bids count
      const activeBidsCount = await prisma.bid.count({
        where: {
          vendorId: vendorId,
          status: {
            in: ['PENDING', 'ACCEPTED'],
          },
        },
      });

      // Get awarded jobs count
      const awardedJobsCount = await prisma.job.count({
        where: {
          assignedVendorId: vendorId,
          status: {
            in: ['IN_PROGRESS', 'COMPLETED'],
          },
        },
      });

      // Get earnings this month
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      const monthlyEarnings = await prisma.payment.aggregate({
        where: {
          vendorId: vendorId,
          status: 'RELEASED',
          releasedAt: {
            gte: firstDayOfMonth,
          },
        },
        _sum: {
          netAmount: true,
        },
      });

      // Get pending payments
      const pendingPayments = await prisma.payment.aggregate({
        where: {
          vendorId: vendorId,
          status: 'IN_ESCROW',
        },
        _sum: {
          netAmount: true,
        },
      });

      // Get average rating
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: vendorId },
        select: { rating: true },
      });

      const summary = {
        availableJobs: availableJobsCount,
        activeBids: activeBidsCount,
        awardedJobs: awardedJobsCount,
        monthlyEarnings: monthlyEarnings._sum.netAmount || 0,
        pendingPayments: pendingPayments._sum.netAmount || 0,
        rating: vendorProfile?.rating || 0,
      };

      res.json(summary);
    } catch (error) {
      logger.error('Error getting vendor dashboard summary:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get available jobs for vendor
  static async getAvailableJobs(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const {
        page = 1,
        limit = 10,
        category,
        location,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Get vendor skills for better job matching
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: vendorId },
        select: { skills: true },
      });

      const whereClause: any = {
        status: 'OPEN',
        isDeleted: false,
        bids: {
          none: {
            vendorId: vendorId,
          },
        },
      };

      // Category filter
      if (category && category !== 'all') {
        whereClause.category = category;
      }

      // Location filter
      if (location && location !== 'all') {
        whereClause.OR = [
          { city: { contains: location as string, mode: 'insensitive' } },
          { state: { contains: location as string, mode: 'insensitive' } },
          { location: { contains: location as string, mode: 'insensitive' } },
        ];
      }

      // Search filter
      if (search) {
        whereClause.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { category: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Sort options
      const orderBy: any = {};
      if (sortBy === 'budget') {
        orderBy.budget = sortOrder === 'asc' ? 'asc' : 'desc';
      } else if (sortBy === 'deadline') {
        orderBy.deadline = sortOrder === 'asc' ? 'asc' : 'desc';
      } else if (sortBy === 'urgency') {
        orderBy.urgency = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = sortOrder === 'asc' ? 'asc' : 'desc';
      }

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              location: true,
              customerProfile: {
                select: {
                  totalJobsPosted: true,
                },
              },
            },
          },
          bids: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      });

      // Get total count for pagination
      const total = await prisma.job.count({ where: whereClause });

      // Get available categories for filtering
      const categories = await prisma.job.findMany({
        where: { status: 'OPEN', isDeleted: false },
        select: { category: true },
        distinct: ['category'],
      });

      // Get available locations for filtering
      const locations = await prisma.job.findMany({
        where: { status: 'OPEN', isDeleted: false },
        select: { city: true, state: true, location: true },
        distinct: ['city', 'state', 'location'],
      });

      res.json({
        success: true,
        data: {
          jobs: jobs.map((job) => ({
            ...job,
            totalBids: job.bids?.length || 0,
            averageBidAmount:
              job.bids && job.bids.length > 0
                ? job.bids.reduce(
                    (sum: number, bid: any) => sum + bid.amount,
                    0
                  ) / job.bids.length
                : 0,
            customerRating: job.customer?.customerProfile?.totalJobsPosted || 0,
            customerTotalJobs:
              job.customer?.customerProfile?.totalJobsPosted || 0,
            distance: 'Calculated based on location', // This would need geolocation service
            urgency: job.urgency || 'Medium',
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
          filters: {
            categories: categories.map((c) => c.category),
            locations: locations
              .filter((l) => l.city || l.state || l.location)
              .map(
                (l) =>
                  `${l.city || ''}${l.city && l.state ? ', ' : ''}${l.state || ''}${l.location && !l.city && !l.state ? l.location : ''}`
              )
              .filter((l) => l.trim() !== ''),
          },
        },
      });
    } catch (error) {
      logger.error('Error getting available jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get vendor's active bids
  static async getActiveBids(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const bids = await prisma.bid.findMany({
        where: {
          vendorId: vendorId,
          status: {
            in: ['PENDING', 'ACCEPTED'],
          },
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              category: true,
              budget: true,
              location: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      });

      const total = await prisma.bid.count({
        where: {
          vendorId: vendorId,
          status: {
            in: ['PENDING', 'ACCEPTED'],
          },
        },
      });

      res.json({
        bids,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error getting active bids:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all vendor bids with filtering
  static async getAllBids(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { page = 1, limit = 20, status, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build where clause
      const whereClause: any = {
        vendorId: vendorId,
      };

      if (status && status !== 'all') {
        whereClause.status = (status as string).toUpperCase();
      }

      if (search) {
        whereClause.OR = [
          {
            job: {
              title: {
                contains: search as string,
                mode: 'insensitive',
              },
            },
          },
          {
            job: {
              description: {
                contains: search as string,
                mode: 'insensitive',
              },
            },
          },
        ];
      }

      const bids = await prisma.bid.findMany({
        where: whereClause,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              subcategory: true,
              budget: true,
              budgetType: true,
              location: true,
              city: true,
              state: true,
              zipCode: true,
              deadline: true,
              status: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  location: true,
                  customerProfile: {
                    select: {
                      totalJobsPosted: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      });

      const total = await prisma.bid.count({
        where: whereClause,
      });

      res.json({
        bids,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error getting all bids:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get bid details
  static async getBidDetails(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      const { bidId } = req.params;

      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const bid = await prisma.bid.findFirst({
        where: {
          id: bidId,
          vendorId: vendorId,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              subcategory: true,
              budget: true,
              budgetType: true,
              location: true,
              city: true,
              state: true,
              zipCode: true,
              deadline: true,
              status: true,
              requirements: true,
              timeline: true,
              additionalRequests: true,
              images: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  location: true,
                  phone: true,
                  customerProfile: {
                    select: {
                      totalJobsPosted: true,
                      totalSpent: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
      }

      res.json(bid);
    } catch (error) {
      logger.error('Error getting bid details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update bid
  static async updateBid(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      const { bidId } = req.params;
      const { amount, description, timeline, notes, milestones } = req.body;

      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if bid exists and belongs to vendor
      const existingBid = await prisma.bid.findFirst({
        where: {
          id: bidId,
          vendorId: vendorId,
          status: 'PENDING', // Only pending bids can be updated
        },
      });

      if (!existingBid) {
        return res
          .status(404)
          .json({ message: 'Bid not found or cannot be updated' });
      }

      const updatedBid = await prisma.bid.update({
        where: { id: bidId },
        data: {
          amount: amount ? parseFloat(amount) : undefined,
          description: description || undefined,
          timeline: timeline || undefined,
          notes: notes || undefined,
          milestones: milestones || undefined,
          updatedAt: new Date(),
        },
      });

      res.json(updatedBid);
    } catch (error) {
      logger.error('Error updating bid:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Withdraw bid
  static async withdrawBid(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      const { bidId } = req.params;

      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if bid exists and belongs to vendor
      const existingBid = await prisma.bid.findFirst({
        where: {
          id: bidId,
          vendorId: vendorId,
          status: 'PENDING', // Only pending bids can be withdrawn
        },
      });

      if (!existingBid) {
        return res
          .status(404)
          .json({ message: 'Bid not found or cannot be withdrawn' });
      }

      const updatedBid = await prisma.bid.update({
        where: { id: bidId },
        data: {
          status: 'WITHDRAWN',
          updatedAt: new Date(),
        },
      });

      res.json(updatedBid);
    } catch (error) {
      logger.error('Error withdrawing bid:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get awarded jobs
  static async getAwardedJobs(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const jobs = await prisma.job.findMany({
        where: {
          assignedVendorId: vendorId,
          status: {
            in: ['IN_PROGRESS', 'COMPLETED'],
          },
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          payments: {
            where: {
              vendorId: vendorId,
            },
            select: {
              status: true,
              amount: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: Number(limit),
      });

      const total = await prisma.job.count({
        where: {
          assignedVendorId: vendorId,
          status: {
            in: ['IN_PROGRESS', 'COMPLETED'],
          },
        },
      });

      res.json({
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error getting awarded jobs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get vendor earnings
  static async getEarnings(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { period = 'month' } = req.query;

      let startDate: Date;
      const currentDate = new Date();

      switch (period) {
        case 'week':
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          break;
        case 'quarter':
          startDate = new Date(
            currentDate.getFullYear(),
            Math.floor(currentDate.getMonth() / 3) * 3,
            1
          );
          break;
        case 'year':
          startDate = new Date(currentDate.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
      }

      const earnings = await prisma.payment.aggregate({
        where: {
          vendorId: vendorId,
          status: 'RELEASED',
          releasedAt: {
            gte: startDate,
          },
        },
        _sum: {
          netAmount: true,
        },
      });

      const pendingPayments = await prisma.payment.aggregate({
        where: {
          vendorId: vendorId,
          status: 'IN_ESCROW',
        },
        _sum: {
          netAmount: true,
        },
      });

      // Get monthly breakdown for charts
      const monthlyBreakdown = await prisma.payment.groupBy({
        by: ['releasedAt'],
        where: {
          vendorId: vendorId,
          status: 'RELEASED',
          releasedAt: {
            gte: startDate,
          },
        },
        _sum: {
          netAmount: true,
        },
      });

      res.json({
        totalEarnings: earnings._sum.netAmount || 0,
        pendingPayments: pendingPayments._sum.netAmount || 0,
        monthlyBreakdown: monthlyBreakdown.map((item) => ({
          date: item.releasedAt,
          amount: item._sum.netAmount,
        })),
      });
    } catch (error) {
      logger.error('Error getting vendor earnings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Submit a bid
  static async submitBid(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { jobId, amount, description, timeline, milestones } = req.body;

      // Check if job exists and is open
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { bids: { where: { vendorId } } },
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (job.status !== 'OPEN') {
        return res.status(400).json({ message: 'Job is not open for bidding' });
      }

      if (job.bids.length > 0) {
        return res
          .status(400)
          .json({ message: 'You have already bid on this job' });
      }

      // Create bid
      const bid = await prisma.bid.create({
        data: {
          amount: parseFloat(amount),
          description,
          timeline,
          milestones: milestones || {},
          jobId,
          vendorId,
        },
      });

      // Update job bid count
      await prisma.job.update({
        where: { id: jobId },
        data: { bidCount: { increment: 1 } },
      });

      res.status(201).json(bid);
    } catch (error) {
      logger.error('Error submitting bid:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get available categories and locations for filtering
  static async getAvailableFilters(req: Request, res: Response) {
    console.log('🔍 getAvailableFilters called!', req.url, req.method);
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get available categories
      const categories = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          isDeleted: false,
          bids: {
            none: {
              vendorId: vendorId,
            },
          },
        },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });

      // Get available locations
      const locations = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          isDeleted: false,
          bids: {
            none: {
              vendorId: vendorId,
            },
          },
        },
        select: { city: true, state: true, location: true },
        distinct: ['city', 'state', 'location'],
      });

      // Get budget ranges
      const budgetRanges = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          isDeleted: false,
          bids: {
            none: {
              vendorId: vendorId,
            },
          },
          budget: { not: null },
        },
        select: { budget: true },
        orderBy: { budget: 'asc' },
      });

      const minBudget = Math.min(...budgetRanges.map((j) => j.budget!));
      const maxBudget = Math.max(...budgetRanges.map((j) => j.budget!));

      res.json({
        success: true,
        data: {
          categories: categories.map((c) => c.category),
          locations: locations
            .filter((l) => l.city || l.state || l.location)
            .map(
              (l) =>
                `${l.city || ''}${l.city && l.state ? ', ' : ''}${l.state || ''}${l.location && !l.city && !l.state ? l.location : ''}`
            )
            .filter((l) => l.trim() !== '')
            .sort(),
          budgetRanges: {
            min: minBudget,
            max: maxBudget,
            ranges: [
              { label: 'Under $500', min: 0, max: 500 },
              { label: '$500 - $1,000', min: 500, max: 1000 },
              { label: '$1,000 - $2,500', min: 1000, max: 2500 },
              { label: '$2,500 - $5,000', min: 2500, max: 5000 },
              { label: '$5,000 - $10,000', min: 5000, max: 10000 },
              { label: 'Over $10,000', min: 10000, max: Infinity },
            ],
          },
        },
      });
    } catch (error) {
      logger.error('Error getting available filters:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get job details for bidding
  static async getJobDetails(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const vendorId = req.user?.id;

      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              location: true,
              phone: true,
            },
          },
          bids: {
            where: { vendorId },
            select: { id: true, amount: true, status: true },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      logger.error('Error getting job details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
