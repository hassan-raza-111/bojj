import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AdminController {
  // ========================================
  // DASHBOARD OVERVIEW & STATISTICS
  // ========================================

  async getDashboardStats(req: Request, res: Response) {
    try {
      console.log('🔍 Starting getDashboardStats...');

      // Test database connection first
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');

      let stats;

      try {
        // Try to get real data first
        console.log('🔍 Attempting to fetch real data...');

        const [
          totalVendors,
          totalCustomers,
          totalJobs,
          totalPayments,
          pendingVendors,
          activeJobs,
          completedJobs,
          totalRevenue,
        ] = await Promise.all([
          prisma.user.count({ where: { role: 'VENDOR' } }),
          prisma.user.count({ where: { role: 'CUSTOMER' } }),
          prisma.job.count(),
          prisma.payment.count(),
          prisma.user.count({
            where: {
              role: 'VENDOR',
              vendorProfile: { verified: false },
            },
          }),
          prisma.job.count({ where: { status: 'IN_PROGRESS' } }),
          prisma.job.count({ where: { status: 'COMPLETED' } }),
          prisma.payment.aggregate({
            where: { status: 'RELEASED' },
            _sum: { amount: true },
          }),
        ]);

        const recentActivity = await this.getRecentActivity();

        stats = {
          totalVendors,
          totalCustomers,
          totalJobs,
          totalPayments,
          pendingVendors,
          activeJobs,
          completedJobs,
          totalRevenue: totalRevenue._sum.amount || 0,
          recentActivity,
        };

        console.log('✅ Real data fetched successfully');
      } catch (dbError) {
        console.log(
          '⚠️ Database tables missing, using mock data:',
          dbError instanceof Error ? dbError.message : 'Unknown error'
        );

        // Provide mock data if tables don't exist
        stats = {
          totalVendors: 0,
          totalCustomers: 1, // At least the admin user
          totalJobs: 0,
          totalPayments: 0,
          pendingVendors: 0,
          activeJobs: 0,
          completedJobs: 0,
          totalRevenue: 0,
          recentActivity: {
            recentJobs: [],
            recentPayments: [],
          },
        };
      }

      console.log('✅ Final stats object:', stats);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('❌ Error in getDashboardStats:', error);
      logger.error('Error fetching dashboard stats:', error);

      // Send more detailed error information
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private async getRecentActivity() {
    try {
      console.log('🔍 Getting recent jobs...');
      const recentJobs = await prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          assignedVendor: { select: { firstName: true, lastName: true } },
        },
      });
      console.log('✅ Recent jobs fetched:', recentJobs.length);

      console.log('🔍 Getting recent payments...');
      const recentPayments = await prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          vendor: { select: { firstName: true, lastName: true } },
        },
      });
      console.log('✅ Recent payments fetched:', recentPayments.length);

      return { recentJobs, recentPayments };
    } catch (error) {
      console.error('❌ Error in getRecentActivity:', error);
      // Return empty arrays if there's an error (tables don't exist)
      return { recentJobs: [], recentPayments: [] };
    }
  }

  // ========================================
  // VENDOR MANAGEMENT
  // ========================================

  async getPendingVendors(req: Request, res: Response) {
    try {
      const pendingVendors = await prisma.user.findMany({
        where: {
          role: 'VENDOR',
          vendorProfile: { verified: false },
        },
        include: {
          vendorProfile: {
            select: {
              companyName: true,
              businessType: true,
              experience: true,
              skills: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: pendingVendors });
    } catch (error) {
      logger.error('Error fetching pending vendors:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch pending vendors' });
    }
  }

  async approveVendor(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;

      const vendor = await prisma.user.findUnique({
        where: { id: vendorId },
        include: { vendorProfile: true },
      });

      if (!vendor || vendor.role !== 'VENDOR') {
        return res
          .status(404)
          .json({ success: false, message: 'Vendor not found' });
      }

      // Update vendor profile to verified
      await prisma.vendorProfile.update({
        where: { userId: vendorId },
        data: { verified: true },
      });

      // Update user status to active if it was suspended
      if (vendor.status === 'SUSPENDED') {
        await prisma.user.update({
          where: { id: vendorId },
          data: { status: 'ACTIVE' },
        });
      }

      logger.info(`Vendor ${vendorId} approved by admin`);
      res.json({ success: true, message: 'Vendor approved successfully' });
    } catch (error) {
      logger.error('Error approving vendor:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to approve vendor' });
    }
  }

  async rejectVendor(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const { reason } = req.body;

      const vendor = await prisma.user.findUnique({
        where: { id: vendorId },
      });

      if (!vendor || vendor.role !== 'VENDOR') {
        return res
          .status(404)
          .json({ success: false, message: 'Vendor not found' });
      }

      // Update vendor status to rejected
      await prisma.user.update({
        where: { id: vendorId },
        data: { status: 'SUSPENDED' },
      });

      logger.info(`Vendor ${vendorId} rejected by admin. Reason: ${reason}`);
      res.json({ success: true, message: 'Vendor rejected successfully' });
    } catch (error) {
      logger.error('Error rejecting vendor:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to reject vendor' });
    }
  }

  async getAllVendors(req: Request, res: Response) {
    try {
      const { search, status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { role: 'VENDOR' };

      if (search) {
        where.OR = [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [vendors, total] = await Promise.all([
        prisma.user.findMany({
          where,
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
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: vendors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching vendors:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch vendors' });
    }
  }

  async toggleVendorStatus(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const { status, reason } = req.body;

      const vendor = await prisma.user.findUnique({
        where: { id: vendorId },
      });

      if (!vendor || vendor.role !== 'VENDOR') {
        return res
          .status(404)
          .json({ success: false, message: 'Vendor not found' });
      }

      // Update vendor status
      await prisma.user.update({
        where: { id: vendorId },
        data: { status: status as any },
      });

      logger.info(`Vendor ${vendorId} status updated to ${status}`);
      res.json({
        success: true,
        message: 'Vendor status updated successfully',
      });
    } catch (error) {
      logger.error('Error updating vendor status:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update vendor status' });
    }
  }

  // ========================================
  // CUSTOMER MANAGEMENT
  // ========================================

  async getAllCustomers(req: Request, res: Response) {
    try {
      const { search, status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { role: 'CUSTOMER' };

      if (search) {
        where.OR = [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [customers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            customerProfile: {
              select: {
                preferredCategories: true,
                budgetRange: true,
                totalJobsPosted: true,
                totalSpent: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching customers:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch customers' });
    }
  }

  async toggleCustomerStatus(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const { status, reason } = req.body;

      const customer = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!customer || customer.role !== 'CUSTOMER') {
        return res
          .status(404)
          .json({ success: false, message: 'Customer not found' });
      }

      // Update customer status
      await prisma.user.update({
        where: { id: customerId },
        data: { status: status as any },
      });

      logger.info(`Customer ${customerId} status updated to ${status}`);
      res.json({
        success: true,
        message: 'Customer status updated successfully',
      });
    } catch (error) {
      logger.error('Error updating customer status:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update customer status' });
    }
  }

  // ========================================
  // PAYMENT MANAGEMENT
  // ========================================

  async getAllPayments(req: Request, res: Response) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: {
            customer: {
              select: { firstName: true, lastName: true, email: true },
            },
            vendor: {
              select: { firstName: true, lastName: true, email: true },
            },
            job: { select: { title: true } },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
      ]);

      res.json({
        success: true,
        data: payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching payments:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch payments' });
    }
  }

  async confirmPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { adminNotes } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { job: true },
      });

      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: 'Payment not found' });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Update job status if payment is confirmed
      if (payment.job) {
        await prisma.job.update({
          where: { id: payment.job.id },
          data: { status: 'COMPLETED' },
        });
      }

      logger.info(`Payment ${paymentId} confirmed by admin`);
      res.json({ success: true, message: 'Payment confirmed successfully' });
    } catch (error) {
      logger.error('Error confirming payment:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to confirm payment' });
    }
  }

  async releasePayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { adminNotes } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: 'Payment not found' });
      }

      if (payment.status !== 'IN_ESCROW') {
        return res
          .status(400)
          .json({ success: false, message: 'Payment is not in escrow' });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      logger.info(`Payment ${paymentId} released from escrow by admin`);
      res.json({ success: true, message: 'Payment released successfully' });
    } catch (error) {
      logger.error('Error releasing payment:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to release payment' });
    }
  }

  async refundPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { reason, refundAmount } = req.body;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: 'Payment not found' });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
        },
      });

      logger.info(`Payment ${paymentId} refunded by admin. Reason: ${reason}`);
      res.json({ success: true, message: 'Payment refunded successfully' });
    } catch (error) {
      logger.error('Error refunding payment:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to refund payment' });
    }
  }

  // ========================================
  // JOB MANAGEMENT
  // ========================================

  async getAllJobs(req: Request, res: Response) {
    try {
      const { status, category, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (category) {
        where.category = category;
      }

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            customer: {
              select: { firstName: true, lastName: true, email: true },
            },
            assignedVendor: {
              select: { firstName: true, lastName: true, email: true },
            },
            bids: { select: { id: true } },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.job.count({ where }),
      ]);

      res.json({
        success: true,
        data: jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching jobs:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
  }

  async updateJobStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const { status, adminNotes } = req.body;

      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        return res
          .status(404)
          .json({ success: false, message: 'Job not found' });
      }

      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: status as any,
          updatedAt: new Date(),
        },
      });

      logger.info(`Job ${jobId} status updated to ${status} by admin`);
      res.json({ success: true, message: 'Job status updated successfully' });
    } catch (error) {
      logger.error('Error updating job status:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update job status' });
    }
  }

  async assignJobToVendor(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const { vendorId, adminNotes } = req.body;

      const [job, vendor] = await Promise.all([
        prisma.job.findUnique({ where: { id: jobId } }),
        prisma.user.findUnique({
          where: { id: vendorId },
          include: { vendorProfile: true },
        }),
      ]);

      if (!job) {
        return res
          .status(404)
          .json({ success: false, message: 'Job not found' });
      }

      if (!vendor || vendor.role !== 'VENDOR') {
        return res
          .status(404)
          .json({ success: false, message: 'Vendor not found' });
      }

      if (!vendor.vendorProfile?.verified) {
        return res
          .status(400)
          .json({ success: false, message: 'Vendor is not verified' });
      }

      // Update job assignment
      await prisma.job.update({
        where: { id: jobId },
        data: {
          assignedVendorId: vendorId,
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });

      logger.info(`Job ${jobId} assigned to vendor ${vendorId} by admin`);
      res.json({ success: true, message: 'Job assigned successfully' });
    } catch (error) {
      logger.error('Error assigning job:', error);
      res.status(500).json({ success: false, message: 'Failed to assign job' });
    }
  }

  async cancelJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const { reason, adminNotes } = req.body;

      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        return res
          .status(404)
          .json({ success: false, message: 'Job not found' });
      }

      if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: 'Job cannot be cancelled in current status',
        });
      }

      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      logger.info(`Job ${jobId} cancelled by admin. Reason: ${reason}`);
      res.json({ success: true, message: 'Job cancelled successfully' });
    } catch (error) {
      logger.error('Error cancelling job:', error);
      res.status(500).json({ success: false, message: 'Failed to cancel job' });
    }
  }

  // ========================================
  // SUPPORT TICKET MANAGEMENT
  // ========================================

  async getAllSupportTickets(req: Request, res: Response) {
    try {
      const { status, priority, category, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (priority) {
        where.priority = priority;
      }
      if (category) {
        where.category = category;
      }

      const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
          where,
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            assignedTo: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.supportTicket.count({ where }),
      ]);

      res.json({
        success: true,
        data: tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching support tickets:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch support tickets' });
    }
  }

  async assignTicket(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { assignedToId, adminNotes } = req.body;

      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ success: false, message: 'Ticket not found' });
      }

      // Update ticket assignment
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          assignedToId,
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });

      logger.info(`Ticket ${ticketId} assigned to ${assignedToId} by admin`);
      res.json({ success: true, message: 'Ticket assigned successfully' });
    } catch (error) {
      logger.error('Error assigning ticket:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to assign ticket' });
    }
  }

  async updateTicketStatus(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { status, adminNotes } = req.body;

      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ success: false, message: 'Ticket not found' });
      }

      // Update ticket status
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: status as any,
          updatedAt: new Date(),
        },
      });

      logger.info(`Ticket ${ticketId} status updated to ${status} by admin`);
      res.json({
        success: true,
        message: 'Ticket status updated successfully',
      });
    } catch (error) {
      logger.error('Error updating ticket status:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update ticket status' });
    }
  }

  async closeTicket(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { resolution, adminNotes } = req.body;

      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        return res
          .status(404)
          .json({ success: false, message: 'Ticket not found' });
      }

      // Update ticket status
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: 'CLOSED',
          updatedAt: new Date(),
        },
      });

      logger.info(`Ticket ${ticketId} closed by admin`);
      res.json({ success: true, message: 'Ticket closed successfully' });
    } catch (error) {
      logger.error('Error closing ticket:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to close ticket' });
    }
  }

  // ========================================
  // CATEGORY MANAGEMENT
  // ========================================

  async getAllCategories(req: Request, res: Response) {
    try {
      // Since categories don't exist in schema, return empty array
      res.json({ success: true, data: [] });
    } catch (error) {
      logger.error('Error fetching categories:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch categories' });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      res.status(501).json({
        success: false,
        message: 'Category management not implemented yet',
      });
    } catch (error) {
      logger.error('Error creating category:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to create category' });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      res.status(501).json({
        success: false,
        message: 'Category management not implemented yet',
      });
    } catch (error) {
      logger.error('Error updating category:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to update category' });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      res.status(501).json({
        success: false,
        message: 'Category management not implemented yet',
      });
    } catch (error) {
      logger.error('Error deleting category:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to delete category' });
    }
  }

  // ========================================
  // SYSTEM ANALYTICS
  // ========================================

  async getSystemAnalytics(req: Request, res: Response) {
    try {
      const { period = '30' } = req.query; // days
      const days = Number(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        newUsers,
        newJobs,
        completedJobs,
        totalRevenue,
        topCategories,
        userGrowth,
      ] = await Promise.all([
        // New users in period
        prisma.user.count({
          where: { createdAt: { gte: startDate } },
        }),
        // New jobs in period
        prisma.job.count({
          where: { createdAt: { gte: startDate } },
        }),
        // Completed jobs in period
        prisma.job.count({
          where: {
            status: 'COMPLETED',
            updatedAt: { gte: startDate },
          },
        }),
        // Revenue in period
        prisma.payment.aggregate({
          where: {
            status: 'RELEASED',
            releasedAt: { gte: startDate },
          },
          _sum: { amount: true },
        }),
        // Top job categories
        prisma.job.groupBy({
          by: ['category'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
        // User growth over time
        prisma.user.groupBy({
          by: ['createdAt'],
          _count: { id: true },
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      const analytics = {
        period: days,
        newUsers,
        newJobs,
        completedJobs,
        totalRevenue: totalRevenue._sum.amount || 0,
        topCategories,
        userGrowth,
        conversionRate: newJobs > 0 ? (completedJobs / newJobs) * 100 : 0,
      };

      res.json({ success: true, data: analytics });
    } catch (error) {
      logger.error('Error fetching system analytics:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch system analytics' });
    }
  }

  // ========================================
  // ADMIN ACTION LOGS
  // ========================================

  async getAdminActionLogs(req: Request, res: Response) {
    try {
      // Since admin action logs don't exist in schema, return empty array
      res.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      });
    } catch (error) {
      logger.error('Error fetching admin action logs:', error);
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch admin action logs' });
    }
  }
}
