import type { WizardInput } from "@/lib/types";

/** 用户文本里常见「要刺激 / 要机动类项目」信号（中英） */
const THRILL_OR_OPERATOR_RE =
  /蹦极|跳伞|高空|秋千|越野|四驱|ATV|卡丁车|赛道|漂移|漂流|喷射|快艇|滑索|飞拉达|攀岩|室内跳伞|风洞|冒险|刺激|肾上腺素|极限|bungy|bungee|skydive|sky\s*dive|swing|kart|go-?kart|raceway|drift|4wd|4x4|quad|off-?road|jet\s*boat|rafting|zip\s*line|zipride|climbing\s*wall|indoor\s*sky|adrenaline|thrill|extreme/i;

/** 结果页「改一改」合并进 whereNotes 时的前缀（与 ResultClient 一致） */
const REGEN_TWEAK_MARKERS = /（希望调整：|\(Request:/;

/**
 * 是否应强烈鼓励模型混用目录外 customPlace（游乐运营商场地等）。
 */
export function openActivityBlendMode(input: WizardInput): "thrill" | "default" {
  if (input.styleTags.includes("adventure")) return "thrill";
  const notes = input.whereNotes?.trim() ?? "";
  if (notes && THRILL_OR_OPERATOR_RE.test(notes)) return "thrill";
  return "default";
}

/** 用户写了可读的补充/修改意见（不限于刺激类） */
export function hasSteeringWhereNotes(input: WizardInput): boolean {
  return (input.whereNotes?.trim().length ?? 0) >= 4;
}

/** 是否像「生成后再改一版」的追加说明 */
export function whereNotesLooksLikeRegenerateTweak(input: WizardInput): boolean {
  return REGEN_TWEAK_MARKERS.test(input.whereNotes ?? "");
}

/** 生成温度：有明确修改意见或刺激信号时略提高，避免总套同一批目录点 */
export function modelCreativityTemperature(input: WizardInput): number {
  if (openActivityBlendMode(input) === "thrill") return 0.55;
  if (hasSteeringWhereNotes(input)) return 0.5;
  return 0.42;
}
