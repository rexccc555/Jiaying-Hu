/** 结果页展示 Auckland Transport 行程规划（仅奥克兰都会区相关区域） */
const AUCKLAND_TRANSIT_REGION_IDS = new Set([
  "auckland-central",
  "waitakere-west",
  "north-shore",
  "waiheke",
  "matakana-coast",
]);

export function usesAucklandTransit(regionId: string | undefined): boolean {
  if (!regionId) return false;
  return AUCKLAND_TRANSIT_REGION_IDS.has(regionId);
}
