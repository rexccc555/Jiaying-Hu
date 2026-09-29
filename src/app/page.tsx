import Link from "next/link";
import { episodes, mainQuest, player, quests, voteRound } from "@/data/game";
import { getProgress, QUEST_STATUS_LABEL, serverDay, stars } from "@/lib/game";
import { Counter, Kicker, Panel, PixelAvatar, SectionTitle, StatBar, Tag, XpBar } from "@/components/ui";

export const revalidate = 3600;

const EP_STATUS = {
  released: { label: "已上线", tone: "lime" },
  filming: { label: "拍摄中", tone: "amber" },
  planned: { label: "未解锁", tone: "slate" },
} as const;

export default function LobbyPage() {
  const p = getProgress();
  const day = serverDay();
  const currentQuests = quests.filter((q) => q.episode === "EP01");
  const mqPct = Math.round((mainQuest.current / mainQuest.target) * 100);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-6">
      <p className="flex items-center gap-2 text-xs text-lime-300">
        <span className="status-dot" />
        服务器运行中 · {player.server} · {day >= 1 ? `开服第 ${day} 天` : `距离开服 ${1 - day} 天`}
      </p>

      <section className="mt-6">
        <p className="font-pixel text-2xl leading-tight text-white sm:text-4xl">
          LIFE: <span className="text-lime-300">NEW GAME</span>
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">人生重新开服</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
          如果人生没动力，那就把自己当成游戏角色。
          <br className="hidden sm:block" />
          一个普通人在新西兰的真人开放世界游戏——我负责真实生活，你负责见证，甚至决定我下一步挑战什么。
        </p>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel glow>
          <div className="flex items-center gap-4">
            <PixelAvatar src={player.avatar} size={76} />
            <div className="min-w-0">
              <p className="font-pixel text-[11px] text-cyan-300">
                LV.{String(p.level).padStart(2, "0")} · {p.title}
              </p>
              <p className="mt-1.5 truncate text-xl font-bold text-white">{player.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">所在地：{player.server}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{player.bio}</p>
          <div className="mt-5">
            <XpBar into={p.into} need={p.need} maxed={p.maxed} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Counter value={p.completed} label="已完成任务" />
            <Counter value={`${p.mapPercent}%`} label="地图探索" />
            <Counter value={p.achievementsUnlocked} label="已解锁成就" />
            <Counter value={`${player.streakDays}天`} label="连续登录" />
          </div>
        </Panel>

        <Panel>
          <Kicker>ATTRIBUTES</Kicker>
          <h2 className="mt-2 text-lg font-bold text-white">属性面板</h2>
          <div className="mt-4 space-y-4">
            {Object.values(p.stats).map((s) => (
              <StatBar key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            每日规则：完成现实世界里的挑战，积累经验，解锁更高等级。失败不扣等级，但会进图鉴。
          </p>
        </Panel>
      </div>

      <Panel className="mt-4 border-lime-400/30">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="lime">进行中</Tag>
          <span className="font-pixel text-[10px] text-slate-400">主线任务 {mainQuest.id}</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold text-white">{mainQuest.title}</h2>
        <p className="mt-2 text-sm text-slate-400">{mainQuest.desc}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-sm bg-slate-800">
            <div className="h-full bg-lime-400" style={{ width: `${Math.max(mqPct, 1)}%` }} />
          </div>
          <span className="font-pixel text-[11px] text-lime-300">
            {mainQuest.current} / {mainQuest.target}
            {mainQuest.unit}
          </span>
        </div>
      </Panel>

      <section className="mt-12">
        <SectionTitle kicker="EP01 · MISSIONS" title="本集任务清单" desc="第一集：今天，我决定重新开始练级。" />
        <div className="grid gap-3 sm:grid-cols-2">
          {currentQuests.map((q) => (
            <Panel key={q.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel text-[10px] text-slate-500">MISSION {q.id}</span>
                <Tag tone={q.status === "done" ? "lime" : q.status === "active" ? "cyan" : q.status === "failed" ? "rose" : "slate"}>
                  {QUEST_STATUS_LABEL[q.status]}
                </Tag>
              </div>
              <p className="mt-2 font-semibold text-white">{q.title}</p>
              <p className="mt-1 text-sm text-slate-400">{q.desc}</p>
              <p className="mt-3 flex items-center justify-between text-xs">
                <span className="text-amber-300">{stars(q.difficulty)}</span>
                <span className="font-pixel text-[10px] text-lime-300">+{q.xp} XP</span>
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle kicker="STORY MODE" title="剧情章节" desc="抖音是剧情，网站是游戏大厅。每一集对应一次存档。" />
        <div className="space-y-3">
          {episodes.map((ep) => {
            const st = EP_STATUS[ep.status];
            const inner = (
              <Panel className={`p-4 ${ep.status === "planned" ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[11px] text-cyan-300">{ep.id}</span>
                  <Tag tone={st.tone}>{st.label}</Tag>
                </div>
                <p className="mt-2 font-semibold text-white">{ep.title}</p>
                <p className="mt-1 text-sm text-slate-400">{ep.summary}</p>
              </Panel>
            );
            return ep.videoUrl ? (
              <a key={ep.id} href={ep.videoUrl} target="_blank" rel="noreferrer" className="block hover:opacity-90">
                {inner}
              </a>
            ) : (
              <div key={ep.id}>{inner}</div>
            );
          })}
        </div>
      </section>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Panel glow>
          <Kicker>VOTE · {voteRound.id}</Kicker>
          <h2 className="mt-2 text-lg font-bold text-white">由你决定下一集挑战什么</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
            {voteRound.options.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span>
                  <span className="text-slate-500">[{o.zone}]</span> {o.title}
                </span>
                <span className="shrink-0 font-pixel text-[10px] text-lime-300">+{o.xp}</span>
              </li>
            ))}
          </ul>
          <Link href="/quests" className="btn-primary mt-5 w-full">
            进入任务大厅投票 →
          </Link>
        </Panel>
        <Panel>
          <Kicker>NEW PLAYER</Kicker>
          <h2 className="mt-2 text-lg font-bold text-white">你也可以开一个号</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            领一张属于你的每日新手任务卡。完成一件小事，给自己的人生也加一点经验值。
          </p>
          <Link href="/card" className="btn-ghost mt-5 w-full">
            领取今日任务卡
          </Link>
        </Panel>
      </div>

      <section className="mt-12">
        <SectionTitle kicker="HOW IT WORKS" title="游戏规则" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "奥克兰是第一张地图", d: "从惠灵顿山出发。街道、海边、草坪、超市，都是副本，去过的地方会从战争迷雾里被点亮。" },
            { t: "生活是任务", d: "每件现实里的小事都是一个任务，完成才结算经验值。不刷，不演。" },
            { t: "失败也算数", d: "失败有专门的图鉴和成就。你看到的是一个普通人真实的变化，而不是永远成功的人设。" },
          ].map((x) => (
            <Panel key={x.t} className="p-4">
              <p className="font-semibold text-white">{x.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{x.d}</p>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
