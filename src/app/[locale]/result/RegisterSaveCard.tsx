"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { GenerateResponse } from "@/lib/types";
import type { AppLocale } from "@/i18n/config";
import { WIZARD_PAYLOAD_STORAGE_KEY } from "@/lib/result-session-keys";
import { messages } from "@/i18n/messages";

type Props = {
  locale: AppLocale;
  itinerary: GenerateResponse;
};

const legalReturnQuery = (locale: AppLocale) =>
  `?returnTo=${encodeURIComponent(`/${locale}/result#register-save`)}`;

export function RegisterSaveCard({ locale, itinerary }: Props) {
  const router = useRouter();
  const t = messages[locale].result.register;
  const legalQ = legalReturnQuery(locale);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [planningReminderOptIn, setPlanningReminderOptIn] = useState(false);
  const [productNewsOptIn, setProductNewsOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectAllInputRef = useRef<HTMLInputElement>(null);

  const allThreeChecked = acceptTerms && planningReminderOptIn && productNewsOptIn;

  useEffect(() => {
    const el = selectAllInputRef.current;
    if (!el) return;
    const n = Number(acceptTerms) + Number(planningReminderOptIn) + Number(productNewsOptIn);
    el.indeterminate = n > 0 && n < 3;
  }, [acceptTerms, planningReminderOptIn, productNewsOptIn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) {
      setError(t.errTerms);
      return;
    }
    setLoading(true);
    try {
      let wizardPayload: unknown = itinerary.requestSnapshot;
      if (wizardPayload === undefined && typeof window !== "undefined") {
        const raw = sessionStorage.getItem(WIZARD_PAYLOAD_STORAGE_KEY);
        if (raw) {
          try {
            wizardPayload = JSON.parse(raw) as unknown;
          } catch {
            /* ignore */
          }
        }
      }
      const res = await fetch("/api/register-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          name,
          phone: phone.trim() || undefined,
          locale,
          itinerary,
          ...(typeof wizardPayload !== "undefined" ? { wizardPayload } : {}),
          acceptTerms: true,
          planningReminderOptIn,
          productNewsOptIn,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string; hint?: string };
      if (!res.ok || !data.ok) {
        const base = data.error ?? t.errGeneric;
        setError(data.hint ? `${base}\n（开发提示）${data.hint}` : base);
        return;
      }
      router.push(`/${locale}/account?welcome=1`);
      router.refresh();
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="register-save"
      className="glass mt-12 scroll-mt-28 rounded-3xl border border-slate-200/90 p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
      <p className="mt-2 text-xs text-slate-500">{t.privacy}</p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label className="block text-sm font-semibold text-slate-800" htmlFor="reg-nickname">
            {t.nickname}
          </label>
          <input
            id="reg-nickname"
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

        <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.checkboxGroupLabel}</p>

        <div className="flex gap-3">
          <input
            ref={selectAllInputRef}
            id="reg-select-all"
            name="selectAll"
            type="checkbox"
            checked={allThreeChecked}
            onChange={(e) => {
              const on = e.target.checked;
              setAcceptTerms(on);
              setPlanningReminderOptIn(on);
              setProductNewsOptIn(on);
            }}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40"
            aria-label={t.selectAllMaster}
          />
          <label htmlFor="reg-select-all" className="text-sm font-medium leading-relaxed text-slate-800">
            {t.selectAllMaster}
          </label>
        </div>

        <div className="flex gap-3">
          <input
            id="reg-terms"
            name="acceptTerms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40"
          />
          <label htmlFor="reg-terms" className="text-sm leading-relaxed text-slate-800">
            <span className="font-semibold text-rose-600" aria-hidden>
              *
            </span>{" "}
            {t.termsCheckbox}{" "}
            <Link
              href={`/${locale}/terms${legalQ}`}
              className="font-semibold text-sky-700 underline-offset-2 hover:underline"
            >
              {t.termsLink}
            </Link>{" "}
            {t.termsAnd}{" "}
            <Link
              href={`/${locale}/privacy${legalQ}`}
              className="font-semibold text-sky-700 underline-offset-2 hover:underline"
            >
              {t.privacyLinkLabel}
            </Link>
            <span className="text-slate-500"> {t.termsRequired}</span>
          </label>
        </div>

        <div className="flex gap-3">
          <input
            id="reg-reminder"
            name="planningReminderOptIn"
            type="checkbox"
            checked={planningReminderOptIn}
            onChange={(e) => setPlanningReminderOptIn(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40"
          />
          <label htmlFor="reg-reminder" className="text-sm leading-relaxed text-slate-800">
            {t.reminderCheckbox}
          </label>
        </div>

        <div className="flex gap-3">
          <input
            id="reg-product-news"
            name="productNewsOptIn"
            type="checkbox"
            checked={productNewsOptIn}
            onChange={(e) => setProductNewsOptIn(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40"
          />
          <label htmlFor="reg-product-news" className="text-sm leading-relaxed text-slate-800">
            {t.productNewsCheckbox}
          </label>
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
