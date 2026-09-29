import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "lng_admin";

function expectedToken(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return null;
  return createHmac("sha256", password).update("lng-admin-v1").digest("hex");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function tokenForPassword(password: string): string | null {
  const expected = expectedToken();
  if (!expected) return null;
  const given = createHmac("sha256", password.trim()).update("lng-admin-v1").digest("hex");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? expected : null;
}

export async function isAdmin(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const jar = await cookies();
  const got = jar.get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("UNAUTHORIZED");
}
