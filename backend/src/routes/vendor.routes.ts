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

// Apply authentication and role validation to all routes
router.use(authenticateToken);
router.use(validateRole(['VENDOR']));

// Dashboard summary
router.get('/dashboard/summary', VendorController.getDashboardSummary);

// Available jobs
router.get('/jobs/available', VendorController.getAvailableJobs);

// Get available filters for jobs (must come before :jobId route) - temporarily no auth for testing
router.get('/jobs/filters', (req, res) => {
  console.log('🔍 /jobs/filters route hit!', req.url, req.method);
  // Temporarily bypass auth for testing
  VendorController.getAvailableFilters(req, res);
});

// Get job details for bidding
router.get('/jobs/:jobId/details', VendorController.getJobDetails);

// Active bids
router.get('/bids/active', VendorController.getActiveBids);

// All bids with filtering
router.get('/bids', VendorController.getAllBids);

// Get bid details
router.get('/bids/:bidId', VendorController.getBidDetails);

// Update bid
router.put('/bids/:bidId', VendorController.updateBid);

// Withdraw bid
router.delete('/bids/:bidId', VendorController.withdrawBid);

// Awarded jobs
router.get('/jobs/awarded', VendorController.getAwardedJobs);

// Earnings
router.get('/earnings', VendorController.getEarnings);

// Submit bid
router.post('/bids/submit', VendorController.submitBid);

export default router;
