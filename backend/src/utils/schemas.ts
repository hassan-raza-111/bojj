import { z } from 'zod';

// Base schemas for common patterns
const idSchema = z.string().uuid();
const emailSchema = z.string().email();

// User schemas - Traditional email/password authentication
export const createUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']).default('CUSTOMER'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});

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
    .enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'])
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
  paymentMethod: z.enum(['STRIPE', 'PAYPAL']),
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
  category: z.enum(['TECHNICAL', 'BILLING', 'DISPUTE', 'GENERAL', 'FEEDBACK']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  userId: idSchema,
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z
    .enum(['TECHNICAL', 'BILLING', 'DISPUTE', 'GENERAL', 'FEEDBACK'])
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
    .enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'])
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
