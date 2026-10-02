import { getUser, saveUser } from "./accounts.ts";
import type { Store } from "./cards.ts";

export interface Pack {
  id: string;
  name: string;
  minutes: number;
  price: number;
}

export interface StripeSettings {
  secret: string;
  webhookSecret: string;
  currency: string;
  packs: Pack[];
}

export type StripeApi = (secret: string, method: "GET" | "POST", path: string, params?: Record<string, string>) => Promise<any>;

export const SITE = "https://takeadayoff.co.nz";
const WEBHOOK_TOLERANCE_SEC = 300;

export const stripeApi: StripeApi = async (secret, method, path, params) => {
  const res = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: { authorization: `Bearer ${secret}`, "content-type": "application/x-www-form-urlencoded" },
    body: method === "POST" ? new URLSearchParams(params).toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `stripe ${res.status}`);
  return data;
};

export async function stripeSettings(store: Store): Promise<StripeSettings> {
  const saved = (await store.get("meta/stripe")) as Partial<StripeSettings> | null;
  return { secret: "", webhookSecret: "", currency: "nzd", packs: [], ...(saved || {}) };
}

export const payReady = (s: StripeSettings) => Boolean(s.secret && s.packs.length);

export function cleanPacks(raw: unknown): Pack[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p: any, i: number) => ({
      id: String(p?.id || `p${i + 1}`).replace(/[^a-z0-9_-]/gi, "").slice(0, 20) || `p${i + 1}`,
      name: String(p?.name || "").trim().slice(0, 40),
      minutes: Math.round(Number(p?.minutes)),
      price: Math.round(Number(p?.price) * 100) / 100,
    }))
    .filter((p) => p.name && p.minutes >= 1 && p.minutes <= 100000 && p.price >= 0.5 && p.price <= 100000)
    .slice(0, 6);
}

export async function createCheckout(api: StripeApi, s: StripeSettings, pack: Pack, email: string): Promise<string> {
  const session = await api(s.secret, "POST", "/v1/checkout/sessions", {
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": s.currency,
    "line_items[0][price_data][unit_amount]": String(Math.round(pack.price * 100)),
    "line_items[0][price_data][product_data][name]": `takeadayoff · ${pack.name}`,
    "line_items[0][price_data][product_data][description]": `${pack.minutes} 分钟制作时长`,
    customer_email: email,
    client_reference_id: email,
    "metadata[email]": email,
    "metadata[minutes]": String(pack.minutes),
    "metadata[pack]": pack.id,
    success_url: `${SITE}/buy?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/buy`,
  });
  return session.url;
}

/** Adds the paid minutes to the account once per Stripe session (both the return page and the webhook may call this). */
export async function credit(store: Store, session: any): Promise<boolean> {
  if (!session?.id || session.payment_status !== "paid") return false;
  const key = `paid/${session.id}`;
  if (await store.get(key)) return true;
  const email = String(session.metadata?.email || "");
  const minutes = Number(session.metadata?.minutes) || 0;
  const user = await getUser(store, email);
  if (!user || minutes <= 0) return false;
  await store.set(key, {
    id: session.id,
    email,
    minutes,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || "",
    at: Date.now(),
  });
  user.minutes += minutes;
  await saveUser(store, user);
  return true;
}

const hex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

export async function verifyWebhook(payload: string, header: string, secret: string, nowSec = Date.now() / 1000): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=", 2) as [string, string]));
  const sigs = header.split(",").filter((kv) => kv.startsWith("v1=")).map((kv) => kv.slice(3));
  const t = Number(parts.t);
  if (!secret || !t || !sigs.length || Math.abs(nowSec - t) > WEBHOOK_TOLERANCE_SEC) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)));
  return sigs.includes(expected);
}
