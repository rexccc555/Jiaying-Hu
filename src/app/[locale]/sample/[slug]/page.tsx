import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResultClient from "../../result/ResultClient";
import { getSampleItinerary } from "@/data/sample-itineraries";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const t = messages[locale].home.sampleItineraries.find((x) => x.slug === slug);
  const base = getSiteUrl();
  const title = t?.title ?? "Sample";
  return {
    title: `${title} · takeadayoff.co.nz`,
    description: t?.subtitle ?? "Sample itinerary layout",
    robots: { index: true, follow: true },
    alternates: { canonical: `${base}/${locale}/sample/${slug}` },
  };
}

export default async function SampleItineraryPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const pack = getSampleItinerary(slug, locale);
  if (!pack) notFound();
  const t = messages[locale].home;
  const wizard = `/${locale}/wizard`;

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <p className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-sm">
          {t.sampleBanner}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href={`/${locale}`} className="font-semibold text-sky-800 hover:underline">
            ← {locale === "zh" ? "返回首页" : "Home"}
          </Link>
          <Link href={wizard} className="font-semibold text-sky-800 hover:underline">
            {locale === "zh" ? "用向导生成我的版本 →" : "Build my own in the planner →"}
          </Link>
        </div>
      </div>
      <ResultClient
        locale={locale}
        initialItinerary={pack.data}
        initialWizardPayload={pack.payload}
      />
    </>
  );
}
