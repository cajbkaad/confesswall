import { createHash } from "crypto";
import { NextRequest } from "next/server";

export function hashWithSalt(value: string) {
  const salt = process.env.SERVER_SECRET_SALT;

  if (!salt) {
    throw new Error("SERVER_SECRET_SALT is required");
  }

  return createHash("sha256").update(`${value}:${salt}`).digest("hex");
}

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return realIp || "unknown";
}

export function getRequestIdentity(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  return {
    ipHash: hashWithSalt(ip),
    userAgentHash: hashWithSalt(userAgent)
  };
}
