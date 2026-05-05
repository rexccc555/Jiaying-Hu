import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { getGuide } from "@/data/seo-guides";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const g = getGuide(slug);
  if (!g) return {};
  const base = getSiteUrl();
  const title = locale === "zh" ? g.titleZh : g.titleEn;
  const desc = locale === "zh" ? g.metaZh : g.metaEn;
  return {
    title: `${title} · takeadayoff.co.nz`,
    description: desc.slice(0, 160),
    alternates: { canonical: `${base}/${locale}/guides/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const g = getGuide(slug);
  if (!g) notFound();
  const paras = locale === "zh" ? g.paragraphsZh : g.paragraphsEn;
  const title = locale === "zh" ? g.titleZh : g.titleEn;

  return (
    <main className="pb-16 pt-10">
      <article className="mx-auto max-w-3xl px-4">
        <nav className="text-sm text-sky-800">
          <Link href={`/${locale}/guides`} className="hover:underline">
            ← {locale === "zh" ? "指南索引" : "All guides"}
          </Link>
        </nav>
        <h1 className="mt-6 text-3xl font-bold leading-snug text-slate-900">{title}</h1>
        <div className="prose prose-slate mt-8 max-w-none space-y-4 text-base leading-relaxed">
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-sky-200 bg-sky-50/80 p-6">
          <p className="text-sm font-semibold text-slate-900">
            {locale === "zh" ? "带上本篇推荐参数，打开向导：" : "Open the planner with suggested defaults:"}
          </p>
          <Link
            href={`/${locale}/wizard?${g.wizardQuery}`}
            className="mt-4 inline-flex rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-sky-700"
          >
            {locale === "zh" ? "进入行程向导" : "Open planner"}
          </Link>
        </div>
      </article>
      <SiteFooter locale={locale} />
    </main>
  );
}
