import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/identity";
import { normalizeTokenSymbol, normalizeXHandle, displayXHandle, xProfileUrl } from "@/lib/normalize";
import { prisma } from "@/lib/prisma";
import { refreshProfileStats } from "@/lib/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { createReportSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const identity = getRequestIdentity(request);
  const hourly = await checkRateLimit({
    bucketKey: identity.ipHash,
    action: "report:hour",
    limit: 5,
    windowMs: 60 * 60 * 1000
  });

  if (!hourly.allowed) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  const daily = await checkRateLimit({
    bucketKey: identity.ipHash,
    action: "report:day",
    limit: 20,
    windowMs: 24 * 60 * 60 * 1000
  });

  if (!daily.allowed) {
    return NextResponse.json({ error: "Daily submission limit reached." }, { status: 429 });
  }

  const input = parsed.data;
  const normalized = normalizeXHandle(input.xHandle);
  const tokenSymbol = normalizeTokenSymbol(input.tokenSymbol);

  try {
    const report = await prisma.$transaction(async (tx) => {
      const profile = await tx.xProfile.upsert({
        where: { normalized },
        create: {
          normalized,
          handle: displayXHandle(normalized),
          xUrl: xProfileUrl(normalized),
          lastActivityAt: new Date()
        },
        update: {
          handle: displayXHandle(normalized),
          xUrl: xProfileUrl(normalized),
          lastActivityAt: new Date()
        }
      });

      return tx.tokenReport.create({
        data: {
          xProfileId: profile.id,
          tokenSymbol,
          tokenAddress: input.tokenAddress || null,
          normalizedToken: tokenSymbol,
          chain: input.chain,
          reportType: input.reportType.trim(),
          description: input.description?.trim() || "",
          evidenceUrl: input.evidenceUrl || null,
          anonymousUserId: input.anonymousUserId,
          ipHash: identity.ipHash,
          userAgentHash: identity.userAgentHash
        }
      });
    });

    const profile = await refreshProfileStats(report.xProfileId);
    return NextResponse.json({ report, profile }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "This anonymous user already submitted a primary report for this X account." },
        { status: 409 }
      );
    }

    throw error;
  }
}
