import { apiStrings } from "@/i18n/api-copy";
import type { AppLocale } from "@/i18n/config";
import type { GenerateResponse } from "@/lib/types";
import { TRIP_RAIN_PLAN_THRESHOLD_PCT } from "@/lib/weather";

const CJK = /[\u4e00-\u9fff]/;

/** 界面语言与存档正文语言是否明显不一致（用于英文页洗掉中文、中文页洗掉纯英文模板句） */
export function textLooksMislocalized(stored: string, uiLocale: AppLocale): boolean {
  const s = stored.trim();
  if (!s) return false;
  if (uiLocale === "en") return CJK.test(s);
  if (uiLocale === "zh") return !CJK.test(s) && /\bPer-day forecast\b/i.test(s);
  return false;
}

/** 按当前界面语言与逐日数据重写天气摘要（避免语言与界面不一致） */
export function localizedWeatherSummary(
  weather: GenerateResponse["weather"],
  uiLocale: AppLocale,
): string {
  const a = apiStrings(uiLocale);
  const daily = weather.daily ?? [];
  const shouldRebuild =
    textLooksMislocalized(weather.summary, uiLocale) ||
    (uiLocale === "zh" && daily.length > 0 && !CJK.test(weather.summary));
  if (!shouldRebuild) return weather.summary;
  if (daily.length === 0) return weather.summary;
  const rainHeavy = daily.filter((d) => d.rainPct >= 50).length;
  return rainHeavy >= Math.ceil(daily.length / 2)
    ? a.weatherHighRain
    : daily.some((d) => d.rainPct >= TRIP_RAIN_PLAN_THRESHOLD_PCT)
      ? a.weatherMixed
      : a.weatherFair;
}

export function localizedTripContext(
  weather: GenerateResponse["weather"],
  tripDates: GenerateResponse["tripDates"],
  uiLocale: AppLocale,
): string | undefined {
  const raw = weather.tripContext;
  if (!raw) return undefined;
  if (!textLooksMislocalized(raw, uiLocale)) return raw;
  const start = tripDates?.startDate ?? weather.daily?.[0]?.date;
  const end =
    tripDates?.endDate ??
    (weather.daily?.length ? weather.daily[weather.daily.length - 1]?.date : undefined);
  if (!start || !end) return raw;
  if (uiLocale === "en") {
    return `Per-day forecast for ${start}–${end} at this area’s centre (fetched live when generated; verify live conditions before you go).`;
  }
  return `以下为所选首日 ${start} 至尾日 ${end} 的逐日预报（区域中心坐标，生成时即时拉取；出发前请结合当地实时天气再确认）。`;
}

export function localizedRoadSummary(
  roads: GenerateResponse["roads"],
  uiLocale: AppLocale,
): string {
  const a = apiStrings(uiLocale);
  const shouldRebuild =
    textLooksMislocalized(roads.summary, uiLocale) ||
    (uiLocale === "zh" && !CJK.test(roads.summary));
  if (!shouldRebuild) return roads.summary;
  return a.roadSummary;
}

export function localizedBudgetAssumption(
  assumptions: string,
  uiLocale: AppLocale,
): string {
  const a = apiStrings(uiLocale);
  const shouldRebuild =
    textLooksMislocalized(assumptions, uiLocale) ||
    (uiLocale === "zh" && !CJK.test(assumptions));
  if (!shouldRebuild) return assumptions;
  return a.budgetAssumption;
}

/** 英文界面：不展示仍为中文的提示句（可改为重新生成英文行程） */
export function localizedWarningsForUi(warnings: string[], uiLocale: AppLocale): string[] {
  if (uiLocale !== "en") return warnings;
  return warnings.filter((w) => !CJK.test(w));
}
