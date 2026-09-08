import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import type { GenerateResponse } from "@/lib/types";
import { displayBlockTitle, displayDayTheme } from "@/lib/itinerary-display";

const HELPER_ORIGIN = "http://127.0.0.1:1780";

/** 从行程生成更适合小红书的标题/正文/话题 */
export function buildXhsDraftFromItinerary(
  data: GenerateResponse,
  locale: AppLocale,
): { title: string; content: string; tags: string } {
  const t = messages[locale].result;
  const day0 = data.itinerary.days[0];
  const theme = day0
    ? displayDayTheme(day0, 1, locale, t.dayThemeNeutral)
    : t.title;
  const title =
    locale === "zh"
      ? theme.replace(/[【】[\]]/g, "").replace(/\s+/g, "").slice(0, 16)
      : theme.slice(0, 18);

  const lines: string[] = [];
  if (locale === "zh") {
    lines.push(`按这条线走就够了，不用再翻一堆攻略。`);
    lines.push("");
  } else {
    lines.push(`A runnable day—no 20-tab research spiral.`);
    lines.push("");
  }

  data.itinerary.days.slice(0, 3).forEach((d, idx) => {
    const n = idx + 1;
    const dayTheme = displayDayTheme(d, n, locale, t.dayThemeNeutral);
    lines.push(
      locale === "zh"
        ? `Day ${n} · ${dayTheme}`
        : `Day ${n} · ${dayTheme}`,
    );
    d.blocks.slice(0, 4).forEach((b) => {
      lines.push(`· ${b.startTime} ${displayBlockTitle(b, locale)}`);
    });
    lines.push("");
  });

  if (locale === "zh") {
    lines.push("天气路况出发前再核一遍。想要同款可执行路线，来 Take a Day Off。");
  } else {
    lines.push("Recheck weather/roads before you go. Built with Take a Day Off.");
  }

  const content = lines.join("\n").trim().slice(0, 900);
  const tags =
    locale === "zh"
      ? "新西兰,一日游,周末去哪,奥克兰周边,TakeADayOff"
      : "NewZealand,daytrip,weekend,TakeADayOff";

  return { title: title.slice(0, 20), content, tags };
}

export function buildHelperPublishUrl(draft: {
  title: string;
  content: string;
  tags: string;
}): string {
  const q = new URLSearchParams({
    title: draft.title,
    content: draft.content,
    tags: draft.tags,
  });
  return `${HELPER_ORIGIN}/?${q.toString()}`;
}

export { HELPER_ORIGIN };
