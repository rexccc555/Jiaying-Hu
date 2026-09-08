import { POI_LOCALE } from "@/data/poi-locale";
import type { PoiTemplate } from "@/lib/types";
import type { AppLocale } from "@/i18n/config";

export function poiTitle(poi: PoiTemplate, locale: AppLocale): string {
  if (locale === "en") {
    return POI_LOCALE[poi.id]?.titleEn ?? poi.name;
  }
  return poi.name;
}

export function poiSeasonLine(poi: PoiTemplate, locale: AppLocale): string | undefined {
  if (!poi.seasonNotes) return undefined;
  if (locale === "en") {
    return POI_LOCALE[poi.id]?.seasonEn ?? poi.seasonNotes;
  }
  return poi.seasonNotes;
}
