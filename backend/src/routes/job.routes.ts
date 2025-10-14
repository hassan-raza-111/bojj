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
  rejectBid,
  completeJob,
  getCustomerJobs,
  getAllJobs,
  getVendorJobs,
  getJobDetails,
  submitCounterOffer,
  acceptCounterOffer,
  rejectCounterOffer,
  getNegotiationHistory,
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
router.get('/:id/details', authenticateToken, requireCustomer, getJobDetails);
router.post(
  '/:id/accept-bid/:bidId',
  authenticateToken,
  requireCustomer,
  acceptBid
);
router.post(
  '/:id/reject-bid/:bidId',
  authenticateToken,
  requireCustomer,
  rejectBid
);
router.post('/:id/complete', authenticateToken, requireVendor, completeJob);
router.post(
  '/:id/complete-customer',
  authenticateToken,
  requireCustomer,
  completeJob
);

// ========================================
// COUNTER-OFFER / NEGOTIATION ROUTES
// ========================================

// Submit counter offer (Customer or Vendor can counter)
router.post(
  '/bids/:bidId/counter-offer',
  authenticateToken,
  requireCustomerOrVendor,
  submitCounterOffer
);

// Accept counter offer
router.post(
  '/bids/:bidId/accept-counter',
  authenticateToken,
  requireCustomerOrVendor,
  acceptCounterOffer
);

// Reject counter offer
router.post(
  '/bids/:bidId/reject-counter',
  authenticateToken,
  requireCustomerOrVendor,
  rejectCounterOffer
);

// Get negotiation history for a bid
router.get(
  '/bids/:bidId/negotiation-history',
  authenticateToken,
  requireCustomerOrVendor,
  getNegotiationHistory
);

export const jobRouter = router;
