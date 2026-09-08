import type { GenerateResponse, WizardInput } from "@/lib/types";

type SamplePack = { data: GenerateResponse; payload: WizardInput };

function wxPayload(partial: WizardInput): WizardInput {
  return partial;
}

/** 示例结果页：用于首页「查看示例行程」，与真实生成结构一致；内容为演示文案。 */
export function getSampleItinerary(
  slug: string,
  locale: "zh" | "en",
): SamplePack | null {
  const zh = locale === "zh";
  const demoDisclaimer = zh
    ? "此为演示行程：版式与真实生成一致，站点与天气等为示例，出发前请以实况为准。"
    : "Demo itinerary: layout matches a real run; stops and weather are illustrative—verify before travel.";

  if (slug === "waiheke") {
    const payload = wxPayload({
      regionId: "waiheke",
      partyType: "couple",
      duration: "day",
      mobility: "public_transit",
      budgetBand: "comfort",
      styleTags: ["food", "couple", "nature"],
      startDate: "2026-06-15",
      locale,
    });
    const data: GenerateResponse = {
      requestSnapshot: payload,
      tripDates: { startDate: payload.startDate, endDate: payload.startDate },
      itinerary: {
        days: [
          {
            day: 1,
            theme: zh ? "渡轮 · 酒庄 · 海岸" : "Ferry · wine · coast",
            blocks: [
              {
                startTime: "09:00",
                endTime: "10:30",
                title: zh ? "奥克兰出发 · Fullers 渡轮" : "Fullers ferry from Auckland",
                poiTemplateId: "poi-waiheke-village",
                driveMinutesFromPrev: 0,
                stayMinutes: 30,
                notes: zh ? "示例：预留排队与航程时间。" : "Demo: allow queue + sailing time.",
              },
              {
                startTime: "11:30",
                endTime: "14:00",
                title: zh ? "酒庄品鉴（示意时段）" : "Wine tasting window",
                poiTemplateId: "poi-waiheke-wine",
                driveMinutesFromPrev: 25,
                stayMinutes: 150,
                notes: zh ? "示例：部分酒庄需预约。" : "Demo: bookings may be required.",
              },
              {
                startTime: "15:00",
                endTime: "17:00",
                title: zh ? "Onetangi 海滩散步" : "Onetangi Beach stroll",
                poiTemplateId: "poi-waiheke-onetangi",
                driveMinutesFromPrev: 15,
                stayMinutes: 120,
                notes: zh ? "示例：注意当日海风与日照。" : "Demo: mind wind and UV.",
              },
            ],
          },
        ],
        budgetBandEstimate: {
          currency: "NZD",
          low: 120,
          high: 260,
          assumptions: zh ? "渡轮+品鉴+简餐的粗略示例区间。" : "Rough demo band incl. ferry & tasting.",
        },
        warnings: [zh ? "演示数据，不构成预订建议。" : "Demo only—not booking advice."],
      },
      sources: [{ label: "Tourism NZ", url: "https://www.newzealand.com" }],
      weather: {
        provider: "demo",
        summary: zh ? "示例：当日多云间晴，降水概率中等。" : "Demo: partly cloudy, moderate rain chance.",
        tripContext: zh ? "与所选日期对齐（演示）。" : "Aligned to chosen dates (demo).",
        daily: [
          { date: payload.startDate, maxC: 18, rainPct: 35, code: "partlycloudy" },
        ],
        fetchedAt: new Date().toISOString(),
      },
      roads: {
        provider: "demo",
        summary: zh ? "陆上接驳请使用岛上公交或租车；出海路段不适用 NZTA 路况图。" : "Use island buses or car; ferry legs don’t use NZTA road graph.",
        fetchedAt: new Date().toISOString(),
        moreUrl: "https://www.nzta.govt.nz",
      },
      safetyLinks: [],
      meta: {
        usedOpenAI: false,
        disclaimer: demoDisclaimer,
        mobility: "public_transit",
        regionId: "waiheke",
      },
    };
    return { data, payload };
  }

  if (slug === "piha-muriwai") {
    const payload = wxPayload({
      regionId: "waitakere-west",
      partyType: "couple",
      duration: "day",
      mobility: "car",
      budgetBand: "mid",
      styleTags: ["nature", "photo", "light_hike"],
      startDate: "2026-06-16",
      locale,
    });
    const data: GenerateResponse = {
      requestSnapshot: payload,
      tripDates: { startDate: payload.startDate, endDate: payload.startDate },
      itinerary: {
        days: [
          {
            day: 1,
            theme: zh ? "黑沙滩 · 西海岸自驾（示意）" : "Black-sand beaches · west coast",
            blocks: [
              {
                startTime: "09:30",
                endTime: "12:30",
                title: zh ? "Piha 海滩与狮子岩远眺" : "Piha & Lion Rock",
                poiTemplateId: "poi-piha",
                driveMinutesFromPrev: 45,
                stayMinutes: 150,
                notes: zh ? "示例：海浪强劲，游泳务必留意旗帜。" : "Demo: strong surf—follow lifeguard flags.",
              },
              {
                startTime: "13:45",
                endTime: "16:30",
                title: zh ? "穆里怀塘鹅栖息地观景" : "Muriwai gannet colony",
                poiTemplateId: "poi-muriwai",
                driveMinutesFromPrev: 35,
                stayMinutes: 120,
                notes: zh ? "示例：步道悬崖注意安全。" : "Demo: cliff tracks—stay behind barriers.",
              },
            ],
          },
        ],
        budgetBandEstimate: {
          currency: "NZD",
          low: 40,
          high: 140,
          assumptions: zh ? "自驾油费与简餐示例区间。" : "Fuel & casual meals demo band.",
        },
        warnings: [],
      },
      sources: [{ label: "DOC", url: "https://www.doc.govt.nz" }],
      weather: {
        provider: "demo",
        summary: zh ? "示例：西海岸多变天气，海风偏大。" : "Demo: changeable west-coast weather.",
        fetchedAt: new Date().toISOString(),
      },
      roads: {
        provider: "demo",
        summary: zh
          ? "出发前可查看 NZTA 西北地区路况摘要（示意）。"
          : "Check NZTA North/West Auckland notices before you go (demo).",
        fetchedAt: new Date().toISOString(),
        moreUrl: "https://www.nzta.govt.nz",
      },
      safetyLinks: [],
      meta: {
        usedOpenAI: false,
        disclaimer: demoDisclaimer,
        mobility: "car",
        regionId: "waitakere-west",
      },
    };
    return { data, payload };
  }

  if (slug === "queenstown") {
    const payload = wxPayload({
      regionId: "queenstown-lakes",
      partyType: "couple",
      duration: "day",
      mobility: "car",
      budgetBand: "mid",
      styleTags: ["photo", "adventure", "couple"],
      startDate: "2026-06-17",
      locale,
    });
    const data: GenerateResponse = {
      requestSnapshot: payload,
      tripDates: { startDate: payload.startDate, endDate: payload.startDate },
      itinerary: {
        days: [
          {
            day: 1,
            theme: zh ? "湖滨 · 缆车观景（示意）" : "Lakefront · gondola views",
            blocks: [
              {
                startTime: "10:00",
                endTime: "12:30",
                title: zh ? "Steamer Wharf 湖滨漫步" : "Steamer Wharf lakeside",
                poiTemplateId: "poi-qtown-lakefront",
                driveMinutesFromPrev: 0,
                stayMinutes: 150,
                notes: zh ? "示例：旺季停车位紧张。" : "Demo: parking tight in peak season.",
              },
              {
                startTime: "14:00",
                endTime: "17:30",
                title: zh ? "Skyline 缆车与观景台" : "Skyline gondola & luge",
                poiTemplateId: "poi-skyline-queenstown",
                driveMinutesFromPrev: 10,
                stayMinutes: 180,
                notes: zh ? "示例：活动门票另购。" : "Demo: activities ticketed separately.",
              },
            ],
          },
        ],
        budgetBandEstimate: {
          currency: "NZD",
          low: 90,
          high: 220,
          assumptions: zh ? "缆车与餐饮示例区间。" : "Gondola & meals demo band.",
        },
        warnings: [],
      },
      sources: [{ label: "Queenstown NZ", url: "https://www.queenstownnz.co.nz" }],
      weather: {
        provider: "demo",
        summary: zh ? "示例：山区小气候，昼夜温差大。" : "Demo: alpine microclimate—big diurnal swing.",
        fetchedAt: new Date().toISOString(),
      },
      roads: {
        provider: "demo",
        summary: zh
          ? "出发前查看皇后镇周边道路施工（示意）。"
          : "Check Queenstown-area road works before you leave (demo).",
        fetchedAt: new Date().toISOString(),
        moreUrl: "https://www.nzta.govt.nz",
      },
      safetyLinks: [],
      meta: {
        usedOpenAI: false,
        disclaimer: demoDisclaimer,
        mobility: "car",
        regionId: "queenstown-lakes",
      },
    };
    return { data, payload };
  }

  return null;
}
