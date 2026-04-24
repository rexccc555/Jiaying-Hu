import type { ItineraryBlock, ItineraryCustomPlace, ItineraryPayload } from "@/lib/types";

/** 允许 GPT 自定义站点的粗略范围（新西兰主体，不含离岛领地） */
const CUSTOM_LAT_MIN = -47.4;
const CUSTOM_LAT_MAX = -34.0;
const CUSTOM_LNG_MIN = 166.25;
const CUSTOM_LNG_MAX = 178.75;

function toFiniteNumber(x: unknown): number | undefined {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const n = parseFloat(x.trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function parseCustomPlace(raw: unknown): ItineraryCustomPlace | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const name =
    typeof o.name === "string"
      ? o.name.trim()
      : typeof o.title === "string"
        ? o.title.trim()
        : "";
  if (!name || name.length > 140) return undefined;

  const lat = toFiniteNumber(o.lat);
  const lng = toFiniteNumber(o.lng);
  if (lat === undefined || lng === undefined) return undefined;
  if (lat < CUSTOM_LAT_MIN || lat > CUSTOM_LAT_MAX) return undefined;
  if (lng < CUSTOM_LNG_MIN || lng > CUSTOM_LNG_MAX) return undefined;

  let officialUrl: string | undefined;
  const rawUrl = o.officialUrl ?? o.url;
  if (typeof rawUrl === "string") {
    const u = rawUrl.trim();
    if (u.startsWith("https://") && u.length <= 512 && !/\s/.test(u)) {
      try {
        const host = new URL(u).hostname;
        if (host.length >= 3 && !host.endsWith(".") && !host.startsWith(".")) officialUrl = u;
      } catch {
        /* ignore invalid URL */
      }
    }
  }

  return { name, lat, lng, ...(officialUrl ? { officialUrl } : {}) };
}

function sanitizeBlock(b: ItineraryBlock, validPoiIds: Set<string>): ItineraryBlock {
  let poiTemplateId = b.poiTemplateId;
  if (poiTemplateId && !validPoiIds.has(poiTemplateId)) {
    poiTemplateId = undefined;
  }

  let customPlace = parseCustomPlace(b.customPlace);
  if (poiTemplateId) {
    customPlace = undefined;
  }

  let rainPlan = b.rainPlan;
  if (rainPlan?.poiTemplateId && !validPoiIds.has(rainPlan.poiTemplateId)) {
    rainPlan = undefined;
  }

  return {
    ...b,
    poiTemplateId,
    customPlace,
    rainPlan,
  };
}

/** 丢弃模型幻觉的 poi id；校验自定义坐标；目录内 POI 优先于 customPlace */
export function sanitizeAiItinerary(
  payload: ItineraryPayload,
  validPoiIds: Set<string>,
): ItineraryPayload {
  return {
    ...payload,
    days: payload.days.map((d) => ({
      ...d,
      blocks: d.blocks.map((b) => sanitizeBlock(b, validPoiIds)),
    })),
  };
}
