import { cache } from "react";
import * as seed from "@/data/game";
import type { Achievement, Episode, Quest, Region, SkillBranch, Story } from "@/data/game";
import { prisma } from "@/lib/prisma";

export type Player = typeof seed.player;
export type MainQuest = typeof seed.mainQuest;
export type DailyCardItem = (typeof seed.dailyCardPool)[number];

export type GameContent = {
  player: Player;
  mainQuest: MainQuest;
  quests: Quest[];
  regions: Region[];
  skillTree: SkillBranch[];
  achievements: Achievement[];
  episodes: Episode[];
  stories: Story[];
  dailyCardPool: DailyCardItem[];
};

export type ContentSection = keyof GameContent;

export const CONTENT_SECTIONS: ContentSection[] = [
  "player",
  "mainQuest",
  "quests",
  "regions",
  "skillTree",
  "achievements",
  "episodes",
  "stories",
  "dailyCardPool",
];

const KEY_PREFIX = "content:";

export function defaultContent(): GameContent {
  return structuredClone({
    player: seed.player,
    mainQuest: seed.mainQuest,
    quests: seed.quests,
    regions: seed.regions,
    skillTree: seed.skillTree,
    achievements: seed.achievements,
    episodes: seed.episodes,
    stories: seed.stories,
    dailyCardPool: seed.dailyCardPool,
  });
}

export function isContentSection(s: string): s is ContentSection {
  return (CONTENT_SECTIONS as string[]).includes(s);
}

/** Admin edits stored in GameSetting override the defaults in src/data/game.ts, section by section. */
export const getContent = cache(async (): Promise<GameContent> => {
  const content = defaultContent();
  try {
    const rows = await prisma.gameSetting.findMany({ where: { key: { startsWith: KEY_PREFIX } } });
    for (const row of rows) {
      const section = row.key.slice(KEY_PREFIX.length);
      if (!isContentSection(section)) continue;
      try {
        (content as Record<string, unknown>)[section] = JSON.parse(row.value);
      } catch {
        /* keep default for a corrupted section */
      }
    }
  } catch {
    /* database unavailable: serve defaults */
  }
  return content;
});

export async function saveSection<K extends ContentSection>(section: K, value: GameContent[K]) {
  const json = JSON.stringify(value);
  await prisma.gameSetting.upsert({
    where: { key: KEY_PREFIX + section },
    create: { key: KEY_PREFIX + section, value: json },
    update: { value: json },
  });
}

export async function resetSection(section: ContentSection) {
  await prisma.gameSetting.deleteMany({ where: { key: KEY_PREFIX + section } });
}
