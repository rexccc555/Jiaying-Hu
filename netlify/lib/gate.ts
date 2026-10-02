import { USER_COOKIE } from "./accounts.ts";
import { ADMIN_COOKIE, CARD_COOKIE, type Store, cookie, getCard, status, usable } from "./cards.ts";
import { allowed, visitor } from "./identity.ts";
import { buyPage, landingPage } from "./landing.ts";
import { payReady, stripeSettings } from "./pay.ts";

async function buy(store: Store, email: string, locked: boolean): Promise<Response> {
  const s = await stripeSettings(store);
  return buyPage(email, locked, payReady(s) ? s.packs : [], s.currency);
}

// SHA-256 of "cliptest:mp-video-assistant". Only lets the installer and the program download through; pages need an account or card.
export const DOWNLOAD_KEY = "2abe1a4b8ac31a13ebbaebf99cc6564d5c489d277e96efc71ce7dded4fe325f8";
const KEY_PLACEHOLDER = "__CLIP_KEY__";
const INJECT = new Set(["/", "/index.html", "/install.ps1", "/install.sh"]);

export async function handleGate(request: Request, next: () => Promise<Response>, store: Store): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.startsWith("/api/") || path === "/admin" || path.startsWith("/admin/")) return next();

  if (path === "/__gate" && request.method === "POST") {
    const form = await request.formData();
    const card = await getCard(store, String(form.get("code") || ""));
    if (!card) return landingPage("wrong", "card");
    if (!usable(card)) return landingPage(status(card), "card");
    return new Response(null, { status: 303, headers: { location: "/", "set-cookie": cookie(CARD_COOKIE, card.code) } });
  }

  if (path === "/__logout") {
    const headers = new Headers({ location: "/" });
    headers.append("set-cookie", cookie(CARD_COOKIE, "", 0));
    headers.append("set-cookie", cookie(USER_COOKIE, "", 0));
    headers.append("set-cookie", cookie(ADMIN_COOKIE, "", 0));
    return new Response(null, { status: 303, headers });
  }

  if (path === "/buy") {
    const who = await visitor(store, request);
    return who.user ? buy(store, who.user.email, Boolean(who.locked)) : landingPage("", "login");
  }

  const download = path === "/install.ps1" || path === "/install.sh" || path.startsWith("/download/");
  if (!(download && url.searchParams.get("k") === DOWNLOAD_KEY)) {
    const who = await visitor(store, request);
    if (!allowed(who)) {
      if (who.locked === "user" && who.user) return buy(store, who.user.email, true);
      if (who.locked === "card" && who.card) return landingPage(status(who.card), "card");
      return landingPage();
    }
  }

  const response = await next();
  if (!INJECT.has(path)) return response;
  const body = (await response.text()).replaceAll(KEY_PLACEHOLDER, DOWNLOAD_KEY);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(body, { status: response.status, headers });
}
