import Link from "next/link";
import { Panel, Tag } from "@/components/ui";
import { CONTENT_SECTIONS, getContent, isContentSection, type GameContent } from "@/lib/content";
import { QUEST_STATUS_LABEL } from "@/lib/game";
import { usingEnvPassword } from "@/lib/admin";
import {
  addSkillBranch,
  changePassword,
  addSkillNode,
  deleteSkillBranch,
  deleteSkillNode,
  resetContent,
  saveJson,
  saveObject,
  saveSkillBranch,
  saveSkillNode,
} from "./actions";
import { ConfirmButton } from "./ConfirmButton";
import { MAIN_QUEST_FIELDS, PLAYER_FIELDS, SKILL_BRANCH_FIELDS, SKILL_NODE_FIELDS } from "./fields";
import { FieldGrid, ListEditor, SaveButton, type OptionCtx } from "./forms";

function optionCtx(c: GameContent): OptionCtx {
  return {
    regions: c.regions.map((r) => ({ value: r.id, label: `${r.name}${r.unlocked ? "" : "（迷雾）"}` })),
    episodes: c.episodes.map((e) => ({ value: e.id, label: `${e.id} ${e.title}` })),
    quests: c.quests.map((q) => ({ value: q.id, label: `#${q.id} ${q.title}` })),
  };
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-relaxed text-slate-400">{children}</p>;
}

export async function PlayerTab() {
  const c = await getContent();
  const ctx = optionCtx(c);
  return (
    <div className="space-y-6">
      <Panel>
        <p className="mb-4 text-lg font-bold text-white">玩家资料</p>
        <form action={saveObject}>
          <input type="hidden" name="section" value="player" />
          <FieldGrid fields={PLAYER_FIELDS} value={c.player} ctx={ctx} />
          <p className="mt-3 text-xs text-slate-500">
            属性面板显示的是「初始值 + 已完成任务的属性加成」，等级和经验由已完成任务自动计算。
          </p>
          <div className="mt-4">
            <SaveButton />
          </div>
        </form>
      </Panel>
      <Panel>
        <p className="mb-4 text-lg font-bold text-white">主线任务</p>
        <form action={saveObject}>
          <input type="hidden" name="section" value="mainQuest" />
          <FieldGrid fields={MAIN_QUEST_FIELDS} value={c.mainQuest} ctx={ctx} />
          <div className="mt-4">
            <SaveButton />
          </div>
        </form>
      </Panel>
    </div>
  );
}

const STATUS_TONE = { todo: "slate", active: "cyan", done: "lime", failed: "rose" } as const;

export async function QuestsTab() {
  const c = await getContent();
  return (
    <>
      <Hint>
        把任务状态改成「已完成」后，经验值和属性会自动结算到等级里。如果填了「发生地点」，那个地点会自动从迷雾里点亮。首页的「本集任务清单」显示拍摄中那一集的任务。
      </Hint>
      <ListEditor
        section="quests"
        items={c.quests}
        ctx={optionCtx(c)}
        addLabel="新任务"
        openWhen={(q) => q.status === "active"}
        summary={(q) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-pixel text-[10px] text-slate-500">#{q.id}</span>
            <Tag tone={STATUS_TONE[q.status] ?? "slate"}>{QUEST_STATUS_LABEL[q.status] ?? q.status}</Tag>
            {q.episode ? <Tag tone="violet">{q.episode}</Tag> : null}
            <span>{q.title}</span>
            <span className="text-xs text-lime-300">+{q.xp}</span>
          </span>
        )}
      />
    </>
  );
}

export async function MapTab() {
  const c = await getContent();
  const lit = c.regions.filter((r) => r.unlocked).length;
  return (
    <>
      <Hint>
        已点亮 {lit} / {c.regions.length} 个地点。勾选「已点亮」就会驱散那里的迷雾。新增地点时，在 Google 地图上右键那个位置，第一行就是「纬度, 经度」，分别填进去。
      </Hint>
      <ListEditor
        section="regions"
        items={c.regions}
        ctx={optionCtx(c)}
        addLabel="新地点"
        summary={(r) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span>{r.unlocked ? "🟢" : "🌫️"}</span>
            <span>{r.name}</span>
            <span className="text-xs text-slate-500">{r.nameEn}</span>
            {r.firstVisit ? <span className="text-xs text-lime-300">{r.firstVisit}</span> : null}
          </span>
        )}
      />
    </>
  );
}

const EP_LABEL = { planned: "未解锁", filming: "拍摄中", released: "已上线" } as const;

