import { getPoiById } from "@/data/pois";
import type { AppLocale } from "@/i18n/config";
import type { ItineraryBlock, ItineraryDay } from "@/lib/types";
import { poiTitle } from "@/lib/poi-display";

const CJK = /[\u4e00-\u9fff]/;

/** 结果页：站点标题随界面语言使用目录英文名（如有 POI id） */
export function displayBlockTitle(block: ItineraryBlock, locale: AppLocale): string {
  if (block.poiTemplateId) {
    const p = getPoiById(block.poiTemplateId);
    if (p) return poiTitle(p, locale);
  }
  if (block.customPlace?.name?.trim()) return block.customPlace.name.trim();
  return block.title;
}

/** 英文界面若主题为中文生成，改为中性「第 n 天」式标题，避免夹杂看不懂的文案 */
export function displayDayTheme(
  day: ItineraryDay,
  dayNum: number,
  locale: AppLocale,
  neutralTemplate: string,
): string {
  const theme = day.theme?.trim() ?? "";
  if (!theme) return neutralTemplate.replace("{n}", String(dayNum));
  if (locale === "en" && CJK.test(theme)) {
    return neutralTemplate.replace("{n}", String(dayNum));
  }
  return theme;
}

export function displayRainPlanTitle(
  rain: { title: string; poiTemplateId?: string },
  locale: AppLocale,
): string {
  if (rain.poiTemplateId) {
    const p = getPoiById(rain.poiTemplateId);
    if (p) return poiTitle(p, locale);
  }
  return rain.title;
}

/**
 * 站点说明：英文界面下若为中文长叙述，用简短提示替代（名称已在上方用目录英文化）。
 */
export function displayBlockNotes(
  block: ItineraryBlock,
  locale: AppLocale,
  replacementWhenAiOtherLang: string,
): string | null {
  const raw = block.notes?.trim();
  if (!raw) return null;
  if (locale === "en" && CJK.test(raw)) {
    return replacementWhenAiOtherLang;
  }
  return raw;
}
