const I18N = {
  zh: {
    heroTitle: "拍完就去休息吧，剪辑交给我们",
    heroSub: "拖进原片就行。抠像、字幕、动画和音效一次做好，你说的每一句话都原样保留。去喝杯咖啡，回来就是能发的成片。",
    drop: "把视频拖到这里",
    dropSub: "或点击选择文件 · 手机拍的就可以",
    repick: "换一个",
    refLabel: "有喜欢的视频风格？传上来照着做（可选）",
    refAdd: "添加风格视频或截图",
    refHelp: "最多 3 个。只学它的排版、配色、节奏和转场，不会搬用里面的内容。",
    refTagVideo: "风格视频",
    refTagImage: "风格截图",
    wishLabel: "想要什么感觉？（可以不选）",
    wishPh: "也可以直接写，比如：竖屏，数字要醒目，整体干净一点。",
    chips: [
      ["竖屏短视频", "竖屏 9:16"],
      ["横屏", "横屏 16:9"],
      ["简洁大方", "整体简洁大方，留白多"],
      ["活泼可爱", "风格活泼可爱，色彩明快"],
      ["科技感", "有科技感，线条和光效"],
      ["温暖亲切", "温暖亲切，柔和配色"],
      ["正式稳重", "正式稳重，适合官方发布"],
      ["数字醒目", "讲到数字时放大强调"],
    ],
    start: "开始制作",
    startHelp: "视频只在这台电脑上处理，不会上传到别处。",
    needSetup: "先完成上面的准备，就可以开始了。",
    uploading: "正在读取视频…",
    setupTitle: "第一次使用，先准备一下",
    setupSub: "只需要一次，大约 10 分钟。准备好以后每次都能直接用。",
    setupGo: "👉 点这里开始准备",
    setupBusy: "正在自动准备，请稍等…",
    setupRetry: "👉 再试一次",
    setupItems: { tools: "视频制作工具", speech: "语音识别（听懂你说的话）", extras: "字体与画面工具", agent: "AI 助手" },
    setupLogin: "需要登录一次",
    setupNote: "Windows 弹出“是否允许更改”时请点「是」。",
    setupNoteMac: "全程自动，不需要输入密码。",
    setupKeepOpen: "全程自动下载安装，不用管它。请保持电脑开着、网络连着，不要关闭这个页面。",
    setupDoing: {
      motion: "正在下载视频制作工程（最大的一步，网速慢时要多等一会儿）",
      ffmpeg: "正在安装视频处理工具",
      speech: "正在下载语音识别模型",
      node: "正在安装运行环境",
      runtime: "正在安装抠像和渲染组件（比较久）",
      python: "正在安装字体与画面工具",
      agent: "正在安装 AI 助手",
    },
    setupStep: (done, total) => `已完成 ${done} / ${total}`,
    step1: "第 1 步",
    step2: "第 2 步",
    agentHow1: "推荐 Codex：有 ChatGPT 账号就能用。",
    agentHow2: "点它右边的「一键安装」，等一两分钟。",
    agentHow3: "再点「去登录」，会弹出网页或窗口，按提示登录你的账号。",
    agentHow4: "回到这里，显示「可以用 ✓」就完成了。",
    lockedNote: "⬆️ 先完成上面的准备步骤，这里就能上传视频了",
    setupFail: "准备没完成：",
    login: "登录 AI 助手",
    loginHint: "已打开登录页面，用你的账号确认后回到这里，会自动刷新。",
    f1t: "人物自动抠出",
    f1: "不用绿幕，人物干净地放进设计好的画面。",
    f2t: "画面跟着内容动",
    f2: "讲到数字、地名、重点时，画面自动配合出现。",
    f3t: "原话一字不改",
    f3: "只做包装，不剪改你说的话，发布前你说了算。",
    loginTitle: "请输入访问密码",
    loginSub: "内测中，输入密码后就能开始制作。",
    loginGo: "进入",
    loginNeeded: "请先输入访问密码",
    loginWrong: "密码不对，再试一次",
    qualityLabel: "制作模式",
    qualityBest: "效果最好（推荐）",
    qualityDefault: "账号默认（更省额度）",
    qualityHelp: "效果最好：自动选你账号里最强的模型，画面更精致、返工更少。账号不支持时会自动改用默认模型。",
    speedLabel: "制作速度",
    speedFast: "加速（新）",
    speedSplit: "加速 + 分段接力（实验）",
    speedClassic: "原来的方式",
    lockedTitle: "这张卡的时间已用完",
    lockedSub: "需要继续使用的话，请联系我们续时。",
    lockedGo: "换一张卡",
    timeLeft: (m) => `剩余 ${m} 分钟`,
    timeAdmin: "管理员",
    trialFree: "🎁 免费试用 1 次",
    trialActive: "免费试用中",
    trialTitle: "免费试用已经用完啦",
    trialSub: "希望那条成片让你多休息了一会儿。开通会员（NZ$9.9/月起，无限制使用）或按时长充值 credits 就能继续。",
    trialGo: "开通会员 / 充值",
    topup: "充值 / 会员",
    member: (d) => `👑 会员 · 至 ${d}`,
    creditsLeft: (n) => `${n.toLocaleString()} credits`,
    creditsTitle: "credits 不够了",
    creditsShort: (need, have) => `这条视频需要 ${need.toLocaleString()} credits（1 分钟 = 60），你还剩 ${have.toLocaleString()}。\n\n去开通会员（无限制使用）或充值 credits 吗？`,
    agentTitle: "AI 助手（必须装一个才能制作）",
    agentSub: "任选一个安装并登录即可，装好后会显示「可以用 ✓」。",
    agentNone: "还没有可用的 AI 助手，请先在下面装一个，否则无法开始制作。",
    agentHints: { codex: "ChatGPT 账户登录即可", cursor: "Cursor 账户登录即可", claude: "Claude 账户登录即可" },
    engine: "用哪个来制作",
    install: "一键安装",
    loginBtn: "去登录",
    needLogin: "已安装，需要登录",
    ready: "可以用 ✓",
    missing: "未安装",
    installing: "安装中…",
    working: "正在为你制作",
    queuedTitle: "排队中，马上轮到你",
    listening: "正在听懂你的内容…",
    stages: ["上传", "听懂内容", "抠出人物", "设计画面", "合成检查", "完成"],
    tips: [
      "正在仔细看你的视频，找到最适合放标题的地方…",
      "人物会被干净地抠出来，不需要绿幕。",
      "每个画面都会对着你说的话来设计。",
      "做完会自己检查一遍画面和声音。",
      "好作品值得等一等，先去喝杯茶吧 ☕",
      "你说的每一句话都会原样保留。",
    ],
    etaLeft: (m, at) => `大约还要 <b>${m} 分钟</b> <em>· 预计 ${at} 左右完成</em>`,
    etaAlmost: "快好了，正在做最后的检查…",
    etaStarting: "内容已听懂，正在交给 AI 开始制作…",
    etaQueue: (n) => `前面还有 ${n} 部视频在做，轮到你会自动开始，不用重复点。`,
    restTitle: "可以先去休息，晚点回来看",
    restBody: "做好后会自动出现在这里。期间可以正常用电脑做别的事，只要不关闭、不刷新这个窗口就行。",
    startFilm: "开始制作",
    retry: "重新制作",
    stop: "停止制作",
    stopConfirm: "确定要停止吗？已经做的部分不会保留。",
    stopped: "已停止。需要的话可以重新制作。",
    stoppedTitle: "这次制作已停止",
    backHome: "上传新视频",
    failed: "这次没做成：",
    notReady: "还差一步准备，回首页完成后再来点「开始制作」。",
    done: "做好了！",
    doneSub: "先完整看一遍，满意再下载发布。",
    download: "下载视频",
    again: "再做一个",
    redoLabel: "想换个感觉重做？",
    redo: "按这个要求重做",
    redoConfirm: "重做会覆盖现在这版，确定吗？",
    titleWorking: (p) => `制作中 ${p}% · takeadayoff`,
    titleDone: "✓ 做好了 · takeadayoff",
    notify: "你的视频做好了，回来看看吧！",
  },
  en: {
    heroTitle: "Shoot it. Take a day off. We'll cut it.",
    heroSub: "Just drop in the original. Cut-out, captions, animation and sound are done for you, and every word stays exactly as spoken. Grab a coffee and come back to a film you can post.",
    drop: "Drop your video here",
    dropSub: "or click to choose · phone footage is fine",
    repick: "Change",
    refLabel: "Like a certain style? Upload it and we will match it (optional)",
    refAdd: "Add a style video or screenshot",
    refHelp: "Up to 3. We learn the layout, colours, pacing and transitions, never the content.",
    refTagVideo: "Style video",
    refTagImage: "Screenshot",
    wishLabel: "What feel do you want? (optional)",
    wishPh: "Or write it: vertical, make numbers stand out, keep it clean.",
    chips: [
      ["Vertical", "vertical 9:16"],
      ["Landscape", "landscape 16:9"],
      ["Clean", "clean and minimal, lots of space"],
      ["Playful", "playful, bright colours"],
      ["Tech", "tech feel, lines and light"],
      ["Warm", "warm and friendly, soft colours"],
      ["Formal", "formal and steady, for official release"],
      ["Big numbers", "emphasise numbers when mentioned"],
    ],
    start: "Start",
    startHelp: "Your video is processed on this computer only.",
    needSetup: "Finish the one-time setup above first.",
    uploading: "Reading your video…",
    setupTitle: "First time? Quick one-time setup",
    setupSub: "About 10 minutes, only once. After that it is ready every time.",
    setupGo: "👉 Click here to set up",
    setupBusy: "Setting up automatically, please wait…",
    setupRetry: "👉 Try again",
    setupItems: { tools: "Video tools", speech: "Speech recognition", extras: "Font and image tools", agent: "AI assistant" },
    setupLogin: "sign in once",
    setupNote: "If Windows asks to allow changes, click Yes.",
    setupNoteMac: "Fully automatic, no password needed.",
    setupKeepOpen: "Everything downloads and installs by itself. Keep the computer on and online, and leave this page open.",
    setupDoing: {
      motion: "Downloading the video project (the biggest step; slow internet takes longer)",
      ffmpeg: "Installing video tools",
      speech: "Downloading the speech model",
      node: "Installing the runtime",
      runtime: "Installing cut-out and rendering parts (takes a while)",
      python: "Installing font and image tools",
      agent: "Installing an AI assistant",
    },
    setupStep: (done, total) => `${done} of ${total} done`,
    step1: "Step 1",
    step2: "Step 2",
    agentHow1: "We suggest Codex: works with a ChatGPT account.",
    agentHow2: "Click “Install” next to it and wait a minute or two.",
    agentHow3: "Then click “Sign in”. A web page or window opens; sign in to your account.",
    agentHow4: "Come back here. When it shows “Ready ✓” you’re done.",
    lockedNote: "⬆️ Finish the setup steps above, then you can upload videos here",
    setupFail: "Setup did not finish: ",
    login: "Sign in to AI assistant",
    loginHint: "A sign-in page opened. Confirm with your account, then come back here.",
    f1t: "Automatic cut-out",
    f1: "No green screen. You are placed cleanly into a designed scene.",
    f2t: "Visuals follow your words",
    f2: "Numbers, places and key points appear right when you say them.",
    f3t: "Your words, unchanged",
    f3: "We only design around your speech. You approve before publishing.",
    loginTitle: "Enter the access password",
    loginSub: "Private beta. Enter the password to start making videos.",
    loginGo: "Enter",
    loginNeeded: "Please enter the access password first",
    loginWrong: "Wrong password, try again",
    qualityLabel: "Mode",
    qualityBest: "Best result (recommended)",
    qualityDefault: "Account default (uses less quota)",
    qualityHelp: "Best result picks the strongest model on your account: more polished visuals and fewer redos. If your account can't use it, the default model is used instead.",
    speedLabel: "Speed",
    speedFast: "Faster (new)",
    speedSplit: "Faster + relay (beta)",
    speedClassic: "Original",
    lockedTitle: "This card has no time left",
    lockedSub: "To keep going, contact us to add more time.",
    lockedGo: "Use another card",
    timeLeft: (m) => `${m} min left`,
    timeAdmin: "Admin",
    trialFree: "🎁 1 free trial",
    trialActive: "Free trial",
    trialTitle: "Your free trial is used up",
    trialSub: "Hope that film bought you some rest. Get a membership (from NZ$9.9/month, unlimited) or top up credits to keep going.",
    trialGo: "Membership / top up",
    topup: "Top up / Membership",
    member: (d) => `👑 Member · until ${d}`,
    creditsLeft: (n) => `${n.toLocaleString()} credits`,
    creditsTitle: "Not enough credits",
    creditsShort: (need, have) => `This video needs ${need.toLocaleString()} credits (60 per minute) and you have ${have.toLocaleString()}.\n\nGet a membership (unlimited) or top up credits?`,
    agentTitle: "AI assistant (you need one to make videos)",
    agentSub: "Install and sign in to any one of them. It shows “Ready ✓” when done.",
    agentNone: "No AI assistant is ready yet. Install one below, otherwise videos can’t be made.",
    agentHints: { codex: "just sign in with your ChatGPT account", cursor: "just sign in with your Cursor account", claude: "just sign in with your Claude account" },
    engine: "Use this one",
    install: "Install",
    loginBtn: "Sign in",
    needLogin: "Installed, needs sign-in",
    ready: "Ready ✓",
    missing: "Not installed",
    installing: "Installing…",
    working: "Making your video",
    queuedTitle: "In line, almost your turn",
    listening: "Listening to your video…",
    stages: ["Upload", "Listen", "Cut-out", "Design", "Check", "Done"],
    tips: [
      "Finding the best places for titles…",
      "You will be cut out cleanly, no green screen needed.",
      "Every scene is designed around what you say.",
      "Picture and sound get checked before it is done.",
      "Good work takes a little time. Grab a tea ☕",
      "Every word you said stays exactly as it was.",
    ],
    etaLeft: (m, at) => `About <b>${m} min</b> left <em>· ready around ${at}</em>`,
    etaAlmost: "Almost there, doing the final checks…",
    etaStarting: "Got it. Handing over to the AI to start making…",
    etaQueue: (n) => `${n} video(s) ahead. Yours starts automatically.`,
    restTitle: "Feel free to step away",
    restBody: "It will appear here when ready. Use your computer as normal, just keep this window open and do not refresh it.",
    startFilm: "Start",
    retry: "Try again",
    stop: "Stop",
    stopConfirm: "Stop now? Progress will be lost.",
    stopped: "Stopped. You can start again any time.",
    stoppedTitle: "This video was stopped",
    backHome: "Upload a new video",
    failed: "It did not finish: ",
    notReady: "Setup is not finished. Complete it on the home page, then press Start.",
    done: "It's ready!",
    doneSub: "Watch it through once, then download and publish.",
    download: "Download video",
    again: "Make another",
    redoLabel: "Want a different feel?",
    redo: "Redo with this",
    redoConfirm: "Redoing replaces this version. Continue?",
    titleWorking: (p) => `Making ${p}% · takeadayoff`,
    titleDone: "✓ Ready · takeadayoff",
    notify: "Your video is ready!",
  },
};

