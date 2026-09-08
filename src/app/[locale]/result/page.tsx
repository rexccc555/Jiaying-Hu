import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import ResultClient from "./ResultClient";

type Props = { params: Promise<{ locale: string }> };

export default async function ResultPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  return <ResultClient locale={raw as AppLocale} />;
}
