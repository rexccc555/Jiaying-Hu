import type { Context } from "https://edge.netlify.com";

const COOKIE = "clip_gate";
// SHA-256 of "<password>:mp-video-assistant"; CLIP_PASSWORD on Netlify overrides it.
const DEFAULT_TOKEN = "2abe1a4b8ac31a13ebbaebf99cc6564d5c489d277e96efc71ce7dded4fe325f8";

async function token(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${password}:mp-video-assistant`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(request: Request, name: string): string {
  const raw = request.headers.get("cookie") || "";
  const hit = raw.split(/;\s*/).find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : "";
}

function loginPage(wrong: boolean): Response {
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
  input { width: 100%; padding: 13px 16px; border-radius: 14px; border: 1px solid #ece4d8; font: inherit; font-size: 16px; outline: none; }
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
  <p>内测中，请输入访问密码 · Private beta, enter the password</p>
  <input type="password" name="password" autofocus autocomplete="current-password" placeholder="密码 / Password" />
  <button type="submit">进入 · Enter</button>
  <p class="err">${wrong ? "密码不对，再试一次 · Wrong password" : ""}</p>
</form>
</body>
</html>`;
  return new Response(html, {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

export default async (request: Request, context: Context) => {
  const configured = Netlify.env.get("CLIP_PASSWORD");
  const expected = configured ? await token(configured) : DEFAULT_TOKEN;
  const url = new URL(request.url);

  if (url.pathname === "/__gate" && request.method === "POST") {
    const form = await request.formData();
    if ((await token(String(form.get("password") || ""))) !== expected) return loginPage(true);
    return new Response(null, {
      status: 303,
      headers: {
        location: "/",
        "set-cookie": `${COOKIE}=${expected}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  if (readCookie(request, COOKIE) === expected) return context.next();
  return loginPage(false);
};
