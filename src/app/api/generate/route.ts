import { NextResponse } from "next/server";
import {
  wizardInputSchema,
  type GenerateResponse,
  type ItineraryPayload,
} from "@/lib/types";
import { getRegionById } from "@/data/regions";
import { getPoisByRegion, getPoiById } from "@/data/pois";
import { fetchWeatherForTripDates } from "@/lib/weather";
import { fetchRoadSummary } from "@/lib/nzta";
import { safetyLinksForRegion } from "@/lib/safety-links";
import { buildFallbackItinerary } from "@/lib/itinerary-fallback";
import { sanitizeAiItinerary } from "@/lib/itinerary-ai-sanitize";
import { stripDeadCustomPlaceOfficialUrls } from "@/lib/itinerary-strip-dead-links";
import { generateWithOpenAI } from "@/lib/itinerary-openai";
import type { AppLocale } from "@/i18n/config";
import { apiStrings } from "@/i18n/api-copy";
import { regionTitle } from "@/lib/region-display";
import { poiTitle } from "@/lib/poi-display";
import { getDocHubsForRegion } from "@/data/doc-hubs";
import { buildDayGoogleMapLinks } from "@/lib/google-maps-urls";
import {
  maxForecastEndIso,
  todayIsoPacificAuckland,
  tripEndDateIso,
} from "@/lib/dates-auckland";

