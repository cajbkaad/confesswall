import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  bucketKey: string;
  action: string;
  limit: number;
  windowMs: number;
};

export async function checkRateLimit(options: RateLimitOptions) {
  const now = Date.now();
  const windowStartMs = Math.floor(now / options.windowMs) * options.windowMs;
  const windowStart = new Date(windowStartMs);
  const expiresAt = new Date(windowStartMs + options.windowMs);

  const entry = await prisma.rateLimit.upsert({
    where: {
      bucketKey_action_windowStart: {
        bucketKey: options.bucketKey,
        action: options.action,
        windowStart
      }
    },
    create: {
      bucketKey: options.bucketKey,
      action: options.action,
      count: 1,
      windowStart,
      expiresAt
    },
    update: {
      count: {
        increment: 1
      }
    }
  });

  return {
    allowed: entry.count <= options.limit,
    remaining: Math.max(0, options.limit - entry.count),
    resetAt: expiresAt
  };
}
