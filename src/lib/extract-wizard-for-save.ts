import type { GenerateResponse, WizardInput } from "@/lib/types";
import { wizardInputSchema } from "@/lib/types";

/**
 * 优先用请求体里的 wizardPayload；否则用生成结果中的 requestSnapshot（/api/generate 回显）。
 * 这样即使用户清过 sessionStorage，仍能把当时的选择写入已保存行程。
 */
export function extractWizardForPersist(
  generateResponse: GenerateResponse,
  rawWizard: unknown | undefined,
): WizardInput | null {
  if (rawWizard !== undefined && rawWizard !== null) {
    const w = wizardInputSchema.safeParse(rawWizard);
    if (w.success) return w.data;
  }
  if (generateResponse.requestSnapshot) {
    const w = wizardInputSchema.safeParse(generateResponse.requestSnapshot);
    if (w.success) return w.data;
  }
  return null;
}
