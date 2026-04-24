"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { UserMenu } from "@/components/UserMenu";

export function AppNav() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  const locale: AppLocale = isAppLocale(maybeLocale) ? maybeLocale : "zh";
  const t = messages[locale];
  const subPath = parts.slice(1).join("/");
  const other: AppLocale = locale === "zh" ? "en" : "zh";
  const switchHref = `/${other}${subPath ? `/${subPath}` : ""}`;
  const isLocaleHome = parts.length === 1;
  const planHref = isLocaleHome ? `/${locale}#pick-path` : `/${locale}/wizard?intent=visitor`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/55 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={`/${locale}`} className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-xs font-bold leading-tight text-white shadow-md shadow-sky-600/30">
            TAO
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-wide text-sky-800/90">
              {t.brand.badge}
            </span>
            <span className="text-base font-semibold text-slate-900 group-hover:text-sky-800">
              {t.brand.nameShort}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}`}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white/80 hover:text-sky-800"
          >
            {t.nav.home}
          </Link>
          <Link
            href={planHref}
            className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-sky-700/25 transition hover:bg-sky-700"
          >
            {t.nav.plan}
          </Link>
          <Link
            href={switchHref}
            className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-900"
            hrefLang={other}
          >
            {locale === "zh" ? t.nav.langEn : t.nav.langZh}
          </Link>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
