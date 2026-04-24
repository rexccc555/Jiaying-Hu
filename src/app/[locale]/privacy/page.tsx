import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalArticle } from "@/components/LegalArticle";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { legalDoc } from "@/i18n/legal";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: AppLocale = isAppLocale(raw) ? raw : "zh";
  const doc = legalDoc(locale, "privacy");
  const base = getSiteUrl();
  return {
    title: `${doc.title} · takeadayoff.co.nz`,
    description: doc.intro.slice(0, 155),
    alternates: {
      canonical: `${base}/${locale}/privacy`,
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const doc = legalDoc(locale, "privacy");
  return <LegalArticle locale={locale} doc={doc} />;
}