export async function EpisodesTab() {
  const c = await getContent();
  return (
    <>
      <Hint>视频发布后，把状态改成「已上线」并贴上视频链接，首页的剧集卡片就能点进去看。</Hint>
      <ListEditor
        section="episodes"
        items={c.episodes}
        ctx={optionCtx(c)}
        addLabel="新剧集"
        summary={(e) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-pixel text-[10px] text-cyan-300">{e.id}</span>
            <Tag tone={e.status === "released" ? "lime" : e.status === "filming" ? "amber" : "slate"}>
              {EP_LABEL[e.status] ?? e.status}
            </Tag>
            <span>{e.title}</span>
          </span>
        )}
      />
    </>
  );
}

const STORY_LABEL = { story: "冒险记录", fail: "失败记录", announcement: "公告", update: "版本更新" } as const;

export async function StoriesTab() {
  const c = await getContent();
  return (
    <>
      <Hint>故事档案馆按日期倒序显示。新故事会加在最上面，正文里空一行就是分段。</Hint>
      <ListEditor
        section="stories"
        items={c.stories}
        ctx={optionCtx(c)}
        addLabel="新故事"
        summary={(s) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">{s.date}</span>
            <Tag tone={s.type === "fail" ? "rose" : s.type === "announcement" ? "cyan" : "lime"}>
              {STORY_LABEL[s.type] ?? s.type}
            </Tag>
            <span>{s.title}</span>
          </span>
        )}
      />
    </>
  );
}

const ACH_LABEL = { normal: "成就", fail: "失败图鉴", hidden: "隐藏" } as const;

export async function AchievementsTab() {
  const c = await getContent();
  return (
    <>
      <Hint>「失败图鉴」类型会显示在失败图鉴墙上。没解锁的成就在网站上显示为「？？？」。</Hint>
      <ListEditor
        section="achievements"
        items={c.achievements}
        ctx={optionCtx(c)}
        addLabel="新成就"
        summary={(a) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span>{a.unlocked ? (a.kind === "fail" ? "💀" : "🏆") : "🔒"}</span>
            <Tag tone={a.kind === "fail" ? "rose" : a.kind === "hidden" ? "violet" : "lime"}>{ACH_LABEL[a.kind] ?? a.kind}</Tag>
            <span>{a.title}</span>
          </span>
        )}
      />
    </>
  );
}

export async function CardsTab() {
  const c = await getContent();
  return (
    <>
      <Hint>观众在「新手任务卡」页面每天随机抽到的任务，都从这里的卡池里抽。</Hint>
      <ListEditor
        section="dailyCardPool"
        items={c.dailyCardPool}
        ctx={optionCtx(c)}
        addLabel="新任务卡"
        summary={(d) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <Tag>{d.zone}</Tag>
            <span>{d.title}</span>
            <span className="text-xs text-lime-300">+{d.xp}</span>
          </span>
        )}
      />
    </>
  );
}

const NODE_ICON = { locked: "🔒", active: "⏳", unlocked: "✅" } as const;

