/**
 * 粗略检测 https 链接是否可访问（用于去掉模型幻觉的死链）。
 * 先 HEAD 再 GET（部分站点拒绝 HEAD）。
 */
export async function isLikelyReachableHttpsUrl(url: string): Promise<boolean> {
  if (!url.startsWith("https://") || url.length > 600 || /\s/.test(url)) return false;

  const baseHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (compatible; TakeADayOff/1.0; +https://takeadayoff.co.nz) link-check",
    Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  };

  for (const method of ["HEAD", "GET"] as const) {
    try {
      const init: RequestInit = {
        method,
        headers:
          method === "GET" ? { ...baseHeaders, Range: "bytes=0-4095" } : { ...baseHeaders },
        redirect: "follow",
        signal: AbortSignal.timeout(4500),
      };
      const res = await fetch(url, init);
      if (res.ok || res.status === 206) return true;
    } catch {
      /* try next method */
    }
  }
  return false;
}
