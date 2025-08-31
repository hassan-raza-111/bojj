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
      '/users',
      '/users/stats',
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

// Apply admin authentication middleware to ALL protected routes
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
// USER MANAGEMENT
// ========================================
router.get('/users', (req, res) => adminController.getAllUsers(req, res));
router.get('/users/stats', (req, res) =>
  adminController.getUserStats(req, res)
);
router.get('/users/:userId', (req, res) =>
  adminController.getUserDetails(req, res)
);
router.patch('/users/:userId/status', (req, res) =>
  adminController.updateUserStatus(req, res)
);
router.delete('/users/:userId', (req, res) =>
  adminController.deleteUser(req, res)
);

// New user management routes
router.post('/users', (req, res) => adminController.createUser(req, res));
router.patch('/users/bulk/status', (req, res) =>
  adminController.bulkUpdateUserStatus(req, res)
);
router.delete('/users/bulk', (req, res) =>
  adminController.bulkDeleteUsers(req, res)
);
router.patch('/users/:userId/verification', (req, res) =>
  adminController.updateUserVerification(req, res)
);
router.get('/users/:userId/activity', (req, res) =>
  adminController.getUserActivity(req, res)
);
router.get('/users/export', (req, res) =>
  adminController.exportUsers(req, res)
);

// Job management routes
router.get('/jobs', (req, res) => adminController.getAllJobs(req, res));
router.get('/jobs/stats', (req, res) => adminController.getJobStats(req, res));
router.get('/jobs/:jobId', (req, res) =>
  adminController.getJobDetails(req, res)
);
router.patch('/jobs/:jobId/status', (req, res) =>
  adminController.updateJobStatus(req, res)
);
router.delete('/jobs/:jobId', (req, res) =>
  adminController.deleteJob(req, res)
);
router.patch('/jobs/bulk/status', (req, res) =>
  adminController.bulkUpdateJobStatus(req, res)
);
router.delete('/jobs/bulk', (req, res) =>
  adminController.bulkDeleteJobs(req, res)
);
router.get('/jobs/export', (req, res) => adminController.exportJobs(req, res));

// ========================================
// VENDOR MANAGEMENT
// ========================================
router.get('/vendors', adminController.getAllVendors.bind(adminController));
router.get('/vendors/stats', (req, res) =>
  adminController.getVendorStats(req, res)
);
router.get(
  '/vendors/pending',
  adminController.getPendingVendors.bind(adminController)
);
router.get('/vendors/:vendorId', (req, res) =>
  adminController.getVendorDetails(req, res)
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
router.patch('/vendors/bulk/status', (req, res) =>
  adminController.bulkUpdateVendorStatus(req, res)
);
router.delete('/vendors/bulk', (req, res) =>
  adminController.bulkDeleteVendors(req, res)
);
router.get('/vendors/export', (req, res) =>
  adminController.exportVendors(req, res)
);

// ========================================
// CUSTOMER MANAGEMENT
// ========================================
router.get('/customers', adminController.getAllCustomers.bind(adminController));
router.get('/customers/stats', (req, res) =>
  adminController.getCustomerStats(req, res)
);
router.get('/customers/:customerId', (req, res) =>
  adminController.getCustomerDetails(req, res)
);
router.patch(
  '/customers/:customerId/status',
  adminController.toggleCustomerStatus.bind(adminController)
);
router.patch('/customers/bulk/status', (req, res) =>
  adminController.bulkUpdateCustomerStatus(req, res)
);
router.delete('/customers/bulk', (req, res) =>
  adminController.bulkDeleteCustomers(req, res)
);
router.get('/customers/spending/:spending', (req, res) =>
  adminController.getCustomersBySpending(req, res)
);
router.get('/customers/export', (req, res) =>
  adminController.exportCustomers(req, res)
);

// ========================================
// PAYMENT MANAGEMENT
// ========================================
router.get('/payments', adminController.getAllPayments.bind(adminController));
router.get(
  '/payments/stats',
  adminController.getPaymentStats.bind(adminController)
);
router.patch(
  '/payments/:paymentId/status',
  adminController.updatePaymentStatus.bind(adminController)
);
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
router.get(
  '/payments/export',
  adminController.exportPayments.bind(adminController)
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

// ========================================
// ADMIN DASHBOARD STATS & NOTIFICATIONS
// ========================================
router.get(
  '/dashboard/stats',
  adminController.getAdminDashboardStats.bind(adminController)
);
router.get(
  '/notifications',
  adminController.getAdminNotifications.bind(adminController)
);

export default router;
