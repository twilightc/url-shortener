-- CreateTable
CREATE TABLE "ShortenedUrl" (
    "shortenedUrl" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ShortenedUrl_pkey" PRIMARY KEY ("shortenedUrl")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "enrollTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);
