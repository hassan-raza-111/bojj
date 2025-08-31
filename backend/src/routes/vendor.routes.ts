import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRole } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication and role validation to all routes
router.use(authenticateToken);
router.use(validateRole(['VENDOR']));

// Dashboard summary
router.get('/dashboard/summary', VendorController.getDashboardSummary);

// Available jobs
router.get('/jobs/available', VendorController.getAvailableJobs);

// Active bids
router.get('/bids/active', VendorController.getActiveBids);

// Awarded jobs
router.get('/jobs/awarded', VendorController.getAwardedJobs);

// Earnings
router.get('/earnings', VendorController.getEarnings);

// Submit bid
router.post('/bids/submit', VendorController.submitBid);

// Get job details for bidding
router.get('/jobs/:jobId/details', VendorController.getJobDetails);

export default router;
