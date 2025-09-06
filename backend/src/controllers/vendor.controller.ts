import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(vendor: any): number {
  const vendorProfile = vendor.vendorProfile;
  let completed = 0;
  const total = 6;

  if (vendorProfile?.companyName) completed++;
  if (vendorProfile?.businessType) completed++;
  if (vendorProfile?.skills?.length > 0) completed++;
  if (vendorProfile?.experience && vendorProfile.experience > 0) completed++;
  if (vendor?.phone) completed++;
  if (vendor?.location) completed++;

  return Math.round((completed / total) * 100);
}

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

  // Get available jobs for vendor - RECREATED
  static async getAvailableJobs(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;

      // For testing purposes, if no vendorId, we'll show all jobs
      // In production, this should require authentication
      const isTestMode = !vendorId;

      if (!vendorId && !isTestMode) {
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
        budgetMin,
        budgetMax,
      } = req.query;

      // Debug: Log received parameters
      console.log('🔍 Received query parameters:', {
        page,
        limit,
        category,
        location,
        search,
        sortBy,
        sortOrder,
        budgetMin,
        budgetMax,
      });

      const skip = (Number(page) - 1) * Number(limit);

      // Get vendor skills for better job matching (only if we have a vendorId)
      let vendorProfile = null;
      if (vendorId) {
        vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: vendorId },
          select: { skills: true },
        });
      }

      // Build where clause for jobs
      const whereClause: any = {
        status: 'OPEN',
        isDeleted: false,
      };

      // Only filter by vendor bids if we have a vendorId (not in test mode)
      if (vendorId) {
        whereClause.bids = {
          none: {
            vendorId: vendorId,
          },
        };
      }

      // Category filter - only apply if category is not 'all' and not undefined
      if (category && category !== 'all' && category !== 'undefined') {
        whereClause.category = category;
      }

      // Location filter - only apply if location is not 'all' and not undefined
      if (location && location !== 'all' && location !== 'undefined') {
        whereClause.OR = [
          { city: { contains: location as string, mode: 'insensitive' } },
          { state: { contains: location as string, mode: 'insensitive' } },
          { location: { contains: location as string, mode: 'insensitive' } },
        ];
      }

      // Search filter - only apply if search is not undefined
      if (search && search !== 'undefined') {
        whereClause.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { category: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      // Budget filter - only apply if values are valid numbers
      if (budgetMin || budgetMax) {
        whereClause.budget = {};
        if (budgetMin && !isNaN(Number(budgetMin))) {
          whereClause.budget.gte = Number(budgetMin);
        }
        if (budgetMax && !isNaN(Number(budgetMax))) {
          whereClause.budget.lte = Number(budgetMax);
        }
        // Remove budget filter if no valid values
        if (Object.keys(whereClause.budget).length === 0) {
          delete whereClause.budget;
        }
      }

      // Debug: Log final whereClause
      console.log(
        '🔍 Final whereClause:',
        JSON.stringify(whereClause, null, 2)
      );

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

      // Get available categories for filtering (only from filtered jobs)
      const categories = await prisma.job.findMany({
        where: whereClause,
        select: { category: true },
        distinct: ['category'],
      });

      // Get available locations for filtering (only from filtered jobs)
      const locations = await prisma.job.findMany({
        where: whereClause,
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

  // Get job details for vendors
  static async getJobDetails(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      const { jobId } = req.params;

      if (!vendorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find the job with customer information
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          status: 'OPEN',
          isDeleted: false,
        },
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
                  totalSpent: true,
                },
              },
            },
          },
          bids: {
            where: {
              vendorId: vendorId, // Only show vendor's own bids
            },
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
        return res
          .status(404)
          .json({ message: 'Job not found or not available for bidding' });
      }

      res.json({
        success: true,
        data: {
          job: {
            ...job,
            hasVendorBid: job.bids.length > 0,
            vendorBid: job.bids.length > 0 ? job.bids[0] : null,
          },
        },
      });
    } catch (error) {
      logger.error('Error getting job details:', error);
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

  // Get available categories and locations for filtering - RECREATED
  static async getAvailableFilters(req: Request, res: Response) {
    console.log('🔍 getAvailableFilters called!', req.url, req.method);
    try {
      const vendorId = req.user?.id;

      // For testing purposes, if no vendorId, we'll show all filters
      // In production, this should require authentication
      const isTestMode = !vendorId;

      if (!vendorId && !isTestMode) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Build where clause for jobs (only basic filters, no vendor-specific filtering)
      const whereClause: any = {
        status: 'OPEN',
        isDeleted: false,
      };

      // Only filter by vendor bids if we have a vendorId (not in test mode)
      if (vendorId) {
        whereClause.bids = {
          none: {
            vendorId: vendorId,
          },
        };
      }

      // Get available categories (all available, not filtered by user selections)
      const categories = await prisma.job.findMany({
        where: whereClause,
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });

      // Get available locations (all available, not filtered by user selections)
      const locations = await prisma.job.findMany({
        where: whereClause,
        select: { city: true, state: true, location: true },
        distinct: ['city', 'state', 'location'],
      });

      // Get budget ranges (all available, not filtered by user selections)
      const budgetRanges = await prisma.job.findMany({
        where: {
          ...whereClause,
          budget: { not: null },
        },
        select: { budget: true },
        orderBy: { budget: 'asc' },
      });

      const minBudget =
        budgetRanges.length > 0
          ? Math.min(...budgetRanges.map((j) => j.budget!))
          : 0;
      const maxBudget =
        budgetRanges.length > 0
          ? Math.max(...budgetRanges.map((j) => j.budget!))
          : 10000;

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

  // Get vendor profile
  static async getProfile(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const vendor = await prisma.user.findUnique({
        where: { id: vendorId },
        include: {
          vendorProfile: true,
        },
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found',
        });
      }

      // Calculate profile completion percentage
      const profileCompletion = calculateProfileCompletion(vendor);

      res.json({
        success: true,
        data: {
          ...vendor,
          profileCompletion,
        },
      });
    } catch (error) {
      logger.error('Error getting vendor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Update vendor profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const {
        companyName,
        businessType,
        experience,
        skills,
        description,
        hourlyRate,
        portfolio,
        documents,
        location,
        phone,
      } = req.body;

      // Validate required fields
      if (!companyName || !businessType || !location || !phone) {
        return res.status(400).json({
          success: false,
          message:
            'Company name, business type, location, and phone are required',
        });
      }

      // Validate skills
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one skill is required',
        });
      }

      // Validate experience
      if (!experience || experience < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid experience is required',
        });
      }

      // Validate hourly rate
      if (!hourlyRate || hourlyRate <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid hourly rate is required',
        });
      }

      // Update user basic info
      const updatedUser = await prisma.user.update({
        where: { id: vendorId },
        data: {
          location: location,
          phone: phone,
        },
      });

      // Update or create vendor profile
      const vendorProfile = await prisma.vendorProfile.upsert({
        where: { userId: vendorId },
        update: {
          companyName,
          businessType,
          experience: parseInt(experience),
          skills: skills || [],
          description: description || '',
          hourlyRate: parseFloat(hourlyRate),
          portfolio: portfolio || [],
          documents: documents || [],
          updatedAt: new Date(),
        },
        create: {
          userId: vendorId,
          companyName,
          businessType,
          experience: parseInt(experience),
          skills: skills || [],
          description: description || '',
          hourlyRate: parseFloat(hourlyRate),
          portfolio: portfolio || [],
          documents: documents || [],
          rating: 0,
          totalReviews: 0,
          completedJobs: 0,
          verified: false,
        },
      });

      // Calculate updated profile completion
      const profileCompletion = calculateProfileCompletion({
        ...updatedUser,
        vendorProfile,
      });

      res.json({
        success: true,
        data: {
          ...updatedUser,
          vendorProfile,
          profileCompletion,
        },
      });
    } catch (error) {
      logger.error('Error updating vendor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      console.log('📸 Upload Profile Picture Request:', {
        vendorId,
        hasFile: !!req.file,
        fileInfo: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          filename: req.file.filename
        } : null
      });

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Generate file URL
      const fileUrl = `/uploads/profiles/${req.file.filename}`;

      // Update user avatar
      const updatedUser = await prisma.user.update({
        where: { id: vendorId },
        data: { avatar: fileUrl },
      });

      console.log('✅ Profile picture uploaded successfully:', fileUrl);

      res.json({
        success: true,
        data: { avatar: fileUrl },
      });
    } catch (error) {
      logger.error('Error uploading profile picture:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Upload portfolio images
  static async uploadPortfolioImages(req: Request, res: Response) {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const files = req.files as Express.Multer.File[];
      const fileUrls = files.map(
        (file) => `/uploads/portfolio/${file.filename}`
      );

      // Get current portfolio
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: vendorId },
        select: { portfolio: true },
      });

      const currentPortfolio = vendorProfile?.portfolio || [];
      const updatedPortfolio = [...currentPortfolio, ...fileUrls];

      // Update vendor profile portfolio
      await prisma.vendorProfile.upsert({
        where: { userId: vendorId },
        update: { portfolio: updatedPortfolio },
        create: {
          userId: vendorId,
          portfolio: updatedPortfolio,
          rating: 0,
          totalReviews: 0,
          completedJobs: 0,
          verified: false,
        },
      });

      res.json({
        success: true,
        data: { portfolio: updatedPortfolio },
      });
    } catch (error) {
      logger.error('Error uploading portfolio images:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // Get public vendor profile (for customers to view)
  static async getPublicProfile(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;

      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required',
        });
      }

      const vendor = await prisma.user.findUnique({
        where: { id: vendorId, role: 'VENDOR' },
        include: {
          vendorProfile: {
            select: {
              companyName: true,
              businessType: true,
              experience: true,
              skills: true,
              rating: true,
              totalReviews: true,
              completedJobs: true,
              portfolio: true,
              description: true,
              hourlyRate: true,
              verified: true,
            },
          },
        },
      });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found',
        });
      }

      res.json({
        success: true,
        data: vendor,
      });
    } catch (error) {
      logger.error('Error getting public vendor profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
