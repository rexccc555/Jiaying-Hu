"use client";

import { useEffect } from "react";
import type { AppLocale } from "@/i18n/config";

export function DocumentLang({ locale }: { locale: AppLocale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en-NZ" : "zh-Hans";
  }, [locale]);
  return null;
}
