import { Request, Response } from 'express';
import { PrismaClient, PayoutStatus, PayoutMethod } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Initialize Stripe
let stripe: any = null;
const initializeStripe = () => {
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = require('stripe');
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    }
  } catch (error) {
    logger.error('Error initializing Stripe:', error);
  }
};

initializeStripe();

// Vendor requests payout
export const requestPayout = async (req: Request, res: Response) => {
  try {
    const { vendorId, amount, method = 'STRIPE', description } = req.body;

    if (!vendorId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID and amount are required',
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Check vendor's available balance
    const availablePayments = await prisma.payment.findMany({
      where: {
        vendorId,
        status: 'RELEASED',
        vendorPayout: null, // Not already included in a payout
      },
    });

    const totalAvailable = availablePayments.reduce((sum, payment) => sum + payment.netAmount, 0);

    if (amount > totalAvailable) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $${totalAvailable.toFixed(2)}`,
      });
    }

    // Create payout request
    const payout = await prisma.vendorPayout.create({
      data: {
        vendorId,
        amount,
        method: method as PayoutMethod,
        description: description || `Payout request for $${amount}`,
        status: PayoutStatus.PENDING,
      },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Payout request created: ${payout.id} for vendor: ${vendorId}`);

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: { payout },
    });
  } catch (error) {
    logger.error('Error creating payout request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payout request',
    });
  }
};

// Get vendor's payout history
export const getVendorPayouts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const payouts = await prisma.vendorPayout.findMany({
      where: { vendorId },
      include: {
        payments: {
          select: {
            id: true,
            amount: true,
            jobId: true,
            job: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.vendorPayout.count({
      where: { vendorId },
    });

    res.json({
      success: true,
      data: payouts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Error fetching vendor payouts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payouts',
    });
  }
};

// Get vendor's available balance
export const getVendorBalance = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    // Get released payments not included in payouts
    const availablePayments = await prisma.payment.findMany({
      where: {
        vendorId,
        status: 'RELEASED',
        vendorPayout: null,
      },
    });

    const totalAvailable = availablePayments.reduce((sum, payment) => sum + payment.netAmount, 0);

    // Get pending payouts
    const pendingPayouts = await prisma.vendorPayout.findMany({
      where: {
        vendorId,
        status: PayoutStatus.PENDING,
      },
    });

    const totalPending = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);

    res.json({
      success: true,
      data: {
        availableBalance: totalAvailable,
        pendingPayouts: totalPending,
        netAvailable: totalAvailable - totalPending,
        paymentCount: availablePayments.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching vendor balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balance',
    });
  }
};

// Admin approves payout
export const approvePayout = async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    const { adminNotes } = req.body;

    const payout = await prisma.vendorPayout.findUnique({
      where: { id: payoutId },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (payout.status !== PayoutStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Payout is not pending',
      });
    }

    // Update payout status
    await prisma.vendorPayout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.APPROVED,
        adminNotes,
      },
    });

    logger.info(`Payout ${payoutId} approved by admin`);

    res.json({
      success: true,
      message: 'Payout approved successfully',
    });
  } catch (error) {
    logger.error('Error approving payout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve payout',
    });
  }
};

// Admin processes payout (sends money to vendor)
export const processPayout = async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    const { adminNotes } = req.body;

    const payout = await prisma.vendorPayout.findUnique({
      where: { id: payoutId },
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (payout.status !== PayoutStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'Payout must be approved first',
      });
    }

    let stripePayoutId = null;

    // Process payout based on method
    if (payout.method === PayoutMethod.STRIPE) {
      if (!stripe) {
        return res.status(500).json({
          success: false,
          message: 'Stripe is not configured',
        });
      }

      // Create Stripe payout
      const stripePayout = await stripe.payouts.create({
        amount: Math.round(payout.amount * 100), // Convert to cents
        currency: payout.currency.toLowerCase(),
        description: `Payout to ${payout.vendor.firstName} ${payout.vendor.lastName}`,
      });

      stripePayoutId = stripePayout.id;
    }

    // Update payout status
    await prisma.vendorPayout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PROCESSED,
        stripePayoutId,
        adminNotes,
        processedAt: new Date(),
      },
    });

    // Link payments to this payout
    const availablePayments = await prisma.payment.findMany({
      where: {
        vendorId: payout.vendorId,
        status: 'RELEASED',
        vendorPayout: null,
      },
      take: 10, // Limit to avoid over-processing
    });

    // Link payments to payout (up to the payout amount)
    let linkedAmount = 0;
    for (const payment of availablePayments) {
      if (linkedAmount >= payout.amount) break;
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          vendorPayoutId: payoutId,
        },
      });
      
      linkedAmount += payment.netAmount;
    }

    logger.info(`Payout ${payoutId} processed successfully`);

    res.json({
      success: true,
      message: 'Payout processed successfully',
      data: { stripePayoutId },
    });
  } catch (error) {
    logger.error('Error processing payout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payout',
    });
  }
};

// Admin rejects payout
export const rejectPayout = async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    const { adminNotes } = req.body;

    const payout = await prisma.vendorPayout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (payout.status !== PayoutStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Payout is not pending',
      });
    }

    // Update payout status
    await prisma.vendorPayout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.REJECTED,
        adminNotes,
      },
    });

    logger.info(`Payout ${payoutId} rejected by admin`);

    res.json({
      success: true,
      message: 'Payout rejected successfully',
    });
  } catch (error) {
    logger.error('Error rejecting payout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payout',
    });
  }
};

// Get all payouts (Admin only)
export const getAllPayouts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;

    const payouts = await prisma.vendorPayout.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            jobId: true,
            job: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.vendorPayout.count({ where });

    res.json({
      success: true,
      data: payouts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    logger.error('Error fetching all payouts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payouts',
    });
  }
};