const $ = (id) => document.getElementById(id);
const state = { job: null, ui: "zh", poll: null, file: null, refs: [], agents: [], agentDefault: null, env: null, tip: 0, notified: false };
const VIDEO = /\.(mp4|mov|mkv|m4v|webm|avi)$/i;
const STORE = "mpva.job";

function t(key) {
  return (I18N[state.ui] || I18N.zh)[key];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

const ON_SITE = !["127.0.0.1", "localhost"].includes(location.hostname);
const IS_MAC = /Mac/.test(navigator.platform || navigator.userAgent);
const BASE = ON_SITE ? "http://127.0.0.1:1780" : "";
const KEY_STORE = "mpva.key";
const CHUNK = 32 * 1024 * 1024;

const card = { code: "", admin: false, account: false, trial: "", remainingSec: null };

function withKey(url) {
  if (!url) return url;
  const key = localStorage.getItem(KEY_STORE);
  let full = url.startsWith("/") ? BASE + url : url;
  if (key) full += `${full.includes("?") ? "&" : "?"}k=${encodeURIComponent(key)}`;
  if (card.code) full += `${full.includes("?") ? "&" : "?"}card=${encodeURIComponent(card.code)}`;
  return full;
}

async function api(path, options = {}) {
  const key = localStorage.getItem(KEY_STORE);
  if (key) options.headers = { ...(options.headers || {}), "X-MPVA-Key": key };
  if (card.code) options.headers = { ...(options.headers || {}), "X-MPVA-Card": card.code };
  const res = await fetch(BASE + path, options);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && data.detail === "login") {
    showLogin();
    throw new Error(t("loginNeeded"));
  }
  if (res.status === 403 && data.detail === "card") {
    lockCard();
    throw new Error(t("lockedTitle"));
  }
  if (!res.ok) throw new Error(data.detail || data.error || res.statusText);
  return data;
}

