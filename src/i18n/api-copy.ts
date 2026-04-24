import type { AppLocale } from "@/i18n/config";

/** API / 行程 JSON 内嵌字符串（不经过 React） */
export const apiCopy: Record<
  AppLocale,
  {
    disclaimer: string;
    weatherProvider: string;
    weatherHighRain: string;
    weatherMixed: string;
    weatherFair: string;
    roadProvider: string;
    roadSummary: string;
    srcOpenMeteo: string;
    srcNzta: string;
    srcDoc: string;
    srcTnz: string;
    docSuffix: string;
    bookSuffix: string;
    rainSuffix: string;
    apiInvalid: string;
    apiUnknownRegion: string;
    apiNoPoi: string;
    apiBadJson: string;
    fallbackWarningBase: string;
    bookAhead: string;
    ferryNote: string;
    themeFamily: string;
    themeDefault: string;
    budgetAssumption: string;
    dateInPast: string;
    dateBeyondForecast: string;
    apiOpenDestNeedsText: string;
    apiServerError: string;
  }
> = {
  zh: {
    disclaimer:
      "行程仅供参考，不构成专业建议。户外活动存在风险，请遵循官方安全信息与现场管理要求。",
    weatherProvider: "Open-Meteo",
    weatherHighRain: "未来数日降水概率偏高，行程会自动偏向室内或不易受雨影响的活动。",
    weatherMixed: "部分日期可能有雨，适合搭配室内外混合行程。",
    weatherFair: "整体天气条件尚可，仍以出发前实时预报为准。",
    roadProvider: "NZTA（路况摘要 + 官方入口）",
    roadSummary:
      "此处为路况摘要。出发前请在 NZTA Journeys 查看封路、施工与延误。",
    srcOpenMeteo: "Open-Meteo",
    srcNzta: "NZTA Journeys",
    srcDoc: "DOC",
    srcTnz: "Tourism New Zealand",
    docSuffix: "（DOC）",
    bookSuffix: "（预订）",
    rainSuffix: "（遇雨可改）",
    apiInvalid: "参数不合法",
    apiUnknownRegion: "未知区域",
    apiNoPoi: "该区域暂无模板数据",
    apiBadJson: "请求体不是合法 JSON",
    fallbackWarningBase:
      "本行程由本地模板与规则生成，不构成安全或法律建议；请以 DOC、NZTA、官方天气与路况信息及现场告示为准。",
    bookAhead: "建议提前预约或购票。",
    ferryNote: "注意渡轮班次与末班时间。",
    themeFamily: "亲子轻松",
    themeDefault: "新西兰所选区域",
    budgetAssumption: "不含往返机票；含简餐、交通与中等门票的粗略区间。",
    dateInPast: "出发日期不能早于今天（奥克兰时间）。",
    dateBeyondForecast: "所选日期超出当前可预报范围，请将行程首日往后调整。",
    apiOpenDestNeedsText: "未选推荐区域时，请至少写下去哪里或想怎么玩（几个字即可）。",
    apiServerError:
      "行程生成服务暂时出错，请稍后重试。若刚更换 API 地址或 Key，请确认 Netlify 环境变量与模型名无误；部分兼容网关需设置 OPENAI_RESPONSE_FORMAT_JSON=0。",
  },
  en: {
    disclaimer:
      "Itineraries are indicative only—not professional advice. Outdoor activities carry risk; follow official safety information and on-site instructions.",
    weatherProvider: "Open-Meteo",
    weatherHighRain:
      "Several days show a high chance of rain—the itinerary will lean indoor or less weather-exposed stops.",
    weatherMixed: "Some days may be wet—mix indoor and outdoor blocks.",
    weatherFair: "Conditions look broadly workable—still verify live forecasts before you go.",
    roadProvider: "NZTA (summary + official Journeys link)",
    roadSummary:
      "This is a short road summary only—check Journeys for closures, roadworks, and delays before driving.",
    srcOpenMeteo: "Open-Meteo",
    srcNzta: "NZTA Journeys",
    srcDoc: "DOC",
    srcTnz: "Tourism New Zealand",
    docSuffix: " (DOC)",
    bookSuffix: " (bookings)",
    rainSuffix: " (if wet)",
    apiInvalid: "Invalid request body",
    apiUnknownRegion: "Unknown area",
    apiNoPoi: "No template stops for this area yet",
    apiBadJson: "Invalid JSON",
    fallbackWarningBase:
      "Built from local templates and rules—not legal or safety advice. Re-check DOC, NZTA, official weather and road information, and on-site notices.",
    bookAhead: "Book tickets or time slots where popular.",
    ferryNote: "Watch first/last ferry times for Waiheke.",
    themeFamily: "Family-friendly pace",
    themeDefault: "Around your chosen NZ area",
    budgetAssumption: "Excludes international flights; rough band for meals, transport, and mid-range entries.",
    dateInPast: "Start date can’t be before today (Pacific/Auckland).",
    dateBeyondForecast:
      "Those dates are beyond the current forecast window—pick an earlier first day.",
    apiOpenDestNeedsText:
      "When you skip a recommended area, add a short note about where or how you’d like to go.",
    apiServerError:
      "The itinerary service hit an error—try again shortly. If you just changed API host/key on Netlify, double-check env vars and model name; some OpenAI-compatible hosts need OPENAI_RESPONSE_FORMAT_JSON=0.",
  },
};

export type ApiCopy = (typeof apiCopy)[AppLocale];

export function apiStrings(locale: AppLocale): ApiCopy {
  return apiCopy[locale];
}
