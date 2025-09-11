import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create a chat room (when customer accepts a vendor's bid)
router.post('/rooms', ChatController.createChatRoom);

// Get all chat rooms for the authenticated user
router.get('/rooms', ChatController.getChatRooms);

// Get messages for a specific chat room
router.get('/rooms/:chatRoomId/messages', ChatController.getMessages);

// Send a message
router.post('/messages', ChatController.sendMessage);

// Mark messages as read
router.put('/rooms/:chatRoomId/read', ChatController.markAsRead);

// Get unread message count
router.get('/unread-count', ChatController.getUnreadCount);

export default router;
