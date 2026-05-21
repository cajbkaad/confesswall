import { NextRequest, NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/identity";
import { normalizeXHandle } from "@/lib/normalize";
import { prisma } from "@/lib/prisma";
import { refreshProfileStats } from "@/lib/profile";
import { checkRateLimit } from "@/lib/rate-limit";
import { createCommentSchema } from "@/lib/validators";

export async function POST(request: NextRequest, { params }: { params: { handle: string } }) {
  const body = await request.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const normalized = normalizeXHandle(decodeURIComponent(params.handle));
  const profile = await prisma.xProfile.findUnique({ where: { normalized } });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const identity = getRequestIdentity(request);
  const rateLimit = await checkRateLimit({
    bucketKey: identity.ipHash,
    action: "comment:hour",
    limit: 20,
    windowMs: 60 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many comments. Try again later." }, { status: 429 });
  }

  const comment = await prisma.comment.create({
    data: {
      xProfileId: profile.id,
      content: parsed.data.content.trim(),
      anonymousUserId: parsed.data.anonymousUserId,
      ipHash: identity.ipHash,
      userAgentHash: identity.userAgentHash
    }
  });

  await prisma.xProfile.update({
    where: { id: profile.id },
    data: { lastActivityAt: new Date() }
  });
  const updatedProfile = await refreshProfileStats(profile.id);
  return NextResponse.json({ comment, profile: updatedProfile }, { status: 201 });
}
