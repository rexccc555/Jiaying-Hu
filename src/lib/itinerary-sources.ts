import { getPoiById } from "@/data/pois";
import type { AppLocale } from "@/i18n/config";
import { apiStrings } from "@/i18n/api-copy";
import type { ItineraryPayload } from "@/lib/types";
import { poiTitle } from "@/lib/poi-display";

/** 与 /api/generate 一致：来源链接列表随界面语言使用目录景点英文名 */
export function collectItinerarySources(
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
