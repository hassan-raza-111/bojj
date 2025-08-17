import { Router } from 'express';
import {
  getCustomerDashboard,
  getVendorDashboard,
  getAdminDashboard,
} from '../controllers/dashboard.controller';
import {
  authenticateToken,
  requireCustomer,
  requireVendor,
  requireAdmin,
  requireAuthenticated,
} from '../middleware/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Role-specific dashboards
router.get('/customer', requireCustomer, getCustomerDashboard);
router.get('/vendor', requireVendor, getVendorDashboard);
router.get('/admin', requireAdmin, getAdminDashboard);

// User profile statistics (any authenticated user)
// router.get("/profile", requireAuthenticated, getUserProfileStats);

export const dashboardRouter = router;
