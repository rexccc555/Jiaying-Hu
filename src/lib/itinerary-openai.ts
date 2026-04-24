import OpenAI from "openai";
import type { ItineraryPayload } from "@/lib/types";
import type { PoiTemplate } from "@/lib/types";
import type { WizardInput } from "@/lib/types";
import type { AppLocale } from "@/i18n/config";
import { regionTitle } from "@/lib/region-display";
import { poiTitle } from "@/lib/poi-display";
import type { Region } from "@/lib/types";
import { tripEndDateIso } from "@/lib/dates-auckland";
import { TRIP_RAIN_PLAN_THRESHOLD_PCT, type TripWeatherDaily } from "@/lib/weather";
import { NZ_OPEN_REGION_ID } from "@/lib/wizard-constants";
import {
  hasSteeringWhereNotes,
  modelCreativityTemperature,
  openActivityBlendMode,
  whereNotesLooksLikeRegenerateTweak,
} from "@/lib/itinerary-openness";

function formatDailyLines(locale: AppLocale, daily: TripWeatherDaily[]): string {
  return daily
    .map((d) =>
      locale === "en"
        ? `${d.date}: high ~${d.maxC}°C, max precip chance ${d.rainPct}% (code ${d.code})`
        : `${d.date}：最高约 ${d.maxC}°C，日最大降水概率 ${d.rainPct}%（code ${d.code}）`,
    )
    .join("\n");
}