function collectSources(
  itinerary: ItineraryPayload,
  locale: AppLocale,
): { label: string; url: string }[] {
  const a = apiStrings(locale);
  const urls = new Map<string, string>();
  const add = (label: string, url: string) => {
    if (!url) return;
    if (!urls.has(url)) urls.set(url, label);
  };

  add(a.srcOpenMeteo, "https://open-meteo.com/");
  add(a.srcNzta, "https://www.journeys.nzta.govt.nz/");
  add(a.srcDoc, "https://www.doc.govt.nz/");
  add(a.srcTnz, "https://www.newzealand.com/int/");

  for (const day of itinerary.days) {
    for (const b of day.blocks) {
      const p = b.poiTemplateId ? getPoiById(b.poiTemplateId) : undefined;
      if (p) {
        add(poiTitle(p, locale), p.officialInfoUrl);
        if (p.docUrl) add(`${poiTitle(p, locale)}${a.docSuffix}`, p.docUrl);
        if (p.bookingUrl) add(`${poiTitle(p, locale)}${a.bookSuffix}`, p.bookingUrl);
      }
      const cu = b.customPlace;
      if (cu?.officialUrl) {
        add(`${cu.name}（${locale === "zh" ? "官方" : "official"}）`, cu.officialUrl);
      }
      if (b.rainPlan?.poiTemplateId) {
        const rp = getPoiById(b.rainPlan.poiTemplateId);
        if (rp) add(`${poiTitle(rp, locale)}${a.rainSuffix}`, rp.officialInfoUrl);
      }
    }
  }

  return Array.from(urls.entries()).map(([url, label]) => ({ label, url }));
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: apiStrings("zh").apiBadJson }, { status: 400 });
  }

  const parsed = wizardInputSchema.safeParse(body);
  if (!parsed.success) {
    const loc = (body as { locale?: AppLocale })?.locale === "en" ? "en" : "zh";
    const a0 = apiStrings(loc);
    const openDest = parsed.error.issues.some((i) => i.message === "OPEN_DEST_NEEDS_NOTES");
    if (openDest) {
      return NextResponse.json({ error: a0.apiOpenDestNeedsText }, { status: 400 });
    }
    return NextResponse.json(
      { error: a0.apiInvalid, details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const locale: AppLocale = input.locale;
  const a = apiStrings(locale);

  const region = getRegionById(input.regionId);
  if (!region) {
    return NextResponse.json({ error: a.apiUnknownRegion }, { status: 400 });
  }

  const candidates = getPoisByRegion(input.regionId);
  if (candidates.length === 0) {
    return NextResponse.json({ error: a.apiNoPoi }, { status: 400 });
  }

  const today = todayIsoPacificAuckland();
  const tripEnd = tripEndDateIso(input.startDate, input.duration);
  const forecastEnd = maxForecastEndIso();

  if (input.startDate < today) {
    return NextResponse.json({ error: a.dateInPast }, { status: 400 });
  }
  if (tripEnd > forecastEnd) {
    return NextResponse.json({ error: a.dateBeyondForecast }, { status: 400 });
  }

  const poiCatalog = candidates.slice(0, 28);
  const catalogPoiIds = new Set(candidates.map((p) => p.id));

  try {
    const [weather, roads] = await Promise.all([
      fetchWeatherForTripDates({
        lat: region.centerLat,
        lng: region.centerLng,
        startDate: input.startDate,
        endDate: tripEnd,
        locale,
      }),
      fetchRoadSummary(regionTitle(region, locale), locale),
    ]);

    const ai = await generateWithOpenAI({
      input,
      region,
      locale,
      poiCatalog,
      weatherSummary: `${weather.summary} ${weather.tripContext}`,
      roadSummary: roads.summary,
      weatherDaily: weather.daily,
    });

    const isEmptyItinerary = (p: ItineraryPayload | null | undefined) =>
      !p?.days?.length || p.days.every((d) => !d.blocks?.length);

    let itinerary: ItineraryPayload;
    let usedOpenAI = false;
    let model: string | undefined;

    const upstreamDebug =
      process.env.OPENAI_DEBUG === "1"
        ? ai.ok === false
          ? [ai.stage, ai.detail].filter(Boolean).join(" · ").slice(0, 600)
          : ai.ok && isEmptyItinerary(ai.payload)
            ? "empty_itinerary_from_model"
            : undefined
        : undefined;

    if (ai.ok && !isEmptyItinerary(ai.payload)) {
      itinerary = sanitizeAiItinerary(ai.payload, catalogPoiIds);
      if (process.env.OPENAI_SKIP_OFFICIAL_URL_CHECK !== "1") {
        itinerary = await stripDeadCustomPlaceOfficialUrls(itinerary);
      }
      usedOpenAI = true;
      model = ai.model;
    } else {
      if (!ai.ok) {
        console.warn("[api/generate] OpenAI path failed:", ai.stage, ai.detail ?? "");
      } else {
        console.warn("[api/generate] OpenAI returned empty itinerary");
      }
      itinerary = buildFallbackItinerary(input, candidates, locale, weather.daily);
    }

    const docHubs = getDocHubsForRegion(region.id, locale);
    const dayMapLinks = buildDayGoogleMapLinks(
      itinerary,
      input.mobility,
      input.regionId,
    );

    const hasApiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    const aiUnavailableReason: "no_api_key" | "upstream_failed" | undefined = usedOpenAI
      ? undefined
      : !hasApiKey
        ? "no_api_key"
        : "upstream_failed";

    const payload: GenerateResponse = {
      itinerary,
      tripDates: { startDate: input.startDate, endDate: tripEnd },
      docHubs,
      dayMapLinks,
      sources: collectSources(itinerary, locale),
      weather: {
        provider: weather.provider,
        summary: weather.summary,
        tripContext: weather.tripContext,
        daily: weather.daily,
        fetchedAt: weather.fetchedAt,
      },
      roads,
      safetyLinks: safetyLinksForRegion(region.id, locale),
      meta: {
        usedOpenAI,
        model,
        disclaimer: a.disclaimer,
        mobility: input.mobility,
        regionId: input.regionId,
        ...(aiUnavailableReason ? { aiUnavailableReason } : {}),
        ...(upstreamDebug ? { upstreamDebug } : {}),
      },
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[api/generate]", err);
    return NextResponse.json({ error: a.apiServerError }, { status: 500 });
  }
}
