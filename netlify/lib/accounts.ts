import type { Store } from "./cards.ts";

export interface User {
  email: string;
  salt: string;
  hash: string;
  token: string;
  created: number;
  minutes: number;
  usedSec: number;
  firstUsed: number | null;
  lastBeat: number | null;
  lastSeen: number | null;
  trialStartedAt: number | null;
  trialJob: string | null;
  disabled: boolean;
}

export const USER_COOKIE = "clip_user";
export const TOKEN_PREFIX = "acct_";
// After the free film starts, the account can still open the studio this long to finish, watch and download it.
export const TRIAL_VIEW_MS = 3 * 86_400_000;
const CODE_TTL_MS = 10 * 60_000;
const CODE_RESEND_MS = 60_000;
const CODE_MAX_TRIES = 5;
const BEAT_GAP_MS = 150_000;

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
export const randomHex = (bytes: number) => hex(crypto.getRandomValues(new Uint8Array(bytes)).buffer);
const sha256 = async (text: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));

export function normEmail(raw: unknown): string {
  const email = String(raw || "").trim().toLowerCase();
  return email.length <= 120 && /^[^\s@<>"'&]+@[^\s@<>"'&]+\.[^\s@<>"'&]{2,}$/.test(email) ? email : "";
}

async function pbkdf2(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100_000 },
    key,
    256,
  );
  return hex(bits);
}

export async function checkPassword(user: User, password: string): Promise<boolean> {
  return (await pbkdf2(password, user.salt)) === user.hash;
}

export async function setPassword(user: User, password: string): Promise<void> {
  user.salt = randomHex(16);
  user.hash = await pbkdf2(password, user.salt);
}

export async function getUser(store: Store, email: string): Promise<User | null> {
  return email ? ((await store.get(`user/${email}`)) as User | null) : null;
}

export async function saveUser(store: Store, user: User): Promise<void> {
  await store.set(`user/${user.email}`, user);
}

export async function userByToken(store: Store, token: string): Promise<User | null> {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  const email = (await store.get(`token/${token}`)) as string | null;
  const user = await getUser(store, email || "");
  return user && user.token === token ? user : null;
}

export async function createUser(store: Store, email: string, password: string): Promise<User> {
  const user: User = {
    email,
    salt: "",
    hash: "",
    token: TOKEN_PREFIX + randomHex(24),
    created: Date.now(),
    minutes: 0,
    usedSec: 0,
    firstUsed: null,
    lastBeat: null,
    lastSeen: null,
    trialStartedAt: null,
    trialJob: null,
    disabled: false,
  };
  await setPassword(user, password);
  await store.set(`token/${user.token}`, email);
  await saveUser(store, user);
  return user;
}

export async function deleteUser(store: Store, user: User): Promise<void> {
  await store.delete(`token/${user.token}`);
  await store.delete(`user/${user.email}`);
}

export function paidRemainingSec(user: User): number {
  return Math.max(0, Math.round(user.minutes * 60 - user.usedSec));
}

export function trialState(user: User, now = Date.now()): "available" | "active" | "used" {
  if (!user.trialStartedAt) return "available";
  return now - user.trialStartedAt < TRIAL_VIEW_MS ? "active" : "used";
}

export function userUsable(user: User | null, now = Date.now()): user is User {
  return Boolean(user && !user.disabled && (paidRemainingSec(user) > 0 || trialState(user, now) !== "used"));
}

/** Page heartbeat: bills paid minutes only; the free trial is not timed. */
export function userBeat(user: User, now: number): User {
  if (paidRemainingSec(user) > 0) {
    if (user.lastBeat && now - user.lastBeat <= BEAT_GAP_MS) {
      user.usedSec = Math.min(user.minutes * 60, user.usedSec + (now - user.lastBeat) / 1000);
    }
    user.firstUsed = user.firstUsed || now;
  }
  user.lastBeat = now;
  user.lastSeen = now;
  return user;
}

/** May this account start a film? Paid time always may; the trial covers one film (and retries of that same film). */
export function claimFilm(user: User, job: string, now: number): boolean {
  if (user.disabled) return false;
  if (paidRemainingSec(user) > 0) return true;
  if (!user.trialStartedAt) {
    user.trialStartedAt = now;
    user.trialJob = job || "pending";
    return true;
  }
  if (trialState(user, now) === "used") return false;
  if (user.trialJob === "pending") {
    if (job) user.trialJob = job;
    return true;
  }
  return Boolean(job) && user.trialJob === job;
}

export async function issueCode(store: Store, email: string, now: number): Promise<{ code?: string; waitSec?: number }> {
  const last = (await store.get(`code/${email}`)) as { sentAt: number } | null;
  if (last && now - last.sentAt < CODE_RESEND_MS) return { waitSec: Math.ceil((CODE_RESEND_MS - (now - last.sentAt)) / 1000) };
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  const code = String(n).padStart(6, "0");
  await store.set(`code/${email}`, { hash: await sha256(`${email}:${code}`), expires: now + CODE_TTL_MS, tries: 0, sentAt: now });
  return { code };
}

export async function checkCode(store: Store, email: string, code: string, now: number): Promise<boolean> {
  const entry = (await store.get(`code/${email}`)) as { hash: string; expires: number; tries: number; sentAt: number } | null;
  if (!entry || now > entry.expires || entry.tries >= CODE_MAX_TRIES) return false;
  if (entry.hash !== (await sha256(`${email}:${String(code || "").trim()}`))) {
    entry.tries += 1;
    await store.set(`code/${email}`, entry);
    return false;
  }
  await store.delete(`code/${email}`);
  return true;
}

/** At most `limit` hits per key per hour (e.g. verification emails per IP). */
export async function rateLimited(store: Store, key: string, limit: number, now: number): Promise<boolean> {
  const slot = `rate/${key}/${Math.floor(now / 3_600_000)}`;
  const count = ((await store.get(slot)) as number | null) || 0;
  if (count >= limit) return true;
  await store.set(slot, count + 1);
  return false;
}
