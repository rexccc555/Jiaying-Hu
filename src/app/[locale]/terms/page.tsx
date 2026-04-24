import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalArticle } from "@/components/LegalArticle";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { legalDoc } from "@/i18n/legal";
import { messages } from "@/i18n/messages";
import { safeInternalReturnPath } from "@/lib/safe-return-path";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: AppLocale = isAppLocale(raw) ? raw : "zh";
  const doc = legalDoc(locale, "terms");
  const base = getSiteUrl();
  return {
    title: `${doc.title} · takeadayoff.co.nz`,
    description: doc.intro.slice(0, 155),
    alternates: {
      canonical: `${base}/${locale}/terms`,
    },
  };
}

export default async function TermsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const doc = legalDoc(locale, "terms");
  const sp = await searchParams;
  const returnPath = safeInternalReturnPath(locale, sp.returnTo);
  const t = messages[locale];
  return (
    <LegalArticle
      locale={locale}
      doc={doc}
      backHref={returnPath ?? undefined}
      backLabel={returnPath ? t.legal.backToResult : undefined}
    />
  );
}
