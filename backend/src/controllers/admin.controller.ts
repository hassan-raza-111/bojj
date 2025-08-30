import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AdminController {
  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private async logAdminAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: any,
    req?: Request
  ) {
    try {
      // For now, just log to console until AdminActionLog table is properly set up
      console.log(
        `Admin Action: ${adminId} performed ${action} on ${targetType} ${targetId}`,
        details
      );
      logger.info(
        `Admin Action: ${adminId} performed ${action} on ${targetType} ${targetId}`,
        details
      );
    } catch (error) {
      logger.error('Failed to log admin action:', error);
    }
  }

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
          totalBids,
          totalServices,
          recentUsers,
          recentJobs,
          recentPayments,
          systemAlerts,
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
          prisma.bid.count(),
          prisma.service.count(),
          prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          }),
          prisma.job.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              customer: { select: { firstName: true, lastName: true } },
              assignedVendor: { select: { firstName: true, lastName: true } },
              bids: { select: { id: true } },
            },
          }),
          prisma.payment.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              customer: { select: { firstName: true, lastName: true } },
              vendor: { select: { firstName: true, lastName: true } },
              job: { select: { title: true } },
            },
          }),
          this.getSystemAlerts(),
        ]);

        stats = {
          totalVendors,
          totalCustomers,
          totalJobs,
          totalPayments,
          pendingVendors,
          activeJobs,
          completedJobs,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalBids,
          totalServices,
          recentUsers,
          recentJobs,
          recentPayments,
          systemAlerts,
          // Calculate growth percentages (mock for now)
          growthRates: {
            users: '+12%',
            jobs: '+8%',
            revenue: '+23%',
            vendors: '+15%',
          },
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
          totalCustomers: 1,
          totalJobs: 0,
          totalPayments: 0,
          pendingVendors: 0,
          activeJobs: 0,
          completedJobs: 0,
          totalRevenue: 0,
          totalBids: 0,
          totalServices: 0,
          recentUsers: [],
          recentJobs: [],
          recentPayments: [],
          systemAlerts: [],
          growthRates: {
            users: '+0%',
            jobs: '+0%',
            revenue: '+0%',
            vendors: '+0%',
          },
        };
      }

      console.log('✅ Final stats object:', stats);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('❌ Error in getDashboardStats:', error);
      logger.error('Error fetching dashboard stats:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private async getSystemAlerts() {
    try {
      const alerts = [];
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Check for high pending vendors
      const pendingVendorsCount = await prisma.user.count({
        where: {
          role: 'VENDOR',
          vendorProfile: { verified: false },
        },
      });

      if (pendingVendorsCount > 10) {
        alerts.push({
          id: 'pending-vendors',
          type: 'warning',
          message: `${pendingVendorsCount} vendors pending verification`,
          time: 'Just now',
        });
      }

      // Check for recent system activity
      const recentLogins = await prisma.user.count({
        where: {
          createdAt: { gte: oneHourAgo },
        },
      });

      if (recentLogins > 50) {
        alerts.push({
          id: 'high-activity',
          type: 'info',
          message: 'High user activity detected',
          time: '1 hour ago',
        });
      }

      // Check for payment issues
      const pendingPayments = await prisma.payment.count({
        where: {
          status: 'PENDING',
          createdAt: { gte: oneDayAgo },
        },
      });

      if (pendingPayments > 20) {
        alerts.push({
          id: 'pending-payments',
          type: 'warning',
          message: `${pendingPayments} payments pending processing`,
          time: '1 hour ago',
        });
      }

      // Add success message
      alerts.push({
        id: 'system-ok',
        type: 'success',
        message: 'All systems operational',
        time: 'Just now',
      });

      return alerts;
    } catch (error) {
      console.error('Error getting system alerts:', error);
      return [
        {
          id: 'system-error',
          type: 'error',
          message: 'Unable to fetch system status',
          time: 'Just now',
        },
      ];
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

  // ========================================
  // USER MANAGEMENT
  // ========================================

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const status = req.query.status as string;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';

      const pageNum = Math.max(1, page);
      const limitNum = Math.min(100, Math.max(1, limit));

      // Build where clause
      const where: any = {};
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (role && role !== 'all') where.role = role;
      if (status && status !== 'all') where.status = status;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true,
            lastLoginAt: true,
            loginCount: true,
            location: true,
            vendorProfile: {
              select: {
                companyName: true,
                businessType: true,
                experience: true,
                skills: true,
                verified: true,
                totalJobs: true,
                completedJobs: true,
              },
            },
            customerProfile: {
              select: {
                preferredCategories: true,
                budgetRange: true,
                totalJobsPosted: true,
                totalSpent: true,
              },
            },
          },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      // Transform data for frontend
      const transformedUsers = users.map((user) => ({
        ...user,
        location: user.location || 'N/A',
        totalJobs:
          user.vendorProfile?.totalJobs ||
          user.customerProfile?.totalJobsPosted ||
          0,
        totalSpent: user.customerProfile?.totalSpent || 0,
        joinedDate: user.createdAt.toISOString().split('T')[0],
        lastActive: user.lastLoginAt
          ? this.getTimeAgo(user.lastLoginAt)
          : 'Never',
      }));

      res.json({
        success: true,
        data: {
          users: transformedUsers,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get all users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        role,
        password,
        location,
        companyName,
        businessType,
        experience,
        skills,
        preferredCategories,
        budgetRange,
      } = req.body;

      const adminId = (req as any).user?.id;

      // Validate required fields
      if (!firstName || !lastName || !email || !role || !password) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Create user with transaction to handle profile creation
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            phone,
            role: role as any,
            password: password, // Note: In production, hash this password
            location,
            status: 'ACTIVE',
            emailVerified: true, // Admin-created users are pre-verified
            phoneVerified: true,
          },
        });

        // Create vendor profile if role is VENDOR
        if (role === 'VENDOR') {
          await tx.vendorProfile.create({
            data: {
              userId: user.id,
              companyName,
              businessType,
              experience: experience ? parseInt(experience) : 0,
              skills: skills || [],
              verified: true, // Admin-created vendors are pre-verified
            },
          });
        }

        // Create customer profile if role is CUSTOMER
        if (role === 'CUSTOMER') {
          await tx.customerProfile.create({
            data: {
              userId: user.id,
              preferredCategories: preferredCategories || [],
              budgetRange,
            },
          });
        }

        return user;
      });

      // Log admin action
      await this.logAdminAction(adminId, 'CREATE_USER', 'USER', result.id, {
        userEmail: result.email,
        userRole: result.role,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to create user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async bulkUpdateUserStatus(req: Request, res: Response) {
    try {
      const { userIds, status, reason } = req.body;
      const adminId = (req as any).user?.id;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required',
        });
      }

      if (!['ACTIVE', 'SUSPENDED', 'PENDING', 'VERIFIED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
        });
      }

      // Update all users in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const updates = await Promise.all(
          userIds.map((userId: string) =>
            tx.user.update({
              where: { id: userId },
              data: { status },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            })
          )
        );

        return updates;
      });

      // Log admin action for each user
      await Promise.all(
        result.map((user) =>
          this.logAdminAction(
            adminId,
            `BULK_UPDATE_STATUS_TO_${status}`,
            'USER',
            user.id,
            { reason, previousStatus: 'ACTIVE' }
          )
        )
      );

      res.json({
        success: true,
        message: `Status updated to ${status} for ${result.length} users`,
        data: { updatedUsers: result },
      });
    } catch (error) {
      logger.error('Failed to bulk update user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update user status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async bulkDeleteUsers(req: Request, res: Response) {
    try {
      const { userIds, reason } = req.body;
      const adminId = (req as any).user?.id;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required',
        });
      }

      // Soft delete all users in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const deletes = await Promise.all(
          userIds.map((userId: string) =>
            tx.user.update({
              where: { id: userId },
              data: { status: 'DELETED' },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            })
          )
        );

        return deletes;
      });

      // Log admin action for each user
      await Promise.all(
        result.map((user) =>
          this.logAdminAction(adminId, 'BULK_DELETE_USER', 'USER', user.id, {
            reason,
            userEmail: user.email,
            userRole: user.role,
          })
        )
      );

      res.json({
        success: true,
        message: `Successfully deleted ${result.length} users`,
        data: { deletedUsers: result },
      });
    } catch (error) {
      logger.error('Failed to bulk delete users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk delete users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateUserVerification(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { emailVerified, phoneVerified, reason } = req.body;
      const adminId = (req as any).user?.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update verification status
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified:
            emailVerified !== undefined ? emailVerified : user.emailVerified,
          phoneVerified:
            phoneVerified !== undefined ? phoneVerified : user.phoneVerified,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        'UPDATE_VERIFICATION_STATUS',
        'USER',
        userId,
        {
          reason,
          previousEmailVerified: user.emailVerified,
          previousPhoneVerified: user.phoneVerified,
          newEmailVerified: updatedUser.emailVerified,
          newPhoneVerified: updatedUser.phoneVerified,
        }
      );

      res.json({
        success: true,
        message: 'User verification status updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      logger.error('Failed to update user verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user verification status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          loginCount: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Get user activity data
      const [jobs, payments, bids, reviews] = await Promise.all([
        // Jobs (as customer or vendor)
        prisma.job.findMany({
          where: {
            OR: [{ customerId: userId }, { assignedVendorId: userId }],
          },
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),

        // Payments
        prisma.payment.findMany({
          where: {
            OR: [{ customerId: userId }, { vendorId: userId }],
          },
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            createdAt: true,
            paidAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),

        // Bids (for vendors)
        user.role === 'VENDOR'
          ? prisma.bid.findMany({
              where: { vendorId: userId },
              select: {
                id: true,
                amount: true,
                status: true,
                createdAt: true,
                job: {
                  select: {
                    id: true,
                    title: true,
                    budget: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              skip: (pageNum - 1) * limitNum,
              take: limitNum,
            })
          : [],

        // Reviews
        prisma.review.findMany({
          where: {
            OR: [{ reviewerId: userId }, { reviewedUserId: userId }],
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            reviewedUser: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
      ]);

      // Get counts for pagination
      const [totalJobs, totalPayments, totalBids, totalReviews] =
        await Promise.all([
          prisma.job.count({
            where: {
              OR: [{ customerId: userId }, { assignedVendorId: userId }],
            },
          }),
          prisma.payment.count({
            where: {
              OR: [{ customerId: userId }, { vendorId: userId }],
            },
          }),
          user.role === 'VENDOR'
            ? prisma.bid.count({ where: { vendorId: userId } })
            : 0,
          prisma.review.count({
            where: {
              OR: [{ reviewerId: userId }, { reviewedUserId: userId }],
            },
          }),
        ]);

      const activity = {
        user,
        jobs: {
          data: jobs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalJobs,
            pages: Math.ceil(totalJobs / limitNum),
          },
        },
        payments: {
          data: payments,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalPayments,
            pages: Math.ceil(totalPayments / limitNum),
          },
        },
        bids:
          user.role === 'VENDOR'
            ? {
                data: bids,
                pagination: {
                  page: pageNum,
                  limit: limitNum,
                  total: totalBids,
                  pages: Math.ceil(totalBids / limitNum),
                },
              }
            : null,
        reviews: {
          data: reviews,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalReviews,
            pages: Math.ceil(totalReviews / limitNum),
          },
        },
      };

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      logger.error('Failed to get user activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async exportUsers(req: Request, res: Response) {
    try {
      const { format = 'csv', role, status, search } = req.query;
      const adminId = (req as any).user?.id;

      // Build where clause
      const where: any = {};
      if (search) {
        where.OR = [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      if (role && role !== 'all') where.role = role;
      if (status && status !== 'all') where.status = status;

      // Get all users matching criteria
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          location: true,
          createdAt: true,
          lastLoginAt: true,
          loginCount: true,
          vendorProfile: {
            select: {
              companyName: true,
              businessType: true,
              experience: true,
              skills: true,
              verified: true,
              totalJobs: true,
              completedJobs: true,
            },
          },
          customerProfile: {
            select: {
              preferredCategories: true,
              budgetRange: true,
              totalJobsPosted: true,
              totalSpent: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Log admin action
      await this.logAdminAction(adminId, 'EXPORT_USERS', 'USER', 'BULK', {
        format,
        role,
        status,
        search,
        userCount: users.length,
      });

      if (format === 'csv') {
        // Generate CSV
        const csvHeaders = [
          'ID',
          'Email',
          'First Name',
          'Last Name',
          'Phone',
          'Role',
          'Status',
          'Email Verified',
          'Phone Verified',
          'Location',
          'Created At',
          'Last Login',
          'Login Count',
          'Company Name',
          'Business Type',
          'Experience',
          'Skills',
          'Vendor Verified',
          'Total Jobs',
          'Completed Jobs',
          'Preferred Categories',
          'Budget Range',
          'Jobs Posted',
          'Total Spent',
        ];

        const csvRows = users.map((user) => [
          user.id,
          user.email,
          user.firstName,
          user.lastName,
          user.phone || '',
          user.role,
          user.status,
          user.emailVerified ? 'Yes' : 'No',
          user.phoneVerified ? 'Yes' : 'No',
          user.location || '',
          user.createdAt.toISOString(),
          user.lastLoginAt ? user.lastLoginAt.toISOString() : '',
          user.loginCount,
          user.vendorProfile?.companyName || '',
          user.vendorProfile?.businessType || '',
          user.vendorProfile?.experience || '',
          (user.vendorProfile?.skills || []).join(', '),
          user.vendorProfile?.verified ? 'Yes' : 'No',
          user.vendorProfile?.totalJobs || 0,
          user.vendorProfile?.completedJobs || 0,
          (user.customerProfile?.preferredCategories || []).join(', '),
          user.customerProfile?.budgetRange || '',
          user.customerProfile?.totalJobsPosted || 0,
          user.customerProfile?.totalSpent || 0,
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
        );
        res.send(csvContent);
      } else {
        // Return JSON
        res.json({
          success: true,
          data: users,
          exportInfo: {
            format,
            totalUsers: users.length,
            exportedAt: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      logger.error('Failed to export users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUserDetails(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          lastLoginAt: true,
          loginCount: true,
          location: true,
          vendorProfile: {
            select: {
              companyName: true,
              businessType: true,
              experience: true,
              skills: true,
              verified: true,
              totalJobs: true,
              completedJobs: true,
            },
          },
          customerProfile: {
            select: {
              preferredCategories: true,
              budgetRange: true,
              totalJobsPosted: true,
              totalSpent: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Failed to get user details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;
      const adminId = (req as any).user?.id;

      if (!['ACTIVE', 'SUSPENDED', 'PENDING', 'VERIFIED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
        });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        `UPDATE_STATUS_TO_${status}`,
        'USER',
        userId,
        { reason, previousStatus: 'ACTIVE' }
      );

      res.json({
        success: true,
        message: `User status updated to ${status}`,
        data: user,
      });
    } catch (error) {
      logger.error('Failed to update user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const adminId = (req as any).user?.id;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Soft delete - update status to DELETED instead of actually deleting
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'DELETED' },
      });

      // Log admin action
      await this.logAdminAction(adminId, 'DELETE_USER', 'USER', userId, {
        userEmail: user.email,
        userRole: user.role,
      });

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: user,
      });
    } catch (error) {
      logger.error('Failed to delete user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalVendors,
        totalCustomers,
        newUsersThisMonth,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { status: 'SUSPENDED' } }),
        prisma.user.count({ where: { role: 'VENDOR' } }),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      const userGrowth =
        totalUsers > 0
          ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1)
          : '0.0';

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          totalVendors,
          totalCustomers,
          newUsersThisMonth,
          userGrowth: `${userGrowth}%`,
          activePercentage:
            totalUsers > 0
              ? ((activeUsers / totalUsers) * 100).toFixed(1)
              : '0.0',
        },
      });
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Helper method to format time ago
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }
}
