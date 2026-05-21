import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeXHandle } from "@/lib/normalize";

export async function GET(_request: Request, { params }: { params: { handle: string } }) {
  const normalized = normalizeXHandle(decodeURIComponent(params.handle));
  const profile = await prisma.xProfile.findUnique({
    where: { normalized },
    include: {
      reports: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "desc" }
      },
      comments: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "desc" },
        take: 50
      }
    }
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
