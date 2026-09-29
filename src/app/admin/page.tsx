import type { Metadata } from "next";
import type { QuestSubmission } from "@prisma/client";
import { adminConfigured, isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getCurrentRound, getRoundOptions, isRoundClosed, SUBMISSION_OPTION_PREFIX } from "@/lib/rounds";
import { Panel, SectionTitle, Tag } from "@/components/ui";
import {
  createOwnTask,
  login,
  logout,
  moveToRound,
  removeFromRound,
  restoreSubmission,
  reviewSubmission,
  startNewRound,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "管理后台", robots: { index: false, follow: false } };

const ZONES = ["社交副本", "语言副本", "探索副本", "体力副本", "生存副本", "贵族副本", "隐藏任务", "观众任务"];

function nextWeek() {
  const d = new Date(Date.now() + 7 * 86_400_000);
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86_400_000 + start.getUTCDay() + 1) / 7);
  const closes = new Date(d.getTime() + 6 * 86_400_000).toISOString().slice(0, 10);
  return { id: `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`, closes };
}

function fmt(d: Date) {
  return d.toLocaleString("zh-CN", { timeZone: "Pacific/Auckland", hour12: false }).slice(0, 16);
}

type Props = { searchParams: Promise<{ e?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  if (!adminConfigured()) {
    return (
      <main className="mx-auto max-w-md px-4 pt-16">
        <Panel>
          <p className="text-white">后台还没有设置密码。</p>
          <p className="mt-2 text-sm text-slate-400">在 Netlify 环境变量里添加 ADMIN_PASSWORD，重新部署后即可登录。</p>
        </Panel>
      </main>
    );
  }

  if (!(await isAdmin())) {
    const { e } = await searchParams;
    return (
      <main className="mx-auto max-w-sm px-4 pt-16">
        <Panel glow>
          <p className="font-pixel text-[10px] text-cyan-300">ADMIN</p>
          <h1 className="mt-2 text-xl font-bold text-white">管理后台</h1>
          <form action={login} className="mt-4 space-y-3">
            <input name="password" type="password" required autoFocus className="input" placeholder="后台密码" />
            <button type="submit" className="btn-primary w-full">
              登录
            </button>
          </form>
          {e ? <p className="mt-3 text-sm text-rose-300">密码不对。</p> : null}
        </Panel>
      </main>
    );
  }

  const round = await getCurrentRound();
  const [options, votes, pending, pool, rejected] = await Promise.all([
    getRoundOptions(round.id),
    prisma.questVote.groupBy({ by: ["optionId"], where: { roundId: round.id }, _count: { _all: true } }),
    prisma.questSubmission.findMany({ where: { status: "pending" }, orderBy: { createdAt: "asc" }, take: 100 }),
    prisma.questSubmission.findMany({
      where: { status: "approved", OR: [{ roundId: null }, { roundId: { not: round.id } }] },
      orderBy: { reviewedAt: "desc" },
      take: 50,
    }),
    prisma.questSubmission.findMany({ where: { status: "rejected" }, orderBy: { reviewedAt: "desc" }, take: 20 }),
  ]);
  const counts = Object.fromEntries(votes.map((v) => [v.optionId, v._count._all]));
  const totalVotes = votes.reduce((s, v) => s + v._count._all, 0);
  const closed = isRoundClosed(round);
  const suggestion = nextWeek();
  const ranked = [...options].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-8">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="ADMIN" title="管理后台" desc="观众投稿先在这里审核，同意后才会进入投票。" />
        <form action={logout}>
          <button type="submit" className="btn-ghost">
            退出
          </button>
        </form>
      </div>

      <Panel glow>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold text-white">当前投票：{round.title}</p>
          <Tag tone={closed ? "rose" : "lime"}>{closed ? "已截止" : "进行中"}</Tag>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          第 {round.id} 轮 · 截止 {round.closesAt} · 共 {totalVotes} 票
        </p>
        {ranked.length ? (
          <ul className="mt-4 space-y-2">
            {ranked.map((o, i) => {
              const n = counts[o.id] ?? 0;
              const pct = totalVotes ? Math.round((n / totalVotes) * 100) : 0;
              const fromSubmission = o.id.startsWith(SUBMISSION_OPTION_PREFIX);
              return (
                <li key={o.id} className="relative overflow-hidden rounded-lg border border-slate-700 p-3">
                  <span className="absolute inset-y-0 left-0 bg-lime-400/10" style={{ width: `${pct}%` }} aria-hidden />
                  <div className="relative flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-white">
                      {i === 0 && n > 0 ? "👑 " : ""}
                      <span className="text-slate-500">[{o.zone}]</span> {o.title}
                    </span>
                    <span className="flex items-center gap-3 text-sm">
                      <span className="text-lime-300">
                        {n} 票 · {pct}%
                      </span>
                      {fromSubmission ? (
                        <form action={removeFromRound}>
                          <input type="hidden" name="id" value={o.id.slice(SUBMISSION_OPTION_PREFIX.length)} />
                          <button type="submit" className="text-xs text-slate-400 hover:text-rose-300">
                            移出本轮
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-600">初始任务</span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-400">本轮还没有候选任务。从下面的待审核或备选池里加入。</p>
        )}

        <details className="mt-5 rounded-lg border border-slate-700 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-200">开启新一轮投票</summary>
          <form action={startNewRound} className="mt-3 grid gap-3 sm:grid-cols-4">
            <input name="roundId" className="input" defaultValue={suggestion.id} placeholder="轮次编号" required />
            <input name="roundTitle" className="input sm:col-span-2" defaultValue="本周任务大厅" placeholder="标题" />
            <input name="closesAt" type="date" className="input" defaultValue={suggestion.closes} required />
            <p className="text-xs text-slate-500 sm:col-span-3">
              开新一轮后，观众看到的投票会切换到新轮次，票数从 0 开始。上一轮的票数会保留在数据库里。
            </p>
            <button type="submit" className="btn-primary">
              开启
            </button>
          </form>
        </details>
      </Panel>

      <section className="mt-10">
        <SectionTitle kicker={`PENDING · ${pending.length}`} title="待审核投稿" desc="可以先改标题、难度和经验值，再决定放进本轮投票、放进备选池，还是拒绝。" />
        {pending.length ? (
          <div className="space-y-4">
            {pending.map((s) => (
              <ReviewCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <Panel>
            <p className="text-sm text-slate-400">没有待审核的投稿。</p>
          </Panel>
        )}
      </section>

      <section className="mt-10">
        <SectionTitle kicker={`POOL · ${pool.length}`} title="备选池" desc="已同意但还没放进本轮的任务，随时可以加入。" />
        {pool.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {pool.map((s) => (
              <Panel key={s.id} className="p-4">
                <p className="text-sm text-white">
                  <span className="text-slate-500">[{s.zone}]</span> {s.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {"★".repeat(s.difficulty ?? 3)} · +{s.xp} XP · 来自 {s.nickname || "匿名"}
                  {s.roundId ? ` · 曾在 ${s.roundId}` : ""}
                </p>
                <div className="mt-3 flex gap-3">
                  <form action={moveToRound}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-sm font-semibold text-lime-300 hover:underline">
                      加入本轮
                    </button>
                  </form>
                  <form action={reviewSubmission}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" name="intent" value="reject" className="text-sm text-slate-400 hover:text-rose-300">
                      拒绝
                    </button>
                  </form>
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <Panel>
            <p className="text-sm text-slate-400">备选池是空的。</p>
          </Panel>
        )}
      </section>

      <section className="mt-10">
        <SectionTitle kicker="NEW" title="自己加一个任务" desc="不用等投稿，直接加进本轮或备选池。" />
        <Panel>
          <form action={createOwnTask}>
            <TaskFields title="" desc="" />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="submit" name="intent" value="round" className="btn-primary">
                加入本轮投票
              </button>
              <button type="submit" name="intent" value="pool" className="btn-ghost">
                放进备选池
              </button>
            </div>
          </form>
        </Panel>
      </section>

      {rejected.length ? (
        <section className="mt-10">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-400">已拒绝（最近 {rejected.length} 条）</summary>
            <ul className="mt-3 space-y-2">
              {rejected.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 p-3 text-sm">
                  <span className="text-slate-400">{s.text}</span>
                  <form action={restoreSubmission}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="shrink-0 text-xs text-cyan-300 hover:underline">
                      恢复待审核
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </details>
        </section>
      ) : null}
    </main>
  );
}

function ReviewCard({ s }: { s: QuestSubmission }) {
  return (
    <Panel className="p-4">
      <p className="text-xs text-slate-500">
        {fmt(s.createdAt)} · 来自 {s.nickname || "匿名"}
      </p>
      <p className="mt-1 text-base text-white">「{s.text}」</p>
      <form action={reviewSubmission} className="mt-4">
        <input type="hidden" name="id" value={s.id} />
        <TaskFields title={s.text.slice(0, 40)} desc={s.text} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" name="intent" value="round" className="btn-primary">
            同意，加入本轮投票
          </button>
          <button type="submit" name="intent" value="pool" className="btn-ghost">
            同意，放进备选池
          </button>
          <button type="submit" name="intent" value="reject" className="btn-ghost hover:border-rose-400/60 hover:text-rose-300">
            拒绝
          </button>
        </div>
      </form>
    </Panel>
  );
}

function TaskFields({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <label className="text-xs text-slate-400 sm:col-span-4">
        投票标题
        <input name="title" className="input mt-1" defaultValue={title} maxLength={40} required />
      </label>
      <label className="text-xs text-slate-400">
        副本类型
        <select name="zone" className="input mt-1" defaultValue="观众任务">
          {ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-slate-400">
        难度（1–5）
        <input name="difficulty" type="number" min={1} max={5} className="input mt-1" defaultValue={3} />
      </label>
      <label className="text-xs text-slate-400">
        经验值
        <input name="xp" type="number" min={10} max={5000} step={10} className="input mt-1" defaultValue={300} />
      </label>
      <label className="text-xs text-slate-400 sm:col-span-4">
        任务详情（观众点开看到的说明）
        <textarea name="desc" className="input mt-1 min-h-[72px]" defaultValue={desc} maxLength={300} />
      </label>
    </div>
  );
}
