-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateTable
CREATE TABLE "XProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "xUrl" TEXT NOT NULL,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "communityScore" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenReport" (
    "id" TEXT NOT NULL,
    "xProfileId" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenAddress" TEXT,
    "normalizedToken" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "anonymousUserId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgentHash" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "xProfileId" TEXT NOT NULL,
    "anonymousUserId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "xProfileId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymousUserId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgentHash" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "bucketKey" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XProfile_normalized_key" ON "XProfile"("normalized");

-- CreateIndex
CREATE INDEX "XProfile_communityScore_idx" ON "XProfile"("communityScore");

-- CreateIndex
CREATE INDEX "XProfile_lastActivityAt_idx" ON "XProfile"("lastActivityAt");

-- CreateIndex
CREATE INDEX "TokenReport_normalizedToken_idx" ON "TokenReport"("normalizedToken");

-- CreateIndex
CREATE INDEX "TokenReport_ipHash_idx" ON "TokenReport"("ipHash");

-- CreateIndex
CREATE INDEX "TokenReport_createdAt_idx" ON "TokenReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TokenReport_xProfileId_anonymousUserId_key" ON "TokenReport"("xProfileId", "anonymousUserId");

-- CreateIndex
CREATE INDEX "Vote_ipHash_idx" ON "Vote"("ipHash");

-- CreateIndex
CREATE INDEX "Vote_createdAt_idx" ON "Vote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_xProfileId_anonymousUserId_key" ON "Vote"("xProfileId", "anonymousUserId");

-- CreateIndex
CREATE INDEX "Comment_ipHash_idx" ON "Comment"("ipHash");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "RateLimit_expiresAt_idx" ON "RateLimit"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_bucketKey_action_windowStart_key" ON "RateLimit"("bucketKey", "action", "windowStart");

-- AddForeignKey
ALTER TABLE "TokenReport" ADD CONSTRAINT "TokenReport_xProfileId_fkey" FOREIGN KEY ("xProfileId") REFERENCES "XProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_xProfileId_fkey" FOREIGN KEY ("xProfileId") REFERENCES "XProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_xProfileId_fkey" FOREIGN KEY ("xProfileId") REFERENCES "XProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
