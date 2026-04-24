import type { AppLocale } from "@/i18n/config";

const DOC_KNOW =
  "https://www.doc.govt.nz/parks-and-recreation/know-before-you-go/";
const DOC_AUCKLAND_PLACES =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/auckland/";
const DOC_WAITAKERE =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/auckland/places/waitakere-ranges/";
const DOC_RANGITOTO =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/auckland/places/rangitoto-island/";
const DOC_TAWHARANUI =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/auckland/places/tawharanui-regional-park/";
const DOC_GOAT =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/auckland/places/goat-island-marine-reserve/";
const DOC_NORTHLAND =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/northland/";
const DOC_BAY_OF_PLENTY =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/bay-of-plenty/";
const DOC_TAUPO =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/taupo/";
const DOC_WELLINGTON =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/wellington/";
const DOC_NELSON_TASMAN =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/nelson-tasman/";
const DOC_CANTERBURY =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/canterbury/";
const DOC_OTAGO =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/otago/";
const DOC_FIORDLAND =
  "https://www.doc.govt.nz/parks-and-recreation/places-to-go/fiordland/";

/** 官方 DOC 入口：全纽须知 + 大区总览 + 与所选区域相关的重点页 */
export function getDocHubsForRegion(
  regionId: string,
  locale: AppLocale,
): { label: string; url: string }[] {
  const zh = {
    know: "DOC · 出发前必读（安全与装备）",
    akl: "DOC · 奥克兰地区景区与步道总览",
    waitakere: "DOC · Waitakere 山脉与步道",
    rangi: "DOC · Rangitoto 朗伊托托岛",
    tawha: "DOC · Tāwharanui 区域公园",
    goat: "DOC · 山羊岛海洋保护区",
    northland: "DOC · 北地景区与步道",
    bop: "DOC · Bay of Plenty 景区",
    taupo: "DOC · Taupō 地区",
    wellington: "DOC · 惠灵顿地区",
    nelson: "DOC · Nelson–Tasman 景区",
    canterbury: "DOC · Canterbury 景区",
    otago: "DOC · Otago 景区",
    fiordland: "DOC · Fiordland 峡湾地区",
  };
  const en = {
    know: "DOC · Know Before You Go",
    akl: "DOC · Auckland places to visit",
    waitakere: "DOC · Waitakere Ranges tracks",
    rangi: "DOC · Rangitoto Island",
    tawha: "DOC · Tāwharanui Regional Park",
    goat: "DOC · Goat Island Marine Reserve",
    northland: "DOC · Northland places",
    bop: "DOC · Bay of Plenty places",
    taupo: "DOC · Taupō area",
    wellington: "DOC · Wellington region",
    nelson: "DOC · Nelson–Tasman places",
    canterbury: "DOC · Canterbury places",
    otago: "DOC · Otago places",
    fiordland: "DOC · Fiordland places",
  };
  const t = locale === "en" ? en : zh;

  const hubs: { label: string; url: string }[] = [{ label: t.know, url: DOC_KNOW }];

  const aklFamily = new Set([
    "auckland-central",
    "waitakere-west",
    "north-shore",
    "waiheke",
    "matakana-coast",
  ]);
  if (aklFamily.has(regionId)) {
    hubs.push({ label: t.akl, url: DOC_AUCKLAND_PLACES });
  }

  if (regionId === "waitakere-west") {
    hubs.push({ label: t.waitakere, url: DOC_WAITAKERE });
  } else if (regionId === "north-shore" || regionId === "waiheke") {
    hubs.push({ label: t.rangi, url: DOC_RANGITOTO });
  } else if (regionId === "matakana-coast") {
    hubs.push({ label: t.tawha, url: DOC_TAWHARANUI });
    hubs.push({ label: t.goat, url: DOC_GOAT });
  } else if (regionId === "northland") {
    hubs.push({ label: t.northland, url: DOC_NORTHLAND });
  } else if (regionId === "rotorua-lakes") {
    hubs.push({ label: t.bop, url: DOC_BAY_OF_PLENTY });
  } else if (regionId === "taupo-central") {
    hubs.push({ label: t.taupo, url: DOC_TAUPO });
  } else if (regionId === "wellington-harbour") {
    hubs.push({ label: t.wellington, url: DOC_WELLINGTON });
  } else if (regionId === "nelson-tasman") {
    hubs.push({ label: t.nelson, url: DOC_NELSON_TASMAN });
  } else if (regionId === "christchurch-canterbury" || regionId === "mackenzie-basin") {
    hubs.push({ label: t.canterbury, url: DOC_CANTERBURY });
  } else if (regionId === "queenstown-lakes") {
    hubs.push({ label: t.otago, url: DOC_OTAGO });
  } else if (regionId === "fiordland") {
    hubs.push({ label: t.fiordland, url: DOC_FIORDLAND });
  }

  return hubs;
}
