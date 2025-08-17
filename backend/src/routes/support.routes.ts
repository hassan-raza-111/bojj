import { Router } from "express";
import {
  createTicket,
  getUserTickets,
  getTicketDetails,
  getAllTickets,
  updateTicket,
  getTicketStats,
  getTicketCategories,
  getTicketPriorities,
} from "../controllers/support.controller";

const router = Router();

// Create a support ticket (Any authenticated user)
router.post("/tickets", createTicket);

// Get user's tickets
router.get("/tickets", getUserTickets);

// Get ticket details
router.get("/tickets/:ticketId", getTicketDetails);

// Admin: Get all tickets
router.get("/admin/tickets", getAllTickets);

// Admin: Update ticket status and respond
router.patch("/admin/tickets/:ticketId", updateTicket);

// Admin: Get ticket statistics
router.get("/admin/tickets/stats", getTicketStats);

// Get available ticket categories
router.get("/categories", getTicketCategories);

// Get available ticket priorities
router.get("/priorities", getTicketPriorities);

export { router as supportRouter };
