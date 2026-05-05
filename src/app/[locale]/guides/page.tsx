import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { GUIDE_SLUGS, GUIDES } from "@/data/seo-guides";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const t = messages[locale];
  const base = getSiteUrl();
  const title = locale === "zh" ? "新西兰目的地指南 · takeadayoff.co.nz" : "NZ destination guides · takeadayoff.co.nz";
  const desc =
    locale === "zh"
      ? "奥克兰一日游、周末短途、激流岛、西海岸黑沙滩、皇后镇与中文行程规划长文说明。"
      : "Long-form guides for Auckland day trips, weekends, Waiheke, west-coast beaches, Queenstown, and bilingual planning.";
  return {
    title,
    description: desc,
    alternates: { canonical: `${base}/${locale}/guides` },
  };
}

export default async function GuidesIndexPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const t = messages[locale];

  return (
    <main className="pb-16 pt-10">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-3xl font-bold text-slate-900">{t.footer.guidesLink}</h1>
        <p className="mt-3 text-slate-600">
          {locale === "zh"
            ? "每篇文末可一键带上推荐参数打开向导；出发前请以官方信息为准。"
            : "Each guide ends with a shortcut into the planner with suggested defaults—always verify live official info."}
        </p>
        <ul className="mt-8 space-y-3">
          {GUIDE_SLUGS.map((slug) => {
            const g = GUIDES[slug];
            return (
              <li key={slug}>
                <Link
                  href={`/${locale}/guides/${slug}`}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-sky-900 shadow-sm hover:border-sky-300"
                >
                  {locale === "zh" ? g.titleZh : g.titleEn}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
