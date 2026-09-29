import type { Metadata } from "next";
import { achievements, stories, type Story } from "@/data/game";
import { Panel, SectionTitle, Tag, type Tone } from "@/components/ui";

export const metadata: Metadata = { title: "故事档案馆" };

const TYPE: Record<Story["type"], { label: string; tone: Tone }> = {
  announcement: { label: "公告", tone: "cyan" },
  story: { label: "冒险记录", tone: "lime" },
  fail: { label: "失败记录", tone: "rose" },
  update: { label: "版本更新", tone: "violet" },
};

export default function ArchivePage() {
  const sorted = [...stories].sort((a, b) => b.date.localeCompare(a.date));
  const normal = achievements.filter((a) => a.kind !== "fail");
  const fails = achievements.filter((a) => a.kind === "fail");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-8">
      <SectionTitle kicker="ARCHIVE" title="故事档案馆" desc="按时间线追溯玩家的人生故事。成功会记下来，失败也会。" />

      <ol className="relative space-y-4 border-l border-slate-700 pl-5">
        {sorted.map((s) => (
          <li key={s.id} className="relative">
            <span className="absolute -left-[26px] top-5 h-3 w-3 rounded-full border-2 border-cyan-400 bg-[#070b14]" />
            <Panel className="p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-pixel text-[10px] text-slate-500">{s.date}</span>
                <Tag tone={TYPE[s.type].tone}>{TYPE[s.type].label}</Tag>
                {s.episode ? <Tag tone="violet">{s.episode}</Tag> : null}
                {s.xp ? <span className="font-pixel text-[10px] text-lime-300">+{s.xp} XP</span> : null}
              </div>
              <h3 className="mt-2 text-lg font-bold text-white">{s.title}</h3>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-300">
                {s.body.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              {s.videoUrl ? (
                <a href={s.videoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-cyan-300 hover:underline">
                  看这一集 →
                </a>
              ) : null}
            </Panel>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <SectionTitle kicker="ACHIEVEMENTS" title="成就墙" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {normal.map((a) => (
            <AchievementCard key={a.id} title={a.title} desc={a.desc} unlocked={a.unlocked} date={a.date} tone="lime" />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle
          kicker="FAIL DEX"
          title="失败图鉴"
          desc="失败也能获得成就。这里收录玩家每一次翻车——社恐发作、半途而废、金币清零。"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fails.map((a) => (
            <AchievementCard key={a.id} title={a.title} desc={a.desc} unlocked={a.unlocked} date={a.date} tone="rose" />
          ))}
        </div>
      </section>
    </main>
  );
}

function AchievementCard({
  title,
  desc,
  unlocked,
  date,
  tone,
}: {
  title: string;
  desc: string;
  unlocked: boolean;
  date?: string;
  tone: "lime" | "rose";
}) {
  const on = tone === "lime" ? "border-lime-400/50 bg-lime-400/10" : "border-rose-400/50 bg-rose-400/10";
  return (
    <div className={`rounded-xl border p-4 ${unlocked ? on : "border-slate-800 bg-slate-900/50"}`}>
      <p className="text-lg">{unlocked ? (tone === "lime" ? "🏆" : "💀") : "🔒"}</p>
      <p className={`mt-2 font-semibold ${unlocked ? "text-white" : "text-slate-500"}`}>{unlocked ? title : "？？？"}</p>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
      {unlocked && date ? <p className="mt-2 font-pixel text-[9px] text-slate-500">{date}</p> : null}
    </div>
  );
}
