import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import type { GenerateResponse } from "@/lib/types";

/** 根据新旧行程差异生成对用户可见的「本次改动」要点（用于「改一改」成功后说明） */
export function buildAdjustSummaryLines(
  prev: GenerateResponse,
  next: GenerateResponse,
  locale: AppLocale,
): string[] {
  const t = messages[locale].result;
  const lines: string[] = [];
  const pt = prev.itinerary;
  const nt = next.itinerary;

  if (pt.days.length !== nt.days.length) {
    lines.push(
      t.adjustSummaryDayCount.replace("{old}", String(pt.days.length)).replace("{new}", String(nt.days.length)),
    );
  }

  const maxDays = Math.max(pt.days.length, nt.days.length);
  for (let i = 0; i < maxDays; i++) {
    const pd = pt.days[i];
    const nd = nt.days[i];
    if (pd && nd && pd.theme !== nd.theme) {
      lines.push(
        t.adjustSummaryTheme
          .replace("{day}", String(i + 1))
          .replace("{old}", pd.theme)
          .replace("{new}", nd.theme),
      );
    }
    const pb = pd?.blocks ?? [];
    const nb = nd?.blocks ?? [];
    const maxB = Math.max(pb.length, nb.length);
    for (let j = 0; j < maxB; j++) {
      const a = pb[j];
      const b = nb[j];
      if (a && b && a.title !== b.title) {
        lines.push(
          t.adjustSummaryStop
            .replace("{day}", String(i + 1))
            .replace("{n}", String(j + 1))
            .replace("{old}", a.title)
            .replace("{new}", b.title),
        );
      } else if (!a && b) {
        lines.push(t.adjustSummaryAdded.replace("{day}", String(i + 1)).replace("{title}", b.title));
      } else if (a && !b) {
        lines.push(t.adjustSummaryRemoved.replace("{title}", a.title));
      }
    }
  }

  return lines.slice(0, 14);
}
