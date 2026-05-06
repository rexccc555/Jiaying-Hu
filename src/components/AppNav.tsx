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
  const planHref = isLocaleHome ? `/${locale}#pick-path` : `/${locale}/wizard`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-lg supports-[backdrop-filter]:bg-white/55">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <Link
          href={`/${locale}`}
          className="group flex min-w-0 max-w-[min(100%,14rem)] flex-1 items-center gap-2 sm:max-w-none sm:flex-initial"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-xs font-bold leading-tight text-white shadow-md shadow-sky-600/30">
            TAO
          </span>
          <span className="min-w-0 flex flex-col leading-tight">
            <span className="hidden text-xs font-semibold uppercase tracking-wide text-sky-800/90 sm:block">
              {t.brand.badge}
            </span>
            <span className="truncate text-sm font-semibold text-slate-900 group-hover:text-sky-800 sm:text-base">
              {t.brand.nameShort}
            </span>
          </span>
        </Link>

        <nav className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-3">
          <Link
            href={`/${locale}`}
            className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white/80 hover:text-sky-800 sm:inline-flex"
          >
            {t.nav.home}
          </Link>
          <Link
            href={planHref}
            className="whitespace-nowrap rounded-full bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-700/25 transition hover:bg-sky-700 sm:py-1.5 sm:text-sm"
          >
            {t.nav.plan}
          </Link>
          <Link
            href={switchHref}
            className="whitespace-nowrap rounded-full border border-slate-200 bg-white/80 px-2.5 py-2 text-[11px] font-semibold text-slate-700 hover:border-sky-300 hover:text-sky-900 sm:px-3 sm:py-1.5 sm:text-xs"
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
