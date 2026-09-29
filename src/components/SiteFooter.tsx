import { getContent } from "@/lib/content";

export async function SiteFooter() {
  const { player } = await getContent();
  const socials = player.socials.filter((s) => s.url);
  return (
    <footer className="mt-16 border-t border-slate-800/80 pb-24 pt-8 md:pb-10">
      <div className="mx-auto max-w-5xl px-4 text-sm text-slate-500">
        <p className="font-pixel text-[10px] text-slate-400">LIFE: NEW GAME · 人生重新开服</p>
        <p className="mt-3 leading-relaxed">
          一个普通人在新西兰的真人开放世界游戏。页面上的等级、经验、地图和成就，都来自真实完成（或失败）的挑战。
        </p>
        {socials.length ? (
          <p className="mt-3 flex flex-wrap gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                {s.label}
              </a>
            ))}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-600">
          投票任务会经过筛选：危险、违法、侵犯他人隐私或成本过高的任务不会进入投票池。
        </p>
      </div>
    </footer>
  );
}
