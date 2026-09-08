import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HomeRegisterHint } from "@/components/HomeRegisterHint";
import { RegionHeroThumb } from "@/components/RegionHeroThumb";
import { SiteFooter } from "@/components/SiteFooter";
import {
  getHomeExampleImage,
  HOME_ENTRY_LOCAL,
  HOME_ENTRY_VISITOR,
  HOME_HERO_STRIP,
} from "@/data/marketing-images";
import { getRegionsWithPois } from "@/data/regions";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { regionBlurb, regionTitle } from "@/lib/region-display";

type Props = { params: Promise<{ locale: string }> };

function intentForHomeDemo(slug: string): "local" | "visitor" {
  if (slug === "west" || slug === "waiheke" || slug === "auckland-day") return "local";
  return "visitor";
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const t = messages[locale];
  const regionsWithPois = getRegionsWithPois();

  return (
    <main className="pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
      <Suspense fallback={null}>
        <HomeRegisterHint locale={locale} />
      </Suspense>
      <section className="relative overflow-hidden px-4 pb-14 pt-8 sm:pb-16 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Cpath%20d%3D%22M0%2040h40%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff22%22/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-900/80 shadow-sm sm:px-3 sm:text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t.home.heroKicker}
          </p>
          <h1 className="mt-4 max-w-4xl text-[1.65rem] font-bold leading-snug tracking-tight text-slate-900 sm:mt-5 sm:text-4xl sm:leading-tight md:text-5xl">
            <span className="text-gradient">{t.home.heroTitle}</span>
          </h1>
          {t.home.heroProductLine?.trim() ? (
            <p className="mt-3 max-w-3xl text-xl font-semibold leading-snug text-sky-900/90 sm:text-2xl">
              {t.home.heroProductLine}
            </p>
          ) : null}
          <p className="mt-4 max-w-3xl text-[15px] leading-[1.7] text-slate-600 sm:mt-4 sm:text-lg sm:leading-relaxed md:text-xl">
            {t.home.heroSub}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={`/${locale}/wizard`}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-sky-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-900/15 transition active:scale-[0.99] hover:bg-sky-700 sm:min-h-0"
            >
              {t.home.heroCtaGenerate}
            </Link>
            <Link
              href="#sample-itineraries"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition active:scale-[0.99] hover:border-sky-400 hover:bg-sky-50 sm:min-h-0"
            >
              {t.home.heroCtaSample}
            </Link>
            <Link
              href={`/${locale}/xhs`}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-8 py-3.5 text-base font-semibold text-rose-900 shadow-sm transition active:scale-[0.99] hover:border-rose-300 hover:bg-rose-100 sm:min-h-0"
            >
              {t.home.heroCtaXhs}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 sm:mt-9 sm:gap-3">
            {HOME_HERO_STRIP.map((shot, i) => (
              <div
                key={shot.src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/60 shadow-sm ring-1 ring-slate-900/[0.04] sm:aspect-[5/3] sm:rounded-2xl"
              >
                <Image
                  src={shot.src}
                  alt={locale === "zh" ? shot.altZh : shot.altEn}
                  fill
                  className="object-cover"
                  sizes="(max-width:640px) 33vw, 280px"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          <p id="pick-path" className="mt-10 scroll-mt-36 text-sm font-medium leading-relaxed text-slate-700 sm:mt-12 sm:scroll-mt-32">
            {t.home.entriesLead}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Link
              href={`/${locale}/wizard?intent=local`}
              className="group glass overflow-hidden rounded-3xl border border-white/70 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl"
            >
              <div className="relative aspect-[21/9] w-full sm:aspect-[2/1]">
                <Image
                  src={HOME_ENTRY_LOCAL.src}
                  alt={locale === "zh" ? HOME_ENTRY_LOCAL.altZh : HOME_ENTRY_LOCAL.altEn}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width:768px) 100vw, 400px"
                />
              </div>
              <div className="p-5 pt-5 sm:p-8 sm:pt-6">
              <h2 className="text-xl font-bold text-slate-900">{t.home.entryLocalTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.home.entryLocalSub}</p>
              <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-700">
                {t.home.entryLocalBullets.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <span className="mt-6 inline-flex text-sm font-semibold text-sky-700 group-hover:underline">
                {t.home.entryLocalCta}
              </span>
              </div>
            </Link>
            <Link
              href={`/${locale}/wizard?intent=visitor`}
              className="group glass overflow-hidden rounded-3xl border border-sky-100/90 bg-gradient-to-br from-white/95 to-sky-50/80 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="relative aspect-[21/9] w-full sm:aspect-[2/1]">
                <Image
                  src={HOME_ENTRY_VISITOR.src}
                  alt={locale === "zh" ? HOME_ENTRY_VISITOR.altZh : HOME_ENTRY_VISITOR.altEn}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width:768px) 100vw, 400px"
                />
              </div>
              <div className="p-5 pt-5 sm:p-8 sm:pt-6">
              <h2 className="text-xl font-bold text-slate-900">{t.home.entryVisitorTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.home.entryVisitorSub}</p>
              <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-700">
                {t.home.entryVisitorBullets.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <span className="mt-6 inline-flex text-sm font-semibold text-sky-700 group-hover:underline">
                {t.home.entryVisitorCta}
              </span>
              </div>
            </Link>
          </div>

          <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:mt-12 sm:max-w-none sm:gap-4">
            {t.home.stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl px-2.5 py-3 text-center sm:px-4 sm:py-4">
                <dt className="text-[10px] font-medium uppercase leading-tight tracking-wide text-slate-500 sm:text-xs">
                  {s.label}
                </dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-slate-900 sm:text-2xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4">
        <section className="glass rounded-3xl p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900">{t.home.trustTitle}</h2>
          <p className="mt-2 max-w-3xl text-slate-600">{t.home.trustLead}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {t.home.trustBullets.map((b) => (
              <li
                key={b}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 text-sm leading-relaxed text-slate-800"
              >
                <span className="mt-0.5 text-teal-600">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass rounded-3xl p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900">{t.home.audienceTitle}</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {t.home.audienceCards.map((card) => (
              <li
                key={card.title}
                className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm transition hover:border-sky-200"
              >
                <p className="font-semibold text-slate-900">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="sample-itineraries"
          className="scroll-mt-28 rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/80 p-6 shadow-sm sm:p-10"
        >
          <h2 className="text-2xl font-bold text-slate-900">{t.home.sampleTripsTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{t.home.sampleTripsSub}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {t.home.sampleItineraries.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${locale}/sample/${s.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md"
                >
                  <p className="font-semibold text-slate-900">{s.title}</p>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{s.subtitle}</p>
                  <span className="mt-4 text-sm font-semibold text-sky-700">
                    {t.home.sampleViewCta} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">{t.home.scenariosTitle}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {t.home.scenarios.map((s) => (
              <Link
                key={s.id}
                href={`/${locale}/wizard?${s.query}`}
                className="rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-900">{t.home.hubsFromTitle}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {t.home.hubsFromLinks.map((h) => {
                const hubIntent = h.regionId === "auckland-central" ? "local" : "visitor";
                return (
                  <li key={h.regionId}>
                    <Link
                      href={`/${locale}/wizard?intent=${hubIntent}&region=${h.regionId}`}
                      className="inline-flex rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-sky-800 hover:border-sky-300"
                    >
                      {h.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-900">{t.home.hubsIslandTitle}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/wizard?${t.home.hubsNorthQuery}`}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {t.home.hubsIslandNorth}
              </Link>
              <Link
                href={`/${locale}/wizard?${t.home.hubsSouthQuery}`}
                className="rounded-xl border-2 border-slate-800 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                {t.home.hubsIslandSouth}
              </Link>
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-8">
          <h2 className="text-xl font-bold text-slate-900">{t.home.scopeTitle}</h2>
          <p className="mt-2 text-slate-600">{t.home.scopeSub}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regionsWithPois.map((r) => {
              const scopeIntent =
                r.id === "auckland-central" ||
                r.id === "waitakere-west" ||
                r.id === "north-shore" ||
                r.id === "waiheke" ||
                r.id === "matakana-coast"
                  ? "local"
                  : "visitor";
              return (
                <li key={r.id}>
                  <Link
                    href={`/${locale}/wizard?intent=${scopeIntent}&region=${r.id}`}
                    className="block overflow-hidden rounded-2xl border border-slate-100 bg-white/90 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] w-full">
                      <RegionHeroThumb
                        regionId={r.id}
                        locale={locale}
                        className="absolute inset-0 h-full w-full"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 45vw, 280px"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-slate-900">{regionTitle(r, locale)}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{regionBlurb(r, locale)}</p>
                      <span className="mt-3 inline-block text-xs font-semibold text-sky-700">
                        {locale === "zh" ? "用此区域开向导 →" : "Open planner with this area →"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">{t.home.examplesTitle}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {t.home.examples.map((ex) => {
              const shot = getHomeExampleImage(ex.slug) ?? HOME_HERO_STRIP[0];
              return (
              <Link
                key={ex.slug}
                href={`/${locale}/wizard?intent=${intentForHomeDemo(ex.slug)}&demo=${ex.slug}`}
                className="group glass flex flex-col overflow-hidden rounded-3xl transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={shot.src}
                    alt={locale === "zh" ? shot.altZh : shot.altEn}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width:640px) 100vw, 320px"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                <p className="text-lg font-semibold text-slate-900 group-hover:text-sky-800">{ex.title}</p>
                <p className="mt-2 flex-1 text-sm text-slate-600">{ex.subtitle}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ex.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="mt-4 inline-flex text-sm font-semibold text-sky-700">
                  {locale === "zh" ? "试用此模板 →" : "Use template →"}
                </span>
                </div>
              </Link>
            );
            })}
          </div>
        </section>

        <p className="pb-4 text-center text-xs text-slate-500">{t.home.bottomNote}</p>
      </div>

      <SiteFooter locale={locale} />
    </main>
  );
}
