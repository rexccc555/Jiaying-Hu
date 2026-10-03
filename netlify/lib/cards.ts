export interface Store {
  get(key: string): Promise<any | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

export interface CardFilm {
  sec: number;
  at: number;
  pending?: boolean;
}

export interface Card {
  code: string;
  /** Minutes of uploaded video this card pays for (not minutes of using the site). */
  minutes: number;
  usedSec: number;
  films?: Record<string, CardFilm>;
  lastFilmAt?: number | null;
  note: string;
  disabled: boolean;
  created: number;
  firstUsed: number | null;
  lastBeat: number | null;
  redeemedBy?: string;
}

export const CARD_COOKIE = "clip_card";
export const ADMIN_COOKIE = "clip_admin";
export const ADMIN_PREFIX = "ADMIN:";
// After a film, the studio stays open this long so the result can be watched and downloaded, even with nothing left.
const FILM_VIEW_MS = 7 * 86_400_000;
// A film whose length is not known yet needs at least this much left; the rest is settled once the length is known.
const MIN_PENDING_SEC = 60;
const MAX_FILMS_KEPT = 60;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
// PBKDF2-SHA256 of the admin password, salt "mpva-admin-v1", 200k rounds.
const ADMIN_HASH = "3dbe2669dfec8429bbb729aefd7d3be5aa0aaf865fc049905be407c893f7ac92";

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

export function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `MP-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

export function normalize(raw: string): string {
  const chars = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^MP/, "");
  return chars.length === 8 ? `MP-${chars.slice(0, 4)}-${chars.slice(4)}` : "";
}

export function remainingSec(card: Card): number {
  return Math.max(0, Math.round(card.minutes * 60 - card.usedSec));
}

/** Has video length left to spend (what redeeming into an account transfers). */
export function hasLeft(card: Card | null): card is Card {
  return Boolean(card && !card.disabled && remainingSec(card) > 0);
}

/** May open the studio: something left, or a recent film still to watch and download. */
export function usable(card: Card | null, now = Date.now()): card is Card {
  return hasLeft(card) || Boolean(card && !card.disabled && card.lastFilmAt && now - card.lastFilmAt < FILM_VIEW_MS);
}

export function status(card: Card): string {
  if (card.redeemedBy) return "redeemed";
  if (card.disabled) return "disabled";
  if (remainingSec(card) <= 0) return "used_up";
  return card.firstUsed ? "active" : "new";
}

/** Only records that the studio is open; nothing is charged for time spent on the site. */
export function beat(card: Card, now: number): Card {
  card.lastBeat = now;
  card.firstUsed = card.firstUsed || now;
  return card;
}

export type CardFilmResult = { ok: true; charged: number } | { ok: false; reason: "disabled" | "credits"; need: number };

/**
 * May this card start (or re-make) a film? It is charged the length of the uploaded video, once per film.
 * `job` is empty for the check before upload; `redo` re-makes a finished film and is charged again.
 */
export function claimCardFilm(card: Card, job: string, seconds: number, redo: boolean, now: number): CardFilmResult {
  if (card.disabled) return { ok: false, reason: "disabled", need: 0 };
  card.films ??= {};
  const films = card.films;
  const secs = Number.isFinite(seconds) && seconds > 0 ? Math.ceil(Math.min(seconds, 4 * 3600)) : 0;
  const left = remainingSec(card);
  const record = (sec: number, pending = false) => {
    if (!job) return;
    films[job] = { sec, at: now, ...(pending ? { pending: true } : {}) };
    card.lastFilmAt = now;
    card.firstUsed = card.firstUsed || now;
    const ids = Object.keys(films);
    if (ids.length > MAX_FILMS_KEPT) {
      ids.sort((a, b) => films[a].at - films[b].at).slice(0, ids.length - MAX_FILMS_KEPT).forEach((id) => delete films[id]);
    }
  };

  const known = job ? films[job] : undefined;
  if (known && !redo) {
    if (known.pending && secs > 0) {
      const cost = Math.min(left, secs);
      card.usedSec += cost;
      films[job] = { sec: cost, at: known.at };
    }
    return { ok: true, charged: 0 };
  }

  if (!secs) {
    if (left < MIN_PENDING_SEC) return { ok: false, reason: "credits", need: MIN_PENDING_SEC };
    record(0, true);
    return { ok: true, charged: 0 };
  }
  if (left < secs) return { ok: false, reason: "credits", need: secs };
  if (job) {
    card.usedSec += secs;
    record(secs);
  }
  return { ok: true, charged: job ? secs : 0 };
}

export async function getCard(store: Store, code: string): Promise<Card | null> {
  const key = normalize(code);
  return key ? ((await store.get(`card/${key}`)) as Card | null) : null;
}

export async function saveCard(store: Store, card: Card): Promise<void> {
  await store.set(`card/${card.code}`, card);
}

export async function createCards(store: Store, minutes: number, count: number, note: string): Promise<Card[]> {
  const made: Card[] = [];
  for (let i = 0; i < count; i++) {
    const card: Card = {
      code: newCode(),
      minutes,
      usedSec: 0,
      note,
      disabled: false,
      created: Date.now(),
      firstUsed: null,
      lastBeat: null,
    };
    await saveCard(store, card);
    made.push(card);
  }
  return made;
}

export async function listCards(store: Store): Promise<Card[]> {
  const keys = await store.list("card/");
  const cards = await Promise.all(keys.map((key) => store.get(key)));
  return (cards.filter(Boolean) as Card[]).sort((a, b) => b.created - a.created);
}

async function secret(store: Store): Promise<string> {
  let value = (await store.get("meta/secret")) as string | null;
  if (!value) {
    value = hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
    await store.set("meta/secret", value);
  }
  return value;
}

export async function adminToken(store: Store): Promise<string> {
  const data = new TextEncoder().encode(`admin:${await secret(store)}`);
  return hex(await crypto.subtle.digest("SHA-256", data));
}

export async function isAdmin(store: Store, token: string): Promise<boolean> {
  return Boolean(token) && token === (await adminToken(store));
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode("mpva-admin-v1"), iterations: 200_000 },
    key,
    256,
  );
  return hex(bits) === ADMIN_HASH;
}

export function readCookie(request: Request, name: string): string {
  const raw = request.headers.get("cookie") || "";
  const hit = raw.split(/;\s*/).find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

export function cookie(name: string, value: string, maxAge = 2592000): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}