async function stageFile(file, onProgress) {
  const uid = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
  for (let offset = 0; offset < file.size; offset += CHUNK) {
    await api(`/api/uploads/${uid}?offset=${offset}`, { method: "PUT", body: file.slice(offset, offset + CHUNK) });
    if (onProgress) onProgress(Math.min(1, (offset + CHUNK) / file.size));
  }
  return `${uid}|${file.name}`;
}

function lockCard() {
  card.code = "";
  if (card.account) {
    const box = $("locked");
    box.querySelector("strong").dataset.i18n = "trialTitle";
    box.querySelector("p").dataset.i18n = "trialSub";
    box.querySelector("a").dataset.i18n = "trialGo";
    box.querySelector("a").href = "/buy";
    applyUi();
  }
  $("locked").hidden = false;
}

const UNMEASURED = "mpva.unmeasured";
const unmeasured = new Set(JSON.parse(localStorage.getItem(UNMEASURED) || "[]"));
const saveUnmeasured = () => localStorage.setItem(UNMEASURED, JSON.stringify([...unmeasured]));

function videoSeconds(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (value) => { URL.revokeObjectURL(url); resolve(value); };
    const timer = setTimeout(() => done(0), 8000);
    video.preload = "metadata";
    video.onloadedmetadata = () => { clearTimeout(timer); done(Number.isFinite(video.duration) ? video.duration : 0); };
    video.onerror = () => { clearTimeout(timer); done(0); };
    video.src = url;
  });
}

