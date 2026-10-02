const CARD_MESSAGES: Record<string, string> = {
  wrong: "卡号不对，再检查一下",
  used_up: "这张卡的时间已用完，请联系我们续时",
  disabled: "这张卡已停用，请联系我们",
  redeemed: "这张卡已经充值到账号里了，请用邮箱登录",
};

const STYLE = `
  * { box-sizing: border-box; }
  :root { --ink: #15243b; --muted: #66758a; --line: #ece4d8; --coral: #ff7a59; --sun: #ffb347; --bg: #fbf7f1; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font-family: "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", sans-serif; }
  a { color: inherit; }
  .blob { position: fixed; border-radius: 50%; filter: blur(80px); opacity: .5; z-index: -1; pointer-events: none; }
  .b1 { width: 620px; height: 620px; background: #ffd9c7; top: -220px; right: -180px; }
  .b2 { width: 520px; height: 520px; background: #d9e8ff; bottom: -240px; left: -200px; }
  .b3 { width: 360px; height: 360px; background: #fff0c2; top: 40%; left: 38%; opacity: .35; }
  header { max-width: 1160px; margin: 0 auto; padding: 22px 24px; display: flex; align-items: center; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 19px; letter-spacing: -.01em; text-decoration: none; }
  .logo i { width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; font-style: normal; font-size: 17px;
    background: linear-gradient(135deg, var(--coral), var(--sun)); box-shadow: 0 8px 20px -10px var(--coral); }
  .logo span { color: var(--coral); }
  .pill { font-size: 13px; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px; background: rgba(255,255,255,.7); }
  main { max-width: 1160px; margin: 0 auto; padding: 18px 24px 40px; display: grid; grid-template-columns: 1.15fr .85fr; gap: 48px; align-items: start; }
  .kicker { display: inline-flex; gap: 8px; align-items: center; font-size: 13px; font-weight: 700; color: var(--coral);
    background: #fff1ea; border-radius: 999px; padding: 6px 14px; margin: 26px 0 18px; }
  h1 { font-size: clamp(2.1rem, 4.6vw, 3.5rem); line-height: 1.12; margin: 0 0 18px; letter-spacing: -.02em; }
  h1 em { font-style: normal; background: linear-gradient(120deg, var(--coral), var(--sun)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .lead { font-size: 17px; line-height: 1.75; color: var(--muted); margin: 0 0 8px; max-width: 34em; }
  .en { font-size: 14px; color: #99a3b1; margin: 0 0 28px; letter-spacing: .01em; }
  .feats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 30px; }
  .feat { background: rgba(255,255,255,.8); border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; }
  .feat b { display: block; font-size: 15px; margin: 6px 0 4px; }
  .feat p { margin: 0; font-size: 13px; line-height: 1.6; color: var(--muted); }
  .feat .ic { font-size: 22px; }
  .steps { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; font-size: 14px; color: var(--muted); }
  .steps span { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; }
  .steps b { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; color: #fff; background: var(--ink); }
  .steps .arrow { border: 0; background: none; padding: 0; color: #c9b9a6; }
  .panel { position: sticky; top: 24px; background: #fff; border: 1px solid var(--line); border-radius: 26px; padding: 26px 24px 22px;
    box-shadow: 0 24px 60px -28px rgba(21,36,59,.3); margin-top: 26px; }
  .gift { display: flex; gap: 12px; align-items: center; background: linear-gradient(135deg, #fff4ec, #fff9e8); border: 1px dashed #ffc7ad;
    border-radius: 16px; padding: 12px 14px; margin-bottom: 18px; font-size: 14px; line-height: 1.5; }
  .gift i { font-style: normal; font-size: 24px; }
  .tabs { display: grid; grid-template-columns: 1fr 1fr; background: #f6f1ea; border-radius: 14px; padding: 4px; margin-bottom: 18px; }
  .tabs button { border: 0; background: none; padding: 10px; border-radius: 11px; font: inherit; font-weight: 700; color: var(--muted); cursor: pointer; }
  .tabs button.on { background: #fff; color: var(--ink); box-shadow: 0 4px 12px -6px rgba(21,36,59,.25); }
  form { display: none; }
  form.on { display: block; }
  label { display: block; font-size: 13px; color: var(--muted); margin: 0 0 6px; }
  input { width: 100%; padding: 12px 14px; border-radius: 13px; border: 1px solid var(--line); font: inherit; font-size: 15px; outline: none; margin-bottom: 12px; background: #fff; }
  input:focus { border-color: var(--coral); box-shadow: 0 0 0 4px rgba(255,122,89,.14); }
  .row { display: flex; gap: 8px; }
  .row input { flex: 1; }
  .ghost { flex: none; height: 46px; padding: 0 14px; border-radius: 13px; border: 1px solid var(--line); background: #fff; font: inherit; font-size: 14px;
    font-weight: 700; color: var(--coral); cursor: pointer; white-space: nowrap; }
  .ghost:disabled { color: #b8c0cc; cursor: default; }
  .go { width: 100%; margin-top: 4px; padding: 13px; border: 0; border-radius: 14px; cursor: pointer; font: inherit; font-size: 16px; font-weight: 800;
    color: #fff; background: linear-gradient(135deg, var(--coral), #ff9a5a); box-shadow: 0 12px 26px -14px var(--coral); }
  .go:disabled { opacity: .6; cursor: default; }
  .msg { min-height: 1.3em; font-size: 13px; margin: 10px 0 0; color: #c0392b; text-align: center; }
  .msg.ok { color: #1e8e5a; }
  .links { display: flex; justify-content: space-between; margin-top: 14px; font-size: 13px; color: var(--muted); }
  .links a { cursor: pointer; text-decoration: none; }
  .links a:hover { color: var(--coral); }
  .card-input { text-align: center; letter-spacing: .1em; text-transform: uppercase; font-size: 17px; }
  .packs { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  .pack { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; cursor: pointer;
    padding: 16px; border-radius: 16px; border: 1px solid var(--line); background: #fff; font: inherit; color: var(--ink); transition: .15s; }
  .pack:hover { border-color: var(--coral); box-shadow: 0 10px 24px -16px var(--coral); transform: translateY(-2px); }
  .pack:disabled { opacity: .6; cursor: default; transform: none; }
  .pack b { font-size: 15px; }
  .pack span { font-size: 13px; color: var(--muted); }
  .pack em { font-style: normal; font-size: 22px; font-weight: 800; color: var(--coral); margin-top: 6px; }
  .pack .hot { position: absolute; top: -9px; right: 10px; font-size: 11px; font-weight: 700; color: #fff; background: var(--coral); padding: 2px 8px; border-radius: 999px; }
  .fine { font-size: 12px; color: #99a3b1; text-align: center; margin: 4px 0 0; }
  .or { display: flex; align-items: center; gap: 10px; color: #b8c0cc; font-size: 12px; margin: 18px 0 14px; }
  .or::before, .or::after { content: ""; flex: 1; height: 1px; background: var(--line); }
  [hidden] { display: none !important; }
  footer { max-width: 1160px; margin: 0 auto; padding: 20px 24px 36px; color: #99a3b1; font-size: 13px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  @media (max-width: 900px) {
    main { grid-template-columns: minmax(0, 1fr); gap: 10px; padding: 8px 16px 30px; }
    header { padding: 18px 16px; }
    .pill { display: none; }
    .panel { position: static; }
    .feats { grid-template-columns: 1fr; }
  }
`;

