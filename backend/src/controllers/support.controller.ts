import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  PrismaClient,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '@prisma/client';
import { logger } from '../utils/logger';
import { notifySupportTicketReply } from '../services/notificationService';

const prisma = new PrismaClient();

// Create a support ticket
export const createTicket: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, category, priority = 'MEDIUM' } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const ticket = await prisma.supportTicket.create({
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
      message: 'Support ticket created successfully. Ticket ID: ' + ticket.id,
    });
    return;
  } catch (error) {
    logger.error('Error creating support ticket:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
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
        message: 'userId is required',
      });
      return;
    }
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId };
    if (status) where.status = status;

    const tickets = await prisma.supportTicket.findMany({
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
        createdAt: 'desc',
      },
    });

    const total = await prisma.supportTicket.count({ where });

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
    logger.error('Error fetching user tickets:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
    });
    return;
  }
};

// Get ticket details
export const getTicketById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Get from authenticated user

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
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
        assignedTo: {
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
        message: 'Ticket not found',
      });
      return;
    }

    // Users can only view their own tickets, admins can view all
    if (ticket.userId !== userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You can only view your own tickets',
      });
      return;
    }

    res.json({
      success: true,
      data: ticket,
    });
    return;
  } catch (error) {
    logger.error('Error fetching ticket details:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket details',
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

    const tickets = await prisma.supportTicket.findMany({
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
        createdAt: 'desc',
      },
    });

    const total = await prisma.supportTicket.count({ where });

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
    logger.error('Error fetching all tickets:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
    });
    return;
  }
};

// Admin: Update ticket status
export const updateTicket: RequestHandler = async (req, res, next) => {
  try {
    const { id, ticketId } = req.params as { id?: string; ticketId?: string };
    const targetId = id || ticketId;
    if (!targetId) {
      res.status(400).json({ success: false, message: 'Ticket ID required' });
      return;
    }
    const { status, priority } = req.body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: targetId },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: targetId },
      data: {
        status: status as TicketStatus,
        priority: priority as TicketPriority,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
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

    logger.info(`Ticket updated: ${targetId} with status: ${status}`);
    res.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket updated successfully',
    });
    return;
  } catch (error) {
    logger.error('Error updating ticket:', error);
    next(error);
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
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
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
    logger.error('Error fetching ticket stats:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket statistics',
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
    logger.error('Error fetching ticket categories:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket categories',
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
    logger.error('Error fetching ticket priorities:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket priorities',
    });
    return;
  }
};

// Delete ticket (only for ticket owner or admin)
export const deleteTicket: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Only ticket owner or admin can delete
    if (ticket.userId !== userId && userRole !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own tickets',
      });
      return;
    }

    await prisma.supportTicket.delete({
      where: { id },
    });

    logger.info(`Ticket deleted: ${id} by user: ${userId}`);
    res.json({
      success: true,
      message: 'Ticket deleted successfully',
    });
    return;
  } catch (error) {
    logger.error('Error deleting ticket:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
    });
    return;
  }
};

// Assign ticket to admin
export const assignTicket: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Verify assigned user is an admin
    if (assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!assignedUser || assignedUser.role !== 'ADMIN') {
        res.status(400).json({
          success: false,
          message: 'Can only assign to admin users',
        });
        return;
      }
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: {
        assignedToId,
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
        assignedTo: {
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

    logger.info(`Ticket assigned: ${id} to admin: ${assignedToId}`);
    res.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket assigned successfully',
    });
    return;
  } catch (error) {
    logger.error('Error assigning ticket:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket',
    });
    return;
  }
};

// Get tickets by status for dashboard
export const getTicketsByStatus: RequestHandler = async (req, res, next) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const tickets = await prisma.supportTicket.findMany({
      where: { status: status as TicketStatus },
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
        assignedTo: {
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
        createdAt: 'desc',
      },
    });

    const total = await prisma.supportTicket.count({
      where: { status: status as TicketStatus },
    });

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
    logger.error('Error fetching tickets by status:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
    });
    return;
  }
};

// Add a response to a ticket
export const addTicketResponse: RequestHandler = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!message) {
      res.status(400).json({
        success: false,
        message: 'Response message is required',
      });
      return;
    }

    // Get ticket details
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
      return;
    }

    // Get current user details for responder name
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Create response
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId,
        userId,
        message,
        isAdmin: currentUser.role === 'ADMIN',
      },
    });

    // Get responder name
    const responderName = `${currentUser.firstName} ${currentUser.lastName}`;

    // Notify ticket owner if responder is different
    if (ticket.userId !== userId) {
      await notifySupportTicketReply(
        ticket.userId,
        ticket.title,
        ticketId,
        responderName
      );
    }

    logger.info(
      `Ticket response added to ticket: ${ticketId} by user: ${userId}`
    );
    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: response,
    });
    return;
  } catch (error) {
    logger.error('Error adding ticket response:', error);
    next(error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return;
  }
};