function buildPrompt(params: {
  input: WizardInput;
  region: Region;
  locale: AppLocale;
  poiCatalog: PoiTemplate[];
  weatherSummary: string;
  roadSummary: string;
  weatherDaily: TripWeatherDaily[];
}): { system: string; user: string } {
  const { locale, region } = params;
  const blend = openActivityBlendMode(params.input);
  const steeringNotes = hasSteeringWhereNotes(params.input);
  const postTweak = whereNotesLooksLikeRegenerateTweak(params.input);
  const poiJson = params.poiCatalog.map((p) => ({
    id: p.id,
    name: poiTitle(p, locale),
    category: p.category,
    durationHours: p.durationHours,
    mobility: p.mobility,
    bookingRequired: p.bookingRequired,
    styleTags: p.styleTags,
    seasonNotes: p.seasonNotes,
    rainAlternativePoiId: p.rainAlternativePoiId,
  }));

  const regionLabel = regionTitle(region, locale);
  const isNzOpen = params.region.id === NZ_OPEN_REGION_ID;
  const tripEnd = tripEndDateIso(params.input.startDate, params.input.duration);
  const tripWindow = `${params.input.startDate} → ${tripEnd}`;
  const dailyLines =
    params.weatherDaily.length > 0 ? formatDailyLines(locale, params.weatherDaily) : "";
  const rainRuleEn = [
    "Wet-weather rule (no user toggle): use the per-day max precip probability above (live at generation).",
    `Add rainPlan only for primary outdoor/exposed blocks whose calendar date has precip probability >= ${TRIP_RAIN_PLAN_THRESHOLD_PCT}%; prefer poiCatalog.rainAlternativePoiId when present.`,
    `On drier dates (<${TRIP_RAIN_PLAN_THRESHOLD_PCT}%) omit rainPlan unless the main stop is extremely weather-sensitive.`,
  ].join(" ");
  const rainRuleZh = [
    "遇雨方案由系统根据预报自动决定，用户未单独勾选。请使用上面「逐日降水概率」数字（生成时即时拉取）。",
    `仅当该行程块所在日历日的最大降水概率 ≥ ${TRIP_RAIN_PLAN_THRESHOLD_PCT}% 时，为主要户外/暴露型站点写 rainPlan；优先使用 poiCatalog 中的 rainAlternativePoiId。`,
    `降水概率 <${TRIP_RAIN_PLAN_THRESHOLD_PCT}% 的日期，一般省略 rainPlan（除非主点位对天气极敏感）。`,
  ].join("\n");

  if (locale === "en") {
    return {
      system:
        "You are a New Zealand trip planner. Output ONLY valid JSON, no Markdown. User-facing text must be in natural English. poiCatalog is reference material only—compose days to match the user JSON and especially any free-text wishes; do not default to repeating the same small set of catalog stops when the user asked for something different.",
      user: [
        ...(isNzOpen
          ? [
              "The user did not pick a preset library region. Their free-text destination/vibe is PRIMARY for geography and pacing. poiCatalog is a cross‑NZ hint list—use poiTemplateId only when a catalog stop clearly matches; otherwise use customPlace with accurate mainland NZ coordinates.",
            ]
          : []),
        "Use poiTemplateId when a catalog stop clearly matches the block. For bungy/swing/sky-swing, rafting, jet boat, 4WD/ATV tours, go-kart tracks, zip lines, indoor skydiving, raceway experiences, and similar operator-run activities, poiCatalog is often incomplete—use customPlace with the real venue/operator name and precise WGS84 coordinates inside mainland NZ (lat -47.4..-34.0, lng 166.25..178.75).",
        "customPlace may include optional officialUrl (https only) only when it is the real operator homepage for THAT exact venue (opens in a browser). Do not pair an unrelated domain with the pin. customPlace.name, lat/lng, and officialUrl must describe the same business (e.g. if the pin is East Day Spa at SkyCity, do not use a different spa brand name or URL).",
        "Never put both poiTemplateId and customPlace on the same block; if the stop is in the catalog use poiTemplateId only.",
        ...(steeringNotes
          ? [
              "The user’s free-text field `whereNotes` (may include merged post-edit requests) is a steering brief, not decoration: reinterpret day themes, stop order, and the mix of blocks so the itinerary clearly reflects those words. Replace or drop catalog POIs that conflict with it; add customPlace for specific venues/experiences they name that are not in the catalog.",
            ]
          : []),
        ...(postTweak
          ? [
              "This itinerary request includes a post-generation tweak marker: treat it as a revision. Substantially change stops, ordering, and pacing versus a generic default—do NOT output a near-duplicate of the same headline catalog loop unless the user explicitly asked to keep those stops.",
            ]
          : []),
        ...(blend === "thrill"
          ? [
              "USER SIGNAL: more thrill / adrenaline or explicit request for activities like bungy, off-road, karting, etc. You MUST include one or more customPlace blocks for those venues (not satisfied by mild catalog walks alone). Combine with catalog stops only for pacing, meals, or views.",
            ]
          : []),
        "rainPlan (when applicable) must use poiTemplateId only, and ids must exist in poiCatalog.",
        "Return one JSON object with keys exactly: days, budgetBandEstimate, warnings.",
        "days: array of { day:number, theme:string, blocks:Block[] }.",
        "Block: { startTime, endTime, title, poiTemplateId?, customPlace?, driveMinutesFromPrev, stayMinutes, notes, rainPlan? } — include either poiTemplateId or customPlace when the block is a physical stop with a map pin. customPlace shape: { name, lat, lng, officialUrl? }.",
        "rainPlan optional: { title, poiTemplateId } with ids from the catalog.",
        "budgetBandEstimate: { currency:'NZD', low, high, assumptions }.",
        "warnings: string[] with conservative, short safety reminders (mention verifying hours/access for any customPlace stops).",
        "Respect weather/road summaries; use plausible drive minutes.",
        `Travel dates (inclusive): ${tripWindow}`,
        `Area label: ${regionLabel}`,
        ...(dailyLines ? [`Per-day forecast (area centre):\n${dailyLines}`, rainRuleEn] : []),
        ...(params.input.whereNotes?.trim()
          ? [
              isNzOpen
                ? `Where they want to go (primary): ${params.input.whereNotes.trim()}`
                : `User steering text (highest priority after dates/region/mobility—honour within weather/roads/driving realism; change the plan shape, do not ignore): ${params.input.whereNotes.trim()}`,
            ]
          : []),
        `Weather: ${params.weatherSummary}`,
        `Roads: ${params.roadSummary}`,
        `User JSON: ${JSON.stringify(params.input)}`,
        `poiCatalog JSON: ${JSON.stringify(poiJson)}`,
      ].join("\n"),
    };
  }

  return {
    system:
      "你只输出合法 JSON，不要 Markdown。面向用户的中文要自然、简洁。poiCatalog 只是参考素材，必须根据用户 JSON 与文字说明编排行程；用户提出的具体玩法、增减点、换风格等都要体现在站点与顺序上，不要无用户理由地反复套用同一小撮目录景点。",
    user: [
      `出行日期（含首尾）: ${tripWindow}。`,
      ...(isNzOpen
        ? [
            "用户未从向导里选择固定推荐区域；下方「去哪儿」输入是其最主要的地理与玩法意图。poiCatalog 为跨区参考目录：明显对得上再用 poiTemplateId；否则用 customPlace，坐标须在新西兰主体范围内。",
          ]
        : [
            "你是新西兰行程助手（以用户所选区域为主）。poiCatalog 用于风景、文化、轻量户外等锚点；蹦极、高空秋千、漂流、喷射快艇、越野/ATV/四驱体验基地、卡丁车场、滑索、室内跳伞等强刺激或特种车辆体验通常不在目录里——语义匹配时应用 customPlace：name 写清场地/品牌，lat/lng 为真实接待点或公开图钉坐标（新西兰主体：纬度约 -47.4～-34.0、经度约 166.25～178.75）。",
          ]),
      "customPlace 可带可选 officialUrl（仅 https），且必须是该**同一门店**真实在用的官网/预订页（你自己能浏览器打开再写）；禁止把无关域名与当前坐标拼在一起。name、经纬度、officialUrl 三者须指向同一实体（例如图钉在 Skycity 的 East Day Spa，就不要写成另一家 Auckland Day Spa 或挂错官网）。",
      "同一 Block 不要同时出现 poiTemplateId 与 customPlace；目录能明确覆盖的站点只用 poiTemplateId。",
      ...(steeringNotes
        ? [
            "用户自由文字（whereNotes，可能含生成后合并的「希望调整」）是**硬性导向**，不是可有可无：请按字面意图重组每日主题、站点顺序与停留组合；与文字冲突的目录点应更换或删除；用户点名的具体场地/项目若不在目录中，须用 customPlace（精确坐标）落实。",
          ]
        : []),
      ...(postTweak
        ? [
            "本条包含「生成后再改」标记：视为对上一版的修订，须明显改变动线与点位组合，禁止输出与常见默认行程高度雷同的「老三样」目录循环，除非用户明确要求保留。",
          ]
        : []),
      ...(blend === "thrill"
        ? [
            "【重要】用户想要更刺激或文本里出现蹦极/跳伞/越野/卡丁车等：必须用 customPlace 安排对应真实场地（精确坐标），不得仅用目录里的温和徒步或观景台替代；可与目录点位穿插控制节奏。",
          ]
        : []),
      "rainPlan（按需）只能用 poiTemplateId，且 id 必须来自 poiCatalog。",
      "输出一个 JSON 对象，字段严格为：days, budgetBandEstimate, warnings。",
      "days: 数组，每项含 day:number, theme:string, blocks:Block[]。",
      "Block: { startTime, endTime, title, poiTemplateId?, customPlace?, driveMinutesFromPrev, stayMinutes, notes, rainPlan? }；需要地图图钉的行程块应含 poiTemplateId 或 customPlace 之一。customPlace 形状：{ name, lat, lng, officialUrl? }。",
      "budgetBandEstimate: { currency:'NZD', low, high, assumptions }。",
      "warnings: string[]，包含对用户的安全提示（对 customPlace 站点提醒出发前核对开放时间与现场告示）。",
      "结合用户选择与天气摘要，合理安排出发时间；车程用合理整数分钟。",
      `区域：${regionLabel}`,
      ...(dailyLines ? [`逐日预报（区域中心坐标）：\n${dailyLines}`, rainRuleZh] : []),
      ...(params.input.whereNotes?.trim()
        ? [
            isNzOpen
              ? `用户想去哪 / 玩法（优先满足）：${params.input.whereNotes.trim()}`
              : `用户文字说明（在日期/区域/交通合理前提下视为最高优先级，须体现在行程结构与选点上，勿忽略）：${params.input.whereNotes.trim()}`,
          ]
        : []),
      `天气摘要：${params.weatherSummary}`,
      `路况提示：${params.roadSummary}`,
      `用户选择 JSON：${JSON.stringify(params.input)}`,
      `poiCatalog JSON：${JSON.stringify(poiJson)}`,
    ].join("\n"),
  };
}