export const page = (title: string, body: string, status = 401) =>
  new Response(
    `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="拍完就去休息吧，剪辑交给 takeadayoff。拖进口播视频，自动抠像、字幕、动画和音效，原话一字不改。" />
<style>${STYLE}</style>
</head>
<body>
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
${body}
</body>
</html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

export const HEADER = `<header>
  <a class="logo" href="/"><i>🌴</i><b>takeaday<span>off</span></b></a>
  <div class="pill">Windows · Mac</div>
</header>`;

export const FOOTER = `<footer>
  <div>takeadayoff · 把时间还给你</div>
  <div>© ${new Date().getFullYear()} takeadayoff.co.nz</div>
</footer>`;

export const SCRIPT = `<script>
const $ = (s) => document.querySelector(s);
const ERR = {
  email: "邮箱格式不对", exists: "这个邮箱已经注册过了，直接登录就好", no_account: "这个邮箱还没注册",
  mail_off: "邮件服务还没开通，请稍后再试或联系我们", mail_failed: "验证码没发出去，请检查邮箱后重试",
  too_many: "操作太频繁了，请过一会儿再试", wait: "验证码刚发过，请稍等再发", password: "密码至少 6 位",
  code: "验证码不对或已过期", login: "邮箱或密码不对", disabled: "这个账号已停用，请联系我们",
  card: "卡号不对", card_empty: "这张卡没有剩余时间了", card_redeemed: "这张卡已经被使用过了",
};
const say = (form, text, ok) => { const m = form.querySelector(".msg"); m.textContent = text || ""; m.className = "msg" + (ok ? " ok" : ""); };
function show(name) {
  document.querySelectorAll("form[data-tab]").forEach((f) => f.classList.toggle("on", f.dataset.tab === name));
  document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.go === name));
}
document.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); show(el.dataset.go); }));
async function post(url, data) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, body };
}
document.querySelectorAll("[data-send]").forEach((btn) => btn.addEventListener("click", async () => {
  const form = btn.closest("form");
  const email = form.email.value.trim();
  if (!email) return say(form, ERR.email);
  btn.disabled = true;
  say(form, "正在发送…", true);
  const { ok, body } = await post("/api/auth/send-code", { email, purpose: btn.dataset.send });
  if (!ok) {
    say(form, (ERR[body.error] || "发送失败") + (body.waitSec ? "（" + body.waitSec + " 秒）" : ""));
    btn.disabled = false;
    return;
  }
  say(form, "验证码已发到邮箱，10 分钟内有效（没收到看看垃圾箱）", true);
  let left = 60;
  const tick = () => { btn.textContent = left + " 秒后重发"; if (left-- <= 0) { btn.disabled = false; btn.textContent = "重新发送"; } else setTimeout(tick, 1000); };
  tick();
}));
document.querySelectorAll("form[data-api]").forEach((form) => form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const go = form.querySelector(".go");
  go.disabled = true;
  say(form, "");
  const data = Object.fromEntries(new FormData(form));
  const { ok, body } = await post(form.dataset.api, data);
  go.disabled = false;
  if (!ok) return say(form, ERR[body.error] || "出了点问题，请重试");
  say(form, "成功，正在进入…", true);
  location.href = "/";
}));
</script>`;

export function landingPage(cardReason = "", tab = "register"): Response {
  const body = `${HEADER}
