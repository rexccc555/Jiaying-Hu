import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { DocumentLang } from "@/components/DocumentLang";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: AppLocale = isAppLocale(raw) ? raw : "zh";
  const t = messages[locale];
  return {
    title: `${t.brand.nameShort} · takeadayoff.co.nz`,
    description: `${t.home.heroProductLine} ${t.brand.tagline}`,
    openGraph: {
      title: `${t.brand.nameShort}`,
      description: `${t.home.heroProductLine} ${t.brand.tagline}`,
      locale: locale === "en" ? "en_NZ" : "zh_CN",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw;

  return (
    <>
      <DocumentLang locale={locale} />
      <AppNav />
      {children}
    </>
  );
}
