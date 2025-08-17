import { Router } from 'express';
import {
  createJob,
  getOpenJobs,
  getJobById,
  updateJob,
  deleteJob,
  submitBid,
  getJobBids,
  acceptBid,
  completeJob,
  getCustomerJobs,
  getVendorJobs,
  getAllJobs,
} from '../controllers/job.controller';
import {
  authenticateToken,
  requireCustomer,
  requireVendor,
  requireCustomerOrVendor,
  requireOwnership,
  requireAdmin,
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createJobSchema,
  createBidSchema,
  updateJobSchema,
} from '../utils/schemas';

const router = Router();

// Public routes (no authentication required)
router.get('/open', getOpenJobs); // Anyone can see open jobs

// Protected routes
router.get('/', authenticateToken, requireAdmin, getAllJobs); // Admin only

// Job management (Customer only)
router.post(
  '/',
  authenticateToken,
  requireCustomer,
  validateRequest(createJobSchema),
  createJob
);

router.get('/customer', authenticateToken, requireCustomer, getCustomerJobs);
router.get('/vendor', authenticateToken, requireVendor, getVendorJobs);

// Job operations (owner or admin)
router.get('/:id', authenticateToken, requireCustomerOrVendor, getJobById);
router.patch(
  '/:id',
  authenticateToken,
  requireOwnership('job'),
  validateRequest(updateJobSchema),
  updateJob
);
router.delete('/:id', authenticateToken, requireOwnership('job'), deleteJob);

// Bidding (Vendor only)
router.post(
  '/:id/bids',
  authenticateToken,
  requireVendor,
  validateRequest(createBidSchema),
  submitBid
);

router.get('/:id/bids', authenticateToken, requireCustomerOrVendor, getJobBids);

// Job workflow (Customer and Vendor)
router.post(
  '/:id/accept-bid/:bidId',
  authenticateToken,
  requireCustomer,
  acceptBid
);
router.post('/:id/complete', authenticateToken, requireVendor, completeJob);

export const jobRouter = router;
