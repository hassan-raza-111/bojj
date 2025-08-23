-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "additionalRequests" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactPreference" TEXT,
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "zipCode" TEXT;
