import type { WizardInput } from "@/lib/types";

/** 新西兰太平洋/奥克兰日历日 YYYY-MM-DD */
export function todayIsoPacificAuckland(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addCalendarDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** 行程覆盖的日历天数：一日游=1，2D1N=2，3D2N=3 */
export function tripCalendarSpan(duration: WizardInput["duration"]): number {
  if (duration === "day") return 1;
  if (duration === "2d1n") return 2;
  return 3;
}

export function tripEndDateIso(start: string, duration: WizardInput["duration"]): string {
  return addCalendarDaysIso(start, tripCalendarSpan(duration) - 1);
}

function parseIsoUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetweenIsoInclusive(a: string, b: string): number {
  const diff = parseIsoUtc(b) - parseIsoUtc(a);
  return Math.floor(diff / 86400000) + 1;
}

/** Open-Meteo 免费预报约 16 天窗口：返回奥克兰「今天」起可预报的最后一日 YYYY-MM-DD */
export function maxForecastEndIso(): string {
  return addCalendarDaysIso(todayIsoPacificAuckland(), 15);
}

/** 预报窗口内允许选择的「行程首日」最晚一天（保证整段行程落在可预报区间内） */
export function maxStartDateForDuration(duration: WizardInput["duration"]): string {
  const maxEnd = maxForecastEndIso();
  return addCalendarDaysIso(maxEnd, -(tripCalendarSpan(duration) - 1));
}
