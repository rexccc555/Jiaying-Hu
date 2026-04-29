import type { GenerateResponse, WizardInput } from "@/lib/types";

export type SavedTripEnvelopeV2 = {
  v: 2;
  generateResponse: GenerateResponse;
  /** 保存向导最后一次提交的选项（与 `/api/generate` 的 requestSnapshot 同源）；无则无法再生成（仅可浏览） */
  wizardPayload: WizardInput | null;
};

/** 存库时向导已单独保存，省略回显字段减小体积、避免与 wizardPayload 重复 */
function omitRequestSnapshot(g: GenerateResponse): GenerateResponse {
  if (!g.requestSnapshot) return g;
  const { requestSnapshot: _, ...rest } = g;
  return rest as GenerateResponse;
}

export function serializeSavedTripEnvelope(
  generateResponse: GenerateResponse,
  wizardPayload: WizardInput | null | undefined,
): string {
  const env: SavedTripEnvelopeV2 = {
    v: 2,
    generateResponse: omitRequestSnapshot(generateResponse),
    wizardPayload: wizardPayload ?? null,
  };
  return JSON.stringify(env);
}

export function parseSavedTripPayload(payloadJson: string): {
  generateResponse: GenerateResponse;
  wizardPayload: WizardInput | null;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payloadJson);
  } catch {
    throw new Error("INVALID_JSON");
  }
  if (
    parsed &&
    typeof parsed === "object" &&
    "v" in parsed &&
    (parsed as { v?: number }).v === 2 &&
    "generateResponse" in parsed
  ) {
    const env = parsed as SavedTripEnvelopeV2;
    return {
      generateResponse: env.generateResponse,
      wizardPayload: env.wizardPayload ?? null,
    };
  }
  return {
    generateResponse: parsed as GenerateResponse,
    wizardPayload: null,
  };
}
