export interface Store {
  get(key: string): Promise<any | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

export interface Card {
  code: string;
  minutes: number;
  usedSec: number;
  note: string;
  disabled: boolean;
  created: number;
  firstUsed: number | null;
  lastBeat: number | null;
}

export const CARD_COOKIE = "clip_card";
export const ADMIN_COOKIE = "clip_admin";
export const ADMIN_PREFIX = "ADMIN:";
// A page heartbeat further apart than this means the studio was closed in between; that gap is not billed.
const BEAT_GAP_MS = 150_000;
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

export function usable(card: Card | null): card is Card {
  return Boolean(card && !card.disabled && remainingSec(card) > 0);
}

export function status(card: Card): string {
  if (card.disabled) return "disabled";
  if (remainingSec(card) <= 0) return "used_up";
  return card.firstUsed ? "active" : "new";
}

export function beat(card: Card, now: number): Card {
  if (card.lastBeat && now - card.lastBeat <= BEAT_GAP_MS) {
    card.usedSec = Math.min(card.minutes * 60, card.usedSec + (now - card.lastBeat) / 1000);
  }
  card.lastBeat = now;
  card.firstUsed = card.firstUsed || now;
  return card;
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

/** Who is signed in through the browser: a usable card, the admin, or nobody. */
export async function visitor(store: Store, request: Request): Promise<{ admin: boolean; card: Card | null }> {
  if (await isAdmin(store, readCookie(request, ADMIN_COOKIE))) return { admin: true, card: null };
  const card = await getCard(store, readCookie(request, CARD_COOKIE));
  return { admin: false, card: usable(card) ? card : null };
}
