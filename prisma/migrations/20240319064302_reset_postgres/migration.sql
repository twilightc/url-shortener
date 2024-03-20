/*
  Warnings:

  - The primary key for the `ShortenedUrl` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `ShortenedUrl` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `ShortenedUrl` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "ShortenedUrl" DROP CONSTRAINT "ShortenedUrl_pkey",
DROP COLUMN "userId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ShortenedUrl_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "OpenGraphTag" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "OpenGraphTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenGraphTag_tagId_key" ON "OpenGraphTag"("tagId");

-- AddForeignKey
ALTER TABLE "OpenGraphTag" ADD CONSTRAINT "OpenGraphTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ShortenedUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
