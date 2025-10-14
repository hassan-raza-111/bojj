import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/notifications - Get all notifications for authenticated user
router.get('/', NotificationController.getNotifications);

// GET /api/notifications/unread/count - Get unread notification count
router.get('/unread/count', NotificationController.getUnreadCount);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', NotificationController.markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', NotificationController.markAllAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', NotificationController.deleteNotification);

export default router;
