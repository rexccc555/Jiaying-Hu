import { getPoiById } from "@/data/pois";
import { getRegionById } from "@/data/regions";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { parseSavedTripPayload } from "@/lib/saved-trip-payload";
import type { GenerateResponse, WizardInput } from "@/lib/types";
import { regionTitle } from "@/lib/region-display";
import { NZ_OPEN_REGION_ID } from "@/lib/wizard-constants";

function inferDurationKey(days: number): WizardInput["duration"] {
  if (days <= 1) return "day";
  if (days === 2) return "2d1n";
  return "3d2n";
}

function firstPoiRegionId(g: GenerateResponse): string | null {
  for (const day of g.itinerary.days ?? []) {
    for (const b of day.blocks ?? []) {
      if (b.poiTemplateId) {
        const p = getPoiById(b.poiTemplateId);
        if (p) return p.regionId;
      }
    }
  }
  return null;
}

/** 账户列表：从存档解析「目的地 + 时长 + 旅行计划」标题（随界面语言显示区域名） */
export function savedTripListLabel(payloadJson: string, uiLocale: AppLocale): string {
  const t = messages[uiLocale].accountPage;
  let parsed;
  try {
    parsed = parseSavedTripPayload(payloadJson);
  } catch {
    return t.tripListFallback;
  }
  const g = parsed.generateResponse;
  const w = parsed.wizardPayload;

  const regionId = w?.regionId ?? g.meta?.regionId ?? firstPoiRegionId(g) ?? NZ_OPEN_REGION_ID;
  const region = getRegionById(regionId);
  const regionName = region ? regionTitle(region, uiLocale) : t.tripListUnknownRegion;

  const durKey = w?.duration ?? inferDurationKey(g.itinerary.days?.length ?? 1);
  const durEntry = messages[uiLocale].wizard.duration.find((x) => x.id === durKey);
  const durLabel = durEntry?.label ?? String(durKey);

  if (regionId === NZ_OPEN_REGION_ID && w?.whereNotes?.trim()) {
    const full = w.whereNotes.trim();
    const snip = full.slice(0, 18);
    const more = full.length > 18 ? "…" : "";
    return `${regionName} · ${snip}${more} · ${durLabel} · ${t.tripListPlanSuffix}`;
  }

  return `${regionName} · ${durLabel} · ${t.tripListPlanSuffix}`;
}
