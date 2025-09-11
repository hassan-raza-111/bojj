-- CreateEnum
CREATE TYPE "public"."ManualPaymentMethod" AS ENUM ('CASH', 'VENMO', 'ZELLE');

-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "paymentMethod" "public"."ManualPaymentMethod",
ADD COLUMN     "paymentNotes" TEXT,
ADD COLUMN     "paymentReceived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentReceivedAt" TIMESTAMP(3);
