"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

const DEFAULT_API = "http://127.0.0.1:1780";

type Props = { locale: AppLocale };

type Job = {
  id: string;
  status: string;
  status_label?: string;
  logs?: string[];
  error?: string;
};

function errorText(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object" && data) {
    const o = data as { detail?: unknown; error?: string };
    if (typeof o.error === "string") return o.error;
    if (typeof o.detail === "string") return o.detail;
    if (Array.isArray(o.detail) && o.detail[0] && typeof (o.detail[0] as { msg?: string }).msg === "string") {
      return (o.detail[0] as { msg: string }).msg;
    }
  }
  return fallback;
}

export function XhsPublishClient({ locale }: Props) {
  const t = messages[locale].xhs;
  const searchParams = useSearchParams();
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_CUTPOST_API || DEFAULT_API).replace(/\/$/, ""),
    [],
  );

  const [online, setOnline] = useState<boolean | null>(null);
  const [loginChip, setLoginChip] = useState<string>(t.loginUnknown);
  const [loginHelp, setLoginHelp] = useState<string>(t.loginHelp);
  const [loggedIn, setLoggedIn] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState(locale === "zh" ? "新西兰,一日游,周末去哪" : "NewZealand,daytrip");
  const [adaptText, setAdaptText] = useState("");
  const [actionHelp, setActionHelp] = useState<string>(t.actionHelp);
  const [jobChip, setJobChip] = useState<string>(t.jobNone);
  const [logs, setLogs] = useState<string>(t.logsEmpty);
  const [jobId, setJobId] = useState<string | null>(null);
  const [canPublish, setCanPublish] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [step, setStep] = useState<"login" | "draft" | "preview" | "publish">("login");
  const [readyBanner, setReadyBanner] = useState<string | null>(null);
  const [readyOk, setReadyOk] = useState(false);
  const [copied, setCopied] = useState(false);

  const poller = useRef<ReturnType<typeof setInterval> | null>(null);
  const loginPoller = useRef<ReturnType<typeof setInterval> | null>(null);
  const adaptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const api = useCallback(
    async (path: string, options?: RequestInit) => {
      const res = await fetch(`${apiBase}${path}`, options);
      const data = (await res.json().catch(() => ({}))) as unknown;
      if (!res.ok) throw new Error(errorText(data, res.statusText));
      return data as Record<string, unknown>;
    },
    [apiBase],
  );

  const stopPoll = () => {
    if (poller.current) {
      clearInterval(poller.current);
      poller.current = null;
    }
  };
  const stopLoginPoll = () => {
    if (loginPoller.current) {
      clearInterval(loginPoller.current);
      loginPoller.current = null;
    }
  };

  const refreshReady = useCallback(async () => {
    try {
      const data = await api("/api/ready");
      const issues = (data.issues as string[] | undefined) || [];
      setOnline(true);
      if (issues.length) {
        setReadyOk(false);
        setReadyBanner(issues.join(" "));
      } else {
        setReadyOk(true);
        setReadyBanner(t.readyOk);
      }
    } catch {
      setOnline(false);
      setReadyOk(false);
      setReadyBanner(t.offlineBanner);
    }
  }, [api, t.offlineBanner, t.readyOk]);

  const refreshStatus = useCallback(
    async (force = true) => {
      try {
        const data = await api(`/api/status?force=${force ? "true" : "false"}`);
        const xhs = (data.xiaohongshu || {}) as { logged_in?: boolean; error?: string };
        if (xhs.error) {
          setLoginChip(t.loginFail);
          setLoginHelp(xhs.error);
          return false;
        }
        const logged = Boolean(xhs.logged_in);
        setLoggedIn(logged);
        setLoginChip(logged ? t.loginOk : t.loginNo);
        setLoginHelp(logged ? t.loginHelpOk : t.loginHelp);
        if (logged) {
          setQr(null);
          stopLoginPoll();
          if (!jobId) setStep("draft");
        }
        setOnline(true);
        return logged;
      } catch (err) {
        setOnline(false);
        setLoginChip(t.loginFail);
        setLoginHelp(err instanceof Error ? err.message : t.offlineBanner);
        return false;
      }
    },
    [api, jobId, t],
  );

  useEffect(() => {
    const preTitle = searchParams.get("title");
    const preContent = searchParams.get("content");
    const preTags = searchParams.get("tags");
    if (preTitle) setTitle(preTitle.slice(0, 40));
    if (preContent) setContent(preContent);
    if (preTags) setTags(preTags);
  }, [searchParams]);

  useEffect(() => {
    void refreshReady();
    void refreshStatus(true);
    return () => {
      stopPoll();
      stopLoginPoll();
      if (adaptTimer.current) clearTimeout(adaptTimer.current);
    };
  }, [refreshReady, refreshStatus]);

  const titleCount = Array.from(title.trim()).length;

  const refreshAdapt = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      setAdaptText("");
      return;
    }
    try {
      const data = await api("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags }),
      });
      const xhs = (data.xiaohongshu || {}) as {
        title?: string;
        tags?: string[];
        warnings?: string[];
      };
      const warn = (xhs.warnings || []).join("；");
      setAdaptText(
        `${t.adaptTitle}${xhs.title || ""}\n${t.adaptTags}${(xhs.tags || []).map((x) => `#${x}`).join(" ") || t.adaptNone}${warn ? `\n${warn}` : ""}`,
      );
    } catch {
      setAdaptText("");
    }
  }, [api, content, t.adaptNone, t.adaptTags, t.adaptTitle, tags, title]);

  const onCopyChange = () => {
    if (adaptTimer.current) clearTimeout(adaptTimer.current);
    adaptTimer.current = setTimeout(() => void refreshAdapt(), 250);
  };

  const classify = (list: FileList | File[]) => {
    const images: File[] = [];
    const videos: File[] = [];
    const other: File[] = [];
    Array.from(list || []).forEach((file) => {
      const name = file.name.toLowerCase();
      if (/\.(mp4|mov|m4v|avi|mkv)$/.test(name)) videos.push(file);
      else if (/\.(jpe?g|png|webp|gif|bmp)$/.test(name)) images.push(file);
      else other.push(file);
    });
    if (other.length) return { error: `${t.unsupported}${other.map((f) => f.name).join("、")}` };
    if (videos.length && images.length) return { error: t.mixError };
    if (videos.length > 1) return { error: t.oneVideo };
    return { files: [...videos, ...images], error: null as string | null };
  };

  const setFilesSafe = (list: FileList | File[]) => {
    const result = classify(list);
    if (result.error) {
      setActionHelp(result.error);
      return;
    }
    setFiles(result.files || []);
    if ((result.files || []).length) setStep(loggedIn ? "draft" : "login");
  };

  const startLogin = async () => {
    setLoginHelp(t.loginOpening);
    try {
      const data = await api("/api/xhs/qrcode", { method: "POST" });
      if (data.logged_in) {
        setLoggedIn(true);
        setLoginChip(t.loginOk);
        setQr(null);
        setLoginHelp((data.message as string) || t.loginHelpOk);
        setStep("draft");
        return;
      }
      if (typeof data.qrcode_data_url === "string") setQr(data.qrcode_data_url);
      setLoginHelp((data.message as string) || t.loginScan);
      stopLoginPoll();
      let tries = 0;
      loginPoller.current = setInterval(() => {
        tries += 1;
        void refreshStatus(true).then((logged) => {
          if (logged || tries >= 24) {
            stopLoginPoll();
            if (!logged) setLoginHelp(t.loginStillWaiting);
          }
        });
      }, 5000);
    } catch (err) {
      setLoginHelp(err instanceof Error ? err.message : t.offlineBanner);
    }
  };

  const applyJob = (job: Job) => {
    setJobChip(job.status_label || job.status);
    setLogs((job.logs || []).join("\n") || job.error || "");
    setCanPublish(job.status === "preview_ready");
    if (job.status === "preview_ready") {
      setStep("publish");
      setActionHelp(t.previewReady);
    } else if (job.status === "published") {
      setStep("publish");
      setActionHelp(t.published);
    } else if (job.status === "not_logged_in") {
      setStep("login");
      setActionHelp(t.needLogin);
    } else if (job.status === "failed") {
      setActionHelp(job.error || t.failed);
    } else if (job.status === "publishing") {
      setStep("publish");
      setActionHelp(t.publishing);
    } else if (job.status === "running") {
      setStep("preview");
    }
  };

  const pollJob = async (id: string) => {
    const job = (await api(`/api/jobs/${id}`)) as unknown as Job;
    applyJob(job);
    if (["queued", "running", "publishing"].includes(job.status)) return;
    stopPoll();
    setPreviewBusy(false);
  };

  const submitPreview = async () => {
    if (!files.length) {
      setActionHelp(t.needFiles);
      return;
    }
    if (!title.trim() || !content.trim()) {
      setActionHelp(t.needCopy);
      return;
    }
    const form = new FormData();
    form.append("title", title.trim());
    form.append("content", content.trim());
    form.append("tags", tags);
    form.append("mode", "preview");
    files.forEach((file) => form.append("files", file));
    setPreviewBusy(true);
    setCanPublish(false);
    setStep("preview");
    setActionHelp(t.previewing);
    try {
      const job = (await api("/api/jobs", { method: "POST", body: form })) as unknown as Job;
      setJobId(job.id);
      applyJob(job);
      stopPoll();
      poller.current = setInterval(() => {
        void pollJob(job.id).catch(console.error);
      }, 1500);
    } catch (err) {
      setActionHelp(err instanceof Error ? err.message : t.failed);
      setPreviewBusy(false);
    }
  };

  const submitPublish = async () => {
    if (!jobId) {
      setActionHelp(t.needPreviewFirst);
      return;
    }
    if (!window.confirm(t.confirmPublish)) return;
    setCanPublish(false);
    try {
      const job = (await api(`/api/jobs/${jobId}/confirm`, { method: "POST" })) as unknown as Job;
      applyJob(job);
      stopPoll();
      poller.current = setInterval(() => {
        void pollJob(job.id).catch(console.error);
      }, 1500);
    } catch (err) {
      setActionHelp(err instanceof Error ? err.message : t.failed);
      setCanPublish(true);
    }
  };

  const stepClass = (name: typeof step) => {
    const order = ["login", "draft", "preview", "publish"] as const;
    const cur = order.indexOf(step);
    const mine = order.indexOf(name);
    if (mine < cur) return "rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900";
    if (mine === cur) return "rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white";
    return "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500";
  };

  return (
    <main className="pb-16 pt-8">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-800/80">{t.kicker}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.lede}</p>

        <ol className="mt-6 flex flex-wrap gap-2">
          <li className={stepClass("login")}>1 {t.stepLogin}</li>
          <li className={stepClass("draft")}>2 {t.stepDraft}</li>
          <li className={stepClass("preview")}>3 {t.stepPreview}</li>
          <li className={stepClass("publish")}>4 {t.stepPublish}</li>
        </ol>

        {readyBanner ? (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              readyOk
                ? "border-teal-200 bg-teal-50 text-teal-900"
                : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p>{readyBanner}</p>
            {online === false ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <a
                  href={apiBase}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  {t.openLocalHelper}
                </a>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
                  onClick={async () => {
                    const tagLine = tags
                      .split(/[,，\s]+/)
                      .map((x) => x.trim().replace(/^#/, ""))
                      .filter(Boolean)
                      .slice(0, 10)
                      .map((x) => `#${x}`)
                      .join(" ");
                    const draft = `${title.trim().slice(0, 20)}\n\n${content.trim()}${tagLine ? `\n\n${tagLine}` : ""}`;
                    try {
                      await navigator.clipboard.writeText(draft);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 2000);
                    } catch {
                      setActionHelp(draft);
                    }
                  }}
                >
                  {copied ? t.copiedDraft : t.copyDraft}
                </button>
                <p className="text-xs leading-relaxed text-amber-900/90 sm:basis-full">{t.startHint}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">{t.loginTitle}</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                loggedIn ? "bg-teal-100 text-teal-900" : "bg-slate-100 text-slate-600"
              }`}
            >
              {loginChip}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{loginHelp}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void startLogin()}
              disabled={online === false}
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {t.btnLogin}
            </button>
            <button
              type="button"
              onClick={() => void refreshStatus(true)}
              disabled={online === false}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-sky-300 disabled:opacity-50"
            >
              {t.btnCheck}
            </button>
          </div>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR" className="mt-4 max-w-[220px] rounded-xl border border-slate-200" />
          ) : null}
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{t.mediaTitle}</h2>
            <p className="mt-1 text-xs text-slate-500">{t.mediaHint}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFilesSafe(e.dataTransfer.files);
              }}
              className="mt-4 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 px-4 py-10 text-center transition hover:border-sky-400"
            >
              <strong className="text-sm text-slate-900">{t.dropStrong}</strong>
              <span className="mt-1 text-xs text-slate-500">{t.dropSpan}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/mp4,video/quicktime,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && setFilesSafe(e.target.files)}
            />
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {files.map((f) => (
                <li key={`${f.name}-${f.size}`}>
                  {f.name} · {(f.size / 1024 / 1024).toFixed(1)} MB
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">{t.copyTitle}</h2>
              <span className={`text-xs font-semibold ${titleCount > 20 ? "text-rose-600" : "text-slate-500"}`}>
                {Math.min(titleCount, 20)} / 20
              </span>
            </div>
            <label className="mt-3 block text-sm font-medium text-slate-800">
              {t.labelTitle}
              <input
                value={title}
                maxLength={40}
                onChange={(e) => {
                  setTitle(e.target.value);
                  onCopyChange();
                }}
                placeholder={t.phTitle}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500/30 focus:ring-2"
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-800">
              {t.labelBody}
              <textarea
                value={content}
                rows={5}
                onChange={(e) => {
                  setContent(e.target.value);
                  onCopyChange();
                }}
                placeholder={t.phBody}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500/30 focus:ring-2"
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-800">
              {t.labelTags}
              <input
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  onCopyChange();
                }}
                placeholder={t.phTags}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500/30 focus:ring-2"
              />
            </label>
            {adaptText ? (
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-700">{adaptText}</pre>
            ) : null}
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">{t.actionTitle}</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {jobChip}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{actionHelp}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={online === false || previewBusy}
              onClick={() => void submitPreview()}
              className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {t.btnPreview}
            </button>
            <button
              type="button"
              disabled={!canPublish}
              onClick={() => void submitPublish()}
              className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
            >
              {t.btnPublish}
            </button>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">{t.logsTitle}</summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{logs}</pre>
          </details>
        </section>

        <p className="mt-6 text-center text-xs text-slate-500">{t.foot}</p>
        <p className="mt-4 text-center text-sm">
          <Link href={`/${locale}`} className="font-semibold text-sky-700 hover:underline">
            ← {t.backHome}
          </Link>
        </p>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
