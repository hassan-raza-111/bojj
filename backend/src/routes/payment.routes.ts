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
  createPayPalPayment,
  createManualPayment,
} from '../controllers/payment.controller';
import {
  authenticateToken,
  requireAdmin,
  requireCustomer,
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = express.Router();

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
router.post(
  '/paypal/create',
  authenticateToken,
  requireCustomer,
  createPayPalPayment
);
router.post(
  '/manual/create',
  authenticateToken,
  requireCustomer,
  createManualPayment
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
