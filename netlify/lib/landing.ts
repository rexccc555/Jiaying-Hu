const attr = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Bilingual text: Chinese by default, swapped to English by the language switch. */
export const tr = (zh: string, en: string) => `<span data-en="${attr(en)}">${zh}</span>`;
/** Bilingual placeholder attributes for inputs. */
export const ph = (zh: string, en: string) => `placeholder="${attr(zh)}" data-en-ph="${attr(en)}"`;

const CARD_MESSAGES: Record<string, string> = {
  wrong: tr("卡号不对，再检查一下", "Card not recognised. Please check it."),
  used_up: tr("这张卡的时间已用完，请联系我们续时", "This card has no time left. Contact us to add more."),
  disabled: tr("这张卡已停用，请联系我们", "This card has been switched off. Please contact us."),
  redeemed: tr("这张卡已经充值到账号里了，请用邮箱登录", "This card was added to an account. Please sign in with email."),
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
  .top-right { display: flex; align-items: center; gap: 10px; }
  .lang { display: flex; gap: 4px; background: #fff; padding: 4px; border-radius: 999px; box-shadow: 0 2px 10px -6px rgba(0,0,0,.3); }
  .lang button { border: 0; background: transparent; padding: 6px 12px; border-radius: 999px; cursor: pointer; font: inherit; font-size: 13px; color: var(--muted); }
  .lang button.on { background: #1f3d63; color: #fff; }
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
  .steps > span { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 8px 14px; }
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
  .pack > span { font-size: 13px; color: var(--muted); }
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

export const page = (title: string, body: string, status = 401, titleEn = "takeadayoff · Shoot it. Take a day off. We'll cut it.") =>
  new Response(
    `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title data-zh="${attr(title)}" data-title-en="${attr(titleEn)}">${title}</title>
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
  <div class="top-right">
    <div class="pill">Windows · Mac</div>
    <div class="lang"><button type="button" data-lang="en">EN</button><button type="button" data-lang="zh" class="on">中文</button></div>
  </div>
</header>`;

export const FOOTER = `<footer>
  <div>takeadayoff · ${tr("把时间还给你", "giving you your time back")}</div>
  <div>© ${new Date().getFullYear()} takeadayoff.co.nz</div>
</footer>`;

export const SCRIPT = `<script>
const $ = (s) => document.querySelector(s);
const LANG = { cur: localStorage.getItem("mpva.lang") || ((navigator.language || "").startsWith("zh") ? "zh" : "en") };
const L = (zh, en) => (LANG.cur === "en" ? en : zh);
function setLang(lang) {
  LANG.cur = lang === "en" ? "en" : "zh";
  localStorage.setItem("mpva.lang", LANG.cur);
  const en = LANG.cur === "en";
  document.documentElement.lang = en ? "en" : "zh-CN";
  document.querySelectorAll("[data-en]").forEach((el) => {
    if (el.dataset.zh === undefined) el.dataset.zh = el.innerHTML;
    el.innerHTML = en ? el.dataset.en : el.dataset.zh;
  });
  document.querySelectorAll("[data-en-ph]").forEach((el) => {
    if (el.dataset.zhPh === undefined) el.dataset.zhPh = el.placeholder;
    el.placeholder = en ? el.dataset.enPh : el.dataset.zhPh;
  });
  const title = document.querySelector("title");
  document.title = en ? title.dataset.titleEn : title.dataset.zh;
  document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("on", b.dataset.lang === LANG.cur));
  document.dispatchEvent(new Event("langchange"));
}
document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
const ERR = {
  email: ["邮箱格式不对", "That email doesn't look right"],
  exists: ["这个邮箱已经注册过了，直接登录就好", "This email is already registered. Just sign in."],
  no_account: ["这个邮箱还没注册", "No account with this email yet"],
  mail_off: ["邮件服务还没开通，请稍后再试或联系我们", "Email isn't available yet. Try later or contact us."],
  mail_failed: ["验证码没发出去，请检查邮箱后重试", "Couldn't send the code. Check the email and try again."],
  too_many: ["操作太频繁了，请过一会儿再试", "Too many tries. Please wait a little."],
  wait: ["验证码刚发过，请稍等再发", "A code was just sent. Please wait before resending."],
  password: ["密码至少 6 位", "Password needs at least 6 characters"],
  code: ["验证码不对或已过期", "Wrong or expired code"],
  login: ["邮箱或密码不对", "Wrong email or password"],
  disabled: ["这个账号已停用，请联系我们", "This account is switched off. Please contact us."],
  card: ["卡号不对", "Card not recognised"],
  card_empty: ["这张卡没有剩余时间了", "This card has no time left"],
  card_redeemed: ["这张卡已经被使用过了", "This card has already been used"],
};
const errText = (key, zh, en) => (ERR[key] ? L(ERR[key][0], ERR[key][1]) : L(zh, en));
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
  if (!email) return say(form, errText("email"));
  btn.disabled = true;
  say(form, L("正在发送…", "Sending…"), true);
  const { ok, body } = await post("/api/auth/send-code", { email, purpose: btn.dataset.send });
  if (!ok) {
    say(form, errText(body.error, "发送失败", "Couldn't send") + (body.waitSec ? " (" + body.waitSec + "s)" : ""));
    btn.disabled = false;
    return;
  }
  say(form, L("验证码已发到邮箱，10 分钟内有效（没收到看看垃圾箱）", "Code sent. It's valid for 10 minutes (check spam if you don't see it)."), true);
  let left = 60;
  const tick = () => {
    btn.textContent = L(left + " 秒后重发", "Resend in " + left + "s");
    if (left-- <= 0) { btn.disabled = false; btn.textContent = L("重新发送", "Resend"); } else setTimeout(tick, 1000);
  };
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
  if (!ok) return say(form, errText(body.error, "出了点问题，请重试", "Something went wrong. Please try again."));
  say(form, L("成功，正在进入…", "Done, taking you in…"), true);
  location.href = "/";
}));
setLang(LANG.cur);
</script>`;

export function landingPage(cardReason = "", tab = "register"): Response {
  const body = `${HEADER}
<main>
  <section>
    <div class="kicker">✨ ${tr("口播视频 · 自动剪辑", "Talking-head videos · edited for you")}</div>
    <h1>${tr("拍完就去休息吧，<br/>剪辑交给", "Shoot it.<br/>Take a day off.<br/>We'll cut it with")} <em>takeadayoff</em>${tr("。", ".")}</h1>
    <p class="lead">${tr(
      "拖进一段口播视频，自动抠像、配字幕、做动画和音效。你说的每一句话，原样保留。去喝杯咖啡，回来就是能发的成片。",
      "Drop in a talking-head video: cut-out, captions, animation and sound are done for you, and every word stays exactly as spoken. Grab a coffee and come back to a film you can post.",
    )}</p>
    <p class="en">${tr("Shoot it. Take a day off. We'll cut it.", "拍完就去休息吧，剪辑交给我们。")}</p>
    <div class="feats">
      <div class="feat"><span class="ic">🪄</span><b>${tr("不用绿幕", "No green screen")}</b><p>${tr("普通房间随手拍，人物自动抠出来，背景想换就换。", "Film in any room. You're cut out cleanly and the background is yours to change.")}</p></div>
      <div class="feat"><span class="ic">🎞️</span><b>${tr("画面跟着你的话走", "Visuals follow your words")}</b><p>${tr("讲到哪里，动画、字幕和音效就跟到哪里。", "Animation, captions and sound land right when you say it.")}</p></div>
      <div class="feat"><span class="ic">🔒</span><b>${tr("原话一字不改", "Your words, untouched")}</b><p>${tr("只剪辑、不改词。成片发布前，最后一眼永远是你看。", "We edit, never rewrite. You always get the final look before posting.")}</p></div>
      <div class="feat"><span class="ic">💻</span><b>${tr("在你自己电脑上做", "Made on your own computer")}</b><p>${tr("视频不上传到别人服务器，用你自己的 AI 账号处理。", "Your video stays on your machine, processed with your own AI account.")}</p></div>
    </div>
    <div class="steps">
      <span><b>1</b>${tr("注册领一次免费试用", "Sign up for a free trial")}</span><span class="arrow">→</span>
      <span><b>2</b>${tr("一键安装", "One-click install")}</span><span class="arrow">→</span>
      <span><b>3</b>${tr("拖进视频，去休息", "Drop a video, go rest")}</span>
    </div>
  </section>

  <aside class="panel">
    <div class="gift"><i>🎁</i><div><b>${tr("新用户注册即送 1 次免费试用", "Sign up and get 1 free film")}</b><br/>${tr("完整做一条成片，满意再说。", "Make a full film first, decide later.")}</div></div>
    <div class="tabs">
      <button data-go="register" class="${tab === "register" ? "on" : ""}">${tr("注册", "Sign up")}</button>
      <button data-go="login" class="${tab === "login" ? "on" : ""}">${tr("登录", "Sign in")}</button>
    </div>

    <form data-tab="register" data-api="/api/auth/register" class="${tab === "register" ? "on" : ""}">
      <label>${tr("邮箱", "Email")}</label>
      <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
      <label>${tr("验证码", "Verification code")}</label>
      <div class="row"><input name="code" inputmode="numeric" maxlength="6" ${ph("6 位数字", "6 digits")} required /><button type="button" class="ghost" data-send="register">${tr("发送验证码", "Send code")}</button></div>
      <label>${tr("设置密码", "Choose a password")}</label>
      <input name="password" type="password" autocomplete="new-password" ${ph("至少 6 位", "At least 6 characters")} minlength="6" required />
      <button class="go" type="submit">${tr("注册并领取免费试用", "Sign up & get the free trial")}</button>
      <p class="msg"></p>
      <div class="links"><a data-go="login">${tr("已有账号？登录", "Have an account? Sign in")}</a><a data-go="card">${tr("我有卡号", "I have a card")}</a></div>
    </form>

    <form data-tab="login" data-api="/api/auth/login" class="${tab === "login" ? "on" : ""}">
      <label>${tr("邮箱", "Email")}</label>
      <input name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
      <label>${tr("密码", "Password")}</label>
      <input name="password" type="password" autocomplete="current-password" required />
      <button class="go" type="submit">${tr("登录", "Sign in")}</button>
      <p class="msg"></p>
      <div class="links"><a data-go="reset">${tr("忘记密码？", "Forgot password?")}</a><a data-go="card">${tr("我有卡号", "I have a card")}</a></div>
    </form>

    <form data-tab="reset" data-api="/api/auth/reset">
      <label>${tr("注册时用的邮箱", "The email you signed up with")}</label>
      <input name="email" type="email" autocomplete="email" required />
      <label>${tr("验证码", "Verification code")}</label>
      <div class="row"><input name="code" inputmode="numeric" maxlength="6" ${ph("6 位数字", "6 digits")} required /><button type="button" class="ghost" data-send="reset">${tr("发送验证码", "Send code")}</button></div>
      <label>${tr("新密码", "New password")}</label>
      <input name="password" type="password" autocomplete="new-password" ${ph("至少 6 位", "At least 6 characters")} minlength="6" required />
      <button class="go" type="submit">${tr("重设密码并登录", "Reset password & sign in")}</button>
      <p class="msg"></p>
      <div class="links"><a data-go="login">${tr("返回登录", "Back to sign in")}</a><a data-go="register">${tr("注册新账号", "Create an account")}</a></div>
    </form>

    <form data-tab="card" class="${tab === "card" ? "on" : ""}" method="post" action="/__gate">
      <label>${tr("卡号", "Card code")}</label>
      <input class="card-input" name="code" autocomplete="off" spellcheck="false" placeholder="MP-XXXX-XXXX" />
      <button class="go" type="submit">${tr("用卡号进入", "Enter with card")}</button>
      <p class="msg">${CARD_MESSAGES[cardReason] || ""}</p>
      <div class="links"><a data-go="register">${tr("注册账号", "Sign up")}</a><a data-go="login">${tr("邮箱登录", "Sign in with email")}</a></div>
    </form>
  </aside>
</main>
${FOOTER}
${SCRIPT}`;
  return page("takeadayoff · 拍完就去休息，剪辑交给我们", body);
}
