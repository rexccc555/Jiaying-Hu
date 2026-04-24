import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginClient } from "./LoginClient";
import { SiteFooter } from "@/components/SiteFooter";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { safeInternalReturnPath } from "@/lib/safe-return-path";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: AppLocale = isAppLocale(raw) ? raw : "zh";
  const base = getSiteUrl();
  const t = messages[locale].loginPage;
  return {
    title: `${t.title} · takeadayoff.co.nz`,
    description: t.metaDescription,
    alternates: {
      canonical: `${base}/${locale}/login`,
    },
  };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const sp = await searchParams;
  const nextRaw = typeof sp.next === "string" ? sp.next : undefined;
  const defaultNext = safeInternalReturnPath(locale, nextRaw) ?? `/${locale}`;

  return (
    <main className="min-h-[60vh] px-4 pb-16 pt-10 sm:pt-14">
      <LoginClient locale={locale} defaultNext={defaultNext} />
      <SiteFooter locale={locale} />
    </main>
  );
}
