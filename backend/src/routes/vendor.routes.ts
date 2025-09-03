import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRole } from '../middleware/validation.middleware';

const router = Router();

// Test route to verify vendor routes are working (no auth required for testing)
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit!');
  res.json({
    message: 'Vendor routes are working!',
    timestamp: new Date().toISOString(),
  });
});

// Temporarily bypass auth for testing available jobs
router.get('/jobs/available', (req, res) => {
  console.log(
    '🔍 /jobs/available route hit! (bypassed auth for testing)',
    req.url,
    req.method
  );
  // Temporarily bypass auth for testing
  VendorController.getAvailableJobs(req, res);
});

// Temporarily bypass auth for testing filters
router.get('/jobs/filters', (req, res) => {
  console.log(
    '🔍 /jobs/filters route hit! (bypassed auth for testing)',
    req.url,
    req.method
  );
  // Temporarily bypass auth for testing
  VendorController.getAvailableFilters(req, res);
});

// Protected routes (require authentication)
router.use(authenticateToken);
router.use(validateRole(['VENDOR']));

// Dashboard
router.get('/dashboard', VendorController.getDashboardSummary);

// Jobs
router.get('/jobs/active-bids', VendorController.getActiveBids);
router.get('/jobs/awarded', VendorController.getAwardedJobs);
router.get('/jobs/:jobId', VendorController.getJobDetails);

// Bids
router.get('/bids', VendorController.getAllBids);
router.get('/bids/:bidId', VendorController.getBidDetails);
router.put('/bids/:bidId', VendorController.updateBid);
router.delete('/bids/:bidId', VendorController.withdrawBid);
router.post('/bids', VendorController.submitBid);

// Earnings
router.get('/earnings', VendorController.getEarnings);

export default router;
