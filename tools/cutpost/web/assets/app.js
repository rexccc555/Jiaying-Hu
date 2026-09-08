const $ = (id) => document.getElementById(id);

const state = {
  files: [],
  jobId: null,
  poller: null,
  loginPoller: null,
  loggedIn: false,
};

function setChip(id, text, cls) {
  const el = $(id);
  el.textContent = text;
  el.className = `chip ${cls || ""}`;
}

function log(text) {
  $("logs").textContent = text || "";
}

function errorText(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  return fallback;
}

async function api(path, options = {}) {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(errorText(data, res.statusText));
  }
  return data;
}

function setStep(name) {
  document.querySelectorAll(".steps li").forEach((item) => {
    item.classList.remove("current", "done");
    const order = ["login", "draft", "preview", "publish"];
    const current = order.indexOf(name);
    const mine = order.indexOf(item.dataset.step);
    if (mine < current) item.classList.add("done");
    if (mine === current) item.classList.add("current");
  });
}

function updatePublishButton(enabled) {
  $("btn-publish").disabled = !enabled;
}

async function refreshReady() {
  try {
    const data = await api("/api/ready");
    const box = $("ready-box");
    if (data.issues?.length) {
      box.hidden = false;
      box.className = "banner";
      box.textContent = data.issues.join(" ");
    } else {
      box.hidden = false;
      box.className = "banner ok";
      box.textContent = "本机环境可用：已检测到 Chrome 和小红书发布引擎。";
    }
  } catch (err) {
    const box = $("ready-box");
    box.hidden = false;
    box.className = "banner";
    box.textContent = err.message;
  }
}

async function refreshStatus(force = true) {
  try {
    const data = await api(`/api/status?force=${force ? "true" : "false"}`);
    const logged = Boolean(data.xiaohongshu?.logged_in);
    state.loggedIn = logged;
    if (data.xiaohongshu?.error) {
      setChip("login-chip", "检查失败", "bad");
      $("login-help").textContent = data.xiaohongshu.error;
      return logged;
    }
    setChip("login-chip", logged ? "已登录" : "未登录", logged ? "ok" : "bad");
    $("login-help").textContent = logged
      ? "登录还在。可以去放成片、写文案。"
      : "还没登录。点「打开扫码登录」，用小红书扫弹出的 Chrome，或扫本页二维码。";
    if (logged) {
      $("qrcode").classList.add("hidden");
      stopLoginPoll();
      if (!state.jobId) setStep("draft");
    }
    return logged;
  } catch (err) {
    setChip("login-chip", "检查失败", "bad");
    $("login-help").textContent = err.message;
    return false;
  }
}

function stopLoginPoll() {
  if (state.loginPoller) {
    clearInterval(state.loginPoller);
    state.loginPoller = null;
  }
}

function startLoginPoll() {
  stopLoginPoll();
  let tries = 0;
  state.loginPoller = setInterval(async () => {
    tries += 1;
    const logged = await refreshStatus(true);
    if (logged || tries >= 24) {
      stopLoginPoll();
      if (!logged) {
        $("login-help").textContent = "还没检测到登录。看弹出的 Chrome 是否已扫上，然后点「我已扫完」。";
      }
    }
  }, 5000);
}

async function startLogin() {
  $("btn-login").disabled = true;
  $("login-help").textContent = "正在打开独立 Chrome，大约十秒，请不要关掉弹出的窗口。";
  try {
    const data = await api("/api/xhs/qrcode", { method: "POST" });
    if (data.logged_in) {
      state.loggedIn = true;
      setChip("login-chip", "已登录", "ok");
      $("qrcode").classList.add("hidden");
      $("login-help").textContent = data.message || "已经是登录状态。";
      setStep("draft");
      return;
    }
    if (data.qrcode_data_url) {
      $("qrcode").src = data.qrcode_data_url;
      $("qrcode").classList.remove("hidden");
    }
    $("login-help").textContent = data.message || "请扫码。";
    startLoginPoll();
  } catch (err) {
    $("login-help").textContent = err.message;
  } finally {
    $("btn-login").disabled = false;
  }
}

function renderFiles() {
  $("file-list").innerHTML = state.files
    .map((file) => `<li>${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB</li>`)
    .join("");
}

function classify(files) {
  const images = [];
  const videos = [];
  const other = [];
  Array.from(files || []).forEach((file) => {
    const name = file.name.toLowerCase();
    if (/\.(mp4|mov|m4v|avi|mkv)$/.test(name)) videos.push(file);
    else if (/\.(jpe?g|png|webp|gif|bmp)$/.test(name)) images.push(file);
    else other.push(file);
  });
  if (other.length) return { error: `不支持：${other.map((f) => f.name).join("、")}` };
  if (videos.length && images.length) return { error: "视频和图文请分开发，不要混在一次任务里" };
  if (videos.length > 1) return { error: "一次只发一个视频" };
  return { files: [...videos, ...images], error: null };
}

function setFiles(fileList) {
  const result = classify(fileList);
  if (result.error) {
    $("action-help").textContent = result.error;
    return;
  }
  state.files = result.files;
  renderFiles();
  if (state.files.length) setStep(state.loggedIn ? "draft" : "login");
}

function titleCount() {
  const n = Array.from($("title").value.trim()).length;
  $("title-count").textContent = `${Math.min(n, 20)} / 20`;
  $("title-count").className = `chip ${n > 20 ? "bad" : "quiet"}`;
}

