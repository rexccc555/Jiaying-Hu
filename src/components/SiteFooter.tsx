import Link from "next/link";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

export function SiteFooter({ locale }: { locale: AppLocale }) {
  const t = messages[locale];

  return (
    <footer className="mt-20 border-t border-white/40 bg-white/50 py-12 text-sm text-slate-600 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4">
        <p>{t.footer.openMeteoLine}</p>
        <p>{t.footer.independenceLine}</p>
        <p>{t.footer.docNztaLine}</p>
        <p>{t.footer.mapsLine}</p>
        <div className="flex flex-wrap gap-4">
          <Link className="font-semibold text-sky-700 hover:underline" href={`/${locale}`}>
            {t.footer.home}
          </Link>
          <Link className="font-semibold text-sky-700 hover:underline" href={`/${locale}/wizard`}>
            {t.footer.plan}
          </Link>
          <Link className="font-semibold text-sky-700 hover:underline" href={`/${locale}/privacy`}>
            {t.footer.privacyLink}
          </Link>
          <Link className="font-semibold text-sky-700 hover:underline" href={`/${locale}/terms`}>
            {t.footer.termsLink}
          </Link>
          <Link className="font-semibold text-sky-700 hover:underline" href={`/${locale}/disclaimer`}>
            {t.footer.disclaimerLink}
          </Link>
        </div>
      </div>
    </footer>
  );
}
