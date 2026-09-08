import { getRegionHeroImage } from "@/data/region-hero-images";
import { unsplashPhoto } from "@/lib/unsplash-url";

export type MarketingImage = {
  src: string;
  altZh: string;
  altEn: string;
};

/** Hero strip — three distinct moods, all verified 200 on Unsplash CDN. */
export const HOME_HERO_STRIP: MarketingImage[] = [
  {
    src: unsplashPhoto("1464822759023-fed622ff2c3b", 900),
    altZh: "新西兰风格的壮阔山景",
    altEn: "Broad alpine scenery (NZ mood)",
  },
  {
    src: unsplashPhoto("1559827260-dc66d52bef19", 900),
    altZh: "海岸与自然",
    altEn: "Coast & nature",
  },
  {
    src: unsplashPhoto("1566073771259-6a8506099945", 900),
    altZh: "滨水与城市风光",
    altEn: "Waterfront & city",
  },
];

export const HOME_ENTRY_LOCAL: MarketingImage = {
  src: unsplashPhoto("1476514525535-07fb3b4ae5f1", 900),
  altZh: "湖光山色与休闲户外（适合本地短途）",
  altEn: "Lake & hills · local weekend mood",
};

export const HOME_ENTRY_VISITOR: MarketingImage = {
  src: unsplashPhoto("1507699622108-4be3abd695ad", 900),
  altZh: "新西兰标志性山水风光",
  altEn: "Iconic NZ peaks & water",
};

/** Home 「场景模板」 slug → 与向导区域一致的配图，避免整页重复只用三张图轮播。 */
const EXAMPLE_SLUG_TO_REGION: Record<string, string> = {
  west: "waitakere-west",
  waiheke: "waiheke",
  queenstown: "queenstown-lakes",
  northland: "northland",
  rotorua: "rotorua-lakes",
  taupo: "taupo-central",
  wellington: "wellington-harbour",
  nelson: "nelson-tasman",
  christch: "christchurch-canterbury",
  mackenzie: "mackenzie-basin",
  fiordland: "fiordland",
  "auckland-day": "auckland-central",
};

export function getHomeExampleImage(slug: string): MarketingImage | undefined {
  const regionId = EXAMPLE_SLUG_TO_REGION[slug];
  if (!regionId) return undefined;
  return getRegionHeroImage(regionId);
}
