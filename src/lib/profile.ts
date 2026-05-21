import { prisma } from "@/lib/prisma";
import { calculateScamRiskScore } from "@/lib/score";

export async function refreshProfileStats(xProfileId: string) {
  const [reports, upvotes, reportRows, profile] = await Promise.all([
    prisma.tokenReport.count({
      where: { xProfileId, status: "VISIBLE" }
    }),
    prisma.vote.count({
      where: { xProfileId }
    }),
    prisma.tokenReport.findMany({
      where: { xProfileId, status: "VISIBLE" },
      select: { normalizedToken: true, tokenAddress: true }
    }),
    prisma.xProfile.findUniqueOrThrow({
      where: { id: xProfileId },
      select: { lastActivityAt: true }
    })
  ]);

  const tokenKeys = new Set(
    reportRows.map((report) => report.tokenAddress?.toLowerCase() || report.normalizedToken)
  );
  const tokenCount = tokenKeys.size;
  const communityScore = calculateScamRiskScore({
    tokens: tokenCount,
    upvotes,
    lastActivityAt: profile.lastActivityAt
  });

  return prisma.xProfile.update({
    where: { id: xProfileId },
    data: {
      reportCount: reports,
      tokenCount,
      upvoteCount: upvotes,
      commentCount: 0,
      communityScore
    }
  });
}
