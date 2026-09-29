"use client";

import { useEffect, useState } from "react";
import type { VoteOption } from "@/data/game";

type Props = { roundId: string; closesAt: string; options: VoteOption[] };

export function VotePanel({ roundId, closesAt, options }: Props) {
  const [selected, setSelected] = useState(options[0]?.id ?? "");
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/votes", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { counts?: Record<string, number> | null; myVote?: string | null; error?: string }) => {
        if (!alive) return;
        if (d.counts) setCounts(d.counts);
        if (d.myVote) {
          setMyVote(d.myVote);
          setSelected(d.myVote);
        }
        if (d.error) setMsg(d.error);
      })
      .catch(() => alive && setMsg("投票数据加载失败"));
    return () => {
      alive = false;
    };
  }, []);

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  const current = options.find((o) => o.id === selected);

  const vote = async () => {
    if (!selected || myVote) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selected }),
      });
      const d = (await res.json()) as { counts?: Record<string, number>; myVote?: string; error?: string };
      if (d.counts) setCounts(d.counts);
      if (d.myVote) setMyVote(d.myVote);
      setMsg(res.ok ? "投票成功！结果会在下一集公布。" : d.error || "投票失败");
    } catch {
      setMsg("投票失败，请稍后再试");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        {options.map((o) => {
          const n = counts?.[o.id] ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o.id)}
              className={`relative overflow-hidden rounded-xl border p-4 text-left transition ${
                active ? "border-cyan-400/70 bg-cyan-400/10" : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
              }`}
            >
              {myVote ? (
                <span className="absolute inset-y-0 left-0 bg-lime-400/10" style={{ width: `${pct}%` }} aria-hidden />
              ) : null}
              <span className="relative block">
                <span className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{o.zone}</span>
                  <span className="font-pixel text-[10px] text-lime-300">+{o.xp} XP</span>
                </span>
                <span className="mt-2 block font-semibold text-white">{o.title}</span>
                <span className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-amber-300">{"★".repeat(o.difficulty) + "☆".repeat(5 - o.difficulty)}</span>
                  <span className="text-slate-400">
                    {counts ? `${n} 票` : "—"}
                    {myVote === o.id ? " · 你的选择" : ""}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {current ? (
        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
          <p className="text-xs text-slate-500">任务详情</p>
          <p className="mt-1 font-semibold text-white">{current.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{current.desc}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" disabled={busy || !!myVote || !selected} onClick={() => void vote()}>
          {myVote ? "本轮已投票" : busy ? "提交中…" : "投给这个任务"}
        </button>
        <span className="text-xs text-slate-500">
          第 {roundId} 轮 · 截止 {closesAt} · 共 {total} 票
        </span>
      </div>
      {msg ? <p className="mt-3 text-sm text-cyan-300">{msg}</p> : null}
    </div>
  );
}
