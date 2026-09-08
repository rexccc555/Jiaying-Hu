"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ResultClient from "../../result/ResultClient";
import type { GenerateResponse, WizardInput } from "@/lib/types";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

type Props = {
  locale: AppLocale;
  tripId: string;
};

export function SavedTripLoader({ locale, tripId }: Props) {
  const t = messages[locale].result.savedTripView;
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [data, setData] = useState<GenerateResponse | null>(null);
  const [tripWizard, setTripWizard] = useState<WizardInput | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/saved-trips/${tripId}`, { credentials: "include" });
        const json = (await res.json()) as {
          ok?: boolean;
          trip?: { itinerary: unknown; wizardPayload: WizardInput | null };
        };
        if (cancelled) return;
        if (!res.ok || !json.ok || !json.trip?.itinerary) {
          setState("error");
          return;
        }
        setData(json.trip.itinerary as GenerateResponse);
        setTripWizard(json.trip.wizardPayload ?? null);
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  if (state === "loading") {
    return (
      <main className="min-h-[50vh] px-4 py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        <p className="mt-6 text-slate-600">{t.loading}</p>
      </main>
    );
  }

  if (state === "error" || !data || tripWizard === undefined) {
    return (
      <main className="min-h-[50vh] px-4 py-20 text-center">
        <p className="text-lg text-slate-800">{t.notFound}</p>
        <Link href={`/${locale}/account`} className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700">
          {t.backAccount}
        </Link>
      </main>
    );
  }

  const itineraryForClient =
    tripWizard != null ? { ...data, requestSnapshot: tripWizard } : data;

  return (
    <ResultClient
      locale={locale}
      initialItinerary={itineraryForClient}
      savedTripId={tripId}
      initialWizardPayload={tripWizard}
    />
  );
}
