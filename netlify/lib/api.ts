import {
  ADMIN_COOKIE,
  ADMIN_PREFIX,
  CARD_COOKIE,
  type Card,
  type Store,
  adminToken,
  beat,
  checkAdminPassword,
  cookie,
  createCards,
  getCard,
  isAdmin,
  listCards,
  readCookie,
  remainingSec,
  saveCard,
  status,
  usable,
  visitor,
} from "./cards.ts";

const json = (data: unknown, init: number | ResponseInit = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    ...(typeof init === "number" ? { status: init } : init),
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });

const view = (card: Card) => ({ ...card, remainingSec: remainingSec(card), status: status(card) });

export async function handleApi(request: Request, store: Store): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method;

  if (path === "/api/card/me" && method === "GET") {
    const who = await visitor(store, request);
    if (who.admin) return json({ admin: true, code: ADMIN_PREFIX + (await adminToken(store)) });
    if (!who.card) return json({ locked: true }, 401);
    return json({ admin: false, code: who.card.code, minutes: who.card.minutes, remainingSec: remainingSec(who.card) });
  }

  if (path === "/api/card/beat" && method === "POST") {
    if (await isAdmin(store, readCookie(request, ADMIN_COOKIE))) return json({ admin: true });
    const card = await getCard(store, readCookie(request, CARD_COOKIE));
    if (!usable(card)) return json({ locked: true }, 403);
    await saveCard(store, beat(card, Date.now()));
    return json({ remainingSec: remainingSec(card) });
  }

  if (path === "/api/card/verify" && method === "GET") {
    const code = url.searchParams.get("code") || "";
    if (code.startsWith(ADMIN_PREFIX)) return json({ ok: await isAdmin(store, code.slice(ADMIN_PREFIX.length)) });
    const card = await getCard(store, code);
    return json(usable(card) ? { ok: true, remainingSec: remainingSec(card) } : { ok: false });
  }

  if (path === "/api/admin/login" && method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (!(await checkAdminPassword(String(body.password || "")))) return json({ error: "wrong password" }, 401);
    return json({ ok: true }, 200, { "set-cookie": cookie(ADMIN_COOKIE, await adminToken(store)) });
  }

  if (path === "/api/admin/logout" && method === "POST") {
    return json({ ok: true }, 200, { "set-cookie": cookie(ADMIN_COOKIE, "", 0) });
  }

  if (path.startsWith("/api/admin/")) {
    if (!(await isAdmin(store, readCookie(request, ADMIN_COOKIE)))) return json({ error: "login" }, 401);

    if (path === "/api/admin/cards" && method === "GET") {
      return json({ cards: (await listCards(store)).map(view) });
    }

    if (path === "/api/admin/cards" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const minutes = Number(body.minutes);
      const count = Number(body.count || 1);
      if (!(minutes >= 1 && minutes <= 100000)) return json({ error: "minutes" }, 400);
      if (!(Number.isInteger(count) && count >= 1 && count <= 50)) return json({ error: "count" }, 400);
      const made = await createCards(store, minutes, count, String(body.note || "").slice(0, 80));
      return json({ cards: made.map(view) });
    }

    const match = path.match(/^\/api\/admin\/cards\/([A-Z0-9-]+)$/i);
    if (match) {
      const card = await getCard(store, match[1]);
      if (!card) return json({ error: "not found" }, 404);
      if (method === "DELETE") {
        await store.delete(`card/${card.code}`);
        return json({ ok: true });
      }
      if (method === "POST") {
        const body = await request.json().catch(() => ({}));
        if (body.action === "disable") card.disabled = true;
        else if (body.action === "enable") card.disabled = false;
        else if (body.action === "add") {
          const extra = Number(body.minutes);
          if (!(extra >= 1 && extra <= 100000)) return json({ error: "minutes" }, 400);
          card.minutes += extra;
        } else return json({ error: "action" }, 400);
        await saveCard(store, card);
        return json({ card: view(card) });
      }
    }
  }

  return json({ error: "not found" }, 404);
}
