import type { Metadata } from "next";
import type { Quest } from "@/data/game";
import { getContent } from "@/lib/content";
import { QUEST_KIND_LABEL, QUEST_STATUS_LABEL, stars } from "@/lib/game";
import { getCurrentRound, getRoundOptions } from "@/lib/rounds";
import { Panel, SectionTitle, Tag, type Tone } from "@/components/ui";
import { SubmitQuest } from "./SubmitQuest";
import { VotePanel } from "./VotePanel";

export const metadata: Metadata = { title: "任务大厅" };
export const revalidate = 60;

const STATUS_TONE: Record<Quest["status"], Tone> = {
  active: "cyan",
  todo: "slate",
  done: "lime",
  failed: "rose",
};

const ORDER: Quest["status"][] = ["active", "todo", "done", "failed"];

export default async function QuestsPage() {
  const round = await getCurrentRound();
  const options = await getRoundOptions(round.id);
  const { quests } = await getContent();
  const grouped = ORDER.map((s) => ({ status: s, items: quests.filter((q) => q.status === s) })).filter(
    (g) => g.items.length,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-8">
      <SectionTitle
        kicker={`QUEST BOARD · ${round.id}`}
        title={round.title}
        desc="由观众决定下一集挑战什么。每周只开放一轮，票数最高的任务会被拍进下一集，完成后在这里发布结算报告。"
      />
      <Panel glow>
        {options.length ? (
          <VotePanel roundId={round.id} closesAt={round.closesAt} options={options} />
        ) : (
          <p className="text-sm text-slate-400">本轮候选任务还在筛选中，先去下面给我派一个任务吧。</p>
        )}
      </Panel>

      <section className="mt-12">
        <SectionTitle kicker="SUBMIT" title="给我派一个任务" desc="投稿会经过筛选。危险、违法、侵犯他人隐私或成本过高的任务不会进入投票池。" />
        <Panel>
          <SubmitQuest />
        </Panel>
      </section>

      <section className="mt-12">
        <SectionTitle kicker="QUEST LOG" title="任务日志" desc="所有任务的状态。完成的任务会结算经验值。" />
        <div className="space-y-8">
          {grouped.map((g) => (
            <div key={g.status}>
              <p className="mb-3 text-sm font-semibold text-slate-300">
                {QUEST_STATUS_LABEL[g.status]} <span className="text-slate-500">({g.items.length})</span>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {g.items.map((q) => (
                  <Panel key={q.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-pixel text-[10px] text-slate-500">#{q.id}</span>
                      <Tag tone={STATUS_TONE[q.status]}>{QUEST_STATUS_LABEL[q.status]}</Tag>
                      <Tag>{QUEST_KIND_LABEL[q.kind]}</Tag>
                      <Tag>{q.zone}</Tag>
                      {q.episode ? <Tag tone="violet">{q.episode}</Tag> : null}
                    </div>
                    <p className="mt-2 font-semibold text-white">{q.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{q.desc}</p>
                    {q.result ? <p className="mt-2 text-sm text-lime-200">结算：{q.result}</p> : null}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-amber-300">{stars(q.difficulty)}</span>
                      <span className="flex items-center gap-3">
                        {q.date ? <span className="text-slate-500">{q.date}</span> : null}
                        {q.videoUrl ? (
                          <a href={q.videoUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                            看视频
                          </a>
                        ) : null}
                        <span className="font-pixel text-[10px] text-lime-300">+{q.xp} XP</span>
                      </span>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
