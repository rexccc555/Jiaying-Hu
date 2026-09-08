"use client";

import { useMemo, useState } from "react";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import type { GenerateResponse } from "@/lib/types";
import { buildHelperPublishUrl, buildXhsDraftFromItinerary } from "@/lib/xhs-draft";

type Props = {
  locale: AppLocale;
  data: GenerateResponse;
};

export function ShareToXhsButton({ locale, data }: Props) {
  const t = messages[locale].xhs;
  const [hint, setHint] = useState<string | null>(null);
  const draft = useMemo(() => buildXhsDraftFromItinerary(data, locale), [data, locale]);
  const helperUrl = useMemo(() => buildHelperPublishUrl(draft), [draft]);

  const launch = () => {
    const win = window.open(helperUrl, "_blank", "noopener,noreferrer");
    if (!win) {
      setHint(t.popupBlocked);
      return;
    }
    setHint(t.launchedHint);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={launch}
        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 shadow-sm hover:border-rose-300 hover:bg-rose-100"
      >
        {t.launchPublish}
      </button>
      {hint ? <p className="max-w-[16rem] text-right text-[11px] leading-snug text-slate-500">{hint}</p> : null}
    </div>
  );
}
