import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SavedTripLoader } from "./SavedTripLoader";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string; tripId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, tripId } = await params;
  const locale: AppLocale = isAppLocale(raw) ? raw : "zh";
  const base = getSiteUrl();
  const t = messages[locale].result.savedTripView;
  return {
    title: `${t.metaTitle} · takeadayoff.co.nz`,
    description: t.metaDescription,
    alternates: {
      canonical: tripId ? `${base}/${locale}/saved/${tripId}` : `${base}/${locale}/saved`,
    },
  };
}

export default async function SavedTripPage({ params }: Props) {
  const { locale: raw, tripId } = await params;
  if (!isAppLocale(raw) || !tripId?.trim()) notFound();
  const locale = raw as AppLocale;

  return <SavedTripLoader locale={locale} tripId={tripId} />;
}
