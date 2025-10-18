import {
  PrismaClient,
  NotificationType,
  NotificationPriority,
} from '@prisma/client';
import { sendEmail, emailTemplates } from '../utils/emailService';
import { logger } from '../utils/logger';
import { io } from '../server';

const prisma = new PrismaClient();

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  link?: string;
  priority?: NotificationPriority;
  sendEmail?: boolean;
  emailData?: any;
}

// Create notification and optionally send email
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data,
  link,
  priority = 'MEDIUM',
  sendEmail: shouldSendEmail = false,
  emailData,
}: NotificationData) => {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
        link,
        priority,
        isRead: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Emit real-time notification via Socket.io
    io.to(`user_${userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      link: notification.link,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });

    // Send email if requested and priority is HIGH or URGENT
    if (shouldSendEmail || priority === 'HIGH' || priority === 'URGENT') {
      await sendNotificationEmail(notification.user.email, type, {
        recipientName: `${notification.user.firstName} ${notification.user.lastName}`,
        ...emailData,
      });

      // Update notification as email sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });
    }

    logger.info(`Notification created: ${type} for user ${userId}`);
    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

// Send email based on notification type
const sendNotificationEmail = async (
  email: string,
  type: NotificationType,
  data: any
) => {
  try {
    let template;

    switch (type) {
      case 'NEW_BID':
        template = emailTemplates.newBid(
          data.recipientName,
          data.jobTitle,
          data.bidAmount,
          data.vendorName
        );
        break;

      case 'BID_ACCEPTED':
        template = emailTemplates.bidAccepted(
          data.recipientName,
          data.jobTitle,
          data.customerName
        );
        break;

      case 'NEW_MESSAGE':
        template = emailTemplates.newMessage(
          data.recipientName,
          data.senderName,
          data.jobTitle
        );
        break;

      case 'JOB_COMPLETED':
        template = emailTemplates.jobCompleted(
          data.recipientName,
          data.jobTitle,
          data.vendorName
        );
        break;

      case 'PAYMENT_RELEASED':
        template = emailTemplates.paymentReleased(
          data.recipientName,
          data.amount,
          data.jobTitle
        );
        break;

      case 'ACCOUNT_VERIFIED':
        template = emailTemplates.accountVerified(data.recipientName);
        break;

      case 'NEW_JOB_POSTED':
        template = emailTemplates.newJobPosted(
          data.recipientName,
          data.jobTitle,
          data.customerName,
          data.budget,
          data.location,
          data.category
        );
        break;

      default:
        logger.warn(`No email template for notification type: ${type}`);
        return;
    }

    if (template) {
      await sendEmail(email, template);
    }
  } catch (error) {
    logger.error('Error sending notification email:', error);
  }
};

// Get user notifications
export const getUserNotifications = async (userId: string, limit = 50) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async (userId: string) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    logger.error('Error getting unread count:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId: string, userId: string) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit update via Socket.io
    io.to(`user_${userId}`).emit('notification_read', { notificationId });

    return notification;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (userId: string) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit update via Socket.io
    io.to(`user_${userId}`).emit('all_notifications_read');

    return { success: true };
  } catch (error) {
    logger.error('Error marking all as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  try {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    return { success: true };
  } catch (error) {
    logger.error('Error deleting notification:', error);
    throw error;
  }
};

// Clear old notifications (older than 30 days)
export const clearOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        isRead: true,
      },
    });

    logger.info(`Cleared ${result.count} old notifications`);
    return result;
  } catch (error) {
    logger.error('Error clearing old notifications:', error);
    throw error;
  }
};

// Notification helpers for common scenarios
export const notifyNewBid = async (
  customerId: string,
  jobTitle: string,
  bidAmount: number,
  vendorName: string,
  jobId: string
) => {
  return createNotification({
    userId: customerId,
    type: 'NEW_BID',
    title: 'New Bid Received',
    message: `${vendorName} submitted a bid of $${bidAmount} for "${jobTitle}"`,
    link: `/customer/jobs/${jobId}`,
    priority: 'HIGH',
    sendEmail: true,
    emailData: { jobTitle, bidAmount, vendorName },
  });
};

export const notifyBidAccepted = async (
  vendorId: string,
  jobTitle: string,
  customerName: string,
  jobId: string
) => {
  return createNotification({
    userId: vendorId,
    type: 'BID_ACCEPTED',
    title: 'Bid Accepted! 🎉',
    message: `${customerName} accepted your bid for "${jobTitle}"`,
    link: `/vendor/jobs/${jobId}`,
    priority: 'URGENT',
    sendEmail: true,
    emailData: { jobTitle, customerName },
  });
};

export const notifyBidRejected = async (
  vendorId: string,
  jobTitle: string,
  customerName: string
) => {
  return createNotification({
    userId: vendorId,
    type: 'BID_REJECTED',
    title: 'Bid Not Selected',
    message: `Your bid for "${jobTitle}" was not selected by ${customerName}`,
    priority: 'MEDIUM',
    sendEmail: false,
  });
};

export const notifyNewMessage = async (
  recipientId: string,
  senderName: string,
  jobTitle: string,
  chatRoomId: string
) => {
  return createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: 'New Message',
    message: `${senderName} sent you a message about "${jobTitle}"`,
    link: `/chat/${chatRoomId}`,
    priority: 'MEDIUM',
    sendEmail: false, // Don't spam emails for every message
  });
};

export const notifyJobCompleted = async (
  customerId: string,
  jobTitle: string,
  vendorName: string,
  jobId: string
) => {
  return createNotification({
    userId: customerId,
    type: 'JOB_COMPLETED',
    title: 'Job Completed',
    message: `${vendorName} marked "${jobTitle}" as completed`,
    link: `/customer/jobs/${jobId}`,
    priority: 'HIGH',
    sendEmail: true,
    emailData: { jobTitle, vendorName },
  });
};

export const notifyPaymentReleased = async (
  vendorId: string,
  amount: number,
  jobTitle: string
) => {
  return createNotification({
    userId: vendorId,
    type: 'PAYMENT_RELEASED',
    title: 'Payment Released! 💰',
    message: `Your payment of $${amount} for "${jobTitle}" has been released`,
    link: `/vendor/earnings`,
    priority: 'URGENT',
    sendEmail: true,
    emailData: { amount, jobTitle },
  });
};

export const notifyAccountVerified = async (userId: string) => {
  return createNotification({
    userId,
    type: 'ACCOUNT_VERIFIED',
    title: 'Account Verified! ✅',
    message:
      'Your account has been successfully verified. You can now access all features.',
    link: '/dashboard',
    priority: 'HIGH',
    sendEmail: true,
  });
};

// Job Assignment Notification
export const notifyJobAssigned = async (
  vendorId: string,
  jobTitle: string,
  customerName: string,
  jobId: string
) => {
  return createNotification({
    userId: vendorId,
    type: 'JOB_ASSIGNED',
    title: 'Job Assigned to You! 🎯',
    message: `${customerName} assigned you the job "${jobTitle}"`,
    link: `/vendor/jobs/${jobId}`,
    priority: 'URGENT',
    sendEmail: true,
    emailData: { jobTitle, customerName },
  });
};

// Job Cancelled Notification
export const notifyJobCancelled = async (
  userId: string,
  jobTitle: string,
  reason: string,
  userRole: 'VENDOR' | 'CUSTOMER'
) => {
  const link = userRole === 'VENDOR' ? '/vendor/jobs' : '/customer/jobs';
  return createNotification({
    userId,
    type: 'JOB_CANCELLED',
    title: 'Job Cancelled ⚠️',
    message: `The job "${jobTitle}" has been cancelled. Reason: ${reason}`,
    link,
    priority: 'HIGH',
    sendEmail: true,
    emailData: { jobTitle, reason },
  });
};

// New Review Notification
export const notifyNewReview = async (
  userId: string,
  reviewerName: string,
  rating: number,
  jobTitle: string,
  userRole: 'VENDOR' | 'CUSTOMER'
) => {
  const link = userRole === 'VENDOR' ? '/vendor/reviews' : '/customer/reviews';
  return createNotification({
    userId,
    type: 'NEW_REVIEW',
    title: 'New Review Received ⭐',
    message: `${reviewerName} gave you ${rating} stars for "${jobTitle}"`,
    link,
    priority: 'MEDIUM',
    sendEmail: true,
    emailData: { reviewerName, rating, jobTitle },
  });
};

// Support Ticket Reply Notification
export const notifySupportTicketReply = async (
  userId: string,
  ticketTitle: string,
  ticketId: string,
  responderName: string
) => {
  return createNotification({
    userId,
    type: 'SUPPORT_TICKET_REPLY',
    title: 'New Reply on Your Ticket 💬',
    message: `${responderName} replied to your ticket: "${ticketTitle}"`,
    link: `/support/tickets/${ticketId}`,
    priority: 'MEDIUM',
    sendEmail: true,
    emailData: { ticketTitle, responderName },
  });
};

// Payment Received Notification (for vendors)
export const notifyPaymentReceived = async (
  vendorId: string,
  amount: number,
  jobTitle: string,
  paymentMethod: string
) => {
  return createNotification({
    userId: vendorId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received! 💰',
    message: `You received $${amount} payment via ${paymentMethod} for "${jobTitle}"`,
    link: '/vendor/earnings',
    priority: 'HIGH',
    sendEmail: true,
    emailData: { amount, jobTitle, paymentMethod },
  });
};

// System Alert Notification
export const notifySystemAlert = async (
  userId: string,
  title: string,
  message: string,
  priority: NotificationPriority = 'MEDIUM',
  link?: string
) => {
  return createNotification({
    userId,
    type: 'SYSTEM_ALERT',
    title,
    message,
    link,
    priority,
    sendEmail: priority === 'URGENT' || priority === 'HIGH',
  });
};

// Payment Reminder Notification
export const notifyPaymentReminder = async (
  customerId: string,
  jobTitle: string,
  amount: number,
  dueDate: Date,
  jobId: string
) => {
  return createNotification({
    userId: customerId,
    type: 'PAYMENT_REMINDER',
    title: 'Payment Reminder 💳',
    message: `Payment of $${amount} for "${jobTitle}" is due on ${dueDate.toLocaleDateString()}`,
    link: `/customer/jobs/${jobId}`,
    priority: 'HIGH',
    sendEmail: true,
    emailData: { jobTitle, amount, dueDate },
  });
};

// Job Expiring Soon Notification
export const notifyJobExpiring = async (
  customerId: string,
  jobTitle: string,
  daysLeft: number,
  jobId: string
) => {
  return createNotification({
    userId: customerId,
    type: 'JOB_EXPIRING',
    title: 'Job Expiring Soon ⏰',
    message: `Your job "${jobTitle}" will expire in ${daysLeft} days`,
    link: `/customer/jobs/${jobId}`,
    priority: daysLeft <= 1 ? 'URGENT' : 'HIGH',
    sendEmail: true,
    emailData: { jobTitle, daysLeft },
  });
};

// ========================================
// JOB POSTING NOTIFICATIONS
// ========================================

// New Job Posted Notification (to all vendors)
export const notifyNewJobPosted = async (
  vendorId: string,
  jobTitle: string,
  customerName: string,
  budget: number,
  location: string,
  category: string,
  jobId: string
) => {
  console.log(`🔔 Creating notification for vendor ${vendorId}:`, {
    jobTitle,
    customerName,
    budget,
    location,
    category,
    jobId,
  });

  try {
    const notification = await createNotification({
      userId: vendorId,
      type: 'NEW_JOB_POSTED',
      title: 'New Job Available! 🎯',
      message: `${customerName} posted a new job: "${jobTitle}" ($${budget}) in ${location}`,
      link: `/vendor/jobs/${jobId}`,
      priority: 'HIGH',
      sendEmail: true,
      emailData: { jobTitle, customerName, budget, location, category },
    });

    console.log(`✅ Notification created successfully: ${notification.id}`);
    return notification;
  } catch (error) {
    console.error(
      `❌ Failed to create notification for vendor ${vendorId}:`,
      error
    );
    throw error;
  }
};

// ========================================
// COUNTER-OFFER / NEGOTIATION NOTIFICATIONS
// ========================================

// Customer Counter-Offer Notification (to Vendor)
export const notifyCustomerCounterOffer = async (
  vendorId: string,
  customerName: string,
  jobTitle: string,
  originalAmount: number,
  counterAmount: number,
  jobId: string
) => {
  return createNotification({
    userId: vendorId,
    type: 'BID_ACCEPTED', // Reusing existing type, could add new COUNTER_OFFER type
    title: '💰 Counter-Offer Received',
    message: `${customerName} countered your bid of $${originalAmount} with $${counterAmount} for "${jobTitle}"`,
    link: `/vendor/jobs/${jobId}`,
    priority: 'HIGH',
    sendEmail: true,
    emailData: { customerName, jobTitle, originalAmount, counterAmount },
  });
};

// Vendor Counter-Offer Notification (to Customer)
export const notifyVendorCounterOffer = async (
  customerId: string,
  vendorName: string,
  jobTitle: string,
  originalAmount: number,
  counterAmount: number,
  jobId: string
) => {
  return createNotification({
    userId: customerId,
    type: 'NEW_BID', // Reusing existing type
    title: '💰 Counter-Offer Received',
    message: `${vendorName} countered with $${counterAmount} (originally $${originalAmount}) for "${jobTitle}"`,
    link: `/customer/jobs/${jobId}`,
    priority: 'HIGH',
    sendEmail: true,
    emailData: { vendorName, jobTitle, originalAmount, counterAmount },
  });
};

// Counter-Offer Accepted Notification
export const notifyCounterOfferAccepted = async (
  userId: string,
  otherPartyName: string,
  jobTitle: string,
  agreedAmount: number,
  jobId: string,
  userRole: 'VENDOR' | 'CUSTOMER'
) => {
  const link =
    userRole === 'VENDOR' ? `/vendor/jobs/${jobId}` : `/customer/jobs/${jobId}`;
  return createNotification({
    userId,
    type: 'BID_ACCEPTED',
    title: '🎉 Offer Accepted!',
    message: `${otherPartyName} accepted your counter-offer of $${agreedAmount} for "${jobTitle}"`,
    link,
    priority: 'URGENT',
    sendEmail: true,
    emailData: { otherPartyName, jobTitle, agreedAmount },
  });
};

// Counter-Offer Rejected Notification
export const notifyCounterOfferRejected = async (
  userId: string,
  otherPartyName: string,
  jobTitle: string,
  rejectedAmount: number,
  jobId: string,
  userRole: 'VENDOR' | 'CUSTOMER'
) => {
  const link =
    userRole === 'VENDOR' ? `/vendor/jobs/${jobId}` : `/customer/jobs/${jobId}`;
  return createNotification({
    userId,
    type: 'BID_REJECTED',
    title: '❌ Offer Rejected',
    message: `${otherPartyName} rejected your counter-offer of $${rejectedAmount} for "${jobTitle}"`,
    link,
    priority: 'MEDIUM',
    sendEmail: false,
    emailData: { otherPartyName, jobTitle, rejectedAmount },
  });
};

// Max Negotiation Rounds Reached
export const notifyMaxNegotiationReached = async (
  userId: string,
  jobTitle: string,
  jobId: string,
  userRole: 'VENDOR' | 'CUSTOMER'
) => {
  const link =
    userRole === 'VENDOR' ? `/vendor/jobs/${jobId}` : `/customer/jobs/${jobId}`;
  return createNotification({
    userId,
    type: 'SYSTEM_ALERT',
    title: '⚠️ Maximum Negotiation Rounds Reached',
    message: `Negotiation limit reached for "${jobTitle}". Please accept or reject the current offer.`,
    link,
    priority: 'HIGH',
    sendEmail: true,
    emailData: { jobTitle },
  });
};
