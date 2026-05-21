import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const filter = searchParams.get("filter") || "all";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 20)));

  const where = {
    AND: [
      q
        ? {
            OR: [
              { handle: { contains: q, mode: "insensitive" as const } },
              { normalized: { contains: q.replace(/^@/, ""), mode: "insensitive" as const } },
              {
                reports: {
                  some: {
                    OR: [
                      { tokenSymbol: { contains: q, mode: "insensitive" as const } },
                      { tokenAddress: { contains: q, mode: "insensitive" as const } }
                    ],
                    status: "VISIBLE" as const
                  }
                }
              }
            ]
          }
        : {},
      filter === "trending" ? { communityScore: { gte: 80 } } : {},
      filter === "watchlisted" ? { communityScore: { gte: 30, lt: 80 } } : {},
      filter === "multi" ? { tokenCount: { gte: 2 } } : {},
      filter === "new"
        ? { lastActivityAt: { gte: new Date(Date.now() - 7 * 86_400_000) } }
        : {},
      filter === "disputed" ? { commentCount: { gte: 20 } } : {}
    ]
  };

  const [items, total] = await Promise.all([
    prisma.xProfile.findMany({
      where,
      orderBy: [{ communityScore: "desc" }, { lastActivityAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        reports: {
          where: { status: "VISIBLE" },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            tokenSymbol: true,
            tokenAddress: true,
            chain: true,
            reportType: true,
            createdAt: true
          }
        }
      }
    }),
    prisma.xProfile.count({ where })
  ]);

  return NextResponse.json({ items, total, page, limit });
}
