import { Router } from "express";
import {
  getCustomerDashboard,
  getVendorDashboard,
  getAdminDashboard,
  getUserStats,
} from "../controllers/dashboard.controller";

const router = Router();

// Get customer dashboard data
router.get("/customer", getCustomerDashboard);

// Get vendor dashboard data
router.get("/vendor", getVendorDashboard);

// Get admin dashboard data
router.get("/admin", getAdminDashboard);

// Get user profile statistics
router.get("/profile", getUserStats);

export { router as dashboardRouter };
