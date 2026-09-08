export type WizardIntent = "local" | "visitor" | "unset";

/** 仅当 URL 含 `intent=local` 或 `intent=visitor` 时确定类型；否则先让用户选择（不默认游客）。 */
export function parseWizardIntent(v: string | null | undefined): WizardIntent {
  if (v === "local") return "local";
  if (v === "visitor") return "visitor";
  return "unset";
}
