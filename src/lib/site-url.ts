/** 规范站点根 URL（无末尾斜杠），供 sitemap、robots、OG 等使用 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "https://takeadayoff.co.nz";
}
