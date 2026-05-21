import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadDotEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

function tokenScore(tokens) {
  if (tokens >= 3) return 35;
  if (tokens >= 2) return 25;
  if (tokens >= 1) return 15;
  return 0;
}

function activityBonus(lastActivityAt) {
  const ageDays = (Date.now() - lastActivityAt.getTime()) / 86_400_000;

  if (ageDays <= 7) return 5;
  if (ageDays <= 30) return 3;
  if (ageDays <= 90) return 1;
  return 0;
}

function calculateScamRiskScore({ tokens, upvotes, lastActivityAt }) {
  const voteScore = 60 * (1 - Math.exp(-0.035 * upvotes));
  const raw = tokenScore(tokens) + voteScore + activityBonus(lastActivityAt);

  return Math.min(100, Math.round(raw));
}

loadDotEnv();

const prisma = new PrismaClient({
  log: ["error", "warn"]
});

try {
  const profiles = await prisma.xProfile.findMany({
    select: {
      id: true,
      handle: true,
      lastActivityAt: true
    },
    orderBy: { createdAt: "asc" }
  });

  console.log(`Refreshing ${profiles.length} profile score(s)...`);

  for (const profile of profiles) {
    const [reports, upvotes, comments, reportRows] = await Promise.all([
      prisma.tokenReport.count({
        where: { xProfileId: profile.id, status: "VISIBLE" }
      }),
      prisma.vote.count({
        where: { xProfileId: profile.id }
      }),
      prisma.comment.count({
        where: { xProfileId: profile.id, status: "VISIBLE" }
      }),
      prisma.tokenReport.findMany({
        where: { xProfileId: profile.id, status: "VISIBLE" },
        select: { normalizedToken: true, tokenAddress: true }
      })
    ]);

    const tokenKeys = new Set(
      reportRows.map((report) => report.tokenAddress?.toLowerCase() || report.normalizedToken)
    );
    const tokenCount = tokenKeys.size;
    const scamRiskScore = calculateScamRiskScore({
      tokens: tokenCount,
      upvotes,
      lastActivityAt: profile.lastActivityAt
    });

    await prisma.xProfile.update({
      where: { id: profile.id },
      data: {
        reportCount: reports,
        tokenCount,
        upvoteCount: upvotes,
        commentCount: comments,
        communityScore: scamRiskScore
      }
    });

    console.log(`${profile.handle}: ${scamRiskScore}`);
  }

  console.log("Score refresh complete.");
} finally {
  await prisma.$disconnect();
}
