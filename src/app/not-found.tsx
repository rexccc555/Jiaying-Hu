import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 pb-8 pt-24 text-center">
      <p className="font-pixel text-3xl text-rose-300">404</p>
      <h1 className="mt-4 text-xl font-bold text-white">这片区域还没有被探索</h1>
      <p className="mt-2 text-sm text-slate-400">你走进了战争迷雾。回到大厅看看玩家最近在干嘛吧。</p>
      <Link href="/" className="btn-primary mt-6">
        返回游戏大厅
      </Link>
    </main>
  );
}
