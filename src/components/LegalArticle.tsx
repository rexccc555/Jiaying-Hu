import Link from "next/link";
import type { AppLocale } from "@/i18n/config";
import type { LegalDoc } from "@/i18n/legal";
import { messages } from "@/i18n/messages";
import { SiteFooter } from "@/components/SiteFooter";

export function LegalArticle({ locale, doc }: { locale: AppLocale; doc: LegalDoc }) {
  const t = messages[locale];

  return (
    <main className="min-h-[60vh] pb-6">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {t.legal.lastUpdatedLabel} {doc.lastUpdated}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{doc.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{doc.intro}</p>

        <div className="mt-10 space-y-10">
          {doc.blocks.map((b) => (
            <section key={b.heading}>
              <h2 className="text-lg font-semibold text-slate-900">{b.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
                {b.paragraphs.map((p, i) => (
                  <p key={`${b.heading}-${i}`}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-slate-500">
          <Link href={`/${locale}`} className="font-semibold text-sky-700 hover:underline">
            ← {t.footer.home}
          </Link>
        </p>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
