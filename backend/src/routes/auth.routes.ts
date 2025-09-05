import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  getProfileData,
  uploadProfilePicture,
  deleteAccount,
} from '../controllers/auth.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Password reset (public)
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.get('/me', authenticateToken, getCurrentUser);
router.patch('/me', authenticateToken, updateCurrentUser);
router.patch('/change-password', authenticateToken, changePassword);

// Enhanced profile management routes
router.get('/profile', authenticateToken, getProfileData);
router.post('/profile/picture', authenticateToken, uploadProfilePicture);
router.delete('/account', authenticateToken, deleteAccount);

export const authRouter = router;
