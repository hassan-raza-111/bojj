import express from 'express';
import {
  requestPayout,
  getVendorPayouts,
  getVendorBalance,
  approvePayout,
  processPayout,
  rejectPayout,
  getAllPayouts,
} from '../controllers/vendor-payout.controller';
import {
  authenticateToken,
  requireAdmin,
  requireVendor,
} from '../middleware/auth.middleware';

const router = express.Router();

// Vendor routes
router.post('/request', authenticateToken, requireVendor, requestPayout);
router.get('/vendor/:vendorId', authenticateToken, requireVendor, getVendorPayouts);
router.get('/vendor/:vendorId/balance', authenticateToken, requireVendor, getVendorBalance);

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllPayouts);
router.post('/admin/:payoutId/approve', authenticateToken, requireAdmin, approvePayout);
router.post('/admin/:payoutId/process', authenticateToken, requireAdmin, processPayout);
router.post('/admin/:payoutId/reject', authenticateToken, requireAdmin, rejectPayout);

export const vendorPayoutRouter = router;

