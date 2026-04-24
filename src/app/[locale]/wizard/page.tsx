import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import WizardClient from "./WizardClient";

function WizardFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-slate-600">Loading…</div>
  );
}

type Props = { params: Promise<{ locale: string }> };

export default async function WizardPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;

  return (
    <Suspense fallback={<WizardFallback />}>
      <WizardClient locale={locale} />
    </Suspense>
  );
}