/**
 * Accounts: membership is unlimited, otherwise the one free trial, then credits by the source length.
 * Ask the site before starting or re-making a film (cards and admin always pass).
 */
async function claimFilm(jobId, seconds = 0, redo = false) {
  if (!ON_SITE || !card.account) return;
  const res = await fetch("/api/card/film", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job: jobId || "", seconds, redo }),
  });
  const data = await res.json().catch(() => ({}));
  ["trial", "credits", "plan", "planUntil"].forEach((k) => k in data && (card[k] = data[k]));
  renderTimeLeft();
  if (res.ok) {
    if (jobId && !seconds && data.via === "credits") { unmeasured.add(jobId); saveUnmeasured(); }
    return;
  }
  if (data.reason === "credits") {
    if (window.confirm(t("creditsShort")(data.need, card.credits || 0))) location.href = "/buy";
    throw new Error(t("creditsTitle"));
  }
  lockCard();
  throw new Error(t("trialTitle"));
}

function settleLength(job) {
  if (!job || !unmeasured.has(job.id) || !(job.duration > 0)) return;
  unmeasured.delete(job.id);
  saveUnmeasured();
  claimFilm(job.id, job.duration).catch(() => {});
}

function renderTimeLeft() {
  const badge = $("time-left");
  if (card.account) {
    badge.hidden = false;
    badge.classList.add("link");
    badge.title = t("topup");
    $("topup").hidden = false;
    const day = card.planUntil ? new Date(card.planUntil).toLocaleDateString(state.ui === "zh" ? "zh-CN" : "en-NZ", { month: "numeric", day: "numeric" }) : "";
    badge.textContent = card.plan ? t("member")(day)
      : card.credits > 0 ? t("creditsLeft")(card.credits)
      : card.trial === "available" ? t("trialFree")
      : card.trial === "active" ? t("trialActive") : t("creditsLeft")(0);
    badge.classList.toggle("low", !card.plan && card.trial === "used" && card.credits < 600);
    return;
  }
  badge.hidden = !card.admin && card.remainingSec === null;
  if (badge.hidden) return;
  const minutes = Math.max(0, Math.ceil((card.remainingSec || 0) / 60));
  badge.textContent = card.admin ? t("timeAdmin") : t("timeLeft")(minutes);
  badge.classList.toggle("low", !card.admin && minutes <= 5);
}

async function loadCard() {
  const res = await fetch("/api/card/me", { cache: "no-store" });
  if (!res.ok) throw new Error("card");
  Object.assign(card, await res.json());
  renderTimeLeft();
}

async function cardBeat() {
  if (!card.code || card.admin) return;
  const res = await fetch("/api/card/beat", { method: "POST", cache: "no-store" }).catch(() => null);
  if (!res) return;
  if (res.status === 403) return lockCard();
  const data = await res.json().catch(() => ({}));
  if (typeof data.remainingSec === "number") card.remainingSec = data.remainingSec;
  ["trial", "credits", "plan", "planUntil"].forEach((k) => k in data && (card[k] = data[k]));
  renderTimeLeft();
}

function showLogin() {
  $("login").hidden = false;
  $("login-pw").focus();
}

