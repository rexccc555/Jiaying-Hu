import type { Region } from "@/lib/types";
import type { WizardIntent } from "@/lib/wizard-intent";

/** 本地向导：奥克兰日常半径优先 */
const LOCAL_AUCKLAND_NEAR = [
  "auckland-central",
  "waitakere-west",
  "north-shore",
  "waiheke",
  "matakana-coast",
] as const;

const LOCAL_NORTH_OTHER = [
  "northland",
  "rotorua-lakes",
  "taupo-central",
  "wellington-harbour",
] as const;

const LOCAL_SOUTH = [
  "nelson-tasman",
  "christchurch-canterbury",
  "mackenzie-basin",
  "queenstown-lakes",
  "fiordland",
] as const;

/** 游客向导：按岛与由北向南浏览 */
const VISITOR_NORTH = [
  "northland",
  "auckland-central",
  "waitakere-west",
  "north-shore",
  "waiheke",
  "matakana-coast",
  "rotorua-lakes",
  "taupo-central",
  "wellington-harbour",
] as const;

const VISITOR_SOUTH = [
  "nelson-tasman",
  "christchurch-canterbury",
  "mackenzie-basin",
  "queenstown-lakes",
  "fiordland",
] as const;

function orderByIdList(regions: Region[], order: readonly string[]): Region[] {
  const byId = new Map(regions.map((r) => [r.id, r]));
  const out: Region[] = [];
  for (const id of order) {
    const r = byId.get(id);
    if (r) out.push(r);
  }
  for (const r of regions) {
    if (!out.includes(r)) out.push(r);
  }
  return out;
}

export function orderRegionsForWizardIntent(regions: Region[], intent: WizardIntent): Region[] {
  if (intent === "local") {
    return orderByIdList(regions, [...LOCAL_AUCKLAND_NEAR, ...LOCAL_NORTH_OTHER, ...LOCAL_SOUTH]);
  }
  return orderByIdList(regions, [...VISITOR_NORTH, ...VISITOR_SOUTH]);
}

export function regionSubgroupsForIntent(
  intent: WizardIntent,
  ordered: Region[],
): { key: string; regionIds: string[] }[] {
  const ids = new Set(ordered.map((r) => r.id));
  const pick = (list: readonly string[]) => list.filter((id) => ids.has(id));

  if (intent === "local") {
    return [
      { key: "localMetro", regionIds: pick(LOCAL_AUCKLAND_NEAR) },
      { key: "localNorth", regionIds: pick(LOCAL_NORTH_OTHER) },
      { key: "localSouth", regionIds: pick(LOCAL_SOUTH) },
    ].filter((g) => g.regionIds.length > 0);
  }

  return [
    { key: "visitorNorth", regionIds: pick(VISITOR_NORTH) },
    { key: "visitorSouth", regionIds: pick(VISITOR_SOUTH) },
  ].filter((g) => g.regionIds.length > 0);
}
