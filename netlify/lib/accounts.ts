import type { Store } from "./cards.ts";

export type Plan = "monthly" | "yearly" | "month";

export interface FilmCharge {
  credits: number;
  at: number;
  pending?: boolean;
}

export interface User {
  email: string;
  salt: string;
  hash: string;
  token: string;
  created: number;
  credits: number;
  plan: Plan | null;
  planUntil: number | null;
  stripeCustomer: string | null;
  subId: string | null;
  films: Record<string, FilmCharge>;
  lastFilmAt: number | null;
  lastSeen: number | null;
  trialStartedAt: number | null;
  trialJob: string | null;
  disabled: boolean;
  /** Older accounts were sold page-open minutes; converted to credits on load. */
  minutes?: number;
  usedSec?: number;
}

export const USER_COOKIE = "clip_user";
export const TOKEN_PREFIX = "acct_";
// After the free film starts, the account can still open the studio this long to finish, watch and download it.
export const TRIAL_VIEW_MS = 3 * 86_400_000;
// After any film, the studio stays open this long so the result can be watched and downloaded.
const FILM_VIEW_MS = 7 * 86_400_000;
// One credit pays for one second of source video (60 credits = 1 minute).
export const CREDITS_PER_SECOND = 1;
// A film whose length is not known yet needs at least this balance; the rest is settled once the length is known.
const MIN_PENDING_CREDITS = 60;
const MAX_FILMS_KEPT = 60;
const CODE_TTL_MS = 10 * 60_000;
const CODE_RESEND_MS = 60_000;
const CODE_MAX_TRIES = 5;

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

function upgrade(user: User): User {
  if (typeof user.credits !== "number") {
    const leftSec = Math.max(0, (user.minutes || 0) * 60 - (user.usedSec || 0));
    user.credits = Math.round(leftSec);
  }
  delete user.minutes;
  delete user.usedSec;
  user.plan ??= null;
  user.planUntil ??= null;
  user.stripeCustomer ??= null;
  user.subId ??= null;
  user.films ??= {};
  user.lastFilmAt ??= null;
  return user;
}

export async function getUser(store: Store, email: string): Promise<User | null> {
  const user = email ? ((await store.get(`user/${email}`)) as User | null) : null;
  return user ? upgrade(user) : null;
}

export async function saveUser(store: Store, user: User): Promise<void> {
  const ids = Object.keys(user.films);
  if (ids.length > MAX_FILMS_KEPT) {
    ids.sort((a, b) => user.films[a].at - user.films[b].at).slice(0, ids.length - MAX_FILMS_KEPT).forEach((id) => delete user.films[id]);
  }
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
    credits: 0,
    plan: null,
    planUntil: null,
    stripeCustomer: null,
    subId: null,
    films: {},
    lastFilmAt: null,
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

export const planActive = (user: User, now = Date.now()) => Boolean(user.planUntil && user.planUntil > now);

export function trialState(user: User, now = Date.now()): "available" | "active" | "used" {
  if (!user.trialStartedAt) return "available";
  return now - user.trialStartedAt < TRIAL_VIEW_MS ? "active" : "used";
}

export function userUsable(user: User | null, now = Date.now()): user is User {
  if (!user || user.disabled) return false;
  return (
    planActive(user, now) ||
    user.credits > 0 ||
    trialState(user, now) !== "used" ||
    Boolean(user.lastFilmAt && now - user.lastFilmAt < FILM_VIEW_MS)
  );
}

export function userBeat(user: User, now: number): User {
  user.lastSeen = now;
  return user;
}

export const filmCost = (seconds: number) => Math.max(1, Math.ceil(seconds * CREDITS_PER_SECOND));

export type FilmResult = { ok: true; charged: number; via: "plan" | "trial" | "credits" | "free" } | { ok: false; reason: "disabled" | "credits"; need: number };

/**
 * May this account start (or re-make) a film? Membership is unlimited; otherwise the one free trial film,
 * then credits by source length. `job` is empty for the check before upload; `redo` re-makes a finished film.
 */
export function claimFilm(user: User, job: string, seconds: number, redo: boolean, now: number): FilmResult {
  if (user.disabled) return { ok: false, reason: "disabled", need: 0 };
  const secs = Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 4 * 3600) : 0;
  const record = (credits: number, pending = false) => {
    if (!job) return;
    user.films[job] = { credits, at: now, ...(pending ? { pending: true } : {}) };
    user.lastFilmAt = now;
  };

  if (planActive(user, now)) {
    record(0);
    return { ok: true, charged: 0, via: "plan" };
  }

  const known = job ? user.films[job] : undefined;
  if (known && !redo) {
    if (known.pending && secs > 0) {
      const cost = Math.min(user.credits, filmCost(secs));
      user.credits -= cost;
      user.films[job] = { credits: cost, at: known.at };
      return { ok: true, charged: cost, via: "credits" };
    }
    return { ok: true, charged: 0, via: "free" };
  }

  if (!user.trialStartedAt) {
    user.trialStartedAt = now;
    user.trialJob = job || "pending";
    record(0);
    return { ok: true, charged: 0, via: "trial" };
  }
  if (trialState(user, now) === "active" && (user.trialJob === "pending" || user.trialJob === job)) {
    if (job && user.trialJob === "pending") user.trialJob = job;
    record(0);
    return { ok: true, charged: 0, via: "trial" };
  }

  if (!secs) {
    if (user.credits < MIN_PENDING_CREDITS) return { ok: false, reason: "credits", need: MIN_PENDING_CREDITS };
    record(0, true);
    return { ok: true, charged: 0, via: "credits" };
  }
  const cost = filmCost(secs);
  if (user.credits < cost) return { ok: false, reason: "credits", need: cost };
  if (job) {
    user.credits -= cost;
    record(cost);
  }
  return { ok: true, charged: job ? cost : 0, via: "credits" };
}

export function addMonths(from: number, months: number): number {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.getTime();
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
