"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "大厅", icon: "🏠" },
  { href: "/quests", label: "任务", icon: "⚔️" },
  { href: "/map", label: "地图", icon: "🗺️" },
  { href: "/skills", label: "技能", icon: "🌳" },
  { href: "/archive", label: "档案", icon: "📜" },
  { href: "/card", label: "开号", icon: "🎮" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function GameNav() {
  const pathname = usePathname() || "/";
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070b14]/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-pixel text-[11px] text-lime-300">LIFE:</span>
            <span className="font-pixel text-[11px] text-white">NEW GAME</span>
            <span className="hidden text-xs text-slate-500 sm:inline">· 人生重新开服</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  isActive(pathname, l.href)
                    ? "bg-cyan-400/15 text-cyan-200"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <span className="flex items-center gap-1.5 text-[11px] text-lime-300 md:hidden">
            <span className="status-dot" />
            在线
          </span>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-[#070b14]/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                isActive(pathname, l.href) ? "text-cyan-300" : "text-slate-500"
              }`}
            >
              <span className="text-base leading-none">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
