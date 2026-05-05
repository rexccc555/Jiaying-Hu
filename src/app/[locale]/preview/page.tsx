import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { SiteFooter } from "@/components/SiteFooter";
import { HOME_ENTRY_VISITOR } from "@/data/marketing-images";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: AppLocale = isAppLocale(raw) ? raw : "zh";
  const p = messages[locale].preview;
  const base = getSiteUrl();
  return {
    title: `${p.metaTitle} · takeadayoff.co.nz`,
    description: p.metaDescription.slice(0, 155),
    alternates: {
      canonical: `${base}/${locale}/preview`,
    },
  };
}

export default async function PreviewPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const t = messages[locale];
  const p = t.preview;
  const heroAlt = locale === "zh" ? HOME_ENTRY_VISITOR.altZh : HOME_ENTRY_VISITOR.altEn;

  return (
    <main className="pb-10">
      <section className="relative overflow-hidden border-b border-white/40 bg-gradient-to-b from-sky-50/90 to-white">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(52%,480px)] lg:block">
          <Image
            src={HOME_ENTRY_VISITOR.src}
            alt={heroAlt}
            fill
            className="object-cover opacity-[0.35]"
            sizes="480px"
            priority
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:pt-14">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800/80">
            takeadayoff.co.nz
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {p.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{p.lead}</p>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">{p.ctaHomeHint}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={`/${locale}`}
              className="inline-flex justify-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-700/20 transition hover:bg-sky-700 sm:min-w-[200px]"
            >
              {p.ctaHome}
            </Link>
            <Link
              href={`/${locale}/wizard`}
              className="inline-flex justify-center rounded-full border border-slate-300 bg-white/95 px-6 py-3 text-sm font-semibold text-slate-800 hover:border-sky-400 hover:bg-sky-50"
            >
              {p.ctaWizard}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pt-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f) => (
            <li
              key={f.title}
              className="glass rounded-2xl border border-white/70 p-6 shadow-sm transition hover:border-sky-200/80"
            >
              <h2 className="text-lg font-bold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </li>
          ))}
        </ul>

        <p className="max-w-3xl text-xs leading-relaxed text-slate-500">{p.imageCredit}</p>
      </div>

      <SiteFooter locale={locale} />
    </main>
  );
}
