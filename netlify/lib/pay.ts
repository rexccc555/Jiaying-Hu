import { type Plan, type User, addMonths, getUser, saveUser } from "./accounts.ts";
import type { Store } from "./cards.ts";

export interface Pricing {
  monthly: number;
  yearly: number;
  month: number;
  creditPrice: number;
  minCredits: number;
  discountFrom: number;
  discount: number;
}

export interface StripeSettings {
  secret: string;
  webhookSecret: string;
  currency: string;
  pricing: Pricing;
}

export type Kind = Plan | "credits";

export type StripeApi = (secret: string, method: "GET" | "POST", path: string, params?: Record<string, string>) => Promise<any>;

export const SITE = "https://takeadayoff.co.nz";
export const DEFAULT_PRICING: Pricing = {
  monthly: 9.9,
  yearly: 99.9,
  month: 15.9,
  creditPrice: 0.02,
  minCredits: 500,
  discountFrom: 2000,
  discount: 0.95,
};
const MAX_CREDITS = 1_000_000;
const WEBHOOK_TOLERANCE_SEC = 300;
// Renewal can land a little after the period ends; keep members unlocked meanwhile.
const RENEWAL_GRACE_MS = 2 * 86_400_000;

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
  return {
    secret: saved?.secret || "",
    webhookSecret: saved?.webhookSecret || "",
    currency: saved?.currency || "nzd",
    pricing: { ...DEFAULT_PRICING, ...(saved?.pricing || {}) },
  };
}

export const payReady = (s: StripeSettings) => Boolean(s.secret);

export function cleanPricing(raw: any): Pricing {
  const num = (v: unknown, fallback: number, min: number, max: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 10000) / 10000 : fallback;
  };
  const d = DEFAULT_PRICING;
  return {
    monthly: num(raw?.monthly, d.monthly, 0.5, 100000),
    yearly: num(raw?.yearly, d.yearly, 0.5, 100000),
    month: num(raw?.month, d.month, 0.5, 100000),
    creditPrice: num(raw?.creditPrice, d.creditPrice, 0.0001, 100),
    minCredits: Math.round(num(raw?.minCredits, d.minCredits, 1, MAX_CREDITS)),
    discountFrom: Math.round(num(raw?.discountFrom, d.discountFrom, 1, MAX_CREDITS)),
    discount: num(raw?.discount, d.discount, 0.1, 1),
  };
}

/** Price in cents for a credit top-up, or 0 when the amount is not allowed. */
export function creditsPriceCents(p: Pricing, credits: number): number {
  if (!Number.isInteger(credits) || credits < p.minCredits || credits > MAX_CREDITS) return 0;
  const rate = credits >= p.discountFrom ? p.discount : 1;
  return Math.max(50, Math.round(credits * p.creditPrice * rate * 100));
}

const PLAN_NAMES: Record<Plan, string> = { monthly: "连续包月会员", yearly: "连续包年会员", month: "单月会员" };

export async function createCheckout(api: StripeApi, s: StripeSettings, user: User, kind: Kind, credits = 0): Promise<string> {
  const p = s.pricing;
  const params: Record<string, string> = {
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": s.currency,
    client_reference_id: user.email,
    "metadata[email]": user.email,
    "metadata[kind]": kind,
    success_url: `${SITE}/buy?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE}/buy`,
  };
  if (user.stripeCustomer) params.customer = user.stripeCustomer;
  else params.customer_email = user.email;

  if (kind === "credits") {
    const cents = creditsPriceCents(p, credits);
    if (!cents) throw new Error("credits");
    params.mode = "payment";
    params["metadata[credits]"] = String(credits);
    params["line_items[0][price_data][unit_amount]"] = String(cents);
    params["line_items[0][price_data][product_data][name]"] = `takeadayoff · ${credits} credits`;
    params["line_items[0][price_data][product_data][description]"] = `约 ${Math.floor(credits / 60)} 分钟视频的制作额度`;
  } else if (kind === "month") {
    params.mode = "payment";
    params["line_items[0][price_data][unit_amount]"] = String(Math.round(p.month * 100));
    params["line_items[0][price_data][product_data][name]"] = `takeadayoff · ${PLAN_NAMES.month}`;
    params["line_items[0][price_data][product_data][description]"] = "一个月内无限制使用，不自动续费";
  } else {
    params.mode = "subscription";
    params["line_items[0][price_data][unit_amount]"] = String(Math.round((kind === "yearly" ? p.yearly : p.monthly) * 100));
    params["line_items[0][price_data][recurring][interval]"] = kind === "yearly" ? "year" : "month";
    params["line_items[0][price_data][product_data][name]"] = `takeadayoff · ${PLAN_NAMES[kind]}`;
    params["subscription_data[metadata][email]"] = user.email;
    params["subscription_data[metadata][kind]"] = kind;
  }
  const session = await api(s.secret, "POST", "/v1/checkout/sessions", params);
  return session.url;
}

