/*
  Warnings:

  - A unique constraint covering the columns `[urlCode]` on the table `ShortenedUrl` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `urlCode` to the `ShortenedUrl` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShortenedUrl" ADD COLUMN     "urlCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ShortenedUrl_urlCode_key" ON "ShortenedUrl"("urlCode");
