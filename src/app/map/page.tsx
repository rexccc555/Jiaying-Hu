import type { Metadata } from "next";
import { quests, regions, stories } from "@/data/game";
import { getProgress } from "@/lib/game";
import { SectionTitle } from "@/components/ui";
import { WorldMap } from "./WorldMap";

export const metadata: Metadata = { title: "开放世界地图" };

export default function MapPage() {
  const p = getProgress();
  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-8">
      <SectionTitle
        kicker={`WORLD MAP · ${p.unlockedRegions}/${p.totalRegions}`}
        title="开放世界地图：奥克兰服务器"
        desc={`已探索 ${p.mapPercent}%。玩家在惠灵顿山醒来，其他地方都还在战争迷雾里。每去一个新地方，迷雾就被驱散一块。`}
      />
      <WorldMap regions={regions} quests={quests} stories={stories} />
    </main>
  );
}
