export type WizardIntent = "local" | "visitor";

export function parseWizardIntent(v: string | null | undefined): WizardIntent {
  return v === "local" ? "local" : "visitor";
}
