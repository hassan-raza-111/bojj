-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "additionalRequests" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactPreference" TEXT,
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
