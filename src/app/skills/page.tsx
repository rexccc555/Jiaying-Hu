import type { Metadata } from "next";
import { quests, skillTree, type SkillBranch, type SkillNode } from "@/data/game";
import { Panel, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "技能树" };

const COLOR: Record<SkillBranch["color"], { ring: string; text: string; line: string; fill: string }> = {
  cyan: { ring: "border-cyan-400", text: "text-cyan-300", line: "bg-cyan-400/50", fill: "bg-cyan-400/15" },
  lime: { ring: "border-lime-400", text: "text-lime-300", line: "bg-lime-400/50", fill: "bg-lime-400/15" },
  amber: { ring: "border-amber-400", text: "text-amber-300", line: "bg-amber-400/50", fill: "bg-amber-400/15" },
  rose: { ring: "border-rose-400", text: "text-rose-300", line: "bg-rose-400/50", fill: "bg-rose-400/15" },
  violet: { ring: "border-violet-400", text: "text-violet-300", line: "bg-violet-400/50", fill: "bg-violet-400/15" },
};

function nodeLabel(n: SkillNode) {
  if (n.status === "unlocked") return "已点亮";
  if (n.status === "active") return "修炼中";
  return "未解锁";
}

export default function SkillsPage() {
  const total = skillTree.reduce((s, b) => s + b.nodes.length, 0);
  const lit = skillTree.reduce((s, b) => s + b.nodes.filter((n) => n.status === "unlocked").length, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-8">
      <SectionTitle
        kicker={`SKILL TREE · ${lit}/${total}`}
        title="技能树"
        desc="生活不再是流水账，而是不断解锁的技能。每个节点都对应一个真实挑战。"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillTree.map((branch) => {
          const c = COLOR[branch.color];
          return (
            <Panel key={branch.id} className="p-4">
              <p className={`flex items-center gap-2 font-bold ${c.text}`}>
                <span className="text-xl">{branch.icon}</span>
                {branch.name}
              </p>
              <ol className="mt-4">
                {branch.nodes.map((n, i) => {
                  const q = n.questId ? quests.find((x) => x.id === n.questId) : undefined;
                  const locked = n.status === "locked";
                  return (
                    <li key={n.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {i < branch.nodes.length - 1 ? (
                        <span
                          className={`absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 ${locked ? "bg-slate-700" : c.line}`}
                          aria-hidden
                        />
                      ) : null}
                      <span
                        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 font-pixel text-[9px] ${
                          locked
                            ? "border-slate-700 bg-slate-900 text-slate-600"
                            : `${c.ring} ${n.status === "unlocked" ? c.fill : "bg-slate-900"} ${c.text}`
                        } ${n.status === "active" ? "animate-pulse" : ""}`}
                      >
                        {n.status === "unlocked" ? "✓" : i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${locked ? "text-slate-500" : "text-white"}`}>{n.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{n.desc}</p>
                        <p className="mt-1 text-[11px]">
                          <span className={locked ? "text-slate-600" : c.text}>{nodeLabel(n)}</span>
                          {q?.videoUrl ? (
                            <a href={q.videoUrl} target="_blank" rel="noreferrer" className="ml-2 text-cyan-300 hover:underline">
                              挑战视频
                            </a>
                          ) : null}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          );
        })}
      </div>
    </main>
  );
}
