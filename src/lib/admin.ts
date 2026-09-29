import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ADMIN_COOKIE = "lng_admin";

const PASSWORD_KEY = "adminPassword";
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

type Secret = { kind: "env"; password: string } | { kind: "db"; salt: string; hash: string };

/** ADMIN_PASSWORD env wins; otherwise the scrypt hash stored in GameSetting. */
async function getSecret(): Promise<Secret | null> {
  const env = process.env.ADMIN_PASSWORD?.trim();
  if (env) return { kind: "env", password: env };
  try {
    const row = await prisma.gameSetting.findUnique({ where: { key: PASSWORD_KEY } });
    if (!row) return null;
    const v = JSON.parse(row.value) as { salt?: string; hash?: string };
    return v.salt && v.hash ? { kind: "db", salt: v.salt, hash: v.hash } : null;
  } catch {
    return null;
  }
}

function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 32, SCRYPT, (err, key) => (err ? reject(err) : resolve(key.toString("hex")))),
  );
}

function tokenFor(secret: Secret) {
  const key = secret.kind === "env" ? secret.password : secret.hash;
  return createHmac("sha256", key).update("lng-admin-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function adminConfigured() {
  return (await getSecret()) !== null;
}

export async function tokenForPassword(password: string): Promise<string | null> {
  const secret = await getSecret();
  if (!secret) return null;
  const pw = password.trim();
  const ok =
    secret.kind === "env"
      ? safeEqual(tokenFor({ kind: "env", password: pw }), tokenFor(secret))
      : safeEqual(await hashPassword(pw, secret.salt), secret.hash);
  return ok ? tokenFor(secret) : null;
}

export async function isAdmin(): Promise<boolean> {
  const secret = await getSecret();
  if (!secret) return false;
  const jar = await cookies();
  const got = jar.get(ADMIN_COOKIE)?.value;
  return Boolean(got && safeEqual(got, tokenFor(secret)));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("UNAUTHORIZED");
}

export function usingEnvPassword() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

/** Stores a new password hash and returns the cookie token for it. Signs out every other session. */
export async function setAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await hashPassword(password.trim(), salt);
  const value = JSON.stringify({ salt, hash });
  await prisma.gameSetting.upsert({
    where: { key: PASSWORD_KEY },
    create: { key: PASSWORD_KEY, value },
    update: { value },
  });
  return tokenFor({ kind: "db", salt, hash });
}
