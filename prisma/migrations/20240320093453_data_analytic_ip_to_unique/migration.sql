/*
  Warnings:

  - You are about to drop the column `shortenedUrlId` on the `DataAnalytic` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ip]` on the table `DataAnalytic` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dataAnalyticId` to the `ShortenedUrl` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DataAnalytic" DROP CONSTRAINT "DataAnalytic_shortenedUrlId_fkey";

-- DropIndex
DROP INDEX "DataAnalytic_shortenedUrlId_key";

-- AlterTable
ALTER TABLE "DataAnalytic" DROP COLUMN "shortenedUrlId";

-- AlterTable
ALTER TABLE "ShortenedUrl" ADD COLUMN     "dataAnalyticId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DataAnalytic_ip_key" ON "DataAnalytic"("ip");

-- AddForeignKey
ALTER TABLE "ShortenedUrl" ADD CONSTRAINT "ShortenedUrl_dataAnalyticId_fkey" FOREIGN KEY ("dataAnalyticId") REFERENCES "DataAnalytic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
