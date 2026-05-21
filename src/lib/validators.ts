import { z } from "zod";

export const anonymousUserIdSchema = z.string().uuid();

export const createReportSchema = z.object({
  xHandle: z.string().min(2).max(80),
  tokenSymbol: z.string().min(1).max(40),
  tokenAddress: z.string().max(140).optional().nullable(),
  chain: z.enum(["Ethereum", "Solana", "BSC", "Base"]),
  reportType: z.string().min(2).max(60),
  description: z.string().max(2000).optional().nullable(),
  evidenceUrl: z.union([z.string().url().max(500), z.literal("")]).optional().nullable(),
  anonymousUserId: anonymousUserIdSchema
});

export const voteSchema = z.object({
  anonymousUserId: anonymousUserIdSchema
});
