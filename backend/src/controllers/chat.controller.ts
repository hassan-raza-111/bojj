import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { io } from '../server';
import { notifyNewMessage } from '../services/notificationService';

const prisma = new PrismaClient();

export class ChatController {
  // Create a chat room when a customer accepts a vendor's bid or contacts vendor
  static async createChatRoom(req: Request, res: Response) {
    try {
      const { jobId, vendorId } = req.body;
      const customerId = req.user?.id;

      if (!customerId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if this is a general contact (not job-specific)
      const isGeneralContact = jobId.startsWith('contact-');

      if (isGeneralContact) {
        // For general contact, just verify vendor exists
        const vendor = await prisma.user.findFirst({
          where: {
            id: vendorId,
            role: 'VENDOR',
          },
        });

        if (!vendor) {
          return res.status(404).json({ message: 'Vendor not found' });
        }

        // Check if general chat room already exists
        const existingChatRoom = await prisma.chatRoom.findFirst({
          where: {
            customerId: customerId,
            vendorId: vendorId,
            jobId: jobId,
          },
        });

        if (existingChatRoom) {
          return res.json({
            success: true,
            message: 'Chat room already exists',
            chatRoom: existingChatRoom,
          });
        }

        // Create general chat room with dummy job data
        const chatRoom = await prisma.chatRoom.create({
          data: {
            jobId: jobId,
            customerId: customerId,
            vendorId: vendorId,
            status: 'ACTIVE',
          },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });

        // Add dummy job data for general contact
        const chatRoomWithJob = {
          ...chatRoom,
          job: {
            id: jobId,
            title: 'General Contact',
            status: 'ACTIVE',
          },
        };

        return res.json({
          success: true,
          message: 'General chat room created successfully',
          chatRoom: chatRoomWithJob,
        });
      }

      // For job-specific chat rooms, verify that the customer owns the job
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          customerId: customerId,
          status: 'IN_PROGRESS',
        },
        include: {
          assignedVendor: true,
        },
      });

      if (!job) {
        return res
          .status(404)
          .json({ message: 'Job not found or not assigned to vendor' });
      }

      if (job.assignedVendorId !== vendorId) {
        return res
          .status(403)
          .json({ message: 'Vendor not assigned to this job' });
      }

      // Check if chat room already exists
      const existingChatRoom = await prisma.chatRoom.findUnique({
        where: { jobId },
      });

      if (existingChatRoom) {
        return res
          .status(400)
          .json({ message: 'Chat room already exists for this job' });
      }

      // Create chat room
      const chatRoom = await prisma.chatRoom.create({
        data: {
          jobId,
          customerId,
          vendorId,
          status: 'ACTIVE',
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Send system message
      await prisma.chatMessage.create({
        data: {
          chatRoomId: chatRoom.id,
          senderId: customerId,
          content:
            'Chat room created. You can now communicate with your vendor.',
          messageType: 'SYSTEM',
        },
      });

      res.status(201).json({
        message: 'Chat room created successfully',
        chatRoom,
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all chat rooms for a user (customer or vendor)
  static async getChatRooms(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      let chatRooms;

      if (userRole === 'CUSTOMER') {
        chatRooms = await prisma.chatRoom.findMany({
          where: {
            customerId: userId,
            status: 'ACTIVE',
          },
          include: {
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });
      } else if (userRole === 'VENDOR') {
        chatRooms = await prisma.chatRoom.findMany({
          where: {
            vendorId: userId,
            status: 'ACTIVE',
          },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            job: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ chatRooms });
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get messages for a specific chat room
  static async getMessages(req: Request, res: Response) {
    try {
      const { chatRoomId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user has access to this chat room
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          id: chatRoomId,
          OR: [{ customerId: userId }, { vendorId: userId }],
        },
      });

      if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' });
      }

      // Mark messages as read
      await prisma.chatMessage.updateMany({
        where: {
          chatRoomId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Get messages
      const messages = await prisma.chatMessage.findMany({
        where: {
          chatRoomId,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      res.json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Send a message
  static async sendMessage(req: Request, res: Response) {
    try {
      const { chatRoomId, content, messageType = 'TEXT' } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user has access to this chat room
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          id: chatRoomId,
          OR: [{ customerId: senderId }, { vendorId: senderId }],
          status: 'ACTIVE',
        },
      });

      if (!chatRoom) {
        return res
          .status(404)
          .json({ message: 'Chat room not found or access denied' });
      }

      // Create message
      const message = await prisma.chatMessage.create({
        data: {
          chatRoomId,
          senderId,
          content,
          messageType,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Update chat room's updatedAt
      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: { updatedAt: new Date() },
      });

      // Emit real-time message to both users
      const recipientId =
        chatRoom.customerId === senderId
          ? chatRoom.vendorId
          : chatRoom.customerId;

      io.to(`user_${recipientId}`).emit('new_message', {
        message,
        chatRoomId,
      });

      // Send notification to recipient (only if not system message)
      if (messageType !== 'SYSTEM') {
        const job = await prisma.job.findUnique({
          where: { id: chatRoom.jobId },
          select: { title: true },
        });

        const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
        await notifyNewMessage(
          recipientId,
          senderName,
          job?.title || 'Chat',
          chatRoomId
        );
      }

      res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark messages as read
  static async markAsRead(req: Request, res: Response) {
    try {
      const { chatRoomId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify user has access to this chat room
      const chatRoom = await prisma.chatRoom.findFirst({
        where: {
          id: chatRoomId,
          OR: [{ customerId: userId }, { vendorId: userId }],
        },
      });

      if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' });
      }

      // Mark unread messages as read
      await prisma.chatMessage.updateMany({
        where: {
          chatRoomId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get unread message count for a user
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const unreadCount = await prisma.chatMessage.count({
        where: {
          chatRoom: {
            OR: [{ customerId: userId }, { vendorId: userId }],
          },
          senderId: { not: userId },
          isRead: false,
        },
      });

      res.json({ unreadCount });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