function looksLikeItinerary(x: unknown): x is ItineraryPayload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.days)) return false;
  if (!o.budgetBandEstimate || typeof o.budgetBandEstimate !== "object") return false;
  return true;
}

function normalizeOpenAiBaseUrl(u: string): string {
  return u.trim().replace(/\/+$/, "");
}

/** 去掉复制粘贴时自带的引号 */
function stripSurroundingQuotes(s: string): string {
  let t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'")) ||
    (t.startsWith("`") && t.endsWith("`"))
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

/**
 * 解析 OPENAI_BASE_URL；失败时返回明确错误，避免 SDK 只报 “Invalid URL”。
 * 常见修复：补全 `https://`、末尾 `/v1`、去掉引号与首尾空格。
 */
function resolveOpenAiBaseUrl(raw: string | undefined):
  | { ok: true; baseURL?: string }
  | { ok: false; detail: string } {
  if (!raw?.trim()) return { ok: true, baseURL: undefined };
  let u = stripSurroundingQuotes(raw);
  if (/^(undefined|null|none|n\/a)$/i.test(u)) {
    return { ok: false, detail: "OPENAI_BASE_URL 像占位符或未填写，请改为完整 URL（如 https://网关域名/v1）" };
  }
  u = normalizeOpenAiBaseUrl(u);
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, detail: "OPENAI_BASE_URL 须为 http(s) 协议" };
    }
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");
    const baseURL = `${parsed.origin}${path}`;
    return { ok: true, baseURL: baseURL || parsed.origin };
  } catch {
    return {
      ok: false,
      detail:
        "无法把 OPENAI_BASE_URL 解析为合法 URL。示例：https://你的网关域名/v1（不要多空格、不要用中文引号）",
    };
  }
}

