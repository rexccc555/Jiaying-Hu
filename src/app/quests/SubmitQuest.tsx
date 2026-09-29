"use client";

import { useState } from "react";

export function SubmitQuest() {
  const [text, setText] = useState("");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, nickname: nickname || undefined }),
      });
      const d = (await res.json()) as { error?: string };
      if (res.ok) {
        setText("");
        setMsg({ ok: true, text: "任务已送达！我会从投稿里挑选进入下一轮投票。" });
      } else {
        setMsg({ ok: false, text: d.error || "投稿失败" });
      }
    } catch {
      setMsg({ ok: false, text: "投稿失败，请稍后再试" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        className="input min-h-[96px]"
        maxLength={200}
        required
        placeholder="例如：尝试靠自己的英语卖出一件二手商品"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <input
          className="input max-w-[220px]"
          maxLength={20}
          placeholder="你的昵称（可选）"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={busy || text.trim().length < 4}>
          {busy ? "发送中…" : "派发任务"}
        </button>
      </div>
      {msg ? <p className={`text-sm ${msg.ok ? "text-lime-300" : "text-rose-300"}`}>{msg.text}</p> : null}
    </form>
  );
}
