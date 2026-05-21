type ScoreInput = {
  tokens: number;
  upvotes: number;
  lastActivityAt: Date;
};

function tokenScore(tokens: number) {
  if (tokens >= 3) return 35;
  if (tokens >= 2) return 25;
  if (tokens >= 1) return 15;
  return 0;
}

function activityBonus(lastActivityAt: Date) {
  const ageDays = (Date.now() - lastActivityAt.getTime()) / 86_400_000;

  if (ageDays <= 7) return 5;
  if (ageDays <= 30) return 3;
  if (ageDays <= 90) return 1;
  return 0;
}

export function calculateScamRiskScore(input: ScoreInput) {
  const voteScore = 60 * (1 - Math.exp(-0.035 * input.upvotes));
  const raw = tokenScore(input.tokens) + voteScore + activityBonus(input.lastActivityAt);

  return Math.min(100, Math.round(raw));
}
