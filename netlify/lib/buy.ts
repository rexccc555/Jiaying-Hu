import { type User, planActive } from "./accounts.ts";
import { FOOTER, HEADER, SCRIPT, page, tr } from "./landing.ts";
import type { StripeSettings } from "./pay.ts";

const PRICE_SYMBOL: Record<string, string> = { nzd: "NZ$", aud: "A$", usd: "US$", cny: "¥", eur: "€", gbp: "£" };
const PLAN_LABEL: Record<string, [string, string]> = {
  monthly: ["连续包月", "Monthly"],
  yearly: ["连续包年", "Yearly"],
  month: ["单月会员", "One month"],
};

const STYLE = `<style>
  .status { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 18px; }
  .status > span { font-size: 13px; padding: 6px 12px; border-radius: 999px; background: #f6f1ea; color: var(--muted); }
  .status b { color: var(--ink); }
  .status .vip { background: linear-gradient(135deg, #fff1ea, #fff7df); color: #b5512f; }
  h3 { font-size: 15px; margin: 4px 0 10px; }
  .pack small { font-size: 12px; color: #99a3b1; margin-top: 2px; }
  .pack em i { font-style: normal; font-size: 13px; font-weight: 600; color: var(--muted); }
  .credit-box { border: 1px solid var(--line); border-radius: 16px; padding: 16px; }
  .quick { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .quick button { border: 1px solid var(--line); background: #fff; border-radius: 10px; padding: 7px 12px; font: inherit; font-size: 13px; cursor: pointer; }
  .quick button.on { border-color: var(--coral); color: var(--coral); background: #fff4ef; font-weight: 700; }
  .calc { display: flex; align-items: center; gap: 10px; }
  .calc input { margin: 0; flex: 1; font-size: 17px; font-weight: 700; }
  .price { text-align: right; min-width: 120px; }
  .price b { display: block; font-size: 22px; color: var(--coral); }
  .price s { font-size: 12px; color: #b8c0cc; }
  .price > span { font-size: 12px; color: #1e8e5a; font-weight: 700; }
  .rule { font-size: 12.5px; color: var(--muted); line-height: 1.7; margin: 10px 0 12px; }
  .manage { width: 100%; padding: 11px; border-radius: 13px; border: 1px solid var(--line); background: #fff; font: inherit; font-weight: 700; cursor: pointer; color: var(--ink); }
</style>`;

