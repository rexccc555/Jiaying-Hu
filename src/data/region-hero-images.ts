import { NZ_OPEN_REGION_ID } from "@/lib/wizard-constants";
import { unsplashPhoto } from "@/lib/unsplash-url";

export type RegionHeroImage = {
  src: string;
  altZh: string;
  altEn: string;
};

/**
 * Representative thumbnails per wizard region (Unsplash).
 * Each `photo-*` id is checked to return HTTP 200 on images.unsplash.com (IDs that 404 are omitted).
 */
const REGION_HERO_MAP: Record<string, RegionHeroImage> = {
  "auckland-central": {
    src: unsplashPhoto("1566073771259-6a8506099945", 800),
    altZh: "滨水城市天际线与游船（示意：奥克兰一带）",
    altEn: "Waterfront city skyline (illustrative · Auckland area)",
  },
  "waitakere-west": {
    src: unsplashPhoto("1559827260-dc66d52bef19", 800),
    altZh: "海岸浪涛与沙滩（示意：西海岸自然）",
    altEn: "Coastal waves and shore (illustrative · west coast nature)",
  },
  "north-shore": {
    src: unsplashPhoto("1476514525535-07fb3b4ae5f1", 800),
    altZh: "湖泊与远山风光（示意：北岸休闲户外）",
    altEn: "Lake and hills (illustrative · North Shore outdoors)",
  },
  waiheke: {
    src: unsplashPhoto("1512453979798-5ea266f8880c", 800),
    altZh: "户外餐桌与风光（示意：酒庄海岛氛围）",
    altEn: "Outdoor table & view (illustrative · wine island mood)",
  },
  "matakana-coast": {
    src: unsplashPhoto("1441974231531-c6227db76b6e", 800),
    altZh: "林间步道（示意：北部海岸与自然步道）",
    altEn: "Forest trail (illustrative · north coast walks)",
  },
  northland: {
    src: unsplashPhoto("1469474968028-56623f02e42e", 800),
    altZh: "日出时的山峦与自然（示意：北地海湾风光）",
    altEn: "Sunrise hills (illustrative · Northland bays)",
  },
  "rotorua-lakes": {
    src: unsplashPhoto("1571896349842-33c89424de2d", 800),
    altZh: "度假泳池与棕榈（示意：湖区休闲与地热之旅）",
    altEn: "Poolside palms (illustrative · lakes & geothermal trip)",
  },
  "taupo-central": {
    src: unsplashPhoto("1507525428034-b723cf961d3e", 800),
    altZh: "热带风格海滩（示意：大湖与水上活动氛围）",
    altEn: "Beach scene (illustrative · lake & water sports mood)",
  },
  "wellington-harbour": {
    src: unsplashPhoto("1489515217757-5fd1be406fef", 800),
    altZh: "城市建筑与天际线（示意：compact 滨海首都）",
    altEn: "City buildings (illustrative · compact harbour capital)",
  },
  "nelson-tasman": {
    src: unsplashPhoto("1516026672322-bc52d61a55d5", 800),
    altZh: "山地雪景（示意：海岸与户外季相）",
    altEn: "Mountain snow (illustrative · coast & outdoors)",
  },
  "christchurch-canterbury": {
    src: unsplashPhoto("1531572753322-ad063cecc140", 800),
    altZh: "欧式建筑街景（示意：花园城市与南岛门户）",
    altEn: "Classic street façades (illustrative · garden city gateway)",
  },
  "mackenzie-basin": {
    src: unsplashPhoto("1549880338-65ddcdfd017b", 800),
    altZh: "山湖倒影（示意：蒂卡波 / 南阿尔卑斯氛围）",
    altEn: "Lake & peaks (illustrative · Mackenzie / Southern Alps mood)",
  },
  "queenstown-lakes": {
    src: unsplashPhoto("1506905925346-21bda4d32df4", 800),
    altZh: "雄伟山景（示意：湖滨度假与步道）",
    altEn: "Dramatic peaks (illustrative · lakeside escape)",
  },
  fiordland: {
    src: unsplashPhoto("1507699622108-4be3abd695ad", 800),
    altZh: "峡湾式山体与水面（示意：米尔福德 / 峡湾国家公园）",
    altEn: "Steep peaks and water (illustrative · Fiordland / Milford mood)",
  },
  [NZ_OPEN_REGION_ID]: {
    src: unsplashPhoto("1464822759023-fed622ff2c3b", 800),
    altZh: "连绵山脉全景（示意：新西兰全境随心规划）",
    altEn: "Mountain panorama (illustrative · NZ-wide planning)",
  },
};

export function getRegionHeroImage(regionId: string): RegionHeroImage | undefined {
  return REGION_HERO_MAP[regionId];
}
