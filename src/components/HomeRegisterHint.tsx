"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

const PARAM = "registerHint";

type Props = { locale: AppLocale };

export function HomeRegisterHint({ locale }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = messages[locale].home.registerHint;
  const [mounted, setMounted] = useState(false);

  const active = searchParams.get(PARAM) === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback(() => {
    router.replace(`/${locale}`, { scroll: false });
  }, [router, locale]);

  useEffect(() => {
    if (!mounted || !active) return;
    const id = window.requestAnimationFrame(() => {
      document.getElementById("home-register-hint")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(id);
  }, [mounted, active]);

  if (!mounted || !active) return null;

  return (
    <div
      id="home-register-hint"
      className="mx-auto mb-8 max-w-6xl scroll-mt-28 px-4 pt-2 sm:pt-0"
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-3xl border border-sky-200/90 bg-gradient-to-br from-white via-sky-50/90 to-indigo-50/80 p-6 shadow-lg shadow-sky-900/10 ring-1 ring-white/80 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-indigo-400/15 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-600/35"
              aria-hidden
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-800 ring-1 ring-sky-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t.badge}
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{t.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-[15px]">{t.lead}</p>
              <p className="mt-3 max-w-2xl rounded-xl border border-indigo-100/80 bg-white/60 px-3 py-2.5 text-xs leading-relaxed text-indigo-950/90 sm:text-sm">
                <span className="font-semibold text-indigo-800">✦ </span>
                {t.reminder}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600 sm:text-sm">
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-600" aria-hidden>
                    ✓
                  </span>
                  {t.perk1}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-600" aria-hidden>
                    ✓
                  </span>
                  {t.perk2}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-teal-600" aria-hidden>
                    ✓
                  </span>
                  {t.perk3}
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="self-end rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 sm:self-start"
          >
            {t.dismiss}
          </button>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 border-t border-sky-100/90 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={`/${locale}/wizard?intent=visitor`}
            className="inline-flex justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-[0.97] hover:shadow-lg"
          >
            {t.ctaVisitor}
          </Link>
          <Link
            href={`/${locale}/wizard?intent=local`}
            className="inline-flex justify-center rounded-2xl border-2 border-slate-800/90 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            {t.ctaLocal}
          </Link>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("pick-path");
              if (!el) {
                router.replace(`/${locale}#pick-path`, { scroll: false });
                return;
              }
              // 先滚动：提示条仍在、布局不变；若立刻 replace 去掉 registerHint，卡片卸载会拉高下方内容，导致锚点滚动错位
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              window.setTimeout(() => {
                router.replace(`/${locale}#pick-path`, { scroll: false });
              }, 750);
            }}
            className="text-center text-sm font-semibold text-sky-800 underline-offset-2 hover:underline sm:ml-1"
          >
            {t.pickHome}
          </button>
        </div>
      </div>
    </div>
  );
}