export function buyPage(user: User, locked: boolean, s: StripeSettings | null): Response {
  const safe = user.email.replace(/[<>&"]/g, "");
  const member = planActive(user);
  const day = (locale: string) => new Date(user.planUntil || 0).toLocaleDateString(locale, { timeZone: "Pacific/Auckland" });
  const p = s?.pricing;
  const sym = s ? PRICE_SYMBOL[s.currency] || `${s.currency.toUpperCase()} ` : "";
  const mins = Math.floor(user.credits / 60);
  const off = p ? Math.round(p.discount * 100) / 10 : 0;
  const offEn = p ? Math.round((1 - p.discount) * 100) : 0;

  const top = locked
    ? `<div class="gift"><i>☕</i><div><b>${tr("免费试用已经用完啦", "Your free trial is used up")}</b><br/>${tr(
        "希望那条成片让你多休息了一会儿。开通会员或充值 credits 就能继续。",
        "Hope that film bought you some rest. Get a membership or top up credits to keep going.",
      )}</div></div>`
    : `<div class="gift"><i>🌴</i><div><b>${tr("会员与充值", "Membership & top up")}</b><br/>${tr(
        "会员期间无限制使用；不想订阅也可以买 credits，按上传视频的时长扣。",
        "Unlimited while you're a member, or pay as you go with credits, charged by the length of the videos you upload.",
      )}</div></div>`;

  const plan = PLAN_LABEL[user.plan || "month"];
  const status = `<div class="status">
    <span>${tr("账号", "Account")} <b>${safe}</b></span>
    ${
      member
        ? `<span class="vip">👑 ${tr(plan[0], plan[1])} · ${tr(`有效至 <b>${day("zh-CN")}</b>`, `until <b>${day("en-NZ")}</b>`)}${
            user.subId ? ` · ${tr("自动续费中", "auto-renewing")}` : ""
          }</span>`
        : ""
    }
    <span>${tr(
      `余额 <b>${user.credits.toLocaleString()}</b> credits（约 ${mins} 分钟视频）`,
      `Balance <b>${user.credits.toLocaleString()}</b> credits (about ${mins} min of video)`,
    )}</span>
  </div>`;

  const plans = p
    ? `<h3>${tr("会员 · 无限制使用", "Membership · unlimited")}</h3>
    <div class="packs">
      <button type="button" class="pack" data-kind="monthly" ${user.subId ? "disabled" : ""}><span class="hot">${tr("推荐", "Popular")}</span>
        <b>${tr("连续包月", "Monthly")}</b><span>${tr("每月自动续费，可随时取消", "Renews monthly, cancel anytime")}</span><em>${sym}${p.monthly}<i> ${tr("/月", "/mo")}</i></em></button>
      <button type="button" class="pack" data-kind="month">
        <b>${tr("单月", "One month")}</b><span>${tr("一个月，不自动续费", "One month, no auto-renew")}</span><em>${sym}${p.month}<i> ${tr("/月", "/mo")}</i></em></button>
      <button type="button" class="pack" data-kind="yearly" ${user.subId ? "disabled" : ""}><span class="hot">${tr("最划算", "Best value")}</span>
        <b>${tr("连续包年", "Yearly")}</b><span>${tr("每年自动续费", "Renews yearly")}</span><em>${sym}${p.yearly}<i> ${tr("/年", "/yr")}</i></em><small>${tr(
          `约 ${sym}${(p.yearly / 12).toFixed(2)} /月`,
          `about ${sym}${(p.yearly / 12).toFixed(2)} /mo`,
        )}</small></button>
    </div>
    ${user.subId ? `<p class="fine">${tr("你已在自动续费中。想取消或换卡，点下面的「管理订阅」。", "You're on auto-renew. To cancel or change card, use “Manage subscription” below.")}</p>` : ""}
    <p class="msg" id="pay-msg"></p>

    <h3 style="margin-top:18px">${tr("按上传视频的时长买 credits", "Buy credits by uploaded video length")}</h3>
    <div class="credit-box">
      <div class="quick">${[500, 1000, 2000, 5000, 10000]
        .map((n) => `<button type="button" data-n="${n}"${n === 2000 ? ' class="on"' : ""}>${n.toLocaleString()}</button>`)
        .join("")}</div>
      <div class="calc">
        <input id="credits" type="number" min="${p.minCredits}" step="100" value="${Math.max(2000, p.minCredits)}" />
        <div class="price"><b id="price"></b><s id="orig"></s> <span id="off"></span></div>
      </div>
      <p class="rule">${tr(
        `按你<b>上传视频的时长</b>扣：<b>1 秒 = 1 credit，1 分钟 = 60 credits</b>（1 credit = ${sym}${p.creditPrice}）。比如上传一段 2 分钟的视频，就扣 120 credits。AI 制作花多久、页面开多久都不扣。每做一条扣一次，制作失败重试不扣。`,
        `Charged by the <b>length of the video you upload</b>: <b>1 second = 1 credit, 1 minute = 60 credits</b> (1 credit = ${sym}${p.creditPrice}). A 2-minute video uses 120 credits. How long the AI takes, or how long the page is open, is never charged. Each film is charged once; retrying a failed one is free.`,
      )}<span id="mins"></span><br/>${tr(
        `${p.minCredits} 起充，充 ${p.discountFrom.toLocaleString()} 及以上打 ${off} 折。`,
        `Minimum ${p.minCredits}. ${offEn}% off from ${p.discountFrom.toLocaleString()} credits.`,
      )}</p>
      <button type="button" class="go" id="buy-credits">${tr("购买 credits", "Buy credits")}</button>
      <p class="msg" id="credit-msg"></p>
    </div>
    ${user.stripeCustomer ? `<button type="button" class="manage" id="manage" style="margin-top:12px">${tr("管理订阅 / 发票", "Manage subscription / invoices")}</button>` : ""}
    <p class="fine" style="margin-top:10px">${tr(
      "由 Stripe 安全收款，支持银行卡、Apple Pay、Google Pay，付款后自动到账。",
      "Secure payment by Stripe: cards, Apple Pay, Google Pay. Applied to your account right after paying.",
    )}</p>
    <div class="or"><span>${tr("或者用卡号充值", "or use a card code")}</span></div>`
    : "";

  const body = `${HEADER}
${STYLE}
<main style="grid-template-columns:minmax(0,1fr);max-width:620px">
  <aside class="panel" style="position:static">
    ${top}
    ${status}
    <div id="paid" class="gift" hidden style="border-color:#9fd9b9;background:#effaf3"><i>✅</i><div><b>${tr("付款成功，已经到账", "Payment received, all set")}</b><br/>${tr("正在带你回去…", "Taking you back…")}</div></div>
    ${plans}
    <form class="on" data-api="/api/auth/redeem">
      <label>${tr("卡号", "Card code")}</label>
      <input class="card-input" name="code" autocomplete="off" spellcheck="false" placeholder="MP-XXXX-XXXX" required />
      <button class="go" type="submit">${tr("用卡号充值", "Redeem card")}</button>
      <p class="msg"></p>
      <div class="links">${locked ? "<span></span>" : `<a href="/">${tr("返回", "Back")}</a>`}<a href="/__logout">${tr("退出登录", "Sign out")}</a></div>
    </form>
  </aside>
</main>
${FOOTER}
${SCRIPT}
<script>
const P = ${JSON.stringify(p || null)};
const SYM = ${JSON.stringify(sym)};
async function checkout(data, msg, buttons) {
  buttons.forEach((b) => (b.disabled = true));
  msg.className = "msg ok"; msg.textContent = L("正在打开付款页面…", "Opening the payment page…");
  const res = await fetch("/api/pay/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  const out = await res.json().catch(() => ({}));
  if (out.url) { location.href = out.url; return; }
  buttons.forEach((b) => (b.disabled = false));
  msg.className = "msg";
  msg.textContent = out.error === "credits" ? L("最少 " + P.minCredits + " credits", "Minimum " + P.minCredits + " credits")
    : out.error === "subscribed" ? L("你已经在自动续费中了", "You're already on auto-renew")
    : L("暂时无法付款，请稍后再试或联系我们", "Payment isn't available right now. Please try later or contact us.");
}
document.querySelectorAll("[data-kind]").forEach((btn) => btn.addEventListener("click", () =>
  checkout({ kind: btn.dataset.kind }, document.getElementById("pay-msg"), [...document.querySelectorAll("[data-kind]")])));
const input = document.getElementById("credits");
function calc() {
  if (!input) return;
  const n = Math.round(Number(input.value) || 0);
  const ok = n >= P.minCredits;
  const rate = n >= P.discountFrom ? P.discount : 1;
  const full = n * P.creditPrice;
  document.getElementById("price").textContent = ok ? SYM + (Math.round(full * rate * 100) / 100).toFixed(2) : L("最少 ", "Min ") + P.minCredits;
  document.getElementById("orig").textContent = ok && rate < 1 ? SYM + full.toFixed(2) : "";
  document.getElementById("off").textContent = ok && rate < 1 ? L(Math.round(rate * 100) / 10 + " 折", Math.round((1 - rate) * 100) + "% off") : "";
  document.getElementById("mins").textContent = ok ? L(" " + n.toLocaleString() + " credits 约可做 " + Math.floor(n / 60) + " 分钟视频。", " " + n.toLocaleString() + " credits ≈ " + Math.floor(n / 60) + " min of video.") : "";
  document.getElementById("buy-credits").disabled = !ok;
  document.querySelectorAll("[data-n]").forEach((b) => b.classList.toggle("on", Number(b.dataset.n) === n));
}
if (input) {
  input.addEventListener("input", calc);
  document.addEventListener("langchange", calc);
  document.querySelectorAll("[data-n]").forEach((b) => b.addEventListener("click", () => { input.value = b.dataset.n; calc(); }));
  document.getElementById("buy-credits").addEventListener("click", () =>
    checkout({ kind: "credits", credits: Math.round(Number(input.value)) }, document.getElementById("credit-msg"), [document.getElementById("buy-credits")]));
  calc();
}
const manage = document.getElementById("manage");
if (manage) manage.addEventListener("click", async () => {
  manage.disabled = true;
  const res = await fetch("/api/pay/portal", { method: "POST" });
  const out = await res.json().catch(() => ({}));
  if (out.url) location.href = out.url;
  else { manage.disabled = false; manage.textContent = L("暂时打不开，请联系我们取消或修改订阅", "Can't open it right now. Contact us to cancel or change."); }
});
const paid = new URLSearchParams(location.search).get("paid");
if (paid) {
  (async () => {
    for (let i = 0; i < 6; i++) {
      const res = await fetch("/api/pay/confirm?session_id=" + encodeURIComponent(paid), { cache: "no-store" });
      if (res.ok) {
        document.getElementById("paid").hidden = false;
        setTimeout(() => (location.href = "/"), 1800);
        return;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    const msg = document.getElementById("pay-msg") || document.querySelector(".msg");
    msg.className = "msg";
    msg.textContent = L("还没确认到付款，稍等一会儿刷新页面；如果已扣款请联系我们", "Payment not confirmed yet. Refresh in a moment; contact us if you were charged.");
  })();
}
</script>`;
  return page(
    locked ? "takeadayoff · 继续使用" : "takeadayoff · 会员与充值",
    body,
    locked ? 403 : 200,
    locked ? "takeadayoff · Keep going" : "takeadayoff · Membership & top up",
  );
}
