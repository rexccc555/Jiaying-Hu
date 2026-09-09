"use client";

import { useRouter } from "next/navigation";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import type { GenerateResponse } from "@/lib/types";

const ITINERARY_KEY = "tao_xhs_itinerary";

type Props = {
  locale: AppLocale;
  data: GenerateResponse;
};

export function ShareToXhsButton({ locale, data }: Props) {
  const t = messages[locale].xhs;
  const router = useRouter();

  const go = () => {
    try {
      sessionStorage.setItem(ITINERARY_KEY, JSON.stringify(data));
    } catch {
      /* quota / private mode */
    }
    router.push(`/${locale}/xhs`);
  };

  return (
    <button
      type="button"
      onClick={go}
      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 shadow-sm hover:border-rose-300 hover:bg-rose-100"
    >
      {t.launchPublish}
    </button>
  );
}
