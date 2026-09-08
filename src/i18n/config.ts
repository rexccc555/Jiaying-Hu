export const locales = ["zh", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "zh";

export function isAppLocale(s: string): s is AppLocale {
  return locales.includes(s as AppLocale);
}