export async function SkillsTab() {
  const c = await getContent();
  const ctx = optionCtx(c);
  return (
    <>
      <Hint>技能节点从上到下依次解锁。「修炼中」会在网站上闪烁，关联任务有视频的话会显示「挑战视频」链接。</Hint>
      <div className="space-y-5">
        {c.skillTree.map((b, bi) => (
          <Panel key={`${b.id}-${bi}`} className="p-4">
            <form action={saveSkillBranch}>
              <input type="hidden" name="branch" value={bi} />
              <FieldGrid fields={SKILL_BRANCH_FIELDS} value={b} ctx={ctx} />
              <div className="mt-3 flex items-center gap-4">
                <SaveButton>保存分支</SaveButton>
              </div>
            </form>
            <div className="mt-4 space-y-2">
              {b.nodes.map((n, ni) => (
                <details key={`${n.id}-${ni}`} className="rounded-lg border border-slate-700 bg-slate-900/40">
                  <summary className="cursor-pointer px-3 py-2 text-sm text-slate-200">
                    {NODE_ICON[n.status] ?? ""} {n.title}
                  </summary>
                  <div className="border-t border-slate-800 p-3">
                    <form action={saveSkillNode}>
                      <input type="hidden" name="branch" value={bi} />
                      <input type="hidden" name="node" value={ni} />
                      <FieldGrid fields={SKILL_NODE_FIELDS} value={n} ctx={ctx} />
                      <div className="mt-3">
                        <SaveButton />
                      </div>
                    </form>
                    <form action={deleteSkillNode} className="mt-3 border-t border-slate-800 pt-3 text-xs">
                      <input type="hidden" name="branch" value={bi} />
                      <input type="hidden" name="node" value={ni} />
                      <ConfirmButton message="确定删除这个技能吗？" className="text-slate-500 hover:text-rose-300">
                        删除技能
                      </ConfirmButton>
                    </form>
                  </div>
                </details>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <form action={addSkillNode}>
                <input type="hidden" name="branch" value={bi} />
                <button type="submit" className="text-lime-300 hover:underline">
                  + 新技能
                </button>
              </form>
              <form action={deleteSkillBranch}>
                <input type="hidden" name="branch" value={bi} />
                <ConfirmButton message={`确定删除整个「${b.name}」分支吗？`} className="text-xs text-slate-500 hover:text-rose-300">
                  删除分支
                </ConfirmButton>
              </form>
            </div>
          </Panel>
        ))}
      </div>
      <form action={addSkillBranch} className="mt-4">
        <button type="submit" className="btn-ghost">
          + 新分支
        </button>
      </form>
    </>
  );
}

const SECTION_LABEL: Record<(typeof CONTENT_SECTIONS)[number], string> = {
  player: "玩家",
  mainQuest: "主线",
  quests: "任务",
  regions: "地图",
  skillTree: "技能树",
  achievements: "成就",
  episodes: "剧集",
  stories: "故事",
  dailyCardPool: "任务卡",
};

export async function JsonTab({ section, error, ok }: { section?: string; error?: string; ok?: string }) {
  const current = section && isContentSection(section) ? section : "quests";
  const pwChanged = ok === "pw";
  const c = await getContent();
  return (
    <>
      <Hint>
        直接编辑原始数据，适合批量修改。格式写错不会保存。「恢复默认」会丢掉后台里的修改，回到代码里的初始内容。
      </Hint>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CONTENT_SECTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin?tab=json&section=${s}`}
            className={`rounded border px-2.5 py-1 text-xs ${
              s === current ? "border-cyan-400/60 text-cyan-200" : "border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {SECTION_LABEL[s]}
          </Link>
        ))}
      </div>
      {error === "json" ? <p className="mb-3 text-sm text-rose-300">JSON 格式有误，没有保存。</p> : null}
      {error === "shape" ? <p className="mb-3 text-sm text-rose-300">数据结构不对，没有保存。</p> : null}
      {ok === "1" ? <p className="mb-3 text-sm text-lime-300">已保存。</p> : null}
      <Panel>
        <form action={saveJson} key={current}>
          <input type="hidden" name="section" value={current} />
          <textarea
            name="json"
            className="input min-h-[480px] font-mono text-xs"
            spellCheck={false}
            defaultValue={JSON.stringify(c[current], null, 2)}
          />
          <div className="mt-3">
            <SaveButton />
          </div>
        </form>
        <form action={resetContent} className="mt-4 border-t border-slate-800 pt-4">
          <input type="hidden" name="section" value={current} />
          <ConfirmButton
            message={`确定把「${SECTION_LABEL[current]}」恢复成默认内容吗？后台里的修改会丢失。`}
            className="text-xs text-slate-500 hover:text-rose-300"
          >
            恢复默认
          </ConfirmButton>
        </form>
      </Panel>

      <Panel className="mt-8">
        <p className="text-lg font-bold text-white">修改后台密码</p>
        {usingEnvPassword() ? (
          <p className="mt-2 text-sm text-slate-400">当前密码来自 ADMIN_PASSWORD 环境变量，请到 Netlify 修改。</p>
        ) : (
          <form action={changePassword} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input name="current" type="password" required className="input" placeholder="当前密码" />
            <input name="next" type="password" required minLength={8} className="input" placeholder="新密码（至少 8 位）" />
            <input name="confirm" type="password" required minLength={8} className="input" placeholder="再输一次新密码" />
            <div className="sm:col-span-3">
              <SaveButton>修改密码</SaveButton>
            </div>
          </form>
        )}
        {error === "pw" ? <p className="mt-3 text-sm text-rose-300">新密码至少 8 位，并且两次要一致。</p> : null}
        {error === "pwcur" ? <p className="mt-3 text-sm text-rose-300">当前密码不对。</p> : null}
        {pwChanged ? <p className="mt-3 text-sm text-lime-300">密码已修改，其他设备需要重新登录。</p> : null}
      </Panel>
    </>
  );
}