async function submitLogin(e) {
  e.preventDefault();
  $("login-err").textContent = "";
  try {
    const res = await fetch(BASE + "/api/remote/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: $("login-pw").value }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.key) throw new Error(t("loginWrong"));
    localStorage.setItem(KEY_STORE, data.key);
    $("login").hidden = true;
    loadAgents();
    loadEnv();
    restore();
  } catch (err) {
    $("login-err").textContent = err.message;
  }
}

function show(id) {
  ["step-upload", "step-work", "step-ready"].forEach((step) => ($(step).hidden = step !== id));
}

function applyUi() {
  document.documentElement.lang = state.ui === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = t(el.dataset.i18n);
    if (typeof value === "string") el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  document.querySelectorAll("[data-ui]").forEach((el) => el.classList.toggle("on", el.dataset.ui === state.ui));
  renderChips();
  renderRefs();
  renderSetup();
  renderTimeLeft();
  if (state.job) renderJob();
}

/* ---------- 首页 ---------- */

function renderChips() {
  const picked = new Set([...document.querySelectorAll(".chip.on")].map((el) => el.dataset.i));
  $("chips").innerHTML = t("chips")
    .map(([label], i) => `<button type="button" class="chip${picked.has(String(i)) ? " on" : ""}" data-i="${i}">${escapeHtml(label)}</button>`)
    .join("");
}

function briefText() {
  const chips = [...document.querySelectorAll(".chip.on")].map((el) => t("chips")[Number(el.dataset.i)][1]);
  return [...chips, ($("brief").value || "").trim()].filter(Boolean).join("；");
}

function pickFile(file) {
  if (!file || !VIDEO.test(file.name) || file.size < 32) return;
  state.file = file;
  $("picked-name").textContent = file.name;
  $("picked-size").textContent = `${(file.size / 1048576).toFixed(1)} MB`;
  $("picked").hidden = false;
  $("drop").hidden = true;
  updateStart();
}

const REF = /\.(mp4|mov|mkv|m4v|webm|avi|jpg|jpeg|png|webp|gif|bmp)$/i;

function addRefs(files) {
  for (const file of files) {
    if (state.refs.length >= 3) break;
    if (!file || !REF.test(file.name) || file.size < 32) continue;
    if (state.refs.some((r) => r.file.name === file.name && r.file.size === file.size)) continue;
    state.refs.push({ file, url: URL.createObjectURL(file), video: VIDEO.test(file.name) });
  }
  renderRefs();
}

function renderRefs() {
  const items = state.refs
    .map(
      (r, i) => `<div class="ref-item">
        ${r.video ? `<video src="${r.url}#t=0.5" muted playsinline preload="metadata"></video>` : `<img src="${r.url}" alt="" />`}
        <span class="tag">${r.video ? t("refTagVideo") : t("refTagImage")}</span>
        <button type="button" class="x" data-ref="${i}" aria-label="remove">×</button>
      </div>`
    )
    .join("");
  const add = $("ref-add");
  $("ref-grid").innerHTML = items;
  $("ref-grid").appendChild(add);
  add.hidden = state.refs.length >= 3;
}

function isReady() {
  const envOk = state.env ? state.env.ok : true;
  const agentOk = state.agents.some((a) => a.available && a.signed_in !== false);
  return envOk && agentOk;
}

function checked() {
  return Boolean(state.env && state.agentsLoaded);
}

function updateStart() {
  const ready = isReady();
  $("btn-generate").disabled = !state.file || !ready || !checked();
  $("upload-help").textContent = ready || !checked() ? t("startHelp") : t("needSetup");
}

async function loadAgents() {
  try {
    const data = await api("/api/agents");
    state.agents = data.runners || [];
    state.agentDefault = data.default;
  } catch {
    state.agents = [];
  }
  state.agentsLoaded = true;
  renderSetup();
  if (state.agents.some((a) => a.installing)) setTimeout(loadAgents, 3000);
}

async function loadEnv(refresh = false) {
  try {
    state.env = await api(`/api/env${refresh ? "?refresh=1" : ""}`);
  } catch {
    return;
  }
  renderSetup();
  if (state.env.fixing) setTimeout(() => loadEnv(), 4000);
  else if (state.envWasFixing) loadAgents();
  state.envWasFixing = state.env.fixing;
}

function renderSetup() {
  const env = state.env;
  const usable = state.agents.filter((a) => a.available);
  const signedIn = usable.some((a) => a.signed_in !== false);
  if (env) {
    const item = (key) => (env.items.find((i) => i.key === key) || {}).ok;
    const tools = item("ffmpeg") && item("node") && item("motion") && item("runtime");
    const rows = [
      ["tools", tools, ["motion", "ffmpeg", "node", "runtime"].includes(env.step)],
      ["speech", item("speech"), env.step === "speech"],
      ["extras", item("python"), env.step === "python"],
      ["agent", signedIn, env.step === "agent"],
    ];
    const names = t("setupItems");
    $("setup-list").innerHTML = rows
      .map(([key, ok, busy]) => {
        const extra = key === "agent" && usable.length && !signedIn ? ` · ${t("setupLogin")}` : "";
        return `<li class="${ok ? "ok" : busy ? "busy" : ""}"><span class="dot">${ok ? "✓" : ""}</span>${escapeHtml(names[key])}${extra}</li>`;
      })
      .join("");
    const envItems = env.items.filter((i) => i.key !== "agent");
    const doneCount = envItems.filter((i) => i.ok).length;
    state.envDone = doneCount === envItems.length;
    const fix = $("btn-env-fix");
    fix.disabled = env.fixing;
    fix.textContent = env.fixing ? t("setupBusy") : env.error ? t("setupRetry") : t("setupGo");
    fix.classList.toggle("busy", env.fixing);
    fix.hidden = state.envDone && !env.fixing;
    $("setup-progress").hidden = !env.fixing;
    $("setup-fill").style.width = `${Math.max(6, (doneCount / envItems.length) * 100)}%`;
    $("setup-now").textContent = `${t("setupDoing")[env.step] || t("setupBusy")} · ${t("setupStep")(doneCount, envItems.length)}`;
    $("btn-login").hidden = true;
    const note = env.error ? t("setupFail") + env.error : env.fixing ? t("setupKeepOpen") : IS_MAC ? t("setupNoteMac") : t("setupNote");
    $("setup-note").textContent = note;
    $("setup-note").classList.toggle("error", Boolean(env.error));
  }
  $("setup-card").hidden = !checked() || isReady() || (state.envDone && !(env && env.fixing));
  const blocked = checked() && !isReady();
  $("locked-note").hidden = !blocked;
  document.querySelector(".main-card").classList.toggle("locked", blocked);

  const select = $("agent-runner");
  select.innerHTML = usable.map((a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.label)}</option>`).join("");
  if (state.agentDefault) select.value = state.agentDefault;
  select.closest(".adv-row").hidden = usable.length === 0;
  const hints = t("agentHints");
  const rowsHtml = state.agents
    .filter((a) => a.install)
    .map((a) => {
      const needLogin = a.available && a.signed_in === false;
      const ok = a.available && !needLogin;
      const status = a.installing ? t("installing") : ok ? t("ready") : needLogin ? t("needLogin") : t("missing");
      let action = "";
      if (!a.available && !a.installing) action = `<button type="button" class="cta small" data-install="${escapeHtml(a.id)}">${t("install")}</button>`;
      else if (needLogin) action = `<button type="button" class="cta small" data-login="${escapeHtml(a.id)}">${t("loginBtn")}</button>`;
      const hint = hints[a.id] ? `<small>（${escapeHtml(hints[a.id])}）</small>` : "";
      const err = a.install_error ? `<em class="err">${escapeHtml(a.install_error)}</em>` : "";
      return `<div class="agent-row ${ok ? "ok" : ""}"><span class="agent-name"><b>${escapeHtml(a.label)}</b>${hint}</span><span class="state ${ok ? "good" : "warn"}">${status}</span>${action}${err}</div>`;
    })
    .join("");
  const noneReady = checked() && !signedIn;
  $("agent-setup").innerHTML = (noneReady ? `<p class="agent-alert">⚠️ ${t("agentNone")}</p>` : "") + rowsHtml;
  $("advanced").classList.toggle("alert", noneReady);
  const main = document.querySelector(".main-card");
  if (checked() && !isReady()) main.before($("setup-card"), $("advanced"));
  else main.after($("setup-card"), $("advanced"));
  $("advanced").hidden = state.agents.length === 0;
  updateStart();
}

async function startJob() {
  if (!state.file || !isReady()) return;
  $("btn-generate").disabled = true;
  $("upload-help").textContent = t("uploading");
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
  const form = new FormData();
  form.append("language", "auto");
  form.append("brief", briefText());
  form.append("title", state.file.name.replace(/\.[^.]+$/, ""));
  form.append("auto_film", "1");
  form.append("agent", $("agent-runner").value || "");
  form.append("quality", $("agent-quality").value);
  form.append("speed", $("agent-speed").value);
  try {
    const seconds = card.account ? await videoSeconds(state.file) : 0;
    await claimFilm("", seconds);
    const progress = (p) => ($("upload-help").textContent = `${t("uploading")} ${Math.round(p * 100)}%`);
    if (state.file.size > CHUNK) form.append("staged", await stageFile(state.file, progress));
    else form.append("files", state.file, state.file.name);
    for (const r of state.refs) {
      if (r.file.size > CHUNK) form.append("staged_refs", await stageFile(r.file));
      else form.append("refs", r.file, r.file.name);
    }
    const job = await api("/api/jobs", { method: "POST", body: form });
    await claimFilm(job.id, seconds);
    localStorage.setItem(STORE, job.id);
    state.notified = false;
    setJob(job);
    await api(`/api/jobs/${job.id}/generate`, { method: "POST" });
    pollJob(job.id);
  } catch (err) {
    $("upload-help").textContent = err.message;
    updateStart();
  }
}

/* ---------- 制作中 / 完成 ---------- */

function setJob(job) {
  state.job = job;
  settleLength(job);
  renderJob();
}

function agentOf(job) {
  return (job && job.agent) || {};
}

// Between staging and the agent starting, an auto-film job is briefly "review" with no agent yet.
function starting(job) {
  return Boolean(job.auto_film) && job.status === "review" && !agentOf(job).state && !job.error;
}

function estimateMinutes(seconds, speed) {
  const s = Number(seconds) || 0;
  if (speed === "split") return Math.round(Math.max(22, 20 + 0.5 * s));
  if (speed === "fast") return Math.round(Math.max(25, 22 + 0.65 * s));
  return Math.round(Math.max(45, 40 + 1.4 * s));
}

function busy(job) {
  return ["working", "uploaded"].includes(job.status) || ["queued", "running"].includes(agentOf(job).state) || starting(job);
}

function filmUrl(job) {
  const clip = (job.clips || [])[0] || {};
  return withKey((clip.exports || {}).final || agentOf(job).film || "");
}

function renderJob() {
  const job = state.job;
  if (!job) return;
  const agent = agentOf(job);
  if (agent.state === "done" && filmUrl(job)) return renderDone(job);
  show("step-work");
  renderWork(job);
}

function stageIndex(job) {
  const agent = agentOf(job);
  if (["working", "uploaded"].includes(job.status)) return 1;
  if (agent.state === "running") return { cutout: 2, design: 3, finish: 4 }[agent.phase] || 2;
  return 2;
}

function renderWork(job) {
  const agent = agentOf(job);
  const now = stageIndex(job);
  $("stages").innerHTML = t("stages")
    .map((label, i) => `<li class="${i < now ? "done" : i === now ? "now" : ""}"><span class="n">${i < now ? "✓" : i + 1}</span>${escapeHtml(label)}</li>`)
    .join("");

  const queued = agent.state === "queued";
  const stopped = job.status === "failed" || ["failed", "cancelled"].includes(agent.state) || (job.status === "review" && !agent.state && !starting(job));
  $("work-title").textContent = stopped ? t("stoppedTitle") : queued ? t("queuedTitle") : t("working");
  $("work-tip").hidden = stopped;
  $("btn-home").hidden = !stopped;
  let error = "";
  if (job.status === "failed") error = t("failed") + (job.error || "");
  else if (agent.state === "failed") error = t("failed") + (agent.error || "");
  else if (agent.state === "cancelled") error = t("stopped");
  else if (job.status === "review" && !agent.state && !isReady()) error = t("notReady");
  $("work-error").textContent = error;

  const film = $("btn-film");
  film.hidden = !stopped;
  film.textContent = agent.state || job.status === "failed" ? t("retry") : t("startFilm");
  $("btn-stop").hidden = !busy(job) || ["working", "uploaded"].includes(job.status);
  document.querySelector(".mascot").style.opacity = stopped ? 0.45 : 1;
  document.querySelector(".rest").hidden = stopped;

  let pct = 4;
  let html = "";
  if (["working", "uploaded"].includes(job.status)) {
    html = t("listening");
    pct = 6;
  } else if (starting(job)) {
    html = t("etaStarting");
    pct = 8;
  } else if (queued) {
    html = t("etaQueue")((agent.ahead || []).length || 1);
    pct = 4;
  } else if (agent.state === "running" && agent.started) {
    const total = estimateMinutes(job.duration, job.agent_speed || "fast");
    const elapsed = (Date.now() - Date.parse(agent.started)) / 60000;
    const left = Math.round(total - elapsed);
    pct = Math.min(96, Math.max(8, Math.round((elapsed / total) * 100)));
    if (left <= 3) html = t("etaAlmost");
    else {
      const at = new Date(Date.parse(agent.started) + total * 60000).toLocaleTimeString(state.ui === "zh" ? "zh-CN" : "en-NZ", { hour: "2-digit", minute: "2-digit" });
      html = t("etaLeft")(left, at);
    }
  }
  $("eta").hidden = stopped;
  $("eta-fill").style.width = `${pct}%`;
  $("eta-text").innerHTML = html;
  document.title = stopped ? "takeadayoff" : t("titleWorking")(pct);
}

function renderDone(job) {
  show("step-ready");
  const url = filmUrl(job);
  const player = $("player");
  if (player.dataset.src !== url) {
    player.innerHTML = `<video src="${escapeHtml(url)}" controls playsinline></video>`;
    player.dataset.src = url;
  }
  const link = $("btn-download");
  link.href = url;
  link.setAttribute("download", `${(job.title || "video").replace(/[\\/:*?"<>|]/g, "")}.mp4`);
  document.title = t("titleDone");
  if (!state.notified) {
    state.notified = true;
    if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
      try { new Notification("takeadayoff", { body: t("notify") }); } catch {}
    }
  }
}

function rotateTip() {
  const tips = t("tips");
  const el = $("work-tip");
  el.style.opacity = 0;
  setTimeout(() => {
    state.tip = (state.tip + 1) % tips.length;
    el.textContent = tips[state.tip];
    el.style.opacity = 1;
  }, 400);
}

function pollJob(id) {
  if (state.poll) clearInterval(state.poll);
  state.poll = setInterval(async () => {
    try {
      const job = await api(`/api/jobs/${id}`);
      setJob(job);
      if (!busy(job)) {
        clearInterval(state.poll);
        state.poll = null;
      }
    } catch {}
  }, 3000);
}

async function act(path, body) {
  const options = { method: "POST" };
  if (body) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  const job = await api(path, options);
  if (job && job.id) setJob(job);
  pollJob(state.job.id);
}

function resetHome() {
  localStorage.removeItem(STORE);
  if (state.poll) clearInterval(state.poll);
  state.poll = null;
  state.job = null;
  state.file = null;
  $("picked").hidden = true;
  $("drop").hidden = false;
  $("brief").value = "";
  state.refs.forEach((r) => URL.revokeObjectURL(r.url));
  state.refs = [];
  renderRefs();
  document.querySelectorAll(".chip.on").forEach((el) => el.classList.remove("on"));
  document.title = "takeadayoff";
  show("step-upload");
  updateStart();
}

/* ---------- 事件 ---------- */

$("drop").addEventListener("click", () => $("file").click());
$("drop").addEventListener("dragover", (e) => {
  e.preventDefault();
  $("drop").classList.add("over");
});
$("drop").addEventListener("dragleave", () => $("drop").classList.remove("over"));
$("drop").addEventListener("drop", (e) => {
  e.preventDefault();
  $("drop").classList.remove("over");
  pickFile([...(e.dataTransfer.files || [])].find((f) => VIDEO.test(f.name)));
});
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!$("step-upload").hidden) pickFile([...(e.dataTransfer.files || [])].find((f) => VIDEO.test(f.name)));
});
$("file").addEventListener("change", (e) => {
  pickFile(e.target.files[0]);
  e.target.value = "";
});
$("btn-repick").addEventListener("click", () => $("file").click());
$("ref-add").addEventListener("click", () => $("ref-file").click());
$("ref-file").addEventListener("change", (e) => {
  addRefs([...e.target.files]);
  e.target.value = "";
});
$("ref-grid").addEventListener("dragover", (e) => {
  e.preventDefault();
  $("ref-add").classList.add("over");
});
$("ref-grid").addEventListener("dragleave", () => $("ref-add").classList.remove("over"));
$("ref-grid").addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  $("ref-add").classList.remove("over");
  addRefs([...(e.dataTransfer.files || [])]);
});
$("ref-grid").addEventListener("click", (e) => {
  const x = e.target.closest("[data-ref]");
  if (!x) return;
  const [gone] = state.refs.splice(Number(x.dataset.ref), 1);
  if (gone) URL.revokeObjectURL(gone.url);
  renderRefs();
});
$("chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (chip) chip.classList.toggle("on");
});
$("btn-generate").addEventListener("click", startJob);
$("login-form").addEventListener("submit", submitLogin);

