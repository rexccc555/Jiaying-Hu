import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return <section className={`panel ${glow ? "panel-glow" : ""} ${className}`}>{children}</section>;
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="font-pixel text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">{children}</p>;
}

export function SectionTitle({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <Kicker>{kicker}</Kicker>
      <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">{title}</h2>
      {desc ? <p className="mt-1 text-sm text-slate-400">{desc}</p> : null}
    </div>
  );
}

export function XpBar({ into, need, maxed = false }: { into: number; need: number; maxed?: boolean }) {
  const pct = maxed ? 100 : need > 0 ? Math.min(100, Math.round((into / need) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-slate-400">
        <span>当前经验值</span>
        <span className="font-pixel text-[10px] text-lime-300">{maxed ? "MAX" : `${into} / ${need} XP`}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-sm border border-lime-400/30 bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-lime-400 to-emerald-300 shadow-[0_0_12px_rgba(163,230,53,0.6)] transition-all"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

export function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-pixel text-[10px] text-cyan-300">{value}/100</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-slate-800">
        <div className="h-full bg-cyan-400/80" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Counter({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-3 text-center">
      <p className="font-pixel text-base text-white sm:text-lg">{value}</p>
      <p className="mt-1.5 text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

const TAG_TONE = {
  cyan: "border-cyan-400/40 text-cyan-300 bg-cyan-400/10",
  lime: "border-lime-400/40 text-lime-300 bg-lime-400/10",
  amber: "border-amber-400/40 text-amber-300 bg-amber-400/10",
  rose: "border-rose-400/40 text-rose-300 bg-rose-400/10",
  violet: "border-violet-400/40 text-violet-300 bg-violet-400/10",
  slate: "border-slate-600 text-slate-400 bg-slate-800/60",
} as const;

export type Tone = keyof typeof TAG_TONE;

export function Tag({ children, tone = "slate" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold ${TAG_TONE[tone]}`}>
      {children}
    </span>
  );
}

export function PixelAvatar({ src, size = 72 }: { src?: string; size?: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="玩家头像"
        width={size}
        height={size}
        className="rounded-lg border-2 border-cyan-400/60 object-cover shadow-[0_0_16px_rgba(34,211,238,0.35)]"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-lg border-2 border-cyan-400/60 bg-slate-900 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
      style={{ width: size, height: size }}
      aria-label="像素头像"
    >
      <svg viewBox="0 0 8 8" width={size * 0.6} height={size * 0.6} shapeRendering="crispEdges">
        <rect x="2" y="0" width="4" height="1" fill="#1e293b" />
        <rect x="1" y="1" width="6" height="1" fill="#1e293b" />
        <rect x="1" y="2" width="6" height="3" fill="#fcd9b6" />
        <rect x="2" y="3" width="1" height="1" fill="#0f172a" />
        <rect x="5" y="3" width="1" height="1" fill="#0f172a" />
        <rect x="3" y="4" width="2" height="1" fill="#e8a888" />
        <rect x="1" y="5" width="6" height="3" fill="#22d3ee" />
        <rect x="3" y="5" width="2" height="1" fill="#fcd9b6" />
      </svg>
    </div>
  );
}
