import { type User, planActive } from "./accounts.ts";
import { FOOTER, HEADER, SCRIPT, page } from "./landing.ts";
import type { StripeSettings } from "./pay.ts";

const PRICE_SYMBOL: Record<string, string> = { nzd: "NZ$", aud: "A$", usd: "US$", cny: "¥", eur: "€", gbp: "£" };
const PLAN_LABEL: Record<string, string> = { monthly: "连续包月", yearly: "连续包年", month: "单月会员" };

const STYLE = `<style>
  .status { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 18px; }
  .status span { font-size: 13px; padding: 6px 12px; border-radius: 999px; background: #f6f1ea; color: var(--muted); }
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
  .price span { font-size: 12px; color: #1e8e5a; font-weight: 700; }
  .rule { font-size: 12.5px; color: var(--muted); line-height: 1.7; margin: 10px 0 12px; }
  .manage { width: 100%; padding: 11px; border-radius: 13px; border: 1px solid var(--line); background: #fff; font: inherit; font-weight: 700; cursor: pointer; color: var(--ink); }
</style>`;

export function buyPage(user: User, locked: boolean, s: StripeSettings | null): Response {
  const safe = user.email.replace(/[<>&"]/g, "");
  const now = Date.now();
  const member = planActive(user, now);
  const until = member ? new Date(user.planUntil!).toLocaleDateString("zh-CN", { timeZone: "Pacific/Auckland" }) : "";
  const p = s?.pricing;
  const sym = s ? PRICE_SYMBOL[s.currency] || `${s.currency.toUpperCase()} ` : "";

  const top = locked
    ? `<div class="gift"><i>☕</i><div><b>免费试用已经用完啦</b><br/>希望那条成片让你多休息了一会儿。开通会员或充值 credits 就能继续。</div></div>`
    : `<div class="gift"><i>🌴</i><div><b>会员与充值</b><br/>会员期间无限制使用；不想订阅也可以按视频时长买 credits。</div></div>`;

  const status = `<div class="status">
    <span>账号 <b>${safe}</b></span>
    ${member ? `<span class="vip">👑 ${PLAN_LABEL[user.plan || "month"]} · 有效至 <b>${until}</b>${user.subId ? " · 自动续费中" : ""}</span>` : ""}
    <span>余额 <b>${user.credits.toLocaleString()}</b> credits（约 ${Math.floor(user.credits / 60)} 分钟视频）</span>
  </div>`;

  const plans = p
    ? `<h3>会员 · 无限制使用</h3>
    <div class="packs">
      <button type="button" class="pack" data-kind="monthly" ${user.subId ? "disabled" : ""}><span class="hot">推荐</span>
        <b>连续包月</b><span>每月自动续费，可随时取消</span><em>${sym}${p.monthly}<i> /月</i></em></button>
      <button type="button" class="pack" data-kind="month">
        <b>单月</b><span>一个月，不自动续费</span><em>${sym}${p.month}<i> /月</i></em></button>
      <button type="button" class="pack" data-kind="yearly" ${user.subId ? "disabled" : ""}><span class="hot">最划算</span>
        <b>连续包年</b><span>每年自动续费</span><em>${sym}${p.yearly}<i> /年</i></em><small>约 ${sym}${(p.yearly / 12).toFixed(2)} /月</small></button>
    </div>
    ${user.subId ? '<p class="fine">你已在自动续费中。想取消或换卡，点下面的「管理订阅」。</p>' : ""}
    <p class="msg" id="pay-msg"></p>

    <h3 style="margin-top:18px">按时长买 credits</h3>
    <div class="credit-box">
      <div class="quick">${[500, 1000, 2000, 5000, 10000].map((n) => `<button type="button" data-n="${n}"${n === 2000 ? ' class="on"' : ""}>${n.toLocaleString()}</button>`).join("")}</div>
      <div class="calc">
        <input id="credits" type="number" min="${p.minCredits}" step="100" value="${Math.max(2000, p.minCredits)}" />
        <div class="price"><b id="price"></b><s id="orig"></s> <span id="off"></span></div>
      </div>
      <p class="rule">按视频时长扣：<b>1 分钟视频 = 60 credits</b>（1 credit = ${sym}${p.creditPrice}）。生成一次扣一次，制作失败重试不扣。<span id="mins"></span><br/>${p.minCredits} 起充，充 ${p.discountFrom.toLocaleString()} 及以上打 ${Math.round(p.discount * 100) / 10} 折。</p>
      <button type="button" class="go" id="buy-credits">购买 credits</button>
      <p class="msg" id="credit-msg"></p>
    </div>
    ${user.stripeCustomer ? '<button type="button" class="manage" id="manage" style="margin-top:12px">管理订阅 / 发票</button>' : ""}
    <p class="fine" style="margin-top:10px">由 Stripe 安全收款，支持银行卡、Apple Pay、Google Pay，付款后自动到账。</p>
    <div class="or"><span>或者用卡号充值</span></div>`
    : "";

  const body = `${HEADER}
${STYLE}
<main style="grid-template-columns:minmax(0,1fr);max-width:620px">
  <aside class="panel" style="position:static">
    ${top}
    ${status}
    <div id="paid" class="gift" hidden style="border-color:#9fd9b9;background:#effaf3"><i>✅</i><div><b>付款成功，已经到账</b><br/>正在带你回去…</div></div>
    ${plans}
    <form class="on" data-api="/api/auth/redeem">
      <label>卡号</label>
      <input class="card-input" name="code" autocomplete="off" spellcheck="false" placeholder="MP-XXXX-XXXX" required />
      <button class="go" type="submit">用卡号充值</button>
      <p class="msg"></p>
      <div class="links">${locked ? "<span></span>" : '<a href="/">返回</a>'}<a href="/__logout">退出登录</a></div>
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
  msg.className = "msg ok"; msg.textContent = "正在打开付款页面…";
  const res = await fetch("/api/pay/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
  const out = await res.json().catch(() => ({}));
  if (out.url) { location.href = out.url; return; }
  buttons.forEach((b) => (b.disabled = false));
  msg.className = "msg";
  msg.textContent = out.error === "credits" ? "最少 " + P.minCredits + " credits" : out.error === "subscribed" ? "你已经在自动续费中了" : "暂时无法付款，请稍后再试或联系我们";
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
  document.getElementById("price").textContent = ok ? SYM + (Math.round(full * rate * 100) / 100).toFixed(2) : "最少 " + P.minCredits;
  document.getElementById("orig").textContent = ok && rate < 1 ? SYM + full.toFixed(2) : "";
  document.getElementById("off").textContent = ok && rate < 1 ? Math.round(rate * 100) / 10 + " 折" : "";
  document.getElementById("mins").textContent = ok ? " " + n.toLocaleString() + " credits 约可做 " + Math.floor(n / 60) + " 分钟视频。" : "";
  document.getElementById("buy-credits").disabled = !ok;
  document.querySelectorAll("[data-n]").forEach((b) => b.classList.toggle("on", Number(b.dataset.n) === n));
}
if (input) {
  input.addEventListener("input", calc);
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
  else { manage.disabled = false; manage.textContent = "暂时打不开，请联系我们取消或修改订阅"; }
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
    msg.className = "msg"; msg.textContent = "还没确认到付款，稍等一会儿刷新页面；如果已扣款请联系我们";
  })();
}
</script>`;
  return page(locked ? "takeadayoff · 继续使用" : "takeadayoff · 会员与充值", body, locked ? 403 : 200);
}
