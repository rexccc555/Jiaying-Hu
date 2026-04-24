import { createHmac, timingSafeEqual } from "crypto";

/** HttpOnly Cookie 名称（登录会话） */
export const AUTH_COOKIE_NAME = "tao_session";

const MAX_AGE_SEC = 14 * 24 * 60 * 60;

function resolveSecret(): string | null {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") return null;
  return "dev-only-tao-session-secret-min-16-chars";
}

export type SessionUser = { userId: string; email: string; name: string };

type Payload = { sub: string; email: string; name: string; iat: number; exp: number };

export function signSession(user: SessionUser): string {
  const secret = resolveSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET (min 16 chars) is required in production to sign sessions");
  }
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + MAX_AGE_SEC;
  const payload: Payload = {
    sub: user.userId,
    email: user.email,
    name: user.name,
    iat,
    exp,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined): SessionUser | null {
  const secret = resolveSecret();
  if (!secret) return null;
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const json = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (typeof json.sub !== "string" || typeof json.email !== "string" || typeof json.name !== "string") {
      return null;
    }
    if (typeof json.exp !== "number" || json.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: json.sub, email: json.email, name: json.name };
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
