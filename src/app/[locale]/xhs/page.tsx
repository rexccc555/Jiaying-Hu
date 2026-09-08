import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { XhsPublishClient } from "./XhsPublishClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) return {};
  const locale = raw as AppLocale;
  const t = messages[locale].xhs;
  return {
    title: `${t.title} · takeadayoff.co.nz`,
    description: t.ledeShort,
  };
}

export default async function XhsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;

  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-slate-600">Loading…</div>}>
      <XhsPublishClient locale={locale} />
    </Suspense>
  );
}