async function recordPayment(store: Store, id: string, entry: Record<string, unknown>) {
  await store.set(`paid/${id}`, { id, at: Date.now(), ...entry });
}

/** Applies a finished Checkout session once (both the return page and the webhook may call this). */
export async function credit(store: Store, session: any, now = Date.now()): Promise<boolean> {
  if (!session?.id || session.payment_status !== "paid") return false;
  if (await store.get(`paid/${session.id}`)) return true;
  const user = await getUser(store, String(session.metadata?.email || ""));
  const kind = String(session.metadata?.kind || "") as Kind;
  if (!user || !["credits", "month", "monthly", "yearly"].includes(kind)) return false;

  const entry: Record<string, unknown> = {
    email: user.email,
    kind,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || "",
  };
  if (session.customer) user.stripeCustomer = String(session.customer);
  if (kind === "credits") {
    const credits = Math.round(Number(session.metadata?.credits) || 0);
    if (credits <= 0) return false;
    user.credits += credits;
    entry.credits = credits;
  } else if (kind === "month") {
    user.planUntil = addMonths(Math.max(now, user.planUntil || 0), 1);
    if (!user.subId) user.plan = "month";
  } else {
    user.plan = kind;
    user.subId = session.subscription ? String(session.subscription) : user.subId;
    user.planUntil = Math.max(user.planUntil || 0, addMonths(now, kind === "yearly" ? 12 : 1) + RENEWAL_GRACE_MS);
    if (user.subId) await store.set(`sub/${user.subId}`, user.email);
  }
  await recordPayment(store, session.id, entry);
  await saveUser(store, user);
  return true;
}

const subIdOf = (invoice: any): string =>
  String(invoice?.subscription || invoice?.parent?.subscription_details?.subscription || "");

/** A paid subscription invoice (first one or a renewal) pushes membership to the end of the paid period. */
export async function renew(store: Store, invoice: any): Promise<boolean> {
  const subId = subIdOf(invoice);
  if (!subId || !invoice?.id) return false;
  if (await store.get(`paid/${invoice.id}`)) return true;
  const email =
    ((await store.get(`sub/${subId}`)) as string | null) ||
    invoice?.parent?.subscription_details?.metadata?.email ||
    invoice?.subscription_details?.metadata?.email ||
    "";
  const user = await getUser(store, String(email));
  if (!user) return false;
  const ends = (invoice.lines?.data || []).map((line: any) => Number(line?.period?.end) || 0);
  const periodEnd = Math.max(0, ...ends) * 1000;
  if (periodEnd) user.planUntil = Math.max(user.planUntil || 0, periodEnd + RENEWAL_GRACE_MS);
  user.subId = subId;
  await store.set(`sub/${subId}`, user.email);
  if (invoice.billing_reason !== "subscription_create") {
    await recordPayment(store, invoice.id, {
      email: user.email,
      kind: user.plan || "monthly",
      renewal: true,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency || "",
    });
  } else {
    await store.set(`paid/${invoice.id}`, { id: invoice.id, hidden: true });
  }
  await saveUser(store, user);
  return true;
}

/** Subscription ended (cancelled or unpaid): stop calling it a subscription; paid time already granted still runs out naturally. */
export async function subscriptionEnded(store: Store, subscription: any): Promise<void> {
  const subId = String(subscription?.id || "");
  const email = ((await store.get(`sub/${subId}`)) as string | null) || subscription?.metadata?.email || "";
  const user = await getUser(store, String(email));
  if (!user || user.subId !== subId) return;
  user.subId = null;
  await saveUser(store, user);
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
