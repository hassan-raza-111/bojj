import { z } from "zod";

// Base schemas for common patterns
const idSchema = z.string().uuid();
const emailSchema = z.string().email();

// User schemas - Clerk handles authentication
export const createUserSchema = z.object({
  clerkId: z.string().min(1),
  email: emailSchema,
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["CUSTOMER", "VENDOR", "ADMIN"]).default("CUSTOMER"),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  portfolio: z.array(z.string().url()).optional(),
  experience: z.number().int().positive().optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Service schemas - focus on API validation
export const createServiceSchema = z.object({
  title: z.string().min(3),
  code: z.string().min(2),
  description: z.string().min(10),
  tags: z.array(z.string()),
  images: z.array(z.string().url()),
  parentId: idSchema.optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// Job schemas
export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  budget: z.number().positive(),
  location: z.string(),
  images: z.array(z.string().url()).optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  timeline: z.string().optional(),
  date: z.string().datetime().optional(),
  time: z.string().optional(),
  additionalRequests: z.string().optional(),
  contactPreference: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customerId: idSchema,
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"])
    .optional(),
});

// Bid schemas
export const createBidSchema = z.object({
  amount: z.number().positive(),
  message: z.string().min(10),
  estimatedDays: z.number().int().positive(),
  jobId: idSchema,
  vendorId: idSchema,
});

// Payment schemas
export const processPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(["STRIPE", "PAYPAL"]),
  jobId: idSchema,
  customerId: idSchema,
  vendorId: idSchema,
});

// Review schemas
export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  userId: idSchema,
});

// Support ticket schemas
export const createTicketSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["TECHNICAL", "BILLING", "DISPUTE", "GENERAL", "FEEDBACK"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  userId: idSchema,
});

export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z
    .enum(["TECHNICAL", "BILLING", "DISPUTE", "GENERAL", "FEEDBACK"])
    .optional(),
  adminResponse: z.string().optional(),
});

// Query parameter schemas - for API filtering
export const paginationSchema = z.object({
  page: z.string().transform((val) => parseInt(val) || 1),
  limit: z.string().transform((val) => parseInt(val) || 10),
});

export const serviceFilterSchema = z.object({
  category: z.string().optional(),
  parentId: idSchema.optional(),
  search: z.string().optional(),
  minPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .optional(),
  maxPrice: z
    .string()
    .transform((val) => parseFloat(val))
    .optional(),
});

export const jobFilterSchema = z.object({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"])
    .optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minBudget: z
    .string()
    .transform((val) => parseFloat(val))
    .optional(),
  maxBudget: z
    .string()
    .transform((val) => parseFloat(val))
    .optional(),
});

// Response schemas for consistent API responses
export const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.any().optional(),
});
