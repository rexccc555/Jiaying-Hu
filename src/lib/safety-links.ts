import type { AppLocale } from "@/i18n/config";

export function safetyLinksForRegion(
  regionId: string,
  locale: AppLocale,
): { label: string; url: string }[] {
  const zh = {
    nzta: "NZTA 路况与出行",
    met: "预报数据（Open-Meteo）",
    doc: "DOC 户外安全",
    tnz: "Tourism New Zealand",
    water: "海岸与水上安全",
  };
  const en = {
    nzta: "NZTA journeys & road conditions",
    met: "Forecast data (Open-Meteo)",
    doc: "DOC outdoor safety",
    tnz: "Tourism New Zealand",
    water: "Coastal & water safety",
  };
  const t = locale === "en" ? en : zh;

  const common = [
    { label: t.nzta, url: "https://www.journeys.nzta.govt.nz/" },
    { label: t.met, url: "https://open-meteo.com/" },
    { label: t.doc, url: "https://www.doc.govt.nz/parks-and-recreation/know-before-you-go/" },
    { label: t.tnz, url: "https://www.newzealand.com/int/" },
  ];

  const coastal = [{ label: t.water, url: "https://www.watersafety.org.nz/" }];

  const coastalRegions = new Set([
    "waitakere-west",
    "north-shore",
    "waiheke",
    "matakana-coast",
    "northland",
    "nelson-tasman",
    "fiordland",
    "queenstown-lakes",
  ]);

  if (coastalRegions.has(regionId)) {
    return [...common, ...coastal];
  }

  return common;
}
