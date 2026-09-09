import OpenAI from "openai";
import type { AppLocale } from "@/i18n/config";
import { resolveOpenAiBaseUrl } from "@/lib/itinerary-openai";

export type XhsDraftRequest = {
  locale: AppLocale;
  /** 用户上传素材后的简短想法，可空 */
  userIdea?: string;
  /** 行程摘要等上下文，可空 */
  tripSummary?: string;
  stopNames?: string[];
  regionId?: string;
  /** 上一版草稿，用于按反馈改写 */
  previousTitle?: string;
  previousContent?: string;
  previousTags?: string[];
  /** 用户对上一版的修改意见 */
  feedback?: string;
};

export type XhsDraftResult = {
  title: string;
  content: string;
  tags: string[];
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

function defaultTags(locale: AppLocale): string[] {
  return locale === "zh"
    ? ["新西兰", "一日游", "周末去哪", "TakeADayOff"]
    : ["NewZealand", "daytrip", "weekend", "TakeADayOff"];
}

function fallbackDraft(req: XhsDraftRequest): XhsDraftResult {
  const idea = (req.userIdea || "").trim();
  const stops = (req.stopNames || []).slice(0, 5);
  const isRevise = Boolean((req.feedback || "").trim() && (req.previousContent || "").trim());

  if (isRevise) {
    const note = (req.feedback || "").trim().slice(0, 200);
    return {
      title: clipTitle(req.previousTitle || (req.locale === "zh" ? "新西兰这一天" : "NZ day out")),
      content: clipContent(
        `${req.previousContent || ""}\n\n${req.locale === "zh" ? "（已参考意见）" : "(revised)"}${note ? ` ${note}` : ""}`,
      ),
      tags: req.previousTags?.length ? req.previousTags : defaultTags(req.locale),
      usedOpenAI: false,
    };
  }

  const title =
    req.locale === "zh"
      ? clipTitle(idea.slice(0, 12) || stops[0] || "新西兰可执行一日游")
      : clipTitle(idea.slice(0, 16) || stops[0] || "NZ runnable day trip");

  const lines =
    req.locale === "zh"
      ? [
          idea || "按素材里的这一天写就够了，轻松可执行。",
          "",
          ...stops.map((s, i) => `${i + 1}. ${s}`),
          "",
          (req.tripSummary || "").slice(0, 280),
          "",
          "天气路况出发前再核。#TakeADayOff",
        ]
      : [
          idea || "A simple day from your photos—runnable and light.",
          "",
          ...stops.map((s, i) => `${i + 1}. ${s}`),
          "",
          (req.tripSummary || "").slice(0, 280),
          "",
          "Recheck weather/roads. #TakeADayOff",
        ];

  return {
    title,
    content: clipContent(lines.filter((l, i, arr) => l !== "" || arr[i - 1] !== "").join("\n")),
    tags: defaultTags(req.locale),
    usedOpenAI: false,
  };
}

export async function generateXhsDraft(req: XhsDraftRequest): Promise<XhsDraftResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
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

  const revising = Boolean((req.feedback || "").trim() && (req.previousContent || "").trim());

  const system =
    req.locale === "zh"
      ? `你是小红书旅行笔记文案助手。用户会上传自己的照片/视频素材，你只写配文，不要编造没提到的景点细节。
只输出 JSON：{"title":"","content":"","tags":[]}。
标题最多20个汉字，口语钩子，不要营销腔。正文最多1000字，短句+换行，可含少量emoji，结尾带一句互动。tags最多10个、不要#号。不要输出其它文字。`
      : `You write Xiaohongshu-style NZ travel captions for the user's own photos. Do not invent places they didn't mention.
JSON only: {"title":"","content":"","tags":[]}.
Title max 20 chars, hooky. Body max 1000 chars, short lines, light emoji ok, end with a question. tags max 10 without #. No other text.`;

  const parts: string[] = [];
  if (revising) {
    parts.push(
      req.locale === "zh"
        ? `请按用户意见改写上一版草稿，保留可用信息，不要整篇无关重写。`
        : `Revise the previous draft per feedback; keep what still works.`,
    );
    parts.push(`上一版标题：${req.previousTitle || ""}`);
    parts.push(`上一版正文：\n${req.previousContent || ""}`);
    parts.push(`上一版标签：${(req.previousTags || []).join("、")}`);
    parts.push(`用户意见：${req.feedback}`);
  } else {
    parts.push(
      req.locale === "zh"
        ? `用户已准备好素材图，请写适合小红书图文的配文。`
        : `User has photos ready—write a Xiaohongshu image-post caption.`,
    );
  }
  if ((req.userIdea || "").trim()) parts.push(`用户想法：\n${req.userIdea!.trim()}`);
  else if (!revising) parts.push(req.locale === "zh" ? "用户未写想法：请根据常见旅行图文写轻松可执行语气。" : "No idea text—write a light runnable travel tone.");
  if ((req.tripSummary || "").trim()) parts.push(`行程参考（可选用）：\n${req.tripSummary!.trim().slice(0, 2500)}`);
  if (req.stopNames?.length) parts.push(`站点：${req.stopNames.join("、")}`);

  const models = parseModelCandidates(process.env.OPENAI_MODEL);
  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: revising ? 0.7 : 0.85,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: parts.join("\n\n") },
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
        tags: tags.length ? tags : defaultTags(req.locale),
        usedOpenAI: true,
      };
    } catch {
      continue;
    }
  }
  return fallbackDraft(req);
}