async function refreshAdapt() {
  titleCount();
  const title = $("title").value.trim();
  const content = $("content").value.trim();
  const tags = $("tags").value;
  if (!title && !content) {
    $("adapt-box").textContent = "";
    return;
  }
  try {
    const data = await api("/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tags }),
    });
    const xhs = data.xiaohongshu;
    const warn = (xhs.warnings || []).join("；");
    $("adapt-box").textContent = `将使用标题：${xhs.title}\n话题：${(xhs.tags || []).map((t) => "#" + t).join(" ") || "无"}${warn ? "\n" + warn : ""}`;
  } catch {
    $("adapt-box").textContent = "";
  }
}

function applyJob(job) {
  setChip("job-chip", job.status_label || job.status, job.status === "preview_ready" || job.status === "published" ? "ok" : job.status === "failed" || job.status === "not_logged_in" ? "bad" : "");
  log((job.logs || []).join("\n") || job.error || "");
  updatePublishButton(job.status === "preview_ready");
  if (job.status === "preview_ready") {
    setStep("publish");
    $("action-help").textContent = "后台已经填好。请看弹出的 Chrome，确认无误后再点「确认发布」。不要关掉那个窗口。";
  } else if (job.status === "published") {
    setStep("publish");
    $("action-help").textContent = "已点击发布。请到小红书创作者中心确认是否成功。";
  } else if (job.status === "not_logged_in") {
    setStep("login");
    $("action-help").textContent = "还没登录。先扫码，再预览。";
  } else if (job.status === "failed") {
    $("action-help").textContent = job.error || "失败了，展开详细日志看原因。";
  } else if (job.status === "publishing") {
    setStep("publish");
    $("action-help").textContent = "正在点发布，请稍等，不要关 Chrome。";
  } else if (job.status === "running") {
    setStep("preview");
  }
}

async function pollJob(jobId) {
  const job = await api(`/api/jobs/${jobId}`);
  applyJob(job);
  if (["queued", "running", "publishing"].includes(job.status)) return;
  clearInterval(state.poller);
  state.poller = null;
  $("btn-preview").disabled = false;
}

async function submit(mode) {
  if (mode === "preview") {
    if (!state.files.length) {
      $("action-help").textContent = "先放一个视频，或一组图片。";
      return;
    }
    const title = $("title").value.trim();
    const content = $("content").value.trim();
    if (!title || !content) {
      $("action-help").textContent = "标题和正文都要填。";
      return;
    }
    const form = new FormData();
    form.append("title", title);
    form.append("content", content);
    form.append("tags", $("tags").value);
    form.append("mode", "preview");
    state.files.forEach((file) => form.append("files", file));
    $("btn-preview").disabled = true;
    updatePublishButton(false);
    setStep("preview");
    $("action-help").textContent = "正在打开创作者后台并填表，视频越大越慢。请不要关掉弹出的 Chrome。";
    try {
      const job = await api("/api/jobs", { method: "POST", body: form });
      state.jobId = job.id;
      applyJob(job);
      state.poller = setInterval(() => pollJob(job.id).catch(console.error), 1500);
    } catch (err) {
      $("action-help").textContent = err.message;
      $("btn-preview").disabled = false;
    }
    return;
  }

  if (!state.jobId) {
    $("action-help").textContent = "请先预览。看过 Chrome 里的草稿，再确认发布。";
    return;
  }
  const ok = window.confirm("会点击小红书的发布按钮，内容会真实发出去。确定？");
  if (!ok) return;
  $("btn-publish").disabled = true;
  try {
    const job = await api(`/api/jobs/${state.jobId}/confirm`, { method: "POST" });
    applyJob(job);
    state.poller = setInterval(() => pollJob(job.id).catch(console.error), 1500);
  } catch (err) {
    $("action-help").textContent = err.message;
    $("btn-publish").disabled = false;
  }
}

const drop = $("drop");
drop.addEventListener("click", () => $("files").click());
drop.addEventListener("dragover", (event) => {
  event.preventDefault();
  drop.classList.add("drag");
});
drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
drop.addEventListener("drop", (event) => {
  event.preventDefault();
  drop.classList.remove("drag");
  setFiles(event.dataTransfer.files);
});
$("files").addEventListener("change", (event) => setFiles(event.target.files));
["title", "content", "tags"].forEach((id) => {
  $(id).addEventListener("input", () => {
    window.clearTimeout(window.__adaptTimer);
    window.__adaptTimer = setTimeout(refreshAdapt, 250);
  });
});
$("btn-login").addEventListener("click", startLogin);
$("btn-check").addEventListener("click", () => refreshStatus(true));
$("btn-preview").addEventListener("click", () => submit("preview"));
$("btn-publish").addEventListener("click", () => submit("publish"));

function applyQueryDraft() {
  const q = new URLSearchParams(window.location.search);
  const title = q.get("title");
  const content = q.get("content");
  const tags = q.get("tags");
  if (!title && !content && !tags) return;
  if (title) $("title").value = title.slice(0, 40);
  if (content) $("content").value = content;
  if (tags) $("tags").value = tags;
  titleCount();
  refreshAdapt();
  setStep("draft");
  $("action-help").textContent =
    "文案已从 Take a Day Off 带过来。放上成片，登录后点预览即可。";
}

refreshReady();
setStep("login");
titleCount();
updatePublishButton(false);
applyQueryDraft();
void refreshStatus(false).then((logged) => {
  const q = new URLSearchParams(window.location.search);
  if ((q.get("title") || q.get("content")) && logged) setStep("draft");
});
