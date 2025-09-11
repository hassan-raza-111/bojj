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

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
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
        data: {
          vendors,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
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
  // ENHANCED VENDOR MANAGEMENT
  // ========================================

  async getVendorStats(req: Request, res: Response) {
    try {
      const [
        totalVendors,
        verifiedVendors,
        pendingVendors,
        suspendedVendors,
        deletedVendors,
        newVendorsThisMonth,
        averageRating,
        totalCompletedJobs,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'VENDOR' } }),
        prisma.user.count({
          where: {
            role: 'VENDOR',
            vendorProfile: { verified: true },
            status: 'ACTIVE',
          },
        }),
        prisma.user.count({
          where: {
            role: 'VENDOR',
            vendorProfile: { verified: false },
            status: 'ACTIVE',
          },
        }),
        prisma.user.count({
          where: { role: 'VENDOR', status: 'SUSPENDED' },
        }),
        prisma.user.count({
          where: { role: 'VENDOR', status: 'DELETED' },
        }),
        prisma.user.count({
          where: {
            role: 'VENDOR',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.vendorProfile.aggregate({
          where: { rating: { gt: 0 } },
          _avg: { rating: true },
        }),
        prisma.vendorProfile.aggregate({
          _sum: { completedJobs: true },
        }),
      ]);

      const vendorGrowth =
        totalVendors > 0
          ? ((newVendorsThisMonth / totalVendors) * 100).toFixed(1)
          : '0.0';

      const verifiedPercentage =
        totalVendors > 0
          ? ((verifiedVendors / totalVendors) * 100).toFixed(1)
          : '0.0';

      res.json({
        success: true,
        data: {
          totalVendors,
          verifiedVendors,
          pendingVendors,
          suspendedVendors,
          deletedVendors,
          newVendorsThisMonth,
          vendorGrowth: `${vendorGrowth}%`,
          verifiedPercentage: `${verifiedPercentage}%`,
          averageRating: averageRating._avg.rating || 0,
          totalCompletedJobs: totalCompletedJobs._sum.completedJobs || 0,
        },
      });
    } catch (error) {
      logger.error('Failed to get vendor stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getVendorDetails(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;

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
              documents: true,
              verified: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
              budget: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!vendor) {
        return res
          .status(404)
          .json({ success: false, message: 'Vendor not found' });
      }

      res.json({ success: true, data: vendor });
    } catch (error) {
      logger.error('Failed to get vendor details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async bulkUpdateVendorStatus(req: Request, res: Response) {
    try {
      const { vendorIds, status, reason } = req.body;
      const adminId = (req as any).user.id;

      if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: 'Vendor IDs are required' });
      }

      const updatedVendors = await prisma.user.updateMany({
        where: {
          id: { in: vendorIds },
          role: 'VENDOR',
        },
        data: { status: status as any },
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        'BULK_UPDATE_VENDOR_STATUS',
        'VENDOR',
        vendorIds.join(','),
        {
          vendorIds,
          status,
          reason,
          count: updatedVendors.count,
        }
      );

      res.json({
        success: true,
        message: `Status updated for ${updatedVendors.count} vendors`,
        data: { updatedVendors: updatedVendors.count },
      });
    } catch (error) {
      logger.error('Failed to bulk update vendor status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update vendor status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async bulkDeleteVendors(req: Request, res: Response) {
    try {
      const { vendorIds, reason } = req.body;
      const adminId = (req as any).user.id;

      if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: 'Vendor IDs are required' });
      }

      const deletedVendors = await prisma.user.updateMany({
        where: {
          id: { in: vendorIds },
          role: 'VENDOR',
        },
        data: { status: 'DELETED' },
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        'BULK_DELETE_VENDORS',
        'VENDOR',
        vendorIds.join(','),
        {
          vendorIds,
          reason,
          count: deletedVendors.count,
        }
      );

      res.json({
        success: true,
        message: `Successfully deleted ${deletedVendors.count} vendors`,
        data: { deletedVendors: deletedVendors.count },
      });
    } catch (error) {
      logger.error('Failed to bulk delete vendors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk delete vendors',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async exportVendors(req: Request, res: Response) {
    try {
      const { format = 'csv', status, verification, search } = req.query;

      const where: any = { role: 'VENDOR' };

      if (status && status !== 'all') {
        where.status = status;
      }

      if (verification && verification !== 'all') {
        where.vendorProfile = {
          verified: verification === 'verified',
        };
      }

      if (search) {
        where.OR = [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const vendors = await prisma.user.findMany({
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
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'csv') {
        const csvData = vendors.map((vendor) => ({
          'Vendor ID': vendor.id,
          'First Name': vendor.firstName,
          'Last Name': vendor.lastName,
          Email: vendor.email,
          Phone: vendor.phone || 'N/A',
          Status: vendor.status,
          'Company Name': vendor.vendorProfile?.companyName || 'N/A',
          'Business Type': vendor.vendorProfile?.businessType || 'N/A',
          'Experience (Years)': vendor.vendorProfile?.experience || 0,
          Skills: vendor.vendorProfile?.skills?.join(', ') || 'N/A',
          Rating: vendor.vendorProfile?.rating || 0,
          'Total Reviews': vendor.vendorProfile?.totalReviews || 0,
          'Completed Jobs': vendor.vendorProfile?.completedJobs || 0,
          Verified: vendor.vendorProfile?.verified ? 'Yes' : 'No',
          'Email Verified': vendor.emailVerified ? 'Yes' : 'No',
          'Phone Verified': vendor.phoneVerified ? 'Yes' : 'No',
          Location: vendor.location || 'N/A',
          'Joined Date': vendor.createdAt,
          'Last Active': vendor.lastLoginAt || 'N/A',
        }));

        const csv = this.convertToCSV(csvData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=vendors_export_${new Date().toISOString().split('T')[0]}.csv`
        );
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: vendors,
          exportInfo: {
            totalVendors: vendors.length,
            exportDate: new Date().toISOString(),
            filters: { status, verification, search },
          },
        });
      }
    } catch (error) {
      logger.error('Failed to export vendors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export vendors',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ========================================
  // CUSTOMER MANAGEMENT
  // ========================================

  // Test endpoint to check database connection and basic queries
  async testDatabaseConnection(req: Request, res: Response) {
    try {
      console.log('🧪 Testing database connection...');

      // Test basic connection
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');

      // Test if users table exists and has data
      const userCount = await prisma.user.count();
      console.log('✅ Users table accessible, count:', userCount);

      // Test if customer profiles table exists
      const profileCount = await prisma.customerProfile.count();
      console.log(
        '✅ Customer profiles table accessible, count:',
        profileCount
      );

      // Test if jobs table exists
      const jobCount = await prisma.job.count();
      console.log('✅ Jobs table accessible, count:', jobCount);

      // Test if reviews table exists
      const reviewCount = await prisma.review.count();
      console.log('✅ Reviews table accessible, count:', reviewCount);

      res.json({
        success: true,
        message: 'Database connection test successful',
        data: {
          userCount,
          profileCount,
          jobCount,
          reviewCount,
        },
      });
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Database connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  async getAllCustomers(req: Request, res: Response) {
    try {
      console.log('🔍 Starting getAllCustomers...');
      const { search, status, spending, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      console.log('🔍 Query params:', {
        search,
        status,
        spending,
        page,
        limit,
      });

      const where: any = { role: 'CUSTOMER' };

      if (search) {
        where.OR = [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (status && status !== 'all') {
        where.status = status;
      }

      // Add spending filter
      if (spending && spending !== 'all') {
        if (spending === 'high') {
          where.customerProfile = { totalSpent: { gte: 5000 } };
        } else if (spending === 'medium') {
          where.customerProfile = {
            totalSpent: { gte: 2000, lt: 5000 },
          };
        } else if (spending === 'low') {
          where.customerProfile = { totalSpent: { lt: 2000 } };
        }
      }

      console.log('🔍 Where clause:', JSON.stringify(where, null, 2));

      // First, let's test if we can get basic customer data without complex includes
      console.log('🔍 Testing basic customer query...');
      const basicCustomers = await prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          location: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      });

      console.log(
        '✅ Basic customers query successful, found:',
        basicCustomers.length
      );

      // Now let's get the total count
      const total = await prisma.user.count({ where });
      console.log('✅ Total count query successful:', total);

      // Try to get customer profiles separately to avoid complex join issues
      const customerIds = basicCustomers.map((c) => c.id);
      console.log('🔍 Fetching customer profiles for IDs:', customerIds);

      const customerProfiles = await prisma.customerProfile.findMany({
        where: { userId: { in: customerIds } },
        select: {
          userId: true,
          preferredCategories: true,
          budgetRange: true,
          totalJobsPosted: true,
          totalSpent: true,
        },
      });

      console.log(
        '✅ Customer profiles query successful, found:',
        customerProfiles.length
      );

      // Create a map for easy lookup
      const profileMap = new Map(
        customerProfiles.map((profile) => [profile.userId, profile])
      );

      // Try to get recent jobs for activity tracking
      console.log('🔍 Fetching recent jobs...');
      const recentJobs = await prisma.job.findMany({
        where: { customerId: { in: customerIds } },
        select: {
          customerId: true,
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log('✅ Recent jobs query successful, found:', recentJobs.length);

      // Group jobs by customer
      const jobsMap = new Map();
      recentJobs.forEach((job) => {
        if (!jobsMap.has(job.customerId)) {
          jobsMap.set(job.customerId, []);
        }
        jobsMap.get(job.customerId).push(job);
      });

      // Try to get reviews for rating calculation
      console.log('🔍 Fetching reviews...');
      const reviews = await prisma.review.findMany({
        where: { reviewerId: { in: customerIds } },
        select: {
          reviewerId: true,
          rating: true,
        },
      });

      console.log('✅ Reviews query successful, found:', reviews.length);

      // Group reviews by customer
      const reviewsMap = new Map();
      reviews.forEach((review) => {
        if (!reviewsMap.has(review.reviewerId)) {
          reviewsMap.set(review.reviewerId, []);
        }
        reviewsMap.get(review.reviewerId).push(review);
      });

      // Enhance customer data with calculated fields
      console.log('🔍 Enhancing customer data...');
      const enhancedCustomers = basicCustomers.map((customer) => {
        const profile = profileMap.get(customer.id);
        const customerJobs = jobsMap.get(customer.id) || [];
        const customerReviews = reviewsMap.get(customer.id) || [];

        const totalReviews = customerReviews.length;
        const averageRating =
          totalReviews > 0
            ? customerReviews.reduce(
                (sum: number, review: { rating: number }) =>
                  sum + review.rating,
                0
              ) / totalReviews
            : 0;

        const lastJob = customerJobs[0];
        const lastActive = lastJob
          ? this.formatTimeAgo(lastJob.createdAt)
          : 'Never';

        const recentActivity = lastJob
          ? `Posted job: ${lastJob.title}`
          : 'No recent activity';

        return {
          ...customer,
          customerProfile: profile || {
            preferredCategories: [],
            budgetRange: null,
            totalJobsPosted: 0,
            totalSpent: 0,
          },
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          lastActive,
          recentActivity,
        };
      });

      console.log('✅ Customer data enhancement successful');

      res.json({
        success: true,
        data: enhancedCustomers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });

      console.log('✅ getAllCustomers completed successfully');
    } catch (error) {
      console.error('❌ Error in getAllCustomers:', error);
      logger.error('Error fetching customers:', error);

      // Send more detailed error information for debugging
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  async getCustomerStats(req: Request, res: Response) {
    try {
      const [
        totalCustomers,
        activeCustomers,
        suspendedCustomers,
        deletedCustomers,
        newCustomersThisMonth,
        totalRevenue,
        averageOrderValue,
        highValueCustomers,
        mediumValueCustomers,
        lowValueCustomers,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
        prisma.user.count({ where: { role: 'CUSTOMER', status: 'SUSPENDED' } }),
        prisma.user.count({ where: { role: 'CUSTOMER', status: 'DELETED' } }),
        prisma.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.customerProfile.aggregate({
          _sum: { totalSpent: true },
        }),
        prisma.customerProfile.aggregate({
          where: { totalSpent: { gt: 0 } },
          _avg: { totalSpent: true },
        }),
        prisma.user.count({
          where: {
            role: 'CUSTOMER',
            customerProfile: { totalSpent: { gte: 5000 } },
          },
        }),
        prisma.user.count({
          where: {
            role: 'CUSTOMER',
            customerProfile: {
              totalSpent: { gte: 2000, lt: 5000 },
            },
          },
        }),
        prisma.user.count({
          where: {
            role: 'CUSTOMER',
            customerProfile: { totalSpent: { lt: 2000 } },
          },
        }),
      ]);

      const customerGrowth =
        totalCustomers > 0
          ? ((newCustomersThisMonth / totalCustomers) * 100).toFixed(1)
          : '0.0';

      const activePercentage =
        totalCustomers > 0
          ? ((activeCustomers / totalCustomers) * 100).toFixed(1)
          : '0.0';

      res.json({
        success: true,
        data: {
          totalCustomers,
          activeCustomers,
          suspendedCustomers,
          deletedCustomers,
          newCustomersThisMonth,
          customerGrowth: `${customerGrowth}%`,
          activePercentage: `${activePercentage}%`,
          totalRevenue: totalRevenue._sum.totalSpent || 0,
          averageOrderValue: averageOrderValue._avg.totalSpent || 0,
          highValueCustomers,
          mediumValueCustomers,
          lowValueCustomers,
        },
      });
    } catch (error) {
      logger.error('Failed to get customer stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCustomerDetails(req: Request, res: Response) {
    try {
      const { customerId } = req.params;

      const customer = await prisma.user.findUnique({
        where: { id: customerId, role: 'CUSTOMER' },
        include: {
          customerProfile: {
            select: {
              preferredCategories: true,
              budgetRange: true,
              totalJobsPosted: true,
              totalSpent: true,
            },
          },
          jobs: {
            select: {
              id: true,
              title: true,
              status: true,
              budget: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          customerPayments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: 'Customer not found' });
      }

      res.json({ success: true, data: customer });
    } catch (error) {
      logger.error('Failed to get customer details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async toggleCustomerStatus(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const { status, reason } = req.body;
      const adminId = (req as any).user.id;

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

      // Log admin action
      await this.logAdminAction(
        adminId,
        'UPDATE_CUSTOMER_STATUS',
        'CUSTOMER',
        customerId,
        {
          customerEmail: customer.email,
          oldStatus: customer.status,
          newStatus: status,
          reason,
        }
      );

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

  async bulkUpdateCustomerStatus(req: Request, res: Response) {
    try {
      const { customerIds, status, reason } = req.body;
      const adminId = (req as any).user.id;

      if (
        !customerIds ||
        !Array.isArray(customerIds) ||
        customerIds.length === 0
      ) {
        return res
          .status(400)
          .json({ success: false, message: 'Customer IDs are required' });
      }

      const updatedCustomers = await prisma.user.updateMany({
        where: {
          id: { in: customerIds },
          role: 'CUSTOMER',
        },
        data: { status: status as any },
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        'BULK_UPDATE_CUSTOMER_STATUS',
        'CUSTOMER',
        customerIds.join(','),
        {
          customerIds,
          status,
          reason,
          count: updatedCustomers.count,
        }
      );

      res.json({
        success: true,
        message: `Status updated for ${updatedCustomers.count} customers`,
        data: { updatedCustomers: updatedCustomers.count },
      });
    } catch (error) {
      logger.error('Failed to bulk update customer status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update customer status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async bulkDeleteCustomers(req: Request, res: Response) {
    try {
      const { customerIds, reason } = req.body;
      const adminId = (req as any).user.id;

      if (
        !customerIds ||
        !Array.isArray(customerIds) ||
        customerIds.length === 0
      ) {
        return res
          .status(400)
          .json({ success: false, message: 'Customer IDs are required' });
      }

      const deletedCustomers = await prisma.user.updateMany({
        where: {
          id: { in: customerIds },
          role: 'CUSTOMER',
        },
        data: { status: 'DELETED' },
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        'BULK_DELETE_CUSTOMERS',
        'CUSTOMER',
        customerIds.join(','),
        {
          customerIds,
          reason,
          count: deletedCustomers.count,
        }
      );

      res.json({
        success: true,
        message: `Successfully deleted ${deletedCustomers.count} customers`,
        data: { deletedCustomers: deletedCustomers.count },
      });
    } catch (error) {
      logger.error('Failed to bulk delete customers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk delete customers',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getCustomersBySpending(req: Request, res: Response) {
    try {
      const { spending, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { role: 'CUSTOMER' };

      if (spending === 'high') {
        where.customerProfile = { totalSpent: { gte: 5000 } };
      } else if (spending === 'medium') {
        where.customerProfile = {
          totalSpent: { gte: 2000, lt: 5000 },
        };
      } else if (spending === 'low') {
        where.customerProfile = { totalSpent: { lt: 2000 } };
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
            jobs: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            reviews: {
              select: {
                rating: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      // Enhance customer data with calculated fields
      const enhancedCustomers = customers.map((customer) => {
        const totalReviews = customer.reviews.length;
        const averageRating =
          totalReviews > 0
            ? customer.reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            : 0;

        const lastJob = customer.jobs[0];
        const lastActive = lastJob
          ? this.formatTimeAgo(lastJob.createdAt)
          : 'Never';

        const recentActivity = lastJob
          ? `Posted job: ${lastJob.title}`
          : 'No recent activity';

        return {
          ...customer,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          lastActive,
          recentActivity,
          reviews: undefined,
          jobs: undefined,
        };
      });

      res.json({
        success: true,
        data: enhancedCustomers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching customers by spending:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers by spending',
      });
    }
  }

  async exportCustomers(req: Request, res: Response) {
    try {
      const { format = 'csv', status, spending, search } = req.query;

      const where: any = { role: 'CUSTOMER' };

      if (status && status !== 'all') {
        where.status = status;
      }

      if (spending && spending !== 'all') {
        if (spending === 'high') {
          where.customerProfile = { totalSpent: { gte: 5000 } };
        } else if (spending === 'medium') {
          where.customerProfile = {
            totalSpent: { gte: 2000, lt: 5000 },
          };
        } else if (spending === 'low') {
          where.customerProfile = { totalSpent: { lt: 2000 } };
        }
      }

      if (search) {
        where.OR = [
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const customers = await prisma.user.findMany({
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
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'csv') {
        const csvData = customers.map((customer) => ({
          'Customer ID': customer.id,
          'First Name': customer.firstName,
          'Last Name': customer.lastName,
          Email: customer.email,
          Phone: customer.phone || 'N/A',
          Status: customer.status,
          Location: customer.location || 'N/A',
          'Total Jobs Posted': customer.customerProfile?.totalJobsPosted || 0,
          'Total Spent': customer.customerProfile?.totalSpent || 0,
          'Budget Range': customer.customerProfile?.budgetRange || 'N/A',
          'Preferred Categories':
            customer.customerProfile?.preferredCategories?.join(', ') || 'N/A',
          'Email Verified': customer.emailVerified ? 'Yes' : 'No',
          'Phone Verified': customer.phoneVerified ? 'Yes' : 'No',
          'Joined Date': customer.createdAt,
          'Last Active': customer.lastLoginAt || 'N/A',
        }));

        const csv = this.convertToCSV(csvData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=customers_export_${new Date().toISOString().split('T')[0]}.csv`
        );
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: customers,
          exportInfo: {
            totalCustomers: customers.length,
            exportDate: new Date().toISOString(),
            filters: { status, spending, search },
          },
        });
      }
    } catch (error) {
      logger.error('Failed to export customers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export customers',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
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
  // JOB MANAGEMENT METHODS
  // ========================================

  async getJobStats(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;

      // Get total jobs count
      const totalJobs = await prisma.job.count({
        where: { isDeleted: false },
      });

      // Get active jobs (OPEN + IN_PROGRESS)
      const activeJobs = await prisma.job.count({
        where: {
          isDeleted: false,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      });

      // Get completed jobs
      const completedJobs = await prisma.job.count({
        where: {
          isDeleted: false,
          status: 'COMPLETED',
        },
      });

      // Get disputed jobs
      const disputedJobs = await prisma.job.count({
        where: {
          isDeleted: false,
          status: 'DISPUTED',
        },
      });

      // Calculate total value and average budget
      const jobsWithBudget = await prisma.job.findMany({
        where: {
          isDeleted: false,
          budget: { not: null },
        },
        select: { budget: true },
      });

      const totalValue = jobsWithBudget.reduce(
        (sum, job) => sum + (job.budget || 0),
        0
      );
      const averageBudget =
        jobsWithBudget.length > 0 ? totalValue / jobsWithBudget.length : 0;

      // Get category distribution
      const categoryStats = await prisma.job.groupBy({
        by: ['category'],
        where: { isDeleted: false },
        _count: { category: true },
      });

      const categoryDistribution = categoryStats.map((stat) => ({
        category: stat.category,
        count: stat._count.category,
        percentage: Math.round((stat._count.category / totalJobs) * 100),
      }));

      // Get monthly trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyStats = await prisma.job.groupBy({
        by: ['createdAt'],
        where: {
          isDeleted: false,
          createdAt: { gte: sixMonthsAgo },
        },
        _count: { createdAt: true },
        _sum: { budget: true },
      });

      const monthlyTrends = monthlyStats.map((stat) => ({
        month: stat.createdAt.toISOString().slice(0, 7), // YYYY-MM format
        jobs: stat._count.createdAt,
        value: stat._sum.budget || 0,
      }));

      // Calculate job growth (compare current month with previous month)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const previousMonth = new Date(currentMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      const currentMonthJobs = await prisma.job.count({
        where: {
          isDeleted: false,
          createdAt: { gte: currentMonth },
        },
      });

      const previousMonthJobs = await prisma.job.count({
        where: {
          isDeleted: false,
          createdAt: { gte: previousMonth, lt: currentMonth },
        },
      });

      const jobGrowth =
        previousMonthJobs > 0
          ? `${Math.round(((currentMonthJobs - previousMonthJobs) / previousMonthJobs) * 100)}%`
          : '0%';

      const stats = {
        totalJobs,
        activeJobs,
        completedJobs,
        disputedJobs,
        totalValue,
        averageBudget,
        jobGrowth,
        categoryDistribution,
        monthlyTrends,
      };

      // Log admin action
      await this.logAdminAction(adminId, 'VIEW_JOB_STATS', 'JOB', 'BULK', {
        statsViewed: 'job_statistics',
      });

      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Failed to get job stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get job statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAllJobs(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const {
        page = 1,
        limit = 20,
        status,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = { isDeleted: false };

      if (status && status !== 'all') {
        where.status = status;
      }

      if (category && category !== 'all') {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          {
            customer: {
              firstName: { contains: search as string, mode: 'insensitive' },
            },
          },
          {
            customer: {
              lastName: { contains: search as string, mode: 'insensitive' },
            },
          },
        ];
      }

      // Get jobs with relations
      const jobs = await prisma.job.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedVendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              vendorProfile: {
                select: { companyName: true },
              },
            },
          },
          bids: {
            select: {
              id: true,
              amount: true,
              description: true,
              timeline: true,
              status: true,
              vendor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  vendorProfile: {
                    select: { companyName: true },
                  },
                },
              },
              createdAt: true,
              updatedAt: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              description: true,
              status: true,
              method: true,
              isEscrow: true,
              escrowFee: true,
              createdAt: true,
              updatedAt: true,
              paidAt: true,
              releasedAt: true,
            },
          },
        },
        orderBy: { [sortBy as string]: sortOrder },
        skip,
        take: limitNum,
      });

      // Get total count for pagination
      const total = await prisma.job.count({ where });

      // Transform jobs for frontend
      const transformedJobs = jobs.map((job) => ({
        ...job,
        customer: {
          id: job.customer.id,
          firstName: job.customer.firstName,
          lastName: job.customer.lastName,
          email: job.customer.email,
          phone: job.customer.phone,
        },
        assignedVendor: job.assignedVendor
          ? {
              id: job.assignedVendor.id,
              firstName: job.assignedVendor.firstName,
              lastName: job.assignedVendor.lastName,
              email: job.assignedVendor.email,
              companyName: job.assignedVendor.vendorProfile?.companyName,
            }
          : undefined,
        bids: job.bids.map((bid) => ({
          ...bid,
          vendor: {
            id: bid.vendor.id,
            firstName: bid.vendor.firstName,
            lastName: bid.vendor.lastName,
            email: bid.vendor.email,
            companyName: bid.vendor.vendorProfile?.companyName,
          },
        })),
      }));

      const pagination = {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      };

      // Log admin action
      await this.logAdminAction(adminId, 'VIEW_JOBS', 'JOB', 'BULK', {
        page: pageNum,
        limit: limitNum,
        filters: { status, category, search },
        jobsViewed: jobs.length,
      });

      res.json({
        success: true,
        data: {
          jobs: transformedJobs,
          pagination,
        },
      });
    } catch (error) {
      logger.error('Failed to get all jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get jobs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getJobDetails(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const { jobId } = req.params;

      const job = await prisma.job.findUnique({
        where: { id: jobId, isDeleted: false },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedVendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              vendorProfile: {
                select: { companyName: true },
              },
            },
          },
          bids: {
            include: {
              vendor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  vendorProfile: {
                    select: { companyName: true },
                  },
                },
              },
            },
          },
          payments: true,
        },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      // Transform job for frontend
      const transformedJob = {
        ...job,
        customer: {
          id: job.customer.id,
          firstName: job.customer.firstName,
          lastName: job.customer.lastName,
          email: job.customer.email,
          phone: job.customer.phone,
        },
        assignedVendor: job.assignedVendor
          ? {
              id: job.assignedVendor.id,
              firstName: job.assignedVendor.firstName,
              lastName: job.assignedVendor.lastName,
              email: job.assignedVendor.email,
              companyName: job.assignedVendor.vendorProfile?.companyName,
            }
          : undefined,
        bids: job.bids.map((bid) => ({
          ...bid,
          vendor: {
            id: bid.vendor.id,
            firstName: bid.vendor.firstName,
            lastName: bid.vendor.lastName,
            email: bid.vendor.email,
            companyName: bid.vendor.vendorProfile?.companyName,
          },
        })),
      };

      // Log admin action
      await this.logAdminAction(adminId, 'VIEW_JOB_DETAILS', 'JOB', jobId, {
        jobTitle: job.title,
        jobStatus: job.status,
      });

      res.json({
        success: true,
        data: transformedJob,
      });
    } catch (error) {
      logger.error('Failed to get job details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get job details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateJobStatus(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const { jobId } = req.params;
      const { status, reason } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
        });
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId, isDeleted: false },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: { status: status as any },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedVendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              vendorProfile: {
                select: { companyName: true },
              },
            },
          },
        },
      });

      // Log admin action
      await this.logAdminAction(adminId, 'UPDATE_JOB_STATUS', 'JOB', jobId, {
        oldStatus: job.status,
        newStatus: status,
        reason,
        jobTitle: job.title,
      });

      res.json({
        success: true,
        message: 'Job status updated successfully',
        data: updatedJob,
      });
    } catch (error) {
      logger.error('Failed to update job status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update job status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteJob(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const { jobId } = req.params;
      const { reason } = req.body;

      const job = await prisma.job.findUnique({
        where: { id: jobId, isDeleted: false },
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      // Soft delete the job
      const deletedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: adminId,
        },
      });

      // Log admin action
      await this.logAdminAction(adminId, 'DELETE_JOB', 'JOB', jobId, {
        jobTitle: job.title,
        reason,
        jobStatus: job.status,
      });

      res.json({
        success: true,
        message: 'Job deleted successfully',
        data: deletedJob,
      });
    } catch (error) {
      logger.error('Failed to delete job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete job',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async bulkUpdateJobStatus(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const { jobIds, status, reason } = req.body;

      if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Job IDs array is required',
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
        });
      }

      // Update all jobs in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedJobs = [];
        for (const jobId of jobIds) {
          const job = await tx.job.findUnique({
            where: { id: jobId, isDeleted: false },
          });

          if (job) {
            const updatedJob = await tx.job.update({
              where: { id: jobId },
              data: { status: status as any },
            });
            updatedJobs.push(updatedJob);
          }
        }
        return updatedJobs;
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        'BULK_UPDATE_JOB_STATUS',
        'JOB',
        'BULK',
        {
          jobIds,
          newStatus: status,
          reason,
          updatedCount: result.length,
        }
      );

      res.json({
        success: true,
        message: `Status updated for ${result.length} jobs`,
        data: { updatedJobs: result },
      });
    } catch (error) {
      logger.error('Failed to bulk update job status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update job status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async bulkDeleteJobs(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const { jobIds, reason } = req.body;

      if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Job IDs array is required',
        });
      }

      // Soft delete all jobs in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const deletedJobs = [];
        for (const jobId of jobIds) {
          const job = await tx.job.findUnique({
            where: { id: jobId, isDeleted: false },
          });

          if (job) {
            const deletedJob = await tx.job.update({
              where: { id: jobId },
              data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: adminId,
              },
            });
            deletedJobs.push(deletedJob);
          }
        }
        return deletedJobs;
      });

      // Log admin action
      await this.logAdminAction(adminId, 'BULK_DELETE_JOBS', 'JOB', 'BULK', {
        jobIds,
        reason,
        deletedCount: result.length,
      });

      res.json({
        success: true,
        message: `Successfully deleted ${result.length} jobs`,
        data: { deletedJobs: result },
      });
    } catch (error) {
      logger.error('Failed to bulk delete jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk delete jobs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async exportJobs(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const { format = 'csv', status, category, search } = req.query;

      // Build where clause
      const where: any = { isDeleted: false };

      if (status && status !== 'all') {
        where.status = status;
      }

      if (category && category !== 'all') {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          {
            customer: {
              firstName: { contains: search as string, mode: 'insensitive' },
            },
          },
          {
            customer: {
              lastName: { contains: search as string, mode: 'insensitive' },
            },
          },
        ];
      }

      // Get all jobs matching criteria
      const jobs = await prisma.job.findMany({
        where,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          assignedVendor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              vendorProfile: {
                select: { companyName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Log admin action
      await this.logAdminAction(adminId, 'EXPORT_JOBS', 'JOB', 'BULK', {
        format,
        status,
        category,
        search,
        jobCount: jobs.length,
      });

      if (format === 'csv') {
        // Generate CSV
        const csvHeaders = [
          'ID',
          'Title',
          'Description',
          'Category',
          'Subcategory',
          'Budget',
          'Budget Type',
          'Status',
          'Priority',
          'Location',
          'Is Remote',
          'Deadline',
          'Customer Name',
          'Customer Email',
          'Customer Phone',
          'Assigned Vendor',
          'Created At',
          'Updated At',
        ];

        const csvRows = jobs.map((job) => [
          job.id,
          job.title,
          job.description,
          job.category,
          job.subcategory || '',
          job.budget || '',
          job.budgetType,
          job.status,
          job.priority,
          job.location || '',
          job.isRemote ? 'Yes' : 'No',
          job.deadline ? job.deadline.toISOString().split('T')[0] : '',
          `${job.customer.firstName} ${job.customer.lastName}`,
          job.customer.email,
          job.customer.phone || '',
          job.assignedVendor
            ? `${job.assignedVendor.firstName} ${job.assignedVendor.lastName}`
            : '',
          job.createdAt.toISOString().split('T')[0],
          job.updatedAt.toISOString().split('T')[0],
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=jobs_export_${new Date().toISOString().split('T')[0]}.csv`
        );
        res.send(csvContent);
      } else {
        // Return JSON
        res.json({
          success: true,
          data: jobs,
          exportInfo: {
            format,
            status,
            category,
            search,
            exportedAt: new Date().toISOString(),
            totalJobs: jobs.length,
          },
        });
      }
    } catch (error) {
      logger.error('Failed to export jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export jobs',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ========================================
  // JOB MANAGEMENT
  // ========================================

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
        totalJobs: user.customerProfile?.totalJobsPosted || 0,
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
            OR: [{ reviewerId: userId }],
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
              OR: [{ reviewerId: userId }],
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
          0,
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

  // Helper method to convert data to CSV format
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  // ========================================
  // PAYMENT MANAGEMENT
  // ========================================

  async getAllPayments(req: Request, res: Response) {
    try {
      console.log('🔍 Starting getAllPayments...');

      const { status, type, page = 1, limit = 10, search } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      console.log('📋 Query params:', {
        status,
        type,
        page: pageNum,
        limit: limitNum,
        search,
      });

      // Build where clause
      const whereClause: any = {};

      if (status && status !== 'all') {
        whereClause.status = status;
      }

      if (type && type !== 'all') {
        whereClause.isEscrow = type === 'ESCROW';
      }

      console.log('🔍 Where clause:', whereClause);

      // Get total count
      const totalPayments = await prisma.payment.count({ where: whereClause });
      console.log('📊 Total payments count:', totalPayments);

      // Get payments with pagination
      const payments = await prisma.payment.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              budget: true,
              budgetType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      });

      console.log('📋 Fetched payments:', payments.length);

      // Transform data for frontend
      const transformedPayments = payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        status: payment.status,
        method: payment.method,
        isEscrow: payment.isEscrow,
        escrowFee: payment.escrowFee,
        platformFee: (payment as any).platformFee || 0,
        netAmount:
          (payment as any).netAmount ||
          payment.amount - ((payment as any).platformFee || 0),
        jobId: payment.jobId,
        customerId: payment.customerId,
        vendorId: payment.vendorId,
        transactionId: (payment as any).transactionId,
        paymentMethod: (payment as any).paymentMethod,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        releasedAt: payment.releasedAt,
        customer: {
          firstName: payment.customer.firstName,
          lastName: payment.customer.lastName,
          email: payment.customer.email,
          phone: payment.customer.phone,
        },
        vendor: {
          firstName: payment.vendor.firstName,
          lastName: payment.vendor.lastName,
          email: payment.vendor.email,
          phone: payment.vendor.phone,
        },
        job: payment.job
          ? {
              id: payment.job.id,
              title: payment.job.title,
              description: payment.job.description,
              budget: payment.job.budget,
              budgetType: payment.job.budgetType,
            }
          : null,
      }));

      console.log('✅ Transformed payments successfully');

      res.json({
        success: true,
        data: {
          payments: transformedPayments,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalPayments,
            totalPages: Math.ceil(totalPayments / limitNum),
          },
        },
      });
    } catch (error) {
      console.error('❌ Error in getAllPayments:', error);
      logger.error('Failed to fetch payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getPaymentStats(req: Request, res: Response) {
    try {
      console.log('🔍 Starting getPaymentStats...');

      // Get payment statistics
      const [
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalRevenue,
        totalPlatformFees,
        totalEscrowFees,
        monthlyRevenue,
        monthlyGrowth,
      ] = await Promise.all([
        prisma.payment.count(),
        prisma.payment.count({ where: { status: 'RELEASED' } }),
        prisma.payment.count({ where: { status: 'PENDING' } }),
        prisma.payment.count({ where: { status: 'DISPUTED' } }),
        prisma.payment.aggregate({
          where: { status: 'RELEASED' },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: { status: 'RELEASED' },
          _sum: { escrowFee: true },
        }),
        prisma.payment.aggregate({
          where: { status: 'RELEASED' },
          _sum: { escrowFee: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: 'RELEASED',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: 'RELEASED',
            createdAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 1,
                1
              ),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
      ]);

      const totalRevenueAmount = totalRevenue._sum.amount || 0;
      const totalPlatformFeesAmount = totalPlatformFees._sum.escrowFee || 0;
      const totalEscrowFeesAmount = totalEscrowFees._sum.escrowFee || 0;
      const monthlyRevenueAmount = monthlyRevenue._sum.amount || 0;
      const lastMonthRevenue = monthlyGrowth._sum.amount || 0;

      const monthlyGrowthPercentage =
        lastMonthRevenue > 0
          ? (
              ((monthlyRevenueAmount - lastMonthRevenue) / lastMonthRevenue) *
              100
            ).toFixed(1)
          : '0.0';

      const successRate =
        totalPayments > 0
          ? ((completedPayments / totalPayments) * 100).toFixed(1)
          : '0.0';

      console.log('✅ Payment stats calculated successfully');

      res.json({
        success: true,
        data: {
          totalPayments,
          completedPayments,
          pendingPayments,
          failedPayments,
          totalRevenue: totalRevenueAmount,
          totalPlatformFees: totalPlatformFeesAmount,
          totalEscrowFees: totalEscrowFeesAmount,
          monthlyRevenue: monthlyRevenueAmount,
          monthlyGrowth: `${monthlyGrowthPercentage}%`,
          successRate: `${successRate}%`,
          pendingAmount: pendingPayments * 1000, // Mock calculation
        },
      });
    } catch (error) {
      console.error('❌ Error in getPaymentStats:', error);
      logger.error('Failed to get payment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { status, reason } = req.body;
      const adminId = (req as any).user?.id;

      console.log('🔍 Updating payment status:', { paymentId, status, reason });

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Admin authentication required',
        });
      }

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          customer: true,
          vendor: true,
          job: true,
        },
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: status as any,
          updatedAt: new Date(),
          ...(status === 'RELEASED' && { releasedAt: new Date() }),
          ...(status === 'PAID' && { paidAt: new Date() }),
        },
      });

      // Log admin action
      await this.logAdminAction(
        adminId,
        'UPDATE_PAYMENT_STATUS',
        'PAYMENT',
        paymentId,
        { oldStatus: payment.status, newStatus: status, reason }
      );

      console.log('✅ Payment status updated successfully');

      res.json({
        success: true,
        data: updatedPayment,
        message: 'Payment status updated successfully',
      });
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      logger.error('Failed to update payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async exportPayments(req: Request, res: Response) {
    try {
      const { format = 'csv', status, type } = req.query;

      console.log('🔍 Exporting payments:', { format, status, type });

      // Build where clause
      const whereClause: any = {};

      if (status && status !== 'all') {
        whereClause.status = status;
      }

      if (type && type !== 'all') {
        whereClause.isEscrow = type === 'ESCROW';
      }

      // Get all payments for export
      const payments = await prisma.payment.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          vendor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          job: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'csv') {
        const csvData = payments.map((payment) => ({
          'Payment ID': payment.id,
          Amount: payment.amount,
          Currency: payment.currency,
          Status: payment.status,
          Method: payment.method,
          Customer: `${payment.customer.firstName} ${payment.customer.lastName}`,
          'Customer Email': payment.customer.email,
          Vendor: `${payment.vendor.firstName} ${payment.vendor.lastName}`,
          'Vendor Email': payment.vendor.email,
          'Job Title': payment.job?.title || 'N/A',
          'Created Date': payment.createdAt.toISOString(),
          'Platform Fee': (payment as any).platformFee || 0,
          'Net Amount':
            (payment as any).netAmount ||
            payment.amount - ((payment as any).platformFee || 0),
        }));

        const csv = this.convertToCSV(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=payments.csv'
        );
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: payments,
        });
      }
    } catch (error) {
      console.error('❌ Error exporting payments:', error);
      logger.error('Failed to export payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export payments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // ========================================
  // ADMIN DASHBOARD STATS & NOTIFICATIONS
  // ========================================

  // Temporarily commented out due to TypeScript compilation issues
  /*
  async getAdminDashboardStats(req: Request, res: Response) {
    try {
      console.log('🔍 Getting admin dashboard stats...');

      // Get comprehensive dashboard statistics
      const results = await Promise.all([
        // User counts
        prisma.user.count(),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.user.count({ where: { role: 'VENDOR' } }),
        
        // Job counts
        prisma.job.count(),
        prisma.job.count({ where: { status: 'OPEN' } }),
        
        // Payment counts
        prisma.payment.count(),
        prisma.payment.aggregate({
          where: { status: 'RELEASED' },
          _sum: { amount: true },
        }),
        
        // Vendor approvals
        prisma.user.count({ 
          where: { 
            role: 'VENDOR', 
            status: 'ACTIVE' 
          } 
        }),
        
        // Support tickets
        prisma.supportTicket.count({ 
          where: { 
            status: 'OPEN' 
          } 
        }),
        
        // Revenue calculations
        prisma.payment.aggregate({
          where: { status: 'RELEASED' },
          _sum: { amount: true },
        }),
        
        // Monthly growth calculation
        prisma.payment.aggregate({
          where: {
            status: 'RELEASED',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
        
        // Recent admin activities
        prisma.adminActionLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        
        // System alerts (users with issues, failed payments, etc.)
        prisma.user.count({
          where: {
            OR: [
              { status: 'SUSPENDED' },
              { status: 'ACTIVE' },
            ],
          },
        }),
      ]);

      const totalRevenueAmount = results[6]._sum?.amount || 0;
      const lastMonthRevenue = results[8]._sum?.amount || 0;
      const monthlyGrowthPercentage = lastMonthRevenue > 0 
        ? (((totalRevenueAmount - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
        : '0.0';

      // Calculate notification count
      const notificationCount = results[5] + results[6] + results[10];

      console.log('✅ Admin dashboard stats calculated successfully');

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers: results[0],
            totalCustomers: results[1],
            totalVendors: results[2],
            totalJobs: results[3],
            openJobs: results[4],
            totalPayments: results[5],
            totalRevenue: totalRevenueAmount,
            monthlyGrowth: `${monthlyGrowthPercentage}%`,
          },
          pendingActions: {
            vendorApprovals: results[5],
            supportTickets: results[6],
            systemAlerts: results[10],
            totalNotifications: notificationCount,
          },
          recentActivities: results[9].map((activity: any) => ({
            id: activity.id,
            action: activity.action,
            details: activity.details,
            adminName: `${activity.admin.firstName} ${activity.admin.lastName}`,
            timestamp: activity.createdAt,
            severity: activity.severity,
          })),
          quickStats: {
            activeUsers: results[0] - results[10],
            successRate: results[3] > 0 ? ((results[3] - results[6]) / results[3] * 100).toFixed(1) : '0.0',
            averageJobValue: results[3] > 0 ? (totalRevenueAmount / results[3]).toFixed(2) : '0.00',
          },
        },
      });
    } catch (error) {
      console.error('❌ Error getting admin dashboard stats:', error);
      logger.error('Failed to get admin dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAdminNotifications(req: Request, res: Response) {
    try {
      console.log('🔍 Getting admin notifications...');

      const [
        pendingVendors,
        urgentTickets,
        systemIssues,
        recentPayments,
      ] = await Promise.all([
        // Pending vendor approvals
        prisma.user.findMany({
          where: { 
            role: 'VENDOR', 
            status: 'PENDING' 
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            vendorProfile: {
              select: {
                companyName: true,
                businessType: true,
              },
            },
          },
        }),
        
        // Urgent support tickets
        prisma.supportTicket.findMany({
          where: { 
            priority: 'HIGH',
            status: 'OPEN'
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
            createdAt: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        
        // System issues (failed payments, suspended users, etc.)
        prisma.payment.findMany({
          where: { 
            status: 'FAILED' 
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        
        // Recent large payments
        prisma.payment.findMany({
          where: { 
            status: 'RELEASED',
            amount: { gte: 1000 } // Payments over $1000
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            createdAt: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            vendor: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
      ]);

      console.log('✅ Admin notifications fetched successfully');

      res.json({
        success: true,
        data: {
          pendingVendors: pendingVendors.map(vendor => ({
            id: vendor.id,
            name: `${vendor.firstName} ${vendor.lastName}`,
            email: vendor.email,
            company: vendor.vendorProfile?.companyName || 'N/A',
            businessType: vendor.vendorProfile?.businessType || 'N/A',
            pendingSince: vendor.createdAt,
            type: 'vendor_approval',
            priority: 'medium',
          })),
          urgentTickets: urgentTickets.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            priority: ticket.priority,
            status: ticket.status,
            customer: `${ticket.customer.firstName} ${ticket.customer.lastName}`,
            customerEmail: ticket.customer.email,
            createdAt: ticket.createdAt,
            type: 'support_ticket',
            priority: 'high',
          })),
          systemIssues: systemIssues.map(issue => ({
            id: issue.id,
            type: 'failed_payment',
            amount: issue.amount,
            customer: `${issue.customer.firstName} ${issue.customer.lastName}`,
            createdAt: issue.createdAt,
            priority: 'high',
          })),
          recentPayments: recentPayments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            customer: `${payment.customer.firstName} ${payment.customer.lastName}`,
            vendor: `${payment.vendor.firstName} ${payment.vendor.lastName}`,
            createdAt: payment.createdAt,
            type: 'large_payment',
            priority: 'low',
          })),
        },
      });
    } catch (error) {
      console.error('❌ Error getting admin notifications:', error);
      logger.error('Failed to get admin notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  */
}
