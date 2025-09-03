import { Request, Response, NextFunction, RequestHandler } from 'express';
import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Initialize payment gateways
let stripe: any = null;
let paypal: any = null;

const initializePaymentGateways = () => {
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = require('stripe');
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia',
      });
    }

    if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
      paypal = require('paypal-rest-sdk');
      paypal.configure({
        mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
      });
    }
  } catch (error) {
    logger.error('Error initializing payment gateways:', error);
  }
};

initializePaymentGateways();

// Create payment intent for Stripe
export const createPaymentIntent: RequestHandler = async (req, res, next) => {
  try {
    const { amount, currency = 'usd', jobId, customerId, vendorId } = req.body;

    if (!amount || !jobId || !customerId || !vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, jobId, customerId, and vendorId are required',
      });
    }

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured',
      });
    }

    // Calculate fees
    const platformFee = amount * 0.05; // 5% platform fee
    const escrowFee = amount * 0.02; // 2% escrow fee
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
      },
    });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        paymentId: payment.id,
        jobId,
        customerId,
        vendorId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
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

// Create PayPal payment
export const createPayPalPayment: RequestHandler = async (req, res, next) => {
  try {
    const { amount, currency = 'USD', jobId, customerId, vendorId } = req.body;

    if (!amount || !jobId || !customerId || !vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, jobId, customerId, and vendorId are required',
      });
    }

    if (!paypal) {
      return res.status(500).json({
        success: false,
        message: 'PayPal is not configured',
      });
    }

    // Calculate fees
    const platformFee = amount * 0.05; // 5% platform fee
    const escrowFee = amount * 0.02; // 2% escrow fee
    const netAmount = amount - platformFee - escrowFee;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: currency.toUpperCase(),
        description: `Payment for job ${jobId}`,
        method: PaymentMethod.PAYPAL,
        isEscrow: true,
        escrowFee,
        platformFee,
        netAmount,
        jobId,
        customerId,
        vendorId,
      },
    });

    // Create PayPal payment
    const createPayment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?paymentId=${payment.id}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?paymentId=${payment.id}`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: `Job Payment - ${jobId}`,
                sku: jobId,
                price: amount.toFixed(2),
                currency: currency.toUpperCase(),
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: currency.toUpperCase(),
            total: amount.toFixed(2),
            details: {
              subtotal: amount.toFixed(2),
              tax: '0.00',
              shipping: '0.00',
              handling_fee: '0.00',
              shipping_discount: '0.00',
              insurance: '0.00',
            },
          },
          description: `Payment for job ${jobId}`,
        },
      ],
    };

    paypal.payment.create(createPayment, (error: any, paypalPayment: any) => {
      if (error) {
        logger.error('PayPal payment creation error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create PayPal payment',
        });
      }

      // Update payment record with PayPal payment ID
      prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: paypalPayment.id },
      });

      res.json({
        success: true,
        data: {
          paymentId: payment.id,
          approvalUrl: paypalPayment.links.find(
            (link: any) => link.rel === 'approval_url'
          )?.href,
        },
      });
    });
  } catch (error) {
    logger.error('Error creating PayPal payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PayPal payment',
    });
  }
};

// Process manual payment (Bank Transfer, Cash, etc.)
export const createManualPayment: RequestHandler = async (req, res, next) => {
  try {
    const {
      amount,
      currency = 'USD',
      jobId,
      customerId,
      vendorId,
      paymentMethod,
      referenceNumber,
      notes,
    } = req.body;

    if (!amount || !jobId || !customerId || !vendorId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          'Amount, jobId, customerId, vendorId, and paymentMethod are required',
      });
    }

    // Calculate fees
    const platformFee = amount * 0.05; // 5% platform fee
    const escrowFee = amount * 0.02; // 2% escrow fee
    const netAmount = amount - platformFee - escrowFee;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency: currency.toUpperCase(),
        description: `Manual payment for job ${jobId} - ${notes || ''}`,
        method: PaymentMethod.BANK_TRANSFER,
        isEscrow: true,
        escrowFee,
        platformFee,
        netAmount,
        jobId,
        customerId,
        vendorId,
        transactionId: referenceNumber || undefined,
        paymentMethod: paymentMethod,
      },
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        message:
          'Manual payment created successfully. Admin will verify and process.',
      },
    });
  } catch (error) {
    logger.error('Error creating manual payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual payment',
    });
  }
};

// Process payment and put in escrow (Customer only)
export const processPayment: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, transactionId, customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        job: true,
        vendor: true,
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    if (payment.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: 'You can only process your own payments',
      });
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: 'Payment has already been processed',
      });
      return;
    }

    // Update payment status to IN_ESCROW
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.IN_ESCROW,
        paymentMethod,
        transactionId: transactionId || `sim_${Date.now()}`,
        paidAt: new Date(),
      },
      include: {
        job: true,
        vendor: true,
      },
    });

    // Update job status to IN_PROGRESS
    if (payment.jobId) {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: {
          status: 'IN_PROGRESS',
        },
      });
    }

    logger.info(`Payment processed: ${paymentId} for job: ${payment.jobId}`);
    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment processed successfully and held in escrow',
    });
    return;
  } catch (error) {
    logger.error('Error processing payment:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
    });
    return;
  }
};

// Release payment to vendor (Admin only, or automatic after job completion)
export const releasePayment: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        job: true,
        vendor: true,
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    if (payment.status !== PaymentStatus.IN_ESCROW) {
      res.status(400).json({
        success: false,
        message: 'Payment is not in escrow',
      });
      return;
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.RELEASED,
        releasedAt: new Date(),
      },
    });

    // Update vendor's completed jobs count
    try {
      await prisma.vendorProfile.update({
        where: { userId: payment.vendorId },
        data: {
          completedJobs: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      logger.warn(`Vendor profile not found for user: ${payment.vendorId}`);
    }

    // Update job status to COMPLETED
    if (payment.jobId) {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: {
          status: 'COMPLETED',
          completionDate: new Date(),
        },
      });
    }

    logger.info(
      `Payment released: ${paymentId} to vendor: ${payment.vendorId}`
    );
    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment released successfully',
    });
    return;
  } catch (error) {
    logger.error('Error releasing payment:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to release payment',
    });
    return;
  }
};

// Refund payment to customer (Admin only, for disputes)
export const refundPayment: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        job: true,
        customer: true,
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    if (payment.status !== PaymentStatus.IN_ESCROW) {
      res.status(400).json({
        success: false,
        message: 'Payment is not in escrow',
      });
      return;
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    // Update job status to disputed
    if (payment.jobId) {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: {
          status: 'DISPUTED',
        },
      });
    }

    logger.info(
      `Payment refunded: ${paymentId} to customer: ${payment.customerId}`
    );
    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment refunded successfully',
    });
    return;
  } catch (error) {
    logger.error('Error refunding payment:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund payment',
    });
    return;
  }
};

// Get payment details
export const getPaymentDetails: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
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
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    res.json({
      success: true,
      data: payment,
    });
    return;
  } catch (error) {
    logger.error('Error fetching payment details:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
    });
    return;
  }
};

// Get customer's payments
export const getCustomerPayments: RequestHandler = async (req, res, next) => {
  try {
    const customerId = req.query.customerId as string;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
      return;
    }

    const where: any = { customerId };
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
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
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.payment.count({ where });

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    logger.error('Error fetching customer payments:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
    return;
  }
};

// Get vendor's payments
export const getVendorPayments: RequestHandler = async (req, res, next) => {
  try {
    const vendorId = req.query.vendorId as string;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (!vendorId) {
      res.status(400).json({
        success: false,
        message: 'vendorId is required',
      });
      return;
    }

    const where: any = { vendorId };
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
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
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.payment.count({ where });

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    logger.error('Error fetching vendor payments:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
    return;
  }
};

// Get all payments (Admin only)
export const getAllPayments: RequestHandler = async (req, res, next) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (method) where.method = method;

    const payments = await prisma.payment.findMany({
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
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        vendor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.payment.count({ where });

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    logger.error('Error fetching all payments:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
    return;
  }
};
