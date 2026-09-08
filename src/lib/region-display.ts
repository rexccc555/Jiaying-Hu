import type { Region } from "@/lib/types";
import type { AppLocale } from "@/i18n/config";

export function regionTitle(r: Region, locale: AppLocale): string {
  return locale === "en" ? r.displayNameEn : r.displayName;
}

export function regionBlurb(r: Region, locale: AppLocale): string {
  return locale === "en" ? r.blurbEn : r.blurb;
}
