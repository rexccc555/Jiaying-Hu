import { getPoiById } from "@/data/pois";
import type { ItineraryBlock } from "@/lib/types";

export type ResolvedMapPlace = {
  lat: number;
  lng: number;
  name: string;
  regionId: string;
  googlePlaceId?: string;
};

/** 用于单点地图链接与驾车途经点：目录 POI 优先，否则用已校验的 customPlace */
export function resolveBlockPrimaryPlace(
  block: ItineraryBlock,
  fallbackRegionId: string,
): ResolvedMapPlace | null {
  const p = block.poiTemplateId ? getPoiById(block.poiTemplateId) : undefined;
  if (p && Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
    return {
      lat: p.lat,
      lng: p.lng,
      name: p.name,
      regionId: p.regionId,
      googlePlaceId: p.googlePlaceId,
    };
  }
  const c = block.customPlace;
  if (c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && c.name?.trim()) {
    return {
      lat: c.lat,
      lng: c.lng,
      name: c.name.trim(),
      regionId: fallbackRegionId,
    };
  }
  return null;
}
