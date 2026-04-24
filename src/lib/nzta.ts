import type { AppLocale } from "@/i18n/config";
import { apiStrings } from "@/i18n/api-copy";

export async function fetchRoadSummary(_regionLabel: string, locale: AppLocale): Promise<{
  provider: string;
  summary: string;
  incidents: { title: string; area?: string }[];
  fetchedAt: string;
  moreUrl: string;
}> {
  const a = apiStrings(locale);
  const moreUrl = "https://www.journeys.nzta.govt.nz/";
  return {
    provider: a.roadProvider,
    summary: a.roadSummary,
    incidents: [],
    fetchedAt: new Date().toISOString(),
    moreUrl,
  };
}
