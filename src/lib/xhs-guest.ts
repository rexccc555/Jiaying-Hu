import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const XHS_GUEST_COOKIE = "xhs_guest_id";
export const XHS_SESSION_COOKIE = "xhs_enc_session";

const GUEST_MAX_AGE = 60 * 60 * 24 * 90;
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function cookieSecure(): boolean {
  return process.env.NODE_ENV === "production";
}

/** 浏览器访客 ID（不要求本站登录）；用于 Worker 账号隔离 */
export async function getOrCreateXhsGuestId(): Promise<{ id: string; isNew: boolean }> {
  const jar = await cookies();
  const existing = jar.get(XHS_GUEST_COOKIE)?.value?.trim();
  if (existing && existing.length >= 8 && existing.length <= 80) {
    return { id: existing, isNew: false };
  }
  return { id: `g_${randomBytes(16).toString("hex")}`, isNew: true };
}

export async function readXhsEncryptedSession(): Promise<string | null> {
  const v = (await cookies()).get(XHS_SESSION_COOKIE)?.value?.trim();
  return v || null;
}

export function attachXhsGuestCookie(res: NextResponse, guestId: string): void {
  res.cookies.set(XHS_GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: GUEST_MAX_AGE,
  });
}

export function attachXhsSessionCookie(res: NextResponse, encryptedSession: string): void {
  res.cookies.set(XHS_SESSION_COOKIE, encryptedSession, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearXhsSessionCookie(res: NextResponse): void {
  res.cookies.set(XHS_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: 0,
  });
}
