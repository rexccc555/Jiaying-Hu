"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

type Props = {
  locale: AppLocale;
  /** 登录成功后的站内路径，已由服务端校验 */
  defaultNext: string;
};

export function LoginClient({ locale, defaultNext }: Props) {
  const t = messages[locale].loginPage;
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password, locale, rememberMe }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? t.errGeneric);
        return;
      }
      router.push(defaultNext);
      router.refresh();
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/50 to-indigo-50/60 p-8 shadow-2xl shadow-sky-900/[0.07] ring-1 ring-white/90 sm:p-10">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" aria-hidden />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-800/75">{t.kicker}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{t.introLead}</p>

          <form className="mt-10 space-y-5" onSubmit={(e) => void submit(e)}>
            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="login-identifier">
                {t.identifier}
              </label>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.identifierPlaceholder}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-slate-900 shadow-inner outline-none ring-sky-500/25 placeholder:text-slate-400 focus:ring-2"
              />
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.identifierHint}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="login-password">
                {t.password}
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-slate-900 shadow-inner outline-none ring-sky-500/25 focus:ring-2"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <input
                id="login-remember"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40"
              />
              <label htmlFor="login-remember" className="text-sm leading-relaxed text-slate-700">
                {t.rememberMeLabel}
              </label>
            </div>

            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/15 transition hover:brightness-[1.02] disabled:opacity-60"
            >
              {loading ? t.submitting : t.submit}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-slate-500">{t.securityNote}</p>
          <p className="mt-3 text-xs text-slate-400">{t.afterLoginHint}</p>

          <div className="mt-10 border-t border-slate-200/80 pt-8">
            <p className="text-sm font-medium text-slate-700">{t.noAccount}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={`/${locale}?registerHint=1`}
                className="inline-flex justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-sky-200/90 transition hover:bg-sky-50"
              >
                {t.toRegister}
              </Link>
              <Link
                href={`/${locale}/wizard`}
                className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-white"
              >
                {t.toWizard}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
