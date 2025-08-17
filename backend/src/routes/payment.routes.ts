import { Router } from 'express';
import {
  processPayment,
  releasePayment,
  refundPayment,
  getPaymentDetails,
  getCustomerPaymentHistory,
  getVendorPaymentHistory,
  getAllPayments,
} from '../controllers/payment.controller';
import {
  authenticateToken,
  requireCustomer,
  requireVendor,
  requireCustomerOrVendor,
  requireOwnership,
  requireAdmin,
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { processPaymentSchema } from '../utils/schemas';

const router = Router();

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllPayments);

// Payment processing (Customer only)
router.post(
  '/:paymentId/process',
  authenticateToken,
  requireCustomer,
  validateRequest(processPaymentSchema),
  processPayment
);

// Payment management (Admin only)
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

// Payment viewing (owner or admin)
router.get(
  '/:paymentId',
  authenticateToken,
  requireOwnership('payment'),
  getPaymentDetails
);

// Payment history (authenticated users)
router.get(
  '/customer/history',
  authenticateToken,
  requireCustomer,
  getCustomerPaymentHistory
);
router.get(
  '/vendor/history',
  authenticateToken,
  requireVendor,
  getVendorPaymentHistory
);

export const paymentRouter = router;
