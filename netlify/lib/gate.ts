import { CARD_COOKIE, type Store, cookie, getCard, readCookie, status, usable, visitor } from "./cards.ts";

// SHA-256 of "cliptest:mp-video-assistant". Only lets the installer and the program download through; pages need a card.
export const DOWNLOAD_KEY = "2abe1a4b8ac31a13ebbaebf99cc6564d5c489d277e96efc71ce7dded4fe325f8";
const KEY_PLACEHOLDER = "__CLIP_KEY__";
const INJECT = new Set(["/", "/index.html", "/install.ps1"]);

const MESSAGES: Record<string, string> = {
  wrong: "卡号不对，再检查一下 · Card not recognised",
  used_up: "这张卡的时间已用完，请联系我们续时 · This card has no time left",
  disabled: "这张卡已停用，请联系我们 · This card has been switched off",
};

export function loginPage(reason = ""): Response {
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>MP Video Assistant</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #fbf7f1; color: #15243b;
    font-family: "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", sans-serif; }
  .blob { position: fixed; border-radius: 50%; filter: blur(70px); opacity: .45; z-index: -1; }
  .b1 { width: 520px; height: 520px; background: #ffd9c7; top: -180px; right: -140px; }
  .b2 { width: 460px; height: 460px; background: #d9e8ff; bottom: -200px; left: -160px; }
  form { width: min(380px, 90vw); background: #fff; border: 1px solid #ece4d8; border-radius: 24px; padding: 34px 28px;
    box-shadow: 0 18px 50px -24px rgba(21,36,59,.28); text-align: center; }
  .dot { width: 54px; height: 54px; border-radius: 18px; margin: 0 auto 14px; display: grid; place-items: center; font-size: 26px;
    background: linear-gradient(135deg, #ff7a59, #ffb347); box-shadow: 0 10px 24px -10px #ff7a59; }
  h1 { font-size: 1.25rem; margin: 0 0 6px; }
  p { color: #66758a; font-size: 14px; margin: 0 0 20px; }
  input { width: 100%; padding: 13px 16px; border-radius: 14px; border: 1px solid #ece4d8; font: inherit; font-size: 17px; outline: none;
    text-align: center; letter-spacing: .08em; text-transform: uppercase; }
  input:focus { border-color: #ff7a59; box-shadow: 0 0 0 4px rgba(255,122,89,.15); }
  button { width: 100%; margin-top: 14px; padding: 13px; border: 0; border-radius: 14px; cursor: pointer; font: inherit; font-weight: 700;
    color: #fff; background: linear-gradient(135deg, #ff7a59, #ff9a5a); }
  .err { color: #c0392b; font-size: 13px; margin: 10px 0 0; min-height: 1em; }
</style>
</head>
<body>
<div class="blob b1"></div><div class="blob b2"></div>
<form method="post" action="/__gate">
  <div class="dot">🎬</div>
  <h1>MP Video Assistant</h1>
  <p>请输入卡号 · Enter your access card</p>
  <input name="code" autofocus autocomplete="off" spellcheck="false" placeholder="MP-XXXX-XXXX" />
  <button type="submit">进入 · Enter</button>
  <p class="err">${MESSAGES[reason] || ""}</p>
</form>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

export async function handleGate(request: Request, next: () => Promise<Response>, store: Store): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.startsWith("/api/") || path === "/admin" || path.startsWith("/admin/")) return next();

  if (path === "/__gate" && request.method === "POST") {
    const form = await request.formData();
    const card = await getCard(store, String(form.get("code") || ""));
    if (!card) return loginPage("wrong");
    if (!usable(card)) return loginPage(status(card));
    return new Response(null, { status: 303, headers: { location: "/", "set-cookie": cookie(CARD_COOKIE, card.code) } });
  }

  if (path === "/__logout") {
    return new Response(null, { status: 303, headers: { location: "/", "set-cookie": cookie(CARD_COOKIE, "", 0) } });
  }

  const who = await visitor(store, request);
  const download = path === "/install.ps1" || path.startsWith("/download/");
  if (!who.admin && !who.card && !(download && url.searchParams.get("k") === DOWNLOAD_KEY)) {
    const stale = await getCard(store, readCookie(request, CARD_COOKIE));
    return loginPage(stale ? status(stale) : "");
  }

  const response = await next();
  if (!INJECT.has(path)) return response;
  const body = (await response.text()).replaceAll(KEY_PLACEHOLDER, DOWNLOAD_KEY);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(body, { status: response.status, headers });
}
