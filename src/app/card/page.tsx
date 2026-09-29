import type { Metadata } from "next";
import { dailyCardPool } from "@/data/game";
import { SectionTitle } from "@/components/ui";
import { DailyCard } from "./DailyCard";

export const metadata: Metadata = { title: "领取你的新手任务卡" };

export default function CardPage() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-8 pt-8">
      <SectionTitle
        kicker="NEW PLAYER"
        title="你也可以重新开服"
        desc="看完我的人生游戏，也给自己开个号吧。每天一张新手任务卡，完成一件小事，给你的人生加一点经验值。"
      />
      <DailyCard pool={dailyCardPool} />
    </main>
  );
}
