import { Router } from "express";
import {
  createUserProfile,
  getUserProfile,
  getUserByClerkId,
  updateProfile,
  deleteUserProfile,
  getAllUsers,
  getReviews,
  getUserStats,
} from "../controllers/user.controller";

const router = Router();

// Create user profile
router.post("/", createUserProfile);

// Get all users (with pagination and filtering)
router.get("/", getAllUsers);

// Get user profile by Clerk ID
router.get("/clerk/:clerkId", getUserByClerkId);

// Get user profile by ID
router.get("/:id", getUserProfile);

// Update user profile by ID
router.patch("/:id", updateProfile);

// Delete user profile by ID
router.delete("/:id", deleteUserProfile);

// Get user reviews by ID
router.get("/:id/reviews", getReviews);

// Get user statistics by ID
router.get("/:id/stats", getUserStats);

export const userRouter = router;
