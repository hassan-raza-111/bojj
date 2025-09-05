import express from 'express';
import { processPaymentSchema } from '../utils/schemas';
import {
  processPayment,
  releasePayment,
  refundPayment,
  getPaymentDetails,
  getCustomerPayments,
  getVendorPayments,
  getAllPayments,
  createPaymentIntent,
} from '../controllers/payment.controller';
import { handleStripeWebhook } from '../controllers/stripe-webhook.controller';
import {
  authenticateToken,
  requireAdmin,
  requireCustomer,
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = express.Router();

// Stripe webhook endpoint (no authentication required)
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Customer routes
router.get(
  '/customer/:customerId',
  authenticateToken,
  requireCustomer,
  getCustomerPayments
);
router.get('/vendor/:vendorId', authenticateToken, getVendorPayments);
router.get('/:paymentId', authenticateToken, getPaymentDetails);

// Payment creation routes
router.post(
  '/stripe/create-intent',
  authenticateToken,
  requireCustomer,
  createPaymentIntent
);

// Payment processing (Customer only)
router.post(
  '/:paymentId/process',
  authenticateToken,
  requireCustomer,
  validateRequest(processPaymentSchema),
  processPayment
);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllPayments);
router.post(
  '/:paymentId/release',
  authenticateToken,
  requireAdmin,
  releasePayment
);
router.post(
  '/:paymentId/refund',
  authenticateToken,
  requireAdmin,
  refundPayment
);

export default router;
