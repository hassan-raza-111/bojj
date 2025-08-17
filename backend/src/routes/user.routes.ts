import { Router } from 'express';
import {
  createUserProfile,
  getUserProfile,
  updateProfile,
  deleteUserProfile,
  getAllUsers,
  getReviews,
  getUserStats,
} from '../controllers/user.controller';
import {
  authenticateToken,
  requireAdmin,
  requireOwnership,
  requireAuthenticated,
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../utils/schemas';

const router = Router();

// Create user profile (public - for registration)
router.post('/', createUserProfile);

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, getAllUsers);

// Get user profile by ID (authenticated users can view profiles)
router.get('/:id', authenticateToken, requireAuthenticated, getUserProfile);

// Update user profile (only owner or admin)
router.patch(
  '/:id',
  authenticateToken,
  requireOwnership('user'),
  updateProfile
);

// Delete user profile (only owner or admin)
router.delete(
  '/:id',
  authenticateToken,
  requireOwnership('user'),
  deleteUserProfile
);

// Get user reviews by ID (authenticated users)
router.get('/:id/reviews', authenticateToken, requireAuthenticated, getReviews);

// Get user statistics by ID (only owner or admin)
router.get(
  '/:id/stats',
  authenticateToken,
  requireOwnership('user'),
  getUserStats
);

export const userRouter = router;
