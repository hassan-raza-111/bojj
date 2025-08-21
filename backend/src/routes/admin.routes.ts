import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

// Debug route - no auth required
router.get('/debug', (req, res) => {
  res.json({
    message: 'Admin routes are working!',
    routes: [
      '/dashboard/stats',
      '/dashboard/analytics',
      '/vendors',
      '/customers',
      '/payments',
      '/jobs',
      '/support-tickets',
      '/categories',
      '/admin-logs',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Apply admin authentication middleware to all routes
router.use(authMiddleware);

// ========================================
// DASHBOARD OVERVIEW & STATISTICS
// ========================================
router.get(
  '/dashboard/stats',
  adminController.getDashboardStats.bind(adminController)
);
router.get(
  '/dashboard/analytics',
  adminController.getSystemAnalytics.bind(adminController)
);

// ========================================
// VENDOR MANAGEMENT
// ========================================
router.get('/vendors', adminController.getAllVendors.bind(adminController));
router.get(
  '/vendors/pending',
  adminController.getPendingVendors.bind(adminController)
);
router.patch(
  '/vendors/:vendorId/approve',
  adminController.approveVendor.bind(adminController)
);
router.patch(
  '/vendors/:vendorId/reject',
  adminController.rejectVendor.bind(adminController)
);
router.patch(
  '/vendors/:vendorId/status',
  adminController.toggleVendorStatus.bind(adminController)
);

// ========================================
// CUSTOMER MANAGEMENT
// ========================================
router.get('/customers', adminController.getAllCustomers.bind(adminController));
router.patch(
  '/customers/:customerId/status',
  adminController.toggleCustomerStatus.bind(adminController)
);

// ========================================
// PAYMENT MANAGEMENT
// ========================================
router.get('/payments', adminController.getAllPayments.bind(adminController));
router.patch(
  '/payments/:paymentId/confirm',
  adminController.confirmPayment.bind(adminController)
);
router.patch(
  '/payments/:paymentId/release',
  adminController.releasePayment.bind(adminController)
);
router.patch(
  '/payments/:paymentId/refund',
  adminController.refundPayment.bind(adminController)
);

// ========================================
// JOB MANAGEMENT
// ========================================
router.get('/jobs', adminController.getAllJobs.bind(adminController));
router.patch(
  '/jobs/:jobId/status',
  adminController.updateJobStatus.bind(adminController)
);
router.patch(
  '/jobs/:jobId/assign',
  adminController.assignJobToVendor.bind(adminController)
);
router.patch(
  '/jobs/:jobId/cancel',
  adminController.cancelJob.bind(adminController)
);

// ========================================
// SUPPORT TICKET MANAGEMENT
// ========================================
router.get(
  '/support-tickets',
  adminController.getAllSupportTickets.bind(adminController)
);
router.patch(
  '/support-tickets/:ticketId/assign',
  adminController.assignTicket.bind(adminController)
);
router.patch(
  '/support-tickets/:ticketId/status',
  adminController.updateTicketStatus.bind(adminController)
);
router.patch(
  '/support-tickets/:ticketId/close',
  adminController.closeTicket.bind(adminController)
);

// ========================================
// CATEGORY MANAGEMENT
// ========================================
router.get(
  '/categories',
  adminController.getAllCategories.bind(adminController)
);
router.post(
  '/categories',
  adminController.createCategory.bind(adminController)
);
router.put(
  '/categories/:categoryId',
  adminController.updateCategory.bind(adminController)
);
router.delete(
  '/categories/:categoryId',
  adminController.deleteCategory.bind(adminController)
);

// ========================================
// ADMIN ACTION LOGS
// ========================================
router.get(
  '/admin-logs',
  adminController.getAdminActionLogs.bind(adminController)
);

export default router;
