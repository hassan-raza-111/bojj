-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'BID_WITHDRAWN';
ALTER TYPE "public"."NotificationType" ADD VALUE 'COUNTER_OFFER_RECEIVED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'COUNTER_OFFER_ACCEPTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'COUNTER_OFFER_REJECTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'NEGOTIATION_LIMIT_REACHED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'JOB_DISPUTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PAYMENT_DISPUTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'ACCOUNT_SUSPENDED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PROFILE_VERIFIED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'PROFILE_REJECTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'JOB_DEADLINE_REMINDER';
ALTER TYPE "public"."NotificationType" ADD VALUE 'NEW_JOB_POSTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'BULK_JOB_POSTED';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "city" TEXT;

-- AlterTable
ALTER TABLE "public"."vendor_profiles" ADD COLUMN     "serviceTypes" TEXT[];