function errString(e: unknown): string {
  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    const status = o.status;
    const msg = typeof o.message === "string" ? o.message : undefined;
    const errBody = o.error && typeof o.error === "object" ? (o.error as { message?: string }).message : undefined;
    if (status !== undefined || msg || errBody) {
      return `${status ?? ""} ${msg ?? errBody ?? JSON.stringify(o)}`.trim();
    }
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

function httpStatusFromError(e: unknown): number | undefined {
  if (e && typeof e === "object" && "status" in e) {
    const s = (e as { status: unknown }).status;
    return typeof s === "number" && Number.isFinite(s) ? s : undefined;
  }
  return undefined;
}

/** 多个模型 id：`gpt-5.4,gpt-4o-mini`；未配置时默认先试网关常见 5.4，再兜底 4o-mini */
function parseModelCandidates(raw: string | undefined): string[] {
  const fallback = "gpt-5.4,gpt-4o-mini";
  const s = (raw ?? "").trim() || fallback;
  const parts = s
    .split(/[,|]/)
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length ? parts : fallback.split(",").map((x) => x.trim());
}

/** 当前模型不可用（换 id）；401 不换 */
function shouldTryNextModelForSdkError(e: unknown): boolean {
  const st = httpStatusFromError(e);
  if (st === 401) return false;
  if (st === 403 || st === 404) return true;
  const t = errString(e);
  const lower = t.toLowerCase();
  if (t.includes("无权") || t.includes("无权限")) return true;
  if (
    lower.includes("model_not_found") ||
    lower.includes("does not exist") ||
    lower.includes("invalid model") ||
    lower.includes("unknown model") ||
    lower.includes("unsupported model")
  ) {
    return true;
  }
  return false;
}

/** 兼容：纯 JSON、Markdown 代码块、或正文里第一个 `{` 起的对象 */
function tryParseItineraryJson(text: string): unknown | null {
  const raw = text.trim();
  const once = (s: string): unknown | null => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };
  let v = once(raw);
  if (v) return v;
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    v = once(fence[1].trim());
    if (v) return v;
  }
  const i = raw.indexOf("{");
  if (i >= 0) {
    v = once(raw.slice(i));
    if (v) return v;
  }
  return null;
}

function effectiveTemperature(model: string, base: number): number {
  const o = process.env.OPENAI_TEMPERATURE?.trim();
  if (o !== undefined && o !== "" && Number.isFinite(Number(o))) return Number(o);
  if (/gpt-5/i.test(model)) return 1;
  return base;
}

