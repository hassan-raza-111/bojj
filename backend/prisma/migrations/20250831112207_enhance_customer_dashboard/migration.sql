-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "completionDate" TIMESTAMP(3),
ADD COLUMN     "customerFeedback" TEXT,
ADD COLUMN     "customerRating" DOUBLE PRECISION,
ADD COLUMN     "estimatedDuration" TEXT,
ADD COLUMN     "urgency" TEXT;

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

-- CreateIndex
CREATE UNIQUE INDEX "job_analytics_jobId_key" ON "public"."job_analytics"("jobId");

-- AddForeignKey
ALTER TABLE "public"."job_analytics" ADD CONSTRAINT "job_analytics_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
