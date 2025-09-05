import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRole } from '../middleware/validation.middleware';

const router = Router();

// Protected routes (require authentication)
router.use(authenticateToken);
router.use(validateRole(['VENDOR']));

// Dashboard
router.get('/dashboard/summary', VendorController.getDashboardSummary);
router.get('/dashboard', VendorController.getDashboardSummary);

// Jobs
router.get('/jobs/available', VendorController.getAvailableJobs);
router.get('/jobs/filters', VendorController.getAvailableFilters);
router.get('/jobs/awarded', VendorController.getAwardedJobs);
router.get('/jobs/:jobId/details', VendorController.getJobDetails);

// Bids
router.get('/bids/active', VendorController.getActiveBids);
router.get('/bids', VendorController.getAllBids);
router.get('/bids/:bidId', VendorController.getBidDetails);
router.put('/bids/:bidId', VendorController.updateBid);
router.delete('/bids/:bidId', VendorController.withdrawBid);
router.post('/bids/submit', VendorController.submitBid);

// Earnings
router.get('/earnings', VendorController.getEarnings);

// Profile
router.get('/profile', VendorController.getProfile);
router.put('/profile', VendorController.updateProfile);

export default router;
