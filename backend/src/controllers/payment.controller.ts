import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';
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
      logger.info('Stripe initialized successfully');
    } else {
      logger.warn('Stripe secret key not found in environment variables');
    }
  } catch (error) {
    logger.error('Error initializing Stripe:', error);
  }
};

initializeStripe();

// Create payment intent for Stripe
export const createPaymentIntent: RequestHandler = async (req, res, next) => {
  try {
    const { amount, currency = 'usd', jobId, customerId, vendorId } = req.body;

    // Validate required fields
    if (!amount || !jobId || !customerId || !vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, jobId, customerId, and vendorId are required',
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured',
      });
    }

    // Verify job exists and is assigned to the vendor
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        assignedVendorId: vendorId,
        status: {
          in: ['IN_PROGRESS'],
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not assigned to vendor',
      });
    }

    // Check if payment already exists for this job
    const existingPayment = await prisma.payment.findFirst({
      where: {
        jobId,
        status: {
          in: [PaymentStatus.PENDING, PaymentStatus.COMPLETED],
        },
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this job',
      });
    }

    // Calculate fees
    const platformFeePercentage = parseFloat(
      process.env.PLATFORM_FEE_PERCENTAGE || '5.0'
    );
    const escrowFeePercentage = parseFloat(
      process.env.ESCROW_FEE_PERCENTAGE || '2.0'
    );

    const platformFee = (amount * platformFeePercentage) / 100;
    const escrowFee = (amount * escrowFeePercentage) / 100;
    const netAmount = amount - platformFee - escrowFee;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: currency.toUpperCase(),
        description: `Payment for job ${jobId}`,
        method: PaymentMethod.STRIPE,
        isEscrow: true,
        escrowFee,
        platformFee,
        netAmount,
        jobId,
        customerId,
        vendorId,
        status: PaymentStatus.PENDING,
      },
    });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        paymentId: payment.id,
        jobId,
        customerId,
        vendorId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Payment for job ${jobId}`,
    });

    logger.info(
      `Payment intent created: ${paymentIntent.id} for payment: ${payment.id}`
    );

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
        platformFee,
        escrowFee,
        netAmount,
      },
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
    });
  }
};

// Get payment details
export const getPaymentDetails: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = (req as any).user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        OR: [{ customerId: userId }, { vendorId: userId }],
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            status: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Error getting payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
    });
  }
};

// Get customer payments
export const getCustomerPayments: RequestHandler = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const userId = (req as any).user.id;

    // Verify user is requesting their own payments
    if (customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const payments = await prisma.payment.findMany({
      where: {
        customerId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    logger.error('Error getting customer payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer payments',
    });
  }
};

// Get vendor payments
export const getVendorPayments: RequestHandler = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const userId = (req as any).user.id;

    // Verify user is requesting their own payments
    if (vendorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const payments = await prisma.payment.findMany({
      where: {
        vendorId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    logger.error('Error getting vendor payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor payments',
    });
  }
};

// Get all payments (Admin only)
export const getAllPayments: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, method } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (method) where.method = method;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
    });
  }
};

// Process payment (for manual confirmation)
export const processPayment: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, transactionId, customerId } = req.body;
    const userId = (req as any).user.id;

    // Verify user is the customer
    if (customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        customerId,
        status: PaymentStatus.PENDING,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or already processed',
      });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        transactionId,
        paidAt: new Date(),
      },
    });

    // Update job status
    if (payment.jobId) {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: {
          status: 'IN_PROGRESS',
          paymentStatus: 'PAID',
        },
      });
    }

    logger.info(`Payment ${paymentId} processed manually`);

    res.json({
      success: true,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
    });
  }
};

// Release payment to vendor (Admin only)
export const releasePayment: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        status: PaymentStatus.COMPLETED,
      },
      include: {
        job: true,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or not completed',
      });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.RELEASED,
        releasedAt: new Date(),
      },
    });

    // Update job status if completed
    if (payment.job && payment.job.status === 'COMPLETED') {
      await prisma.job.update({
        where: { id: payment.jobId! },
        data: {
          paymentStatus: 'RELEASED',
        },
      });
    }

    logger.info(`Payment ${paymentId} released to vendor`);

    res.json({
      success: true,
      message: 'Payment released successfully',
    });
  } catch (error) {
    logger.error('Error releasing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release payment',
    });
  }
};

// Refund payment (Admin only)
export const refundPayment: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason, amount } = req.body;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        status: {
          in: [PaymentStatus.COMPLETED, PaymentStatus.RELEASED],
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or cannot be refunded',
      });
    }

    // Process refund through Stripe if transaction ID exists
    if (payment.transactionId && stripe) {
      try {
        const refundAmount = amount || payment.amount;
        await stripe.refunds.create({
          payment_intent: payment.transactionId,
          amount: Math.round(refundAmount * 100), // Convert to cents
          reason: reason || 'requested_by_customer',
        });
      } catch (stripeError) {
        logger.error('Stripe refund error:', stripeError);
        return res.status(500).json({
          success: false,
          message: 'Failed to process refund through Stripe',
        });
      }
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    logger.info(`Payment ${paymentId} refunded`);

    res.json({
      success: true,
      message: 'Payment refunded successfully',
    });
  } catch (error) {
    logger.error('Error refunding payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment',
    });
  }
};
