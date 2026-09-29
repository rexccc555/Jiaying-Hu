import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { NextResponse } from "next/server";

const VISITOR_COOKIE = "lng_vid";

export async function getVisitor(): Promise<{ id: string; isNew: boolean }> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing && /^[a-f0-9-]{36}$/.test(existing)) return { id: existing, isNew: false };
  return { id: randomUUID(), isNew: true };
}

export function attachVisitor(res: NextResponse, visitor: { id: string; isNew: boolean }) {
  if (!visitor.isNew) return res;
  res.cookies.set(VISITOR_COOKIE, visitor.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export async function getIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-nf-client-connection-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  const salt = process.env.VOTE_SALT || "life-new-game";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