$("btn-env-fix").addEventListener("click", async () => {
  $("btn-env-fix").disabled = true;
  await api("/api/env/fix", { method: "POST" }).catch((err) => ($("setup-note").textContent = err.message));
  loadEnv();
});
$("btn-login").addEventListener("click", async () => {
  const target = (state.agents.find((a) => a.available && a.signed_in === false) || {}).id;
  if (!target) return;
  try {
    await api(`/api/agents/${target}/login`, { method: "POST" });
    $("setup-note").textContent = t("loginHint");
    setTimeout(loadAgents, 15000);
    setTimeout(loadAgents, 40000);
  } catch (err) {
    $("setup-note").textContent = err.message;
  }
});
$("agent-setup").addEventListener("click", async (e) => {
  const login = e.target.closest("[data-login]");
  if (login) {
    login.disabled = true;
    try {
      await api(`/api/agents/${login.dataset.login}/login`, { method: "POST" });
      $("agent-note").textContent = t("loginHint");
      setTimeout(loadAgents, 15000);
      setTimeout(loadAgents, 40000);
    } catch (err) {
      $("agent-note").textContent = err.message;
      login.disabled = false;
    }
    return;
  }
  const btn = e.target.closest("[data-install]");
  if (!btn) return;
  btn.disabled = true;
  await api(`/api/agents/${btn.dataset.install}/install`, { method: "POST" }).catch(() => {});
  loadAgents();
});

