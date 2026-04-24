import type { PoiTemplate } from "@/lib/types";
import type { WizardInput } from "@/lib/types";
import type { ItineraryPayload } from "@/lib/types";
import { estimateDriveMinutes } from "@/lib/geo";
import { getPoiById } from "@/data/pois";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { apiStrings } from "@/i18n/api-copy";
import { poiTitle, poiSeasonLine } from "@/lib/poi-display";
import { addCalendarDaysIso } from "@/lib/dates-auckland";
import { TRIP_RAIN_PLAN_THRESHOLD_PCT, type TripWeatherDaily } from "@/lib/weather";

function durationDays(d: WizardInput["duration"]): number {
  if (d === "day") return 1;
  if (d === "2d1n") return 2;
  return 3;
}

function blocksPlan(totalDays: number): number[] {
  if (totalDays === 1) return [3];
  if (totalDays === 2) return [3, 2];
  return [3, 3, 2];
}

function tagLabel(locale: AppLocale, id: string): string {
  const st = messages[locale].styleTags as Record<string, string>;
  return st[id] ?? id;
}

function scorePoi(p: PoiTemplate, input: WizardInput, tripRainBiasPct: number): number {
  let s = 0;
  for (const t of input.styleTags) {
    if (p.styleTags.includes(t)) s += 3;
  }
  if (input.partyType === "family" && p.styleTags.includes("family")) s += 2;
  if (input.partyType === "couple" && p.styleTags.includes("couple")) s += 2;
  if (input.mobility === "public_transit" && p.mobility === "public_transit") s += 2;
  if (input.mobility === "car" && p.mobility === "car") s += 1;
  if (p.category === "food" && input.styleTags.includes("food")) s += 2;
  if (p.category === "walk" && input.styleTags.includes("light_hike")) s += 2;
  if (tripRainBiasPct >= TRIP_RAIN_PLAN_THRESHOLD_PCT && p.styleTags.includes("rain_backup")) s += 4;
  return s;
}

function pickPois(
  candidates: PoiTemplate[],
  input: WizardInput,
  need: number,
  tripRainBiasPct: number,
): PoiTemplate[] {
  const mobilityOk = candidates.filter((p) =>
    input.mobility === "public_transit" ? p.mobility !== "car" : true,
  );
  const ranked = [...mobilityOk].sort(
    (a, b) =>
      scorePoi(b, input, tripRainBiasPct) - scorePoi(a, input, tripRainBiasPct) ||
      a.id.localeCompare(b.id),
  );
  const out: PoiTemplate[] = [];
  const seen = new Set<string>();
  for (const p of ranked) {
    if (out.length >= need) break;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  while (out.length < need && mobilityOk.length > out.length) {
    for (const p of mobilityOk) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
        if (out.length >= need) break;
      }
    }
    break;
  }
  return out;
}

function addMinutes(time: string, add: number): string {
  const [h, m] = time.split(":").map(Number);
  let total = h * 60 + m + add;
  total = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function maxRainPctForTrip(daily: TripWeatherDaily[] | undefined, startDate: string, dayCount: number): number {
  if (!daily?.length) return 0;
  let max = 0;
  for (let i = 0; i < dayCount; i++) {
    const iso = addCalendarDaysIso(startDate, i);
    const row = daily.find((d) => d.date === iso);
    if (row && row.rainPct > max) max = row.rainPct;
  }
  return max;
}

function rainPctForTripDay(daily: TripWeatherDaily[] | undefined, dayDateIso: string): number | undefined {
  if (!daily?.length) return undefined;
  return daily.find((d) => d.date === dayDateIso)?.rainPct;
}

export function buildFallbackItinerary(
  input: WizardInput,
  candidates: PoiTemplate[],
  locale: AppLocale,
  tripDaily?: TripWeatherDaily[],
): ItineraryPayload {
  const a = apiStrings(locale);
  const days = durationDays(input.duration);
  const plan = blocksPlan(days);
  const totalBlocks = plan.reduce((x, y) => x + y, 0);
  const tripRainBias = maxRainPctForTrip(tripDaily, input.startDate, days);
  const selected = pickPois(candidates, input, Math.min(totalBlocks, candidates.length), tripRainBias);

  const warnings: string[] = [a.fallbackWarningBase];

  const itineraryDays = [];
  let idx = 0;
  let prev: { lat: number; lng: number } | null = null;

  for (let d = 0; d < days; d++) {
    const dayDateIso = addCalendarDaysIso(input.startDate, d);
    const dayRainPct = rainPctForTripDay(tripDaily, dayDateIso);
    const n = plan[d] ?? 2;
    const blocks = [];
    let cursor = d === 0 ? "09:00" : "09:30";

    for (let b = 0; b < n; b++) {
      const poi = selected[idx];
      idx += 1;
      if (!poi) break;

      const drive = prev ? estimateDriveMinutes(prev, poi) : 0;
      if (b > 0 && prev) {
        cursor = addMinutes(cursor, drive);
      }

      const stayMinutes = Math.round(poi.durationHours * 60);
      const end = addMinutes(cursor, stayMinutes);

      const rainPoiId = poi.rainAlternativePoiId;
      const rainPoi = rainPoiId ? getPoiById(rainPoiId) : undefined;
      const wantRainPlan =
        Boolean(rainPoi) &&
        (dayRainPct === undefined || dayRainPct >= TRIP_RAIN_PLAN_THRESHOLD_PCT);

      const season = poiSeasonLine(poi, locale);
      blocks.push({
        startTime: cursor,
        endTime: end,
        title: poiTitle(poi, locale),
        poiTemplateId: poi.id,
        driveMinutesFromPrev: b === 0 ? 0 : drive,
        stayMinutes,
        notes: [
          poi.bookingRequired ? a.bookAhead : "",
          season ?? "",
          input.mobility === "public_transit" && poi.regionId === "waiheke" ? a.ferryNote : "",
        ]
          .filter(Boolean)
          .join(" "),
        rainPlan: wantRainPlan && rainPoi
          ? { title: poiTitle(rainPoi, locale), poiTemplateId: rainPoi.id }
          : undefined,
      });

      if (season) warnings.push(`${poiTitle(poi, locale)}：${season}`);

      prev = { lat: poi.lat, lng: poi.lng };
      cursor = addMinutes(end, 30);
    }

    const themeJoined = input.styleTags
      .slice(0, 2)
      .map((id) => tagLabel(locale, id))
      .join(locale === "en" ? " · " : " · ");

    itineraryDays.push({
      day: d + 1,
      theme:
        themeJoined ||
        (input.partyType === "family" ? a.themeFamily : a.themeDefault),
      blocks,
    });
  }

  const mult = input.duration === "day" ? 1 : input.duration === "2d1n" ? 2 : 3;
  const budgetBase =
    input.budgetBand === "budget"
      ? { low: 120, high: 280 }
      : input.budgetBand === "mid"
        ? { low: 220, high: 480 }
        : { low: 400, high: 900 };

  return {
    days: itineraryDays,
    budgetBandEstimate: {
      currency: "NZD",
      low: budgetBase.low * mult,
      high: budgetBase.high * mult,
      assumptions: a.budgetAssumption,
    },
    warnings: Array.from(new Set(warnings)).slice(0, 8),
  };
}
