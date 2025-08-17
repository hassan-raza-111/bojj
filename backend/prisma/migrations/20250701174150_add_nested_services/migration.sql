/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_serviceId_fkey";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "Service"("code");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