$("btn-film").addEventListener("click", async () => {
  if (!state.job) return;
  try {
    await claimFilm(state.job.id);
    const speed = $("agent-speed").value;
    if (state.job.status === "failed") await act(`/api/jobs/${state.job.id}/regenerate`, { speed });
    else await act(`/api/jobs/${state.job.id}/film`, { agent: $("agent-runner").value || "", quality: $("agent-quality").value, speed });
  } catch (err) {
    $("work-error").textContent = err.message;
  }
});
$("btn-stop").addEventListener("click", async () => {
  if (!state.job || !window.confirm(t("stopConfirm"))) return;
  await act(`/api/jobs/${state.job.id}/film/cancel`);
});
$("btn-new").addEventListener("click", resetHome);
$("btn-home").addEventListener("click", resetHome);
$("btn-rebrief").addEventListener("click", async () => {
  if (!state.job || !window.confirm(t("redoConfirm"))) return;
  try {
    await claimFilm(state.job.id, state.job.duration || 0, true);
  } catch {
    return;
  }
  state.notified = false;
  show("step-work");
  await act(`/api/jobs/${state.job.id}/regenerate`, { brief: ($("ready-brief").value || "").trim(), speed: $("agent-speed").value });
});

document.querySelector(".lang-switch").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-ui]");
  if (!btn) return;
  state.ui = btn.dataset.ui;
  localStorage.setItem("mpva.lang", state.ui);
  applyUi();
  renderTimeLeft();
});
$("time-left").addEventListener("click", () => card.account && (location.href = "/buy"));

