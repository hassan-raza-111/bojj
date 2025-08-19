import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, PaymentStatus } from "@prisma/client";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

// Process payment and put in escrow (Customer only)
export const processPayment: RequestHandler = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, transactionId, customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: "customerId is required",
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
        message: "Payment not found",
      });
      return;
    }

    if (payment.customerId !== customerId) {
      res.status(403).json({
        success: false,
        message: "You can only process your own payments",
      });
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: "Payment has already been processed",
      });
      return;
    }

    // In a real implementation, you would integrate with Stripe/PayPal here
    // For now, we'll simulate a successful payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.IN_ESCROW,
        paymentMethod,
        transactionId: transactionId || `sim_${Date.now()}`,
      },
      include: {
        job: true,
        vendor: true,
      },
    });

    logger.info(`Payment processed: ${paymentId} for job: ${payment.jobId}`);
    res.json({
      success: true,
      data: updatedPayment,
      message: "Payment processed successfully and held in escrow",
    });
    return;
  } catch (error) {
    logger.error("Error processing payment:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
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
        message: "Payment not found",
      });
      return;
    }

    if (payment.status !== PaymentStatus.IN_ESCROW) {
      res.status(400).json({
        success: false,
        message: "Payment is not in escrow",
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

    // Update vendor's total earnings
    await prisma.user.update({
      where: { id: payment.vendorId },
      data: {
        totalEarnings: {
          increment: payment.amount,
        },
      },
    });

    logger.info(
      `Payment released: ${paymentId} to vendor: ${payment.vendorId}`
    );
    res.json({
      success: true,
      data: updatedPayment,
      message: "Payment released successfully",
    });
    return;
  } catch (error) {
    logger.error("Error releasing payment:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to release payment",
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
        message: "Payment not found",
      });
      return;
    }

    if (payment.status !== PaymentStatus.IN_ESCROW) {
      res.status(400).json({
        success: false,
        message: "Payment is not in escrow",
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
    await prisma.job.update({
      where: { id: payment.jobId },
      data: {
        status: "DISPUTED",
      },
    });

    logger.info(
      `Payment refunded: ${paymentId} to customer: ${payment.customerId}`
    );
    res.json({
      success: true,
      data: updatedPayment,
      message: "Payment refunded successfully",
    });
    return;
  } catch (error) {
    logger.error("Error refunding payment:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to refund payment",
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
        message: "Payment not found",
      });
      return;
    }

    res.json({
      success: true,
      data: payment,
    });
    return;
  } catch (error) {
    logger.error("Error fetching payment details:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
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
        message: "customerId is required",
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
            rating: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: "desc" },
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
    logger.error("Error fetching customer payments:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
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
        message: "vendorId is required",
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
            rating: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: "desc" },
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
    logger.error("Error fetching vendor payments:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
    return;
  }
};
