import { resolveBlockPrimaryPlace } from "@/lib/itinerary-block-map";
import type { ItineraryPayload } from "@/lib/types";
import type { WizardInput } from "@/lib/types";

export type PoiGoogleMapsPlace = {
  name: string;
  regionId: string;
  googlePlaceId?: string;
};

/**
 * 单点：Google Maps 搜索。
 * 使用精确坐标作 `query`，地图落在单图钉上，避免「名称搜索」出现多条结果让用户选。
 * 若配置了 `googlePlaceId`，附加 `query_place_id`（Google 推荐），侧栏更易显示为具体地点。
 */
export function poiGoogleMapsUrl(
  lat: number,
  lng: number,
  place?: PoiGoogleMapsPlace,
): string {
  const qCoord = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const params = new URLSearchParams();
  params.set("api", "1");
  params.set("query", qCoord);
  const pid = place?.googlePlaceId?.trim();
  if (pid) params.set("query_place_id", pid);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

/**
 * 仅自驾：Google Maps 整日驾车路线（不设置 origin → 从设备「我的位置」出发，途经点 + 终点）。
 * 公共交通不使用 Google 多日/多站链接：其 transit 模式对多途经点常无法算路。
 */
/** 驾车路线里给 Google 的地理后缀，与 POI regionId 对应 */
const REGION_DIR_SUFFIX: Record<string, string> = {
  "auckland-central": "Auckland, New Zealand",
  "north-shore": "North Shore, Auckland, New Zealand",
  "waitakere-west": "West Auckland, New Zealand",
  "waiheke": "Waiheke Island, New Zealand",
  "matakana-coast": "Matakana, New Zealand",
  northland: "Northland, New Zealand",
  "rotorua-lakes": "Rotorua, New Zealand",
  "taupo-central": "Taupo, New Zealand",
  "wellington-harbour": "Wellington, New Zealand",
  "nelson-tasman": "Nelson-Tasman, New Zealand",
  "christchurch-canterbury": "Christchurch, New Zealand",
  "mackenzie-basin": "Mackenzie Country, New Zealand",
  "queenstown-lakes": "Queenstown, New Zealand",
  fiordland: "Fiordland, New Zealand",
};

type DirStop = {
  lat: number;
  lng: number;
  name: string;
  regionId: string;
  googlePlaceId?: string;
};

function poiDirLabel(s: { name: string; regionId: string }): string {
  const suffix = REGION_DIR_SUFFIX[s.regionId] ?? "New Zealand";
  const n = s.name.trim();
  return n ? `${n}, ${suffix}` : suffix;
}

export function buildDayGoogleMapLinks(
  itinerary: ItineraryPayload,
  mobility: WizardInput["mobility"] | "no_car",
  /** 自定义站点在驾车 URL 里拼地区后缀时用（与向导所选区域一致） */
  mapRegionId: string = "auckland-central",
): { day: number; url: string }[] {
  if (mobility !== "car") return [];

  const out: { day: number; url: string }[] = [];

  for (const d of itinerary.days) {
    const stops: DirStop[] = [];
    for (const b of d.blocks) {
      const resolved = resolveBlockPrimaryPlace(b, mapRegionId);
      if (!resolved) continue;
      stops.push({
        lat: resolved.lat,
        lng: resolved.lng,
        name: resolved.name,
        regionId: resolved.regionId,
        googlePlaceId: resolved.googlePlaceId,
      });
    }

    const deduped: DirStop[] = [];
    for (const s of stops) {
      const prev = deduped[deduped.length - 1];
      if (prev && prev.lat === s.lat && prev.lng === s.lng) continue;
      deduped.push(s);
    }

    const url = buildGoogleDirUrlFromMyLocationStops(deduped);
    if (url) out.push({ day: d.day, url });
  }

  return out;
}

/**
 * 驾车整日路线：不设 origin（从「我的位置」出发）。
 * waypoints / destination 使用「名称 + 区域」便于侧栏显示地名；有 Place ID 时附加官方参数提高准确度。
 */
function buildGoogleDirUrlFromMyLocationStops(stops: DirStop[]): string {
  if (stops.length < 1) return "";

  const fmtCoord = (p: { lat: number; lng: number }) =>
    `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;

  /**
   * 驾车途经点/终点：无 Google Place ID 时必须用坐标字符串，否则 Google 会按「名称+城市」重新地理编码，
   * 图钉可能与模型给出的 lat/lng 不一致（用户看到偏差）。
   * 有 place_id 时仍用可读名称 + *_place_id 参数，侧栏显示更稳。
   */
  const stopQuery = (s: DirStop) => {
    if (s.googlePlaceId?.trim()) return poiDirLabel(s);
    return fmtCoord(s);
  };

  const params = new URLSearchParams();
  params.set("api", "1");
  params.set("travelmode", "driving");

  if (stops.length === 1) {
    const s = stops[0];
    params.set("destination", stopQuery(s));
    const dpid = s.googlePlaceId?.trim();
    if (dpid) params.set("destination_place_id", dpid);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  const middles = stops.slice(0, -1);
  const last = stops[stops.length - 1];

  params.set("destination", stopQuery(last));
  const destPid = last.googlePlaceId?.trim();
  if (destPid) params.set("destination_place_id", destPid);

  params.set("waypoints", middles.map(stopQuery).join("|"));

  const allMidsHavePid =
    middles.length > 0 &&
    middles.every((m) => Boolean(m.googlePlaceId?.trim()));
  if (allMidsHavePid) {
    params.set(
      "waypoint_place_ids",
      middles.map((m) => m.googlePlaceId!.trim()).join("|"),
    );
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
