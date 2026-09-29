"use client";

import { useState } from "react";
import type { Quest, Region, Story } from "@/data/game";

type Props = { regions: Region[]; quests: Quest[]; stories: Story[] };

export function WorldMap({ regions, quests, stories }: Props) {
  const firstUnlocked = regions.find((r) => r.unlocked)?.id ?? regions[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstUnlocked);
  const active = regions.find((r) => r.id === activeId);
  const regionQuests = quests.filter((q) => q.regionId === activeId);
  const regionStories = stories.filter((s) => s.regionId === activeId);
  const earnedXp = regionQuests.filter((q) => q.status === "done").reduce((s, q) => s + q.xp, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div
        className="grid gap-1.5 rounded-xl border border-slate-700/60 bg-[#06121f] p-3"
        style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gridTemplateRows: "repeat(11, minmax(0, 44px))" }}
      >
        {regions.map((r) => {
          const selected = r.id === activeId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setActiveId(r.id)}
              style={{ gridRow: r.row, gridColumn: r.col }}
              className={`flex flex-col items-center justify-center rounded-md border px-0.5 text-center text-[10px] leading-tight transition sm:text-[11px] ${
                r.unlocked
                  ? "border-lime-400/60 bg-lime-400/20 text-lime-100 shadow-[0_0_14px_rgba(163,230,53,0.35)]"
                  : "fog border-slate-700 text-slate-500 hover:text-slate-300"
              } ${selected ? "ring-2 ring-cyan-300" : ""}`}
            >
              <span className="font-semibold">{r.unlocked ? r.name : "？？？"}</span>
            </button>
          );
        })}
      </div>

      <div className="panel">
        {active ? (
          <>
            <p className="font-pixel text-[10px] text-cyan-300">{active.nameEn.toUpperCase()}</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{active.unlocked ? active.name : "战争迷雾"}</h3>
            {active.unlocked ? (
              <>
                <p className="mt-1 text-sm text-slate-400">
                  {active.firstVisit ? `首次到达：${active.firstVisit}` : "已探索"}
                  {earnedXp ? ` · 在这里获得 ${earnedXp} XP` : ""}
                </p>
                {active.note ? <p className="mt-3 text-sm leading-relaxed text-slate-300">{active.note}</p> : null}
                <div className="mt-5">
                  <p className="text-xs font-semibold text-slate-400">这里的任务</p>
                  {regionQuests.length ? (
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {regionQuests.map((q) => (
                        <li key={q.id} className="flex justify-between gap-2">
                          <span className={q.status === "done" ? "text-lime-200" : "text-slate-300"}>
                            {q.status === "done" ? "✓ " : q.status === "failed" ? "✗ " : "· "}
                            {q.title}
                          </span>
                          <span className="shrink-0 font-pixel text-[10px] text-slate-500">+{q.xp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">暂无任务记录。</p>
                  )}
                </div>
                {regionStories.length ? (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400">发生过的故事</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
                      {regionStories.map((s) => (
                        <li key={s.id}>
                          <span className="text-slate-500">{s.date}</span> {s.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                这片区域还笼罩在迷雾中。玩家到达后，这里会显示当时的任务、视频、照片、花费和获得的经验值。
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
