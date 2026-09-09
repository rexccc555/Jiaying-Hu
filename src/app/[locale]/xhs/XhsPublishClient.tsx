"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { buildXhsDraftFromItinerary } from "@/lib/xhs-draft";
import type { GenerateResponse } from "@/lib/types";

type Props = { locale: AppLocale };

type Draft = {
  title: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  usedOpenAI?: boolean;
};

const ITINERARY_KEY = "tao_xhs_itinerary";

export function XhsPublishClient({ locale }: Props) {
  const t = messages[locale].xhs;
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [bound, setBound] = useState(false);
  const [bindSessionId, setBindSessionId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [bindMsg, setBindMsg] = useState<string | null>(null);
  const [binding, setBinding] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobStatusCode, setJobStatusCode] = useState<string | null>(null);
  const [jobLogs, setJobLogs] = useState<string>("");
  const [publishing, setPublishing] = useState(false);

  const tripSummaryFromQuery = useMemo(() => {
    return {
      title: searchParams.get("title") || "",
      content: searchParams.get("content") || "",
      tags: (searchParams.get("tags") || "").split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    };
  }, [searchParams]);

  const refreshBound = useCallback(async () => {
    try {
      const q = guestId ? `?guestId=${encodeURIComponent(guestId)}` : "";
      const res = await fetch(`/api/xhs/bind${q}`, { credentials: "include" });
      const data = (await res.json()) as { bound?: boolean; guestId?: string };
      setBound(Boolean(data.bound));
      if (data.guestId) setGuestId(data.guestId);
    } catch {
      /* ignore */
    }
  }, [guestId]);

  useEffect(() => {
    void refreshBound();
  }, [refreshBound]);

  useEffect(() => {
    if (!bindSessionId) return;
    let tries = 0;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      tries += 1;
      try {
        const qs = new URLSearchParams({ sessionId: bindSessionId });
        if (guestId) qs.set("guestId", guestId);
        const res = await fetch(`/api/xhs/bind?${qs.toString()}`, { credentials: "include" });
        const data = (await res.json()) as {
          status?: string;
          bound?: boolean;
          guestId?: string;
          qrcode_data_url?: string;
          message?: string;
          error?: string;
        };
        if (data.guestId) setGuestId(data.guestId);
        if ((data.error || data.status === "error") && !data.qrcode_data_url) {
          setQr(null);
        }
        if (data.qrcode_data_url && !(data.error || "").toLowerCase().includes("another publish")) {
          setQr(data.qrcode_data_url);
          if (data.message) setBindMsg(data.message);
        } else if (data.message && !data.error) {
          setBindMsg(data.message);
        }
        if (data.error) {
          const err = data.error;
          const busy = err.toLowerCase().includes("another publish") || err.includes("还在进行");
          const noQr =
            !data.qrcode_data_url &&
            (data.status === "error" ||
              err === "session_not_found" ||
              err === "user_mismatch" ||
              err === "no_qrcode" ||
              /qrcode|二维码|locate login|没有截到|未获取到|超时|Failed to/i.test(err));
          if (busy) {
            setBindMsg("上一次扫码还在进行，请稍后再点一次「扫码绑定」。");
            setBinding(false);
            setBindSessionId(null);
            setQr(null);
            return true;
          }
          if (noQr) {
            setBindMsg(t.bindQrUnavailable);
            setBinding(false);
            setBindSessionId(null);
            setQr(null);
            return true;
          }
          setBindMsg(err);
        }
        if (data.bound || data.status === "bound") {
          setBound(true);
          setBinding(false);
          setBindSessionId(null);
          return true;
        }
        if (data.status === "error") {
          setBinding(false);
          setBindSessionId(null);
          setQr(null);
          setBindMsg(data.error || data.message || t.bindFail);
          return true;
        }
      } catch (e) {
        setBindMsg(e instanceof Error ? e.message : t.bindFail);
      }
      if (tries >= 60) {
        setBinding(false);
        setBindSessionId(null);
        setBindMsg(t.bindTimeout);
        return true;
      }
      return false;
    };

    void poll();
    const id = window.setInterval(() => {
      void (async () => {
        const done = await poll();
        if (done) window.clearInterval(id);
      })();
    }, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [bindSessionId, guestId, t.bindFail, t.bindTimeout, t.bindQrUnavailable]);

  useEffect(() => {
    if (!jobId) return;
    const id = window.setInterval(() => {
      void (async () => {
        const res = await fetch(`/api/xhs/publish?jobId=${encodeURIComponent(jobId)}`, {
          credentials: "include",
        });
        const data = (await res.json()) as {
          status?: string;
          status_label?: string;
          logs?: string[];
          error?: string;
        };
        if (data.status) setJobStatusCode(data.status);
        setJobStatus(data.status_label || data.status || null);
        setJobLogs((data.logs || []).join("\n") || data.error || "");
        if (data.status && !["queued", "running", "publishing"].includes(data.status)) {
          setPublishing(false);
          window.clearInterval(id);
        }
      })();
    }, 2000);
    return () => window.clearInterval(id);
  }, [jobId]);

  const loadSummary = useCallback((): { tripSummary: string; stopNames: string[]; regionId?: string } => {
    try {
      const raw = sessionStorage.getItem(ITINERARY_KEY);
      if (raw) {
        const data = JSON.parse(raw) as GenerateResponse;
        const stops: string[] = [];
        for (const day of data.itinerary.days) {
          for (const b of day.blocks) stops.push(b.title);
        }
        const fallback = buildXhsDraftFromItinerary(data, locale);
        return {
          tripSummary: `${fallback.title}\n${fallback.content}`.slice(0, 3500),
          stopNames: stops.slice(0, 20),
          regionId: data.meta?.regionId,
        };
      }
    } catch {
      /* ignore */
    }
    if (tripSummaryFromQuery.content || tripSummaryFromQuery.title) {
      return {
        tripSummary: `${tripSummaryFromQuery.title}\n${tripSummaryFromQuery.content}`.slice(0, 3500),
        stopNames: [],
      };
    }
    return {
      tripSummary:
        locale === "zh"
          ? "新西兰一日游/周末游行程，轻松可执行，带天气与路况核对。"
          : "A runnable NZ day/weekend trip with weather and road checks.",
      stopNames: [],
    };
  }, [locale, tripSummaryFromQuery.content, tripSummaryFromQuery.title]);

  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const payload = loadSummary();
      const res = await fetch("/api/xhs/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, ...payload }),
      });
      const data = (await res.json()) as Draft & { error?: string };
      if (!res.ok) throw new Error(data.error || t.genFail);
      setDraft({
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        imageUrls: data.imageUrls || [],
        usedOpenAI: data.usedOpenAI,
      });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : t.genFail);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem(ITINERARY_KEY)) {
        void generate();
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅挂载时自动生成
  }, []);

  const startBind = async () => {
    setBinding(true);
    setBindMsg(t.bindingHint);
    setQr(null);
    try {
      const res = await fetch("/api/xhs/bind", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, guestId }),
      });
      const data = (await res.json()) as {
        sessionId?: string;
        guestId?: string;
        error?: string;
        code?: string;
      };
      if (data.guestId) setGuestId(data.guestId);
      if (!res.ok) {
        setBindMsg(data.error || t.bindFail);
        setBinding(false);
        return;
      }
      if (data.sessionId) {
        setBindSessionId(data.sessionId);
        setBindMsg(t.bindingHint);
      } else {
        setBindMsg(t.bindFail);
        setBinding(false);
      }
    } catch (e) {
      setBindMsg(e instanceof Error ? e.message : t.bindFail);
      setBinding(false);
    }
  };

  const unbind = async () => {
    await fetch("/api/xhs/bind", { method: "DELETE", credentials: "include" });
    setBound(false);
  };

  const previewPublish = async () => {
    if (!draft) return;
    setPublishing(true);
    setJobLogs("");
    try {
      const res = await fetch("/api/xhs/publish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          title: draft.title,
          content: draft.content,
          tags: draft.tags,
          imageUrls: draft.imageUrls,
          mode: "preview",
        }),
      });
      const data = (await res.json()) as {
        id?: string;
        status?: string;
        error?: string;
        message?: string;
        status_label?: string;
      };
      if (!res.ok) {
        setJobLogs(data.message || data.error || t.publishFail);
        setPublishing(false);
        return;
      }
      if (data.id) {
        setJobId(data.id);
        setJobStatusCode(data.status || "running");
        setJobStatus(data.status_label || "running");
      }
    } catch (e) {
      setJobLogs(e instanceof Error ? e.message : t.publishFail);
      setPublishing(false);
    }
  };

  const confirmPublish = async () => {
    if (!jobId) return;
    setPublishing(true);
    if (!window.confirm(t.confirmPublish)) {
      setPublishing(false);
      return;
    }
    const res = await fetch("/api/xhs/publish", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        title: draft?.title || "x",
        content: draft?.content || "x",
        tags: draft?.tags || [],
        imageUrls: draft?.imageUrls || [],
        mode: "confirm",
        jobId,
      }),
    });
    const data = (await res.json()) as { status_label?: string; error?: string };
    if (!res.ok) {
      setJobLogs(data.error || t.publishFail);
      setPublishing(false);
      return;
    }
    setJobStatus(data.status_label || "publishing");
    setJobStatusCode("publishing");
  };

  return (
    <main className="pb-16 pt-8">
      <div className="mx-auto max-w-2xl px-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-800/80">{t.kicker}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.ledeCloud}</p>

        <button
          type="button"
          onClick={() => void generate()}
          disabled={generating}
          className="mt-8 flex w-full min-h-[3.25rem] items-center justify-center rounded-2xl bg-sky-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-60"
        >
          {generating ? t.generating : t.genCta}
        </button>
        {genError ? <p className="mt-2 text-sm text-rose-700">{genError}</p> : null}

        {draft ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">{draft.title}</h2>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {draft.usedOpenAI ? t.aiBadge : t.templateBadge}
              </span>
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{draft.content}</pre>
            <p className="mt-3 text-xs text-sky-800">
              {draft.tags.map((tag) => `#${tag}`).join(" ")}
            </p>
            {draft.imageUrls.length ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {draft.imageUrls.slice(0, 6).map((src) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                    <Image src={src} alt="" fill className="object-cover" sizes="120px" unoptimized />
                  </div>
                ))}
              </div>
            ) : null}
            <label className="mt-4 block text-sm font-medium text-slate-800">
              {t.editTitle}
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={draft.title}
                maxLength={40}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-800">
              {t.editBody}
              <textarea
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={6}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="mt-3 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${draft.title}\n\n${draft.content}\n\n${draft.tags.map((t) => `#${t}`).join(" ")}`,
                  );
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? t.copiedDraft : t.copyDraft}
            </button>
          </section>
        ) : null}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">{t.bindTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{bound ? t.bindOk : t.bindNeed}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!bound ? (
              <button
                type="button"
                disabled={binding}
                onClick={() => void startBind()}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {binding ? t.binding : t.bindCta}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void unbind()}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
              >
                {t.unbind}
              </button>
            )}
          </div>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt="小红书登录二维码"
              className="mt-4 w-full max-w-md rounded-xl border bg-white p-2"
              onError={() => {
                setQr(null);
                setBindMsg("二维码图片损坏，请再点一次「扫码绑定」。");
                setBinding(false);
                setBindSessionId(null);
              }}
            />
          ) : null}
          {bindMsg ? (
            <p
              className={`mt-2 text-sm ${
                bindMsg.includes("失败") || bindMsg.includes("超时") || bindMsg.includes("error")
                  ? "text-rose-700"
                  : "text-slate-600"
              }`}
            >
              {bindMsg}
            </p>
          ) : null}
          {binding && !qr ? (
            <p className="mt-3 text-xs text-slate-500">云端正在打开浏览器截取二维码，通常需要 10–40 秒…</p>
          ) : null}
        </section>

        <section className="mt-8 rounded-3xl border border-rose-100 bg-rose-50/50 p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">{t.publishTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.publishHelp}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!draft || !bound || publishing}
              onClick={() => void previewPublish()}
              className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
            >
              {publishing ? t.publishing : t.previewCta}
            </button>
            <button
              type="button"
              disabled={!jobId || jobStatusCode !== "preview_ready" || publishing}
              onClick={() => void confirmPublish()}
              className="rounded-full border border-rose-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-800 disabled:opacity-40"
            >
              {t.confirmCta}
            </button>
          </div>
          {jobStatus ? <p className="mt-3 text-sm font-medium text-slate-800">{jobStatus}</p> : null}
          {jobLogs ? (
            <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{jobLogs}</pre>
          ) : null}
        </section>

        <p className="mt-8 text-center text-sm">
          <Link href={`/${locale}/wizard`} className="font-semibold text-sky-700 hover:underline">
            {t.goPlan}
          </Link>
          <span className="mx-2 text-slate-300">·</span>
          <Link href={`/${locale}`} className="font-semibold text-sky-700 hover:underline">
            {t.backHome}
          </Link>
        </p>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
