import Link from "next/link";
import type { AppLocale } from "@/i18n/config";
import type { LegalDoc } from "@/i18n/legal";
import { messages } from "@/i18n/messages";
import { SiteFooter } from "@/components/SiteFooter";

export function LegalArticle({
  locale,
  doc,
  backHref,
  backLabel,
}: {
  locale: AppLocale;
  doc: LegalDoc;
  /** 若提供则底部返回链到此路径（例如从结果页注册区打开条款时） */
  backHref?: string;
  backLabel?: string;
}) {
  const t = messages[locale];
  const href = backHref ?? `/${locale}`;
  const label = backLabel ?? t.footer.home;

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
          <Link href={href} className="font-semibold text-sky-700 hover:underline">
            ← {label}
          </Link>
        </p>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
