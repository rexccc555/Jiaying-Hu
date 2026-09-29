import {
  achievements,
  player,
  quests,
  regions,
  type Quest,
  type StatKey,
} from "@/data/game";

/** 升到下一级所需的累计经验值：LEVEL_XP[i] = 到达 Lv.(i+1) 所需总 XP */
const LEVEL_XP = [0, 500, 1200, 2200, 3500, 5000, 7000, 9500, 12500, 16000, 20000];

export const LEVEL_TITLES = [
  "新手村居民",
  "新手村居民",
  "奥克兰见习生",
  "奥克兰探索者",
  "北岛冒险家",
  "开放世界旅人",
  "老练玩家",
  "地图制霸者",
  "人生副本通关者",
  "传说玩家",
  "满级玩家",
];

export function levelFromXp(totalXp: number) {
  let level = 1;
  for (let i = 1; i < LEVEL_XP.length; i += 1) {
    if (totalXp >= LEVEL_XP[i]!) level = i + 1;
  }
  const maxed = level >= LEVEL_XP.length;
  const floor = LEVEL_XP[level - 1] ?? 0;
  const next = LEVEL_XP[level] ?? floor;
  return {
    level,
    maxed,
    into: totalXp - floor,
    need: maxed ? 0 : next - floor,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)] ?? player.title,
  };
}

export function getProgress() {
  const done = quests.filter((q) => q.status === "done");
  const failed = quests.filter((q) => q.status === "failed");
  const totalXp = done.reduce((sum, q) => sum + q.xp, 0);
  const lv = levelFromXp(totalXp);

  const stats = Object.fromEntries(
    (Object.keys(player.stats) as StatKey[]).map((key) => {
      const base = player.stats[key].value;
      const gained = done.reduce((sum, q) => sum + (q.statGain?.[key] ?? 0), 0);
      return [key, { label: player.stats[key].label, value: Math.min(100, base + gained) }];
    }),
  ) as Record<StatKey, { label: string; value: number }>;

  const unlockedRegions = regions.filter((r) => r.unlocked).length;

  return {
    totalXp,
    ...lv,
    stats,
    completed: done.length,
    failed: failed.length,
    mapPercent: Math.round((unlockedRegions / regions.length) * 100),
    unlockedRegions,
    totalRegions: regions.length,
    achievementsUnlocked: achievements.filter((a) => a.unlocked).length,
    achievementsTotal: achievements.length,
  };
}

export function serverDay(now = new Date()): number {
  const start = new Date(`${player.launchDate}T00:00:00+12:00`).getTime();
  return Math.floor((now.getTime() - start) / 86_400_000) + 1;
}

export const QUEST_STATUS_LABEL: Record<Quest["status"], string> = {
  todo: "待挑战",
  active: "进行中",
  done: "已完成",
  failed: "挑战失败",
};

export const QUEST_KIND_LABEL: Record<Quest["kind"], string> = {
  main: "主线",
  side: "支线",
  viewer: "观众任务",
  daily: "每日",
};

export function stars(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}
