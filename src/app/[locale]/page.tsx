import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HomeRegisterHint } from "@/components/HomeRegisterHint";
import { SiteFooter } from "@/components/SiteFooter";
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
    <main className="pb-6">
      <Suspense fallback={null}>
        <HomeRegisterHint locale={locale} />
      </Suspense>
      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%3E%3Cpath%20d%3D%22M0%2040h40%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff22%22/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-900/80 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {t.home.heroKicker}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            <span className="text-gradient">{t.home.heroTitle}</span>
          </h1>
          <p className="mt-3 max-w-3xl text-xl font-semibold leading-snug text-sky-900/90 sm:text-2xl">
            {t.home.heroProductLine}
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600 sm:text-xl">{t.home.heroSub}</p>

          <p id="pick-path" className="mt-8 scroll-mt-32 text-sm font-medium text-slate-700">
            {t.home.entriesLead}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Link
              href={`/${locale}/wizard?intent=local`}
              className="group glass rounded-3xl border border-white/70 p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl"
            >
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
            </Link>
            <Link
              href={`/${locale}/wizard?intent=visitor`}
              className="group glass rounded-3xl border border-sky-100/90 bg-gradient-to-br from-white/95 to-sky-50/80 p-8 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
            >
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
            </Link>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-4 sm:max-w-none sm:grid-cols-3">
            {t.home.stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl px-4 py-4 text-center">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4">
        <section className="glass rounded-3xl p-8 sm:p-10">
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
                    className="block rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                  >
                    <p className="font-semibold text-slate-900">{regionTitle(r, locale)}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{regionBlurb(r, locale)}</p>
                    <span className="mt-3 inline-block text-xs font-semibold text-sky-700">
                      {locale === "zh" ? "用此区域开向导 →" : "Open planner with this area →"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">{t.home.examplesTitle}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {t.home.examples.map((ex) => (
              <Link
                key={ex.slug}
                href={`/${locale}/wizard?intent=${intentForHomeDemo(ex.slug)}&demo=${ex.slug}`}
                className="group glass flex flex-col rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
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
              </Link>
            ))}
          </div>
        </section>

        <p className="pb-4 text-center text-xs text-slate-500">{t.home.bottomNote}</p>
      </div>

      <SiteFooter locale={locale} />
    </main>
  );
}
