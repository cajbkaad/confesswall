type ScoreInput = {
  reports: number;
  tokens: number;
  upvotes: number;
  comments: number;
  lastActivityAt: Date;
};

function reportScore(reports: number) {
  if (reports >= 10) return 35;
  if (reports >= 5) return 30;
  if (reports >= 3) return 22;
  if (reports >= 2) return 14;
  if (reports >= 1) return 8;
  return 0;
}

function tokenScore(tokens: number) {
  if (tokens >= 5) return 25;
  if (tokens >= 3) return 20;
  if (tokens >= 2) return 14;
  if (tokens >= 1) return 8;
  return 0;
}

function freshnessScore(lastActivityAt: Date) {
  const ageDays = (Date.now() - lastActivityAt.getTime()) / 86_400_000;

  if (ageDays <= 7) return 10;
  if (ageDays <= 30) return 7;
  if (ageDays <= 90) return 4;
  return 1;
}

export function calculateCommunityScore(input: ScoreInput) {
  const voteScore = Math.min(20, Math.log2(input.upvotes + 1) * 4);
  const commentScore = Math.min(10, Math.log2(input.comments + 1) * 2);
  const raw =
    reportScore(input.reports) +
    tokenScore(input.tokens) +
    voteScore +
    commentScore +
    freshnessScore(input.lastActivityAt);

  return Math.min(100, Math.round(raw));
}
