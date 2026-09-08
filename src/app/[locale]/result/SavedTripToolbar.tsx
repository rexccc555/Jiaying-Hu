"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

type Props = {
  locale: AppLocale;
  tripId: string;
};

export function SavedTripToolbar({ locale, tripId }: Props) {
  const router = useRouter();
  const t = messages[locale].result.savedTripView;
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (typeof window !== "undefined" && !window.confirm(t.deleteConfirm)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/saved-trips/${tripId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return;
      router.push(`/${locale}/account`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass mt-6 rounded-3xl border border-amber-200/80 bg-amber-50/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-950">{t.toolbarTitle}</h2>
          <p className="mt-1 text-sm text-amber-950/80">{t.toolbarSub}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void remove()}
          className="shrink-0 rounded-2xl border border-rose-300 bg-white px-5 py-2.5 text-sm font-semibold text-rose-800 shadow-sm hover:bg-rose-50 disabled:opacity-60"
        >
          {busy ? t.deleting : t.deleteTrip}
        </button>
      </div>
    </section>
  );
}
