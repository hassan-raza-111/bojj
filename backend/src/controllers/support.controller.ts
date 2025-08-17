import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  PrismaClient,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from "../generated/prisma";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

// Create a support ticket
export const createTicket: RequestHandler = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority = "MEDIUM",
      userId,
    } = req.body;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "userId is required",
      });
      return;
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        category: category as TicketCategory,
        priority: priority as TicketPriority,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    logger.info(`Support ticket created: ${ticket.id} by user: ${userId}`);
    res.status(201).json({
      success: true,
      data: ticket,
      message: "Support ticket created successfully. Ticket ID: " + ticket.id,
    });
    return;
  } catch (error) {
    logger.error("Error creating support ticket:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to create support ticket",
    });
    return;
  }
};

// Get user's tickets
export const getUserTickets: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "userId is required",
      });
      return;
    }
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId };
    if (status) where.status = status;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.ticket.count({ where });

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching user tickets:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
    return;
  }
};

// Get ticket details
export const getTicketDetails: RequestHandler = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "userId is required",
      });
      return;
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
      return;
    }

    // Users can only view their own tickets
    if (ticket.userId !== userId) {
      res.status(403).json({
        success: false,
        message: "You can only view your own tickets",
      });
      return;
    }

    res.json({
      success: true,
      data: ticket,
    });
    return;
  } catch (error) {
    logger.error("Error fetching ticket details:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket details",
    });
    return;
  }
};

// Admin: Get all tickets
export const getAllTickets: RequestHandler = async (req, res, next) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.ticket.count({ where });

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching all tickets:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
    return;
  }
};

// Admin: Update ticket status
export const updateTicket: RequestHandler = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status, priority, adminResponse } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
      return;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: status as TicketStatus,
        priority: priority as TicketPriority,
        adminResponse,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    logger.info(`Ticket updated: ${ticketId} with status: ${status}`);
    res.json({
      success: true,
      data: updatedTicket,
      message: "Ticket updated successfully",
    });
    return;
  } catch (error) {
    logger.error("Error updating ticket:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to update ticket",
    });
    return;
  }
};

// Get ticket statistics
export const getTicketStats: RequestHandler = async (req, res, next) => {
  try {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: "RESOLVED" } }),
      prisma.ticket.count({ where: { status: "CLOSED" } }),
    ]);

    res.json({
      success: true,
      data: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
      },
    });
    return;
  } catch (error) {
    logger.error("Error fetching ticket stats:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket statistics",
    });
    return;
  }
};

// Get ticket categories
export const getTicketCategories: RequestHandler = async (req, res, next) => {
  try {
    const categories = Object.values(TicketCategory);
    res.json({
      success: true,
      data: categories,
    });
    return;
  } catch (error) {
    logger.error("Error fetching ticket categories:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket categories",
    });
    return;
  }
};

// Get ticket priorities
export const getTicketPriorities: RequestHandler = async (req, res, next) => {
  try {
    const priorities = Object.values(TicketPriority);
    res.json({
      success: true,
      data: priorities,
    });
    return;
  } catch (error) {
    logger.error("Error fetching ticket priorities:", error);
    next(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket priorities",
    });
    return;
  }
};
