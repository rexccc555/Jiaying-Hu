import {
  TOKEN_PREFIX,
  USER_COOKIE,
  type User,
  checkCode,
  checkPassword,
  claimFilm,
  createUser,
  deleteUser,
  getUser,
  issueCode,
  normEmail,
  paidRemainingSec,
  rateLimited,
  saveUser,
  setPassword,
  trialState,
  userBeat,
  userByToken,
  userUsable,
} from "./accounts.ts";
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
} from "./cards.ts";
import { visitor } from "./identity.ts";
import { type SendMail, type Smtp, codeEmail } from "./mail.ts";

const json = (data: unknown, init: number | ResponseInit = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    ...(typeof init === "number" ? { status: init } : init),
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });

const fail = (error: string, status = 400) => json({ error }, status);
const cardView = (card: Card) => ({ ...card, remainingSec: remainingSec(card), status: status(card) });
const userView = (user: User) => ({
  email: user.email,
  created: user.created,
  minutes: user.minutes,
  usedSec: user.usedSec,
  remainingSec: paidRemainingSec(user),
  trial: trialState(user),
  trialStartedAt: user.trialStartedAt,
  lastSeen: user.lastSeen,
  disabled: user.disabled,
});
const accountView = (user: User) => ({
  account: true,
  email: user.email,
  code: user.token,
  remainingSec: paidRemainingSec(user),
  trial: trialState(user),
  usable: userUsable(user),
});

async function smtpSettings(store: Store): Promise<Smtp | null> {
  const smtp = (await store.get("meta/smtp")) as Smtp | null;
  return smtp && smtp.host && smtp.user && smtp.pass ? smtp : null;
}

