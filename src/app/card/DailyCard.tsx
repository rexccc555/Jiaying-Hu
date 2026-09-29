"use client";

import { useEffect, useState } from "react";

type Task = { title: string; xp: number; zone: string };

type Save = {
  name: string;
  xp: number;
  log: { date: string; title: string; xp: number }[];
  today?: { date: string; index: number; done: boolean };
};

const KEY = "lng_viewer_save_v1";
const LEVEL_STEP = 300;

function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Save;
  } catch {
    /* ignore */
  }
  return { name: "", xp: 0, log: [] };
}

export function DailyCard({ pool }: { pool: Task[] }) {
  const [save, setSave] = useState<Save | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    const s = load();
    const d = todayKey();
    if (!s.today || s.today.date !== d) {
      s.today = { date: d, index: hash(d) % pool.length, done: false };
    }
    setSave(s);
    setNameDraft(s.name);
  }, [pool.length]);

  const persist = (next: Save) => {
    setSave(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  if (!save?.today) {
    return <div className="panel h-64 animate-pulse" />;
  }

  const task = pool[save.today.index % pool.length]!;
  const level = Math.floor(save.xp / LEVEL_STEP) + 1;
  const into = save.xp % LEVEL_STEP;

  const reroll = () => {
    if (!save.today || save.today.done) return;
    const next = (save.today.index + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
    persist({ ...save, today: { ...save.today, index: next } });
  };

  const complete = () => {
    if (!save.today || save.today.done) return;
    persist({
      ...save,
      xp: save.xp + task.xp,
      log: [{ date: save.today.date, title: task.title, xp: task.xp }, ...save.log].slice(0, 30),
      today: { ...save.today, done: true },
    });
  };

  if (!save.name) {
    return (
      <div className="panel panel-glow">
        <p className="font-pixel text-[10px] text-cyan-300">CREATE CHARACTER</p>
        <h2 className="mt-2 text-xl font-bold text-white">创建你的角色</h2>
        <p className="mt-2 text-sm text-slate-400">给自己起个玩家名。存档只保存在你自己的浏览器里。</p>
        <form
          className="mt-4 flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (nameDraft.trim()) persist({ ...save, name: nameDraft.trim().slice(0, 16) });
          }}
        >
          <input
            className="input max-w-[240px]"
            maxLength={16}
            placeholder="玩家名"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={!nameDraft.trim()}>
            开始游戏
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-white">{save.name}</p>
          <p className="font-pixel text-[11px] text-cyan-300">LV.{String(level).padStart(2, "0")}</p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-sm bg-slate-800">
          <div className="h-full bg-lime-400" style={{ width: `${Math.max(2, (into / LEVEL_STEP) * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-right font-pixel text-[9px] text-slate-500">
          {into} / {LEVEL_STEP} XP
        </p>
      </div>

      <div className={`panel ${save.today.done ? "border-lime-400/50" : "panel-glow"}`}>
        <p className="font-pixel text-[10px] text-cyan-300">DAILY QUEST · {save.today.date}</p>
        <p className="mt-1 text-xs text-slate-500">你的今日人生任务 · {task.zone}</p>
        <h2 className="mt-3 text-2xl font-bold text-white">{task.title}</h2>
        <p className="mt-2 font-pixel text-[11px] text-lime-300">奖励：{task.xp} XP</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {save.today.done ? (
            <p className="text-sm font-semibold text-lime-300">✓ 任务完成！明天再来领新任务。</p>
          ) : (
            <>
              <button type="button" className="btn-primary" onClick={complete}>
                我完成了
              </button>
              <button type="button" className="btn-ghost" onClick={reroll}>
                换一个
              </button>
            </>
          )}
        </div>
      </div>

      {save.log.length ? (
        <div className="panel">
          <p className="text-sm font-semibold text-slate-300">冒险日志</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {save.log.map((l, i) => (
              <li key={`${l.date}-${i}`} className="flex justify-between gap-2 text-slate-400">
                <span>
                  <span className="text-slate-600">{l.date}</span> {l.title}
                </span>
                <span className="shrink-0 font-pixel text-[9px] text-lime-300">+{l.xp}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
