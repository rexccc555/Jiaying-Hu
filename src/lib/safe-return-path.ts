import type { AppLocale } from "@/i18n/config";

/** 与结果页 `RegisterSaveCard` 的 `id` 一致，用于从条款页锚点返回 */
const RESULT_REGISTER_FRAGMENT = "register-save";

/**
 * 仅允许当前语言下的站内路径，避免开放重定向。
 * 含 `#` 时：仅允许 `/{locale}/result#register-save`。
 */
export function safeInternalReturnPath(
  locale: AppLocale,
  value: string | string[] | undefined,
): string | null {
  if (value == null || Array.isArray(value)) return null;
  const raw = value.trim();
  if (!raw.startsWith("/") || raw.includes("//") || raw.includes("..")) return null;
  const lower = raw.toLowerCase();
  if (lower.startsWith("http:") || lower.startsWith("https:") || lower.includes("\\")) {
    return null;
  }

  const hashIdx = raw.indexOf("#");
  const pathWithQuery = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
  const fragment = hashIdx >= 0 ? raw.slice(hashIdx + 1) : "";
  const pathOnly = pathWithQuery.split("?")[0] ?? pathWithQuery;

  if (!pathOnly.startsWith(`/${locale}/`) && pathOnly !== `/${locale}`) return null;

  if (fragment) {
    if (pathOnly !== `/${locale}/result` || fragment !== RESULT_REGISTER_FRAGMENT) return null;
    return `${pathOnly}#${fragment}`;
  }

  return pathOnly;
}