const clientIp = (request: Request) =>
  request.headers.get("x-nf-client-connection-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

const signedIn = (user: User) => ({ "set-cookie": cookie(USER_COOKIE, user.token) });

export async function handleApi(request: Request, store: Store, send: SendMail): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method;
  const now = Date.now();
  const body = method === "POST" ? await request.json().catch(() => ({})) : {};

  // ---- accounts ----
  if (path === "/api/auth/send-code" && method === "POST") {
    const email = normEmail(body.email);
    if (!email) return fail("email");
    const purpose = body.purpose === "reset" ? "reset" : "register";
    const existing = await getUser(store, email);
    if (purpose === "register" && existing) return fail("exists");
    if (purpose === "reset" && !existing) return fail("no_account");
    const smtp = await smtpSettings(store);
    if (!smtp) return fail("mail_off", 503);
    if (await rateLimited(store, `ip/${clientIp(request)}`, 15, now)) return fail("too_many", 429);
    const issued = await issueCode(store, email, now);
    if (!issued.code) return json({ error: "wait", waitSec: issued.waitSec }, 429);
    const mail = codeEmail(issued.code, purpose);
    try {
      await send(smtp, email, mail.subject, mail.html, mail.text);
    } catch {
      await store.delete(`code/${email}`);
      return fail("mail_failed", 502);
    }
    return json({ ok: true });
  }

  if (path === "/api/auth/register" && method === "POST") {
    const email = normEmail(body.email);
    const password = String(body.password || "");
    if (!email) return fail("email");
    if (password.length < 6) return fail("password");
    if (await getUser(store, email)) return fail("exists");
    if (!(await checkCode(store, email, String(body.code || ""), now))) return fail("code");
    const user = await createUser(store, email, password);
    return json(accountView(user), 200, signedIn(user));
  }

  if (path === "/api/auth/login" && method === "POST") {
    const email = normEmail(body.email);
    if (await rateLimited(store, `login/${email || clientIp(request)}`, 20, now)) return fail("too_many", 429);
    const user = await getUser(store, email);
    if (!user || !(await checkPassword(user, String(body.password || "")))) return fail("login", 401);
    if (user.disabled) return fail("disabled", 403);
    return json(accountView(user), 200, signedIn(user));
  }

  if (path === "/api/auth/reset" && method === "POST") {
    const email = normEmail(body.email);
    const password = String(body.password || "");
    const user = await getUser(store, email);
    if (!user) return fail("no_account");
    if (password.length < 6) return fail("password");
    if (!(await checkCode(store, email, String(body.code || ""), now))) return fail("code");
    await setPassword(user, password);
    await saveUser(store, user);
    return json(accountView(user), 200, signedIn(user));
  }

  if (path === "/api/auth/redeem" && method === "POST") {
    const user = await userByToken(store, readCookie(request, USER_COOKIE));
    if (!user) return fail("login", 401);
    const card = await getCard(store, String(body.code || ""));
    if (!card) return fail("card");
    if (!usable(card)) return fail(card.redeemedBy ? "card_redeemed" : "card_empty");
    user.minutes += remainingSec(card) / 60;
    card.redeemedBy = user.email;
    card.disabled = true;
    await saveCard(store, card);
    await saveUser(store, user);
    return json(accountView(user));
  }

  // ---- the studio page and the program on the visitor's computer ----
  if (path === "/api/card/me" && method === "GET") {
    const who = await visitor(store, request);
    if (who.admin) return json({ admin: true, code: ADMIN_PREFIX + (await adminToken(store)) });
    if (who.user) return json(accountView(who.user), who.locked ? 403 : 200);
    if (!who.card || who.locked) return json({ locked: true }, 401);
    return json({ admin: false, code: who.card.code, minutes: who.card.minutes, remainingSec: remainingSec(who.card) });
  }

  if (path === "/api/card/beat" && method === "POST") {
    const who = await visitor(store, request);
    if (who.admin) return json({ admin: true });
    if (who.user) {
      if (who.locked) return json({ locked: true }, 403);
      await saveUser(store, userBeat(who.user, now));
      return json(accountView(who.user));
    }
    if (!who.card || who.locked) return json({ locked: true }, 403);
    await saveCard(store, beat(who.card, now));
    return json({ remainingSec: remainingSec(who.card) });
  }

  if (path === "/api/card/film" && method === "POST") {
    const who = await visitor(store, request);
    if (who.admin || (who.card && !who.locked)) return json({ ok: true });
    if (!who.user) return json({ ok: false }, 401);
    const ok = claimFilm(who.user, String(body.job || ""), now);
    await saveUser(store, who.user);
    return json({ ok, ...accountView(who.user) }, ok ? 200 : 403);
  }

  if (path === "/api/card/verify" && method === "GET") {
    const code = url.searchParams.get("code") || "";
    if (code.startsWith(ADMIN_PREFIX)) return json({ ok: await isAdmin(store, code.slice(ADMIN_PREFIX.length)) });
    if (code.startsWith(TOKEN_PREFIX)) return json({ ok: userUsable(await userByToken(store, code), now) });
    const card = await getCard(store, code);
    return json(usable(card) ? { ok: true, remainingSec: remainingSec(card) } : { ok: false });
  }

  // ---- admin ----
  if (path === "/api/admin/login" && method === "POST") {
    if (!(await checkAdminPassword(String(body.password || "")))) return fail("wrong password", 401);
    return json({ ok: true }, 200, { "set-cookie": cookie(ADMIN_COOKIE, await adminToken(store)) });
  }

  if (path === "/api/admin/logout" && method === "POST") {
    return json({ ok: true }, 200, { "set-cookie": cookie(ADMIN_COOKIE, "", 0) });
  }

  if (path.startsWith("/api/admin/")) {
    if (!(await isAdmin(store, readCookie(request, ADMIN_COOKIE)))) return fail("login", 401);

    if (path === "/api/admin/cards" && method === "GET") {
      return json({ cards: (await listCards(store)).map(cardView) });
    }

    if (path === "/api/admin/cards" && method === "POST") {
      const minutes = Number(body.minutes);
      const count = Number(body.count || 1);
      if (!(minutes >= 1 && minutes <= 100000)) return fail("minutes");
      if (!(Number.isInteger(count) && count >= 1 && count <= 50)) return fail("count");
      const made = await createCards(store, minutes, count, String(body.note || "").slice(0, 80));
      return json({ cards: made.map(cardView) });
    }

    const cardMatch = path.match(/^\/api\/admin\/cards\/([A-Z0-9-]+)$/i);
    if (cardMatch) {
      const card = await getCard(store, cardMatch[1]);
      if (!card) return fail("not found", 404);
      if (method === "DELETE") {
        await store.delete(`card/${card.code}`);
        return json({ ok: true });
      }
      if (method === "POST") {
        if (body.action === "disable") card.disabled = true;
        else if (body.action === "enable") card.disabled = false;
        else if (body.action === "add") {
          const extra = Number(body.minutes);
          if (!(extra >= 1 && extra <= 100000)) return fail("minutes");
          card.minutes += extra;
        } else return fail("action");
        await saveCard(store, card);
        return json({ card: cardView(card) });
      }
    }

    if (path === "/api/admin/users" && method === "GET") {
      const keys = await store.list("user/");
      const users = (await Promise.all(keys.map((key) => store.get(key)))).filter(Boolean) as User[];
      return json({ users: users.sort((a, b) => b.created - a.created).map(userView) });
    }

    const userMatch = path.match(/^\/api\/admin\/users\/(.+)$/);
    if (userMatch) {
      const user = await getUser(store, normEmail(decodeURIComponent(userMatch[1])));
      if (!user) return fail("not found", 404);
      if (method === "DELETE") {
        await deleteUser(store, user);
        return json({ ok: true });
      }
      if (method === "POST") {
        if (body.action === "disable") user.disabled = true;
        else if (body.action === "enable") user.disabled = false;
        else if (body.action === "reset_trial") {
          user.trialStartedAt = null;
          user.trialJob = null;
        } else if (body.action === "add") {
          const extra = Number(body.minutes);
          if (!(extra >= 1 && extra <= 100000)) return fail("minutes");
          user.minutes += extra;
        } else return fail("action");
        await saveUser(store, user);
        return json({ user: userView(user) });
      }
    }

    if (path === "/api/admin/smtp" && method === "GET") {
      const smtp = (await store.get("meta/smtp")) as Smtp | null;
      return json({ smtp: smtp ? { ...smtp, pass: smtp.pass ? "********" : "" } : null });
    }

    if (path === "/api/admin/smtp" && method === "POST") {
      const old = ((await store.get("meta/smtp")) as Smtp | null) || null;
      const smtp: Smtp = {
        host: String(body.host || "").trim(),
        port: Number(body.port) || 465,
        user: String(body.user || "").trim(),
        pass: body.pass && body.pass !== "********" ? String(body.pass) : old?.pass || "",
        fromName: String(body.fromName || "takeadayoff").trim().slice(0, 40),
      };
      if (!smtp.host || !smtp.user || !smtp.pass) return fail("smtp");
      await store.set("meta/smtp", smtp);
      return json({ ok: true });
    }

    if (path === "/api/admin/smtp/test" && method === "POST") {
      const smtp = await smtpSettings(store);
      const to = normEmail(body.to);
      if (!smtp) return fail("smtp");
      if (!to) return fail("email");
      const mail = codeEmail("123456", "register");
      try {
        await send(smtp, to, "takeadayoff 测试邮件", mail.html, mail.text);
      } catch (err) {
        return json({ error: "mail_failed", detail: String((err as Error)?.message || err).slice(0, 200) }, 502);
      }
      return json({ ok: true });
    }
  }

  return fail("not found", 404);
}
