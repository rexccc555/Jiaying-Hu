import OpenAI from "openai";
import type { AppLocale } from "@/i18n/config";
import { getRegionHeroImage } from "@/data/region-hero-images";
import { HOME_HERO_STRIP } from "@/data/marketing-images";
import { resolveOpenAiBaseUrl } from "@/lib/itinerary-openai";

export type XhsDraftRequest = {
  locale: AppLocale;
  regionId?: string;
  tripSummary: string;
  stopNames?: string[];
};

export type XhsDraftResult = {
  title: string;
  content: string;
  tags: string[];
  imageUrls: string[];
  usedOpenAI: boolean;
};

function parseModelCandidates(raw: string | undefined): string[] {
  const list = (raw || "gpt-4o-mini,gpt-4o")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : ["gpt-4o-mini"];
}

function clipTitle(s: string): string {
  const t = s.replace(/\s+/g, " ").trim();
  const chars = Array.from(t);
  return chars.slice(0, 20).join("");
}

function clipContent(s: string): string {
  return s.trim().slice(0, 1000);
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((t) => String(t).replace(/^#/, "").trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,，#\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  return [];
}

function pickImages(regionId: string | undefined, locale: AppLocale): string[] {
  const urls: string[] = [];
  if (regionId) {
    const hero = getRegionHeroImage(regionId);
    if (hero?.src) urls.push(hero.src);
  }
  for (const shot of HOME_HERO_STRIP) {
    if (urls.length >= 6) break;
    if (!urls.includes(shot.src)) urls.push(shot.src);
  }
  if (urls.length === 0) {
    urls.push(HOME_HERO_STRIP[0]?.src || "");
  }
  void locale;
  return urls.filter(Boolean).slice(0, 9);
}

function fallbackDraft(req: XhsDraftRequest): XhsDraftResult {
  const stops = (req.stopNames || []).slice(0, 5);
  const title =
    req.locale === "zh"
      ? clipTitle(stops[0] ? `${stops[0]}这一天` : "新西兰可执行一日游")
      : clipTitle(stops[0] ? `${stops[0]} day` : "NZ runnable day trip");
  const lines =
    req.locale === "zh"
      ? [
          "按这条线走就够了，不用再翻一堆攻略。",
          "",
          ...stops.map((s, i) => `${i + 1}. ${s}`),
          "",
          req.tripSummary.slice(0, 400),
          "",
          "天气路况出发前再核。行程来自 Take a Day Off。",
        ]
      : [
          "A simple runnable loop—no tab chaos.",
          "",
          ...stops.map((s, i) => `${i + 1}. ${s}`),
          "",
          req.tripSummary.slice(0, 400),
          "",
          "Recheck weather/roads. Built with Take a Day Off.",
        ];
  return {
    title,
    content: clipContent(lines.join("\n")),
    tags:
      req.locale === "zh"
        ? ["新西兰", "一日游", "周末去哪", "TakeADayOff"]
        : ["NewZealand", "daytrip", "weekend", "TakeADayOff"],
    imageUrls: pickImages(req.regionId, req.locale),
    usedOpenAI: false,
  };
}

export async function generateXhsDraft(req: XhsDraftRequest): Promise<XhsDraftResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  const images = pickImages(req.regionId, req.locale);
  if (!key) return fallbackDraft(req);

  const resolvedBase = resolveOpenAiBaseUrl(process.env.OPENAI_BASE_URL);
  if (!resolvedBase.ok) return fallbackDraft(req);

  let client: OpenAI;
  try {
    client = new OpenAI({
      apiKey: key,
      ...(resolvedBase.baseURL ? { baseURL: resolvedBase.baseURL } : {}),
      timeout: 60_000,
      maxRetries: 1,
    });
  } catch {
    return fallbackDraft(req);
  }

  const system =
    req.locale === "zh"
      ? `你是小红书旅行笔记文案助手。只输出 JSON：{"title":"","content":"","tags":[]}。
标题最多20个汉字，口语钩子，不要营销腔。正文最多1000字，短句+换行，可含少量emoji，结尾带一句互动。tags最多10个、不要#号。不要输出其它文字。`
      : `You write Xiaohongshu-style NZ travel notes. JSON only: {"title":"","content":"","tags":[]}.
Title max 20 chars, hooky. Body max 1000 chars, short lines, light emoji ok, end with a question. tags max 10 without #. No other text.`;

  const user = `行程摘要：\n${req.tripSummary}\n\n站点：${(req.stopNames || []).join("、") || "（无）"}`;

  const models = parseModelCandidates(process.env.OPENAI_MODEL);
  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) continue;
      const json = JSON.parse(text) as { title?: string; content?: string; tags?: unknown };
      const title = clipTitle(String(json.title || ""));
      const content = clipContent(String(json.content || ""));
      const tags = parseTags(json.tags);
      if (!title || !content) continue;
      return {
        title,
        content,
        tags: tags.length
          ? tags
          : req.locale === "zh"
            ? ["新西兰", "一日游", "TakeADayOff"]
            : ["NewZealand", "daytrip", "TakeADayOff"],
        imageUrls: images,
        usedOpenAI: true,
      };
    } catch {
      continue;
    }
  }
  return fallbackDraft(req);
}
