import { z } from "zod";
import { FREE_DEST_NOTES_MIN_LEN, NZ_OPEN_REGION_ID } from "@/lib/wizard-constants";

export const wizardInputSchema = z
  .object({
    regionId: z.string(),
    partyType: z.enum(["solo", "couple", "family", "group4"]),
    duration: z.enum(["day", "2d1n", "3d2n"]),
    mobility: z.enum(["car", "public_transit"]),
    budgetBand: z.enum(["budget", "mid", "comfort"]),
    styleTags: z.array(z.string()).min(1),
    /** 行程首日 YYYY-MM-DD（太平洋/奥克兰日历），用于对齐天气预报 */
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** 想去哪：可与推荐区域二选一或组合；选全纽占位时必填足够字数 */
    whereNotes: z.string().max(1200).optional(),
    locale: z.enum(["zh", "en"]).default("zh"),
  })
  .superRefine((val, ctx) => {
    if (
      val.regionId === NZ_OPEN_REGION_ID &&
      (!val.whereNotes || val.whereNotes.trim().length < FREE_DEST_NOTES_MIN_LEN)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "OPEN_DEST_NEEDS_NOTES",
        path: ["whereNotes"],
      });
    }
  });

export type WizardInput = z.infer<typeof wizardInputSchema>;

export type PartyType = WizardInput["partyType"];
export type DurationKey = WizardInput["duration"];
export type Mobility = WizardInput["mobility"];
export type BudgetBand = WizardInput["budgetBand"];

export interface Region {
  id: string;
  slug: string;
  displayName: string;
  displayNameEn: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  blurb: string;
  blurbEn: string;
}

export type PoiCategory =
  | "viewpoint"
  | "walk"
  | "beach"
  | "food"
  | "family"
  | "culture"
  | "hot_spring"
  | "adventure"
  | "photo";

export interface PoiTemplate {
  id: string;
  regionId: string;
  name: string;
  shortBlurb: string;
  category: PoiCategory;
  durationHours: number;
  bestTimeOfDay: "morning" | "midday" | "afternoon" | "sunset" | "any";
  mobility: "car" | "any" | "public_transit";
  seasonNotes?: string;
  bookingRequired: boolean;
  bookingUrl?: string;
  docUrl?: string;
  officialInfoUrl: string;
  difficulty?: "easy" | "moderate" | "hard";
  lat: number;
  lng: number;
  /** 可选：与 `query=lat,lng` 同用时 Google 优先解析为该地点，侧栏更易读 */
  googlePlaceId?: string;
  rainAlternativePoiId?: string;
  styleTags: string[];
}

/** 白名单外由模型建议的地点（须带坐标；服务端做地理围栏校验） */
export interface ItineraryCustomPlace {
  name: string;
  lat: number;
  lng: number;
  /** 可选：运营商官方 https 页（预订/介绍），便于结果页与来源区展示 */
  officialUrl?: string;
}

export interface ItineraryBlock {
  startTime: string;
  endTime: string;
  title: string;
  poiTemplateId?: string;
  /** 与 poiTemplateId 二选一：有合法 catalog id 时忽略此项 */
  customPlace?: ItineraryCustomPlace;
  driveMinutesFromPrev: number;
  stayMinutes: number;
  notes: string;
  rainPlan?: {
    title: string;
    poiTemplateId?: string;
  };
}

export interface ItineraryDay {
  day: number;
  theme: string;
  blocks: ItineraryBlock[];
}

export interface ItineraryPayload {
  days: ItineraryDay[];
  budgetBandEstimate: {
    currency: "NZD";
    low: number;
    high: number;
    assumptions: string;
  };
  warnings: string[];
}

export interface GenerateResponse {
  itinerary: ItineraryPayload;
  /** 旧版缓存可能没有 */
  tripDates?: { startDate: string; endDate: string };
  docHubs?: { label: string; url: string }[];
  sources: { label: string; url: string }[];
  weather: {
    provider: string;
    summary: string;
    /** 说明预报与所选出行日期对齐 */
    tripContext?: string;
    daily?: { date: string; maxC: number; rainPct: number; code: string }[];
    fetchedAt: string;
  };
  roads: {
    provider: string;
    summary: string;
    incidents?: { title: string; area?: string }[];
    fetchedAt: string;
    moreUrl: string;
  };
  safetyLinks: { label: string; url: string }[];
  /** 每日按行程点顺序的 Google Maps 导航（含途经点）；至少 2 个点才有链接 */
  dayMapLinks?: { day: number; url: string }[];
  meta: {
    usedOpenAI: boolean;
    model?: string;
    disclaimer: string;
    /** 用于导航模式与旧缓存兼容 */
    mobility?: "car" | "public_transit" | "no_car";
    /** 用户所选区域，用于自定义点的地图区域后缀等 */
    regionId?: string;
    /** 未走通智能生成时，便于区分「没读到 Key」与「上游失败」 */
    aiUnavailableReason?: "no_api_key" | "upstream_failed";
    /** 仅当 Netlify 设置 OPENAI_DEBUG=1 时返回：上游失败阶段/详情，或模型返回空行程（勿长期在生产开启） */
    upstreamDebug?: string;
  };
}