<main>
  <section>
    <div class="kicker">✨ 口播视频 · 自动剪辑</div>
    <h1>拍完就去休息吧，<br/>剪辑交给 <em>takeadayoff</em>。</h1>
    <p class="lead">拖进一段口播视频，自动抠像、配字幕、做动画和音效。你说的每一句话，原样保留。去喝杯咖啡，回来就是能发的成片。</p>
    <p class="en">Shoot it. Take a day off. We'll cut it.</p>
    <div class="feats">
      <div class="feat"><span class="ic">🪄</span><b>不用绿幕</b><p>普通房间随手拍，人物自动抠出来，背景想换就换。</p></div>
      <div class="feat"><span class="ic">🎞️</span><b>画面跟着你的话走</b><p>讲到哪里，动画、字幕和音效就跟到哪里。</p></div>
      <div class="feat"><span class="ic">🔒</span><b>原话一字不改</b><p>只剪辑、不改词。成片发布前，最后一眼永远是你看。</p></div>
      <div class="feat"><span class="ic">💻</span><b>在你自己电脑上做</b><p>视频不上传到别人服务器，用你自己的 AI 账号处理。</p></div>
    </div>
    <div class="steps">
      <span><b>1</b>注册领一次免费试用</span><span class="arrow">→</span>
      <span><b>2</b>一键安装</span><span class="arrow">→</span>
      <span><b>3</b>拖进视频，去休息</span>
    </div>
  </section>

  <aside class="panel">
    <div class="gift"><i>🎁</i><div><b>新用户注册即送 1 次免费试用</b><br/>完整做一条成片，满意再说。</div></div>
    <div class="tabs">
      <button data-go="register" class="${tab === "register" ? "on" : ""}">注册</button>
      <button data-go="login" class="${tab === "login" ? "on" : ""}">登录</button>
    </div>

    <form data-tab="register" data-api="/api/auth/register" class="${tab === "register" ? "on" : ""}">
      <label>邮箱</label>
      <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
      <label>验证码</label>
      <div class="row"><input name="code" inputmode="numeric" maxlength="6" placeholder="6 位数字" required /><button type="button" class="ghost" data-send="register">发送验证码</button></div>
      <label>设置密码</label>
      <input name="password" type="password" autocomplete="new-password" placeholder="至少 6 位" minlength="6" required />
      <button class="go" type="submit">注册并领取免费试用</button>
      <p class="msg"></p>
      <div class="links"><a data-go="login">已有账号？登录</a><a data-go="card">我有卡号</a></div>
    </form>

    <form data-tab="login" data-api="/api/auth/login" class="${tab === "login" ? "on" : ""}">
      <label>邮箱</label>
      <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
      <label>密码</label>
      <input name="password" type="password" autocomplete="current-password" required />
      <button class="go" type="submit">登录</button>
      <p class="msg"></p>
      <div class="links"><a data-go="reset">忘记密码？</a><a data-go="card">我有卡号</a></div>
    </form>

    <form data-tab="reset" data-api="/api/auth/reset">
      <label>注册时用的邮箱</label>
      <input name="email" type="email" autocomplete="email" required />
      <label>验证码</label>
      <div class="row"><input name="code" inputmode="numeric" maxlength="6" placeholder="6 位数字" required /><button type="button" class="ghost" data-send="reset">发送验证码</button></div>
      <label>新密码</label>
      <input name="password" type="password" autocomplete="new-password" placeholder="至少 6 位" minlength="6" required />
      <button class="go" type="submit">重设密码并登录</button>
      <p class="msg"></p>
      <div class="links"><a data-go="login">返回登录</a><a data-go="register">注册新账号</a></div>
    </form>

    <form data-tab="card" class="${tab === "card" ? "on" : ""}" method="post" action="/__gate">
      <label>卡号</label>
      <input class="card-input" name="code" autocomplete="off" spellcheck="false" placeholder="MP-XXXX-XXXX" />
      <button class="go" type="submit">用卡号进入</button>
      <p class="msg">${CARD_MESSAGES[cardReason] || ""}</p>
      <div class="links"><a data-go="register">注册账号</a><a data-go="login">邮箱登录</a></div>
    </form>
  </aside>
</main>
${FOOTER}
${SCRIPT}`;
  return page("takeadayoff · 拍完就去休息，剪辑交给我们", body);
}
