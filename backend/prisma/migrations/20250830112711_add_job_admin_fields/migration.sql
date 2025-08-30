-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "bidCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;
