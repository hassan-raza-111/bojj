import { Router } from 'express';
import {
  createTicket,
  getUserTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getAllTickets,
  getTicketStats,
  getTicketCategories,
  getTicketPriorities,
  assignTicket,
  getTicketsByStatus,
} from '../controllers/support.controller';
import {
  authenticateToken,
  requireAuthenticated,
  requireOwnership,
  requireAdmin,
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createTicketSchema, updateTicketSchema } from '../utils/schemas';

const router = Router();

// Public routes (no authentication required)
router.get('/categories', getTicketCategories);
router.get('/priorities', getTicketPriorities);

// User routes (authenticated users)
router.post(
  '/tickets',
  authenticateToken,
  requireAuthenticated,
  validateRequest(createTicketSchema),
  createTicket
);

router.get('/tickets', authenticateToken, requireAuthenticated, getUserTickets);
router.get(
  '/tickets/:id',
  authenticateToken,
  requireOwnership('ticket'),
  getTicketById
);

router.patch(
  '/tickets/:id',
  authenticateToken,
  requireOwnership('ticket'),
  validateRequest(updateTicketSchema),
  updateTicket
);

router.delete(
  '/tickets/:id',
  authenticateToken,
  requireOwnership('ticket'),
  deleteTicket
);

// Admin routes
router.get('/admin/tickets', authenticateToken, requireAdmin, getAllTickets);
router.get('/admin/tickets/status/:status', authenticateToken, requireAdmin, getTicketsByStatus);
router.patch(
  '/admin/tickets/:id',
  authenticateToken,
  requireAdmin,
  updateTicket
);
router.patch(
  '/admin/tickets/:id/assign',
  authenticateToken,
  requireAdmin,
  assignTicket
);
router.get(
  '/admin/tickets/stats',
  authenticateToken,
  requireAdmin,
  getTicketStats
);

export const supportRouter = router;
