"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { buildHelperPublishUrl, HELPER_ORIGIN } from "@/lib/xhs-draft";

const HELPER_GITHUB = "https://github.com/rexccc555/Jiaying-Hu/tree/main/tools/cutpost";
const HELPER_ZIP = "https://github.com/rexccc555/Jiaying-Hu/archive/refs/heads/main.zip";

type Props = { locale: AppLocale };

export function XhsPublishClient({ locale }: Props) {
  const t = messages[locale].xhs;
  const searchParams = useSearchParams();
  const [online, setOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const draft = useMemo(
    () => ({
      title: searchParams.get("title") || "",
      content: searchParams.get("content") || "",
      tags:
        searchParams.get("tags") ||
        (locale === "zh" ? "新西兰,一日游,TakeADayOff" : "NewZealand,daytrip,TakeADayOff"),
    }),
    [locale, searchParams],
  );

  const helperUrl = useMemo(() => buildHelperPublishUrl(draft), [draft]);

  const probe = useCallback(async () => {
    setChecking(true);
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch(`${HELPER_ORIGIN}/api/health`, {
        signal: ctrl.signal,
        mode: "cors",
        cache: "no-store",
      });
      window.clearTimeout(timer);
      setOnline(res.ok);
      return res.ok;
    } catch {
      setOnline(false);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void probe();
  }, [probe]);

  const openHelper = async () => {
    const ok = await probe();
    window.open(helperUrl, "_blank", "noopener,noreferrer");
    if (!ok) {
      // HTTPS 站点常常测不到本机；仍打开本机地址，用户若已启动即可用
    }
  };

  return (
    <main className="pb-16 pt-8">
      <div className="mx-auto max-w-xl px-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-800/80">{t.kicker}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.ledeShort}</p>

        <button
          type="button"
          onClick={() => void openHelper()}
          className="mt-8 flex w-full min-h-[3.25rem] items-center justify-center rounded-2xl bg-rose-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-rose-900/15 transition hover:bg-rose-700"
        >
          {checking ? t.checking : t.launchPublish}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          {online === true ? t.helperOnline : online === false ? t.helperOfflineHint : t.checking}
        </p>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">{t.setupTitle}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            <li>{t.setup1}</li>
            <li>{t.setup2}</li>
            <li>{t.setup3}</li>
          </ol>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={HELPER_ZIP}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {t.downloadZip}
            </a>
            <a
              href={HELPER_GITHUB}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {t.downloadHelper}
            </a>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{t.setupFoot}</p>
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