export type GenerateOpenAiResult =
  | { ok: true; payload: ItineraryPayload; model: string }
  | { ok: false; stage: string; detail?: string };

export async function generateWithOpenAI(params: {
  input: WizardInput;
  region: Region;
  locale: AppLocale;
  poiCatalog: PoiTemplate[];
  weatherSummary: string;
  roadSummary: string;
  weatherDaily: TripWeatherDaily[];
}): Promise<GenerateOpenAiResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) return { ok: false, stage: "no_api_key" };

  const modelCandidates = parseModelCandidates(process.env.OPENAI_MODEL);
  const resolvedBase = resolveOpenAiBaseUrl(process.env.OPENAI_BASE_URL);
  if (!resolvedBase.ok) {
    return { ok: false, stage: "invalid_openai_base_url", detail: resolvedBase.detail };
  }
  const baseURL = resolvedBase.baseURL;

  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS);
  let client: OpenAI;
  try {
    client = new OpenAI({
      apiKey: key,
      ...(baseURL ? { baseURL } : {}),
      timeout: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 120_000,
      maxRetries: 1,
    });
  } catch (e) {
    const hint = errString(e);
    return {
      ok: false,
      stage: "invalid_openai_base_url",
      detail: `OpenAI 客户端初始化失败（${hint}）。请检查 OPENAI_BASE_URL 是否为完整 https URL，且含路径 /v1（若网关要求）`,
    };
  }

  const { system, user } = buildPrompt(params);

  const wantJsonObject = process.env.OPENAI_RESPONSE_FORMAT_JSON !== "0";

  const maxTokRaw = process.env.OPENAI_MAX_COMPLETION_TOKENS?.trim();
  const tokenOpts =
    maxTokRaw && Number.isFinite(Number(maxTokRaw)) && Number(maxTokRaw) > 0
      ? { max_tokens: Number(maxTokRaw) }
      : {};

  const modelAttempts: string[] = [];

  for (const model of modelCandidates) {
    const temperature = effectiveTemperature(model, modelCreativityTemperature(params.input));

    const runCreate = async (withJsonObject: boolean) =>
      client.chat.completions.create({
        model,
        temperature,
        ...tokenOpts,
        ...(withJsonObject ? { response_format: { type: "json_object" as const } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });

    let completion: Awaited<ReturnType<typeof runCreate>>;
    try {
      completion = await runCreate(wantJsonObject);
    } catch (err) {
      const d1 = errString(err);
      console.error(
        `[generateWithOpenAI] model=${model} create failed (json_object=${wantJsonObject}):`,
        d1,
      );
      if (shouldTryNextModelForSdkError(err)) {
        modelAttempts.push(`${model}: ${d1.slice(0, 200)}`);
        continue;
      }
      if (wantJsonObject) {
        try {
          completion = await runCreate(false);
        } catch (err2) {
          console.error("[generateWithOpenAI] retry without json_object:", errString(err2));
          if (shouldTryNextModelForSdkError(err2)) {
            modelAttempts.push(`${model} (no json_object): ${errString(err2).slice(0, 200)}`);
            continue;
          }
          return { ok: false, stage: "sdk_error", detail: d1.slice(0, 500) };
        }
      } else {
        return { ok: false, stage: "sdk_error", detail: d1.slice(0, 500) };
      }
    }

    const text = completion.choices[0]?.message?.content;
    if (!text?.trim()) {
      const fr = completion.choices?.[0]?.finish_reason;
      return { ok: false, stage: "empty_content", detail: fr ? String(fr) : undefined };
    }

    const parsed = tryParseItineraryJson(text);
    if (!parsed) {
      console.error("[generateWithOpenAI] JSON parse failed, preview:", text.slice(0, 800));
      return { ok: false, stage: "json_parse" };
    }
    if (!looksLikeItinerary(parsed)) {
      return { ok: false, stage: "invalid_shape" };
    }
    return { ok: true, payload: parsed, model };
  }

  const tail = modelAttempts.length
    ? ` 已试: ${modelAttempts.join(" → ")}`.slice(0, 500)
    : "";
  return {
    ok: false,
    stage: "sdk_error",
    detail: `所列模型均不可用（${modelCandidates.join(", ")}）${tail}`.slice(0, 600),
  };
}
