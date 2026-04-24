import type { AppLocale } from "@/i18n/config";
import { apiStrings } from "@/i18n/api-copy";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

export type TripWeatherDaily = {
  date: string;
  maxC: number;
  rainPct: number;
  code: string;
};

/** 单日降水概率 ≥ 此阈值时，模板行程会为该日户外块附加 rainPlan，并让模型优先写备选。 */
export const TRIP_RAIN_PLAN_THRESHOLD_PCT = 40;

export function buildOpenMeteoTripForecastUrl(params: {
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
}): string {
  const url = new URL(OPEN_METEO);
  url.searchParams.set("latitude", String(params.lat));
  url.searchParams.set("longitude", String(params.lng));
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,precipitation_probability_max",
  );
  url.searchParams.set("timezone", "Pacific/Auckland");
  url.searchParams.set("start_date", params.startDate);
  url.searchParams.set("end_date", params.endDate);
  return url.toString();
}

export function parseOpenMeteoDailyJson(data: unknown): TripWeatherDaily[] | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const daily = o.daily;
  if (!daily || typeof daily !== "object") return null;
  const d = daily as Record<string, unknown>;
  const time = d.time;
  if (!Array.isArray(time) || time.length === 0) return null;
  const maxT = d.temperature_2m_max;
  const rain = d.precipitation_probability_max;
  const codes = d.weather_code;
  if (!Array.isArray(maxT) || !Array.isArray(rain)) return null;

  return time.map((date, i) => ({
    date: String(date),
    maxC: Math.round(Number(maxT[i]) || 0),
    rainPct: Math.round(Number(rain[i]) || 0),
    code: String(Array.isArray(codes) ? codes[i] ?? "" : ""),
  }));
}

/** 按所选日历区间拉取预报；生成请求时禁用缓存以便更接近实时。 */
export async function fetchWeatherForTripDates(params: {
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  locale: AppLocale;
}): Promise<{
  provider: string;
  summary: string;
  tripContext: string;
  daily: TripWeatherDaily[];
  fetchedAt: string;
}> {
  const a = apiStrings(params.locale);
  const res = await fetch(
    buildOpenMeteoTripForecastUrl({
      lat: params.lat,
      lng: params.lng,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP ${res.status}`);
  }
  const json: unknown = await res.json();
  const daily = parseOpenMeteoDailyJson(json);
  if (!daily) {
    throw new Error("Open-Meteo: unexpected JSON shape");
  }

  const rainHeavy = daily.filter((d) => d.rainPct >= 50).length;
  const summary =
    daily.length === 0
      ? a.weatherFair
      : rainHeavy >= Math.ceil(daily.length / 2)
        ? a.weatherHighRain
        : daily.some((d) => d.rainPct >= TRIP_RAIN_PLAN_THRESHOLD_PCT)
          ? a.weatherMixed
          : a.weatherFair;

  const tripContext =
    params.locale === "en"
      ? `Per-day forecast for ${params.startDate}–${params.endDate} at this area’s centre (fetched live when you generate; check live conditions before you go).`
      : `以下为所选首日 ${params.startDate} 至尾日 ${params.endDate} 的逐日预报（区域中心坐标，生成时即时拉取；出发前请结合当地实时天气再确认）。`;

  return {
    provider: a.weatherProvider,
    summary,
    tripContext,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
