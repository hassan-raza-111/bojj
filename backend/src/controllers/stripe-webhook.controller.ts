import { Request, Response } from 'express';
import { PrismaClient, PaymentStatus } from '@prisma/client';
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

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!stripe) {
    logger.error('Stripe not initialized');
    return res.status(500).json({ error: 'Stripe not initialized' });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      webhookSecret
    );
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    return res
      .status(400)
      .json({ error: 'Webhook signature verification failed' });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  const { paymentId, jobId, customerId, vendorId } = paymentIntent.metadata;

  if (!paymentId) {
    logger.error('No payment ID found in payment intent metadata');
    return;
  }

  try {
    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        transactionId: paymentIntent.id,
        paidAt: new Date(),
      },
    });

    // Update job status if needed
    if (jobId) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'IN_PROGRESS',
          paymentStatus: 'PAID',
        },
      });
    }

    logger.info(`Payment ${paymentId} completed successfully`);
  } catch (error) {
    logger.error('Error updating payment status:', error);
  }
};

// Handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent: any) => {
  const { paymentId } = paymentIntent.metadata;

  if (!paymentId) {
    logger.error('No payment ID found in payment intent metadata');
    return;
  }

  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.DISPUTED,
        transactionId: paymentIntent.id,
      },
    });

    logger.info(`Payment ${paymentId} failed`);
  } catch (error) {
    logger.error('Error updating failed payment status:', error);
  }
};

// Handle canceled payment intent
const handlePaymentIntentCanceled = async (paymentIntent: any) => {
  const { paymentId } = paymentIntent.metadata;

  if (!paymentId) {
    logger.error('No payment ID found in payment intent metadata');
    return;
  }

  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.DISPUTED,
        transactionId: paymentIntent.id,
      },
    });

    logger.info(`Payment ${paymentId} canceled`);
  } catch (error) {
    logger.error('Error updating canceled payment status:', error);
  }
};

// Handle successful charge
const handleChargeSucceeded = async (charge: any) => {
  logger.info(`Charge ${charge.id} succeeded`);
  // Additional charge-specific logic can be added here
};

// Handle failed charge
const handleChargeFailed = async (charge: any) => {
  logger.info(`Charge ${charge.id} failed`);
  // Additional charge-specific logic can be added here
};

// Handle refunded charge
const handleChargeRefunded = async (charge: any) => {
  try {
    // Find payment by charge ID
    const payment = await prisma.payment.findFirst({
      where: { transactionId: charge.payment_intent },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
        },
      });

      logger.info(`Payment ${payment.id} refunded`);
    }
  } catch (error) {
    logger.error('Error processing refund:', error);
  }
};
