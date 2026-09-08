import type { ItineraryBlock, ItineraryDay, ItineraryPayload } from "@/lib/types";
import { isLikelyReachableHttpsUrl } from "@/lib/url-reachability";

async function stripBlockOfficialUrlIfDead(b: ItineraryBlock): Promise<ItineraryBlock> {
  const url = b.customPlace?.officialUrl;
  if (!url) return b;
  const ok = await isLikelyReachableHttpsUrl(url);
  if (ok) return b;
  return {
    ...b,
    customPlace: b.customPlace ? { ...b.customPlace, officialUrl: undefined } : undefined,
  };
}

async function stripDay(d: ItineraryDay): Promise<ItineraryDay> {
  return {
    ...d,
    blocks: await Promise.all(d.blocks.map((b) => stripBlockOfficialUrlIfDead(b))),
  };
}

/** 去掉无法访问的 customPlace.officialUrl，避免页面上出现死链 */
export async function stripDeadCustomPlaceOfficialUrls(payload: ItineraryPayload): Promise<ItineraryPayload> {
  try {
    return {
      ...payload,
      days: await Promise.all(payload.days.map((d) => stripDay(d))),
    };
  } catch (err) {
    console.error("[stripDeadCustomPlaceOfficialUrls]", err);
    return payload;
  }
}
