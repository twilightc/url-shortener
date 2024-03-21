/*
  Warnings:

  - You are about to drop the column `tagId` on the `OpenGraphTag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortenedUrlId]` on the table `OpenGraphTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortenedUrlId` to the `OpenGraphTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OpenGraphTag" DROP CONSTRAINT "OpenGraphTag_tagId_fkey";

-- DropIndex
DROP INDEX "OpenGraphTag_tagId_key";

-- AlterTable
ALTER TABLE "OpenGraphTag" DROP COLUMN "tagId",
ADD COLUMN     "shortenedUrlId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DataAnalytic" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createTimes" INTEGER NOT NULL,
    "shortenedUrlId" TEXT NOT NULL,

    CONSTRAINT "DataAnalytic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataAnalytic_shortenedUrlId_key" ON "DataAnalytic"("shortenedUrlId");

-- CreateIndex
CREATE UNIQUE INDEX "OpenGraphTag_shortenedUrlId_key" ON "OpenGraphTag"("shortenedUrlId");

-- AddForeignKey
ALTER TABLE "OpenGraphTag" ADD CONSTRAINT "OpenGraphTag_shortenedUrlId_fkey" FOREIGN KEY ("shortenedUrlId") REFERENCES "ShortenedUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataAnalytic" ADD CONSTRAINT "DataAnalytic_shortenedUrlId_fkey" FOREIGN KEY ("shortenedUrlId") REFERENCES "ShortenedUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
