-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "netAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "transactionId" TEXT;
