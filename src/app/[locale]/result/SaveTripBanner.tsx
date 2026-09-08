"use client";

import Link from "next/link";
import { useState } from "react";
import type { GenerateResponse } from "@/lib/types";
import type { AppLocale } from "@/i18n/config";
import { WIZARD_PAYLOAD_STORAGE_KEY } from "@/lib/result-session-keys";
import { messages } from "@/i18n/messages";

type Props = {
  locale: AppLocale;
  itinerary: GenerateResponse;
};

export function SaveTripBanner({ locale, itinerary }: Props) {
  const t = messages[locale].result.saveTripBanner;
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
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
      const res = await fetch("/api/saved-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          locale,
          itinerary,
          ...(typeof wizardPayload !== "undefined" ? { wizardPayload } : {}),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? t.errGeneric);
        return;
      }
      setSaved(true);
    } catch {
      setError(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="save-trip-account"
      className="glass mt-12 scroll-mt-28 rounded-3xl border border-sky-200/90 bg-gradient-to-br from-sky-50/90 to-indigo-50/40 p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.subtitle}</p>
      {error ? (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          disabled={loading || saved}
          onClick={() => void save()}
          className="rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-60"
        >
          {saved ? t.saved : loading ? t.saving : t.cta}
        </button>
        <Link
          href={`/${locale}/account`}
          className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:border-sky-300"
        >
          {t.toAccount}
        </Link>
      </div>
    </section>
  );
}
