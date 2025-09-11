/*
  Warnings:

  - You are about to drop the column `hourlyRate` on the `vendor_profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PayoutMethod" AS ENUM ('STRIPE', 'BANK_TRANSFER', 'PAYPAL', 'CHECK');

-- AlterEnum
ALTER TYPE "public"."JobStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "vendorPayoutId" TEXT;

-- AlterTable
ALTER TABLE "public"."vendor_profiles" DROP COLUMN "hourlyRate";

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

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_vendorPayoutId_fkey" FOREIGN KEY ("vendorPayoutId") REFERENCES "public"."vendor_payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vendor_payouts" ADD CONSTRAINT "vendor_payouts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
