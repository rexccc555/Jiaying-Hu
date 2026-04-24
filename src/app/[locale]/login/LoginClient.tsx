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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ email, password, locale }),
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
    <div className="mx-auto max-w-md">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/50 p-8 shadow-xl shadow-sky-900/5 ring-1 ring-white/80">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-800/80">{t.kicker}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{t.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.introLead}</p>

          <form className="mt-8 space-y-4" onSubmit={(e) => void submit(e)}>
            <div>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="login-email">
                {t.email}
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-slate-900 shadow-inner outline-none ring-sky-500/30 focus:ring-2"
              />
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
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-slate-900 shadow-inner outline-none ring-sky-500/30 focus:ring-2"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-[0.98] disabled:opacity-60"
            >
              {loading ? t.submitting : t.submit}
            </button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">{t.securityNote}</p>
          <p className="mt-2 text-xs text-slate-400">{t.afterLoginHint}</p>

          <div className="mt-8 border-t border-slate-200/80 pt-6">
            <p className="text-sm font-medium text-slate-700">{t.noAccount}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={`/${locale}?registerHint=1`}
                className="inline-flex justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-sky-800 ring-1 ring-sky-200/90 hover:bg-sky-50"
              >
                {t.toRegister}
              </Link>
              <Link
                href={`/${locale}/wizard`}
                className="inline-flex justify-center rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-sky-300"
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
