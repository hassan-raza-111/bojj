-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "public"."BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'IN_ESCROW', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('STRIPE', 'PAYPAL', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."TicketCategory" AS ENUM ('TECHNICAL', 'BILLING', 'GENERAL', 'DISPUTE');

-- CreateEnum
CREATE TYPE "public"."BudgetType" AS ENUM ('FIXED', 'HOURLY', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."PriceType" AS ENUM ('FIXED', 'HOURLY', 'PER_UNIT');

-- CreateEnum
CREATE TYPE "public"."ChatRoomStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PayoutMethod" AS ENUM ('STRIPE', 'BANK_TRANSFER', 'PAYPAL', 'CHECK');

-- CreateEnum
CREATE TYPE "public"."ManualPaymentMethod" AS ENUM ('CASH', 'VENMO', 'ZELLE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_BID', 'BID_ACCEPTED', 'BID_REJECTED', 'JOB_ASSIGNED', 'JOB_COMPLETED', 'JOB_CANCELLED', 'PAYMENT_RECEIVED', 'PAYMENT_RELEASED', 'NEW_MESSAGE', 'NEW_REVIEW', 'ACCOUNT_VERIFIED', 'SUPPORT_TICKET_REPLY', 'SYSTEM_ALERT', 'PAYMENT_REMINDER', 'JOB_EXPIRING', 'MILESTONE_COMPLETED');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "avatar" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "businessType" TEXT,
    "experience" INTEGER,
    "skills" TEXT[],
    "portfolio" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "documents" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredCategories" TEXT[],
    "budgetRange" TEXT,
    "totalJobsPosted" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[],
    "budget" DOUBLE PRECISION,
    "budgetType" "public"."BudgetType" NOT NULL,
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3),
    "status" "public"."JobStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "customerId" TEXT NOT NULL,
    "assignedVendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "additionalRequests" TEXT,
    "city" TEXT,
    "contactPreference" TEXT,
    "date" TIMESTAMP(3),
    "images" TEXT[],
    "state" TEXT,
    "street" TEXT,
    "time" TEXT,
    "timeline" TEXT,
    "zipCode" TEXT,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "completionDate" TIMESTAMP(3),
    "customerFeedback" TEXT,
    "customerRating" DOUBLE PRECISION,
    "estimatedDuration" TEXT,
    "urgency" TEXT,
    "paymentMethod" "public"."ManualPaymentMethod",
    "paymentReceived" BOOLEAN NOT NULL DEFAULT false,
    "paymentReceivedAt" TIMESTAMP(3),
    "paymentNotes" TEXT,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bids" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "milestones" JSONB,
    "status" "public"."BidStatus" NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "initialAmount" DOUBLE PRECISION,
    "currentAmount" DOUBLE PRECISION,
    "counterOffers" JSONB,
    "lastCounteredBy" TEXT,
    "negotiationRound" INTEGER NOT NULL DEFAULT 1,
    "maxNegotiationRounds" INTEGER NOT NULL DEFAULT 3,
    "negotiationStatus" TEXT DEFAULT 'INITIAL',

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[],
    "images" TEXT[],
    "basePrice" DOUBLE PRECISION NOT NULL,
    "priceType" "public"."PriceType" NOT NULL,
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "vendorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "public"."PaymentMethod" NOT NULL,
    "isEscrow" BOOLEAN NOT NULL DEFAULT true,
    "escrowFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jobId" TEXT,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transactionId" TEXT,
    "vendorPayoutId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "reviewerId" TEXT NOT NULL,
    "serviceId" TEXT,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."support_tickets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."TicketCategory" NOT NULL,
    "priority" "public"."TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ticket_responses" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_resets" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_action_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_analytics" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "timeToFirstBid" INTEGER,
    "totalBidCount" INTEGER NOT NULL DEFAULT 0,
    "averageBidAmount" DOUBLE PRECISION,
    "highestBidAmount" DOUBLE PRECISION,
    "lowestBidAmount" DOUBLE PRECISION,
    "uniqueViewers" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "timeToCompletion" INTEGER,
    "customerSatisfaction" DOUBLE PRECISION,
    "rehireLikelihood" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_rooms" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" "public"."ChatRoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "public"."MessageType" NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vendor_payouts" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "method" "public"."PayoutMethod" NOT NULL DEFAULT 'STRIPE',
    "description" TEXT,
    "stripePayoutId" TEXT,
    "adminNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "link" TEXT,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_profiles_userId_key" ON "public"."vendor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_userId_key" ON "public"."customer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "services_code_key" ON "public"."services"("code");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "public"."refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "public"."password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "public"."password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_userId_idx" ON "public"."password_resets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "job_analytics_jobId_key" ON "public"."job_analytics"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_jobId_key" ON "public"."chat_rooms"("jobId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "public"."notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "public"."notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."vendor_profiles" ADD CONSTRAINT "vendor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_profiles" ADD CONSTRAINT "customer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_assignedVendorId_fkey" FOREIGN KEY ("assignedVendorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bids" ADD CONSTRAINT "bids_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bids" ADD CONSTRAINT "bids_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_vendorPayoutId_fkey" FOREIGN KEY ("vendorPayoutId") REFERENCES "public"."vendor_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_responses" ADD CONSTRAINT "ticket_responses_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ticket_responses" ADD CONSTRAINT "ticket_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_action_logs" ADD CONSTRAINT "admin_action_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_analytics" ADD CONSTRAINT "job_analytics_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_rooms" ADD CONSTRAINT "chat_rooms_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_rooms" ADD CONSTRAINT "chat_rooms_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_rooms" ADD CONSTRAINT "chat_rooms_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_payouts" ADD CONSTRAINT "vendor_payouts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
