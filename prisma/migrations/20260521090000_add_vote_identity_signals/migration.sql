-- Add user-agent hashing to vote records for auxiliary abuse analysis.
ALTER TABLE "Vote" ADD COLUMN "userAgentHash" TEXT NOT NULL DEFAULT '';

-- Keep the hard uniqueness rule on anonymous user + profile, and add
-- profile-scoped identity signal indexes for moderation/rate analysis.
CREATE INDEX "Vote_xProfileId_ipHash_idx" ON "Vote"("xProfileId", "ipHash");
CREATE INDEX "Vote_xProfileId_userAgentHash_idx" ON "Vote"("xProfileId", "userAgentHash");
