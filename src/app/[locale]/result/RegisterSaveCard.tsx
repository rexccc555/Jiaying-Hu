"use client";

import { useState } from "react";
import type { GenerateResponse } from "@/lib/types";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

type Props = {
  locale: AppLocale;
  itinerary: GenerateResponse;
};

export function RegisterSaveCard({ locale, itinerary }: Props) {
  const t = messages[locale].result.register;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          phone: phone.trim() || undefined,
          locale,
          itinerary,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? t.errGeneric);
        return;
      }
      setDone(true);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <section className="glass mt-12 rounded-3xl border border-emerald-200/80 bg-emerald-50/70 p-6">
        <h2 className="text-lg font-bold text-emerald-950">{t.title}</h2>
        <p className="mt-2 text-sm font-medium text-emerald-900">{t.success}</p>
      </section>
    );
  }

  return (
    <section className="glass mt-12 rounded-3xl border border-slate-200/90 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
      <p className="mt-2 text-xs text-slate-500">{t.privacy}</p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="reg-name">
            {t.name}
          </label>
          <input
            id="reg-name"
            name="name"
            autoComplete="name"
            required
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-inner outline-none ring-sky-500/30 focus:ring-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="reg-email">
            {t.email}
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-inner outline-none ring-sky-500/30 focus:ring-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="reg-password">
            {t.password}{" "}
            <span className="font-normal text-slate-500">({t.passwordHint})</span>
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-inner outline-none ring-sky-500/30 focus:ring-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="reg-phone">
            {t.phone}{" "}
            <span className="font-normal text-slate-500">({t.phoneOptional})</span>
          </label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-inner outline-none ring-sky-500/30 focus:ring-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60"
        >
          {loading ? t.submitting : t.submit}
        </button>
      </form>
    </section>
  );
}