window.addEventListener("beforeunload", (e) => {
  if (state.job && busy(state.job)) {
    e.preventDefault();
    e.returnValue = "";
  }
});

async function restore() {
  const id = localStorage.getItem(STORE);
  if (!id) return;
  try {
    const job = await api(`/api/jobs/${id}`);
    setJob(job);
    if (busy(job)) pollJob(id);
  } catch {
    localStorage.removeItem(STORE);
  }
}

$("agent-quality").value = localStorage.getItem("mpva.quality") === "default" ? "default" : "best";
$("agent-quality").addEventListener("change", (e) => localStorage.setItem("mpva.quality", e.target.value));
$("agent-speed").value = ["classic", "split"].includes(localStorage.getItem("mpva.speed")) ? localStorage.getItem("mpva.speed") : "fast";
$("agent-speed").addEventListener("change", (e) => localStorage.setItem("mpva.speed", e.target.value));
state.ui = localStorage.getItem("mpva.lang") === "en" ? "en" : "zh";
applyUi();
$("work-tip").textContent = t("tips")[0];
setInterval(rotateTip, 8000);
setInterval(() => state.job && !$("step-work").hidden && renderWork(state.job), 30000);
(ON_SITE ? loadCard() : Promise.resolve())
  .then(() => fetch(BASE + "/api/remote/ping"))
  .then((res) => {
    if (!res.ok) throw new Error();
    if (ON_SITE) {
      cardBeat();
      setInterval(cardBeat, 30000);
    }
    loadAgents();
    loadEnv();
    restore();
  })
  .catch(() => ON_SITE && location.replace("/"));
