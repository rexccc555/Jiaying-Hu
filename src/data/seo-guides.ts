/** SEO / landing：每个 slug 对应一篇指南 + 进入向导的推荐 query（不含 locale）。 */
export const GUIDE_SLUGS = [
  "auckland-day-trip-planner",
  "auckland-weekend-trips",
  "waiheke-island-day-trip",
  "piha-muriwai-day-trip",
  "queenstown-one-day-itinerary",
  "new-zealand-itinerary-planner-chinese",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export type GuideDoc = {
  slug: GuideSlug;
  titleZh: string;
  titleEn: string;
  metaZh: string;
  metaEn: string;
  paragraphsZh: string[];
  paragraphsEn: string[];
  /** e.g. `intent=local&region=waiheke` */
  wizardQuery: string;
};

export const GUIDES: Record<GuideSlug, GuideDoc> = {
  "auckland-day-trip-planner": {
    slug: "auckland-day-trip-planner",
    titleZh: "奥克兰一日游规划：如何用 AI 行程器排一日动线",
    titleEn: "Auckland day trip planner — build a one-day route fast",
    metaZh: "从市中心、西区、北岸或激流岛出发，把天气、路况与安全入口放进同一页；Take a Day Off 新西兰行程规划器。",
    metaEn:
      "Plan an Auckland day trip with weather, NZTA road context, and DOC links in one flow—Take a Day Off NZ planner.",
    paragraphsZh: [
      "奥克兰适合「早出晚归」的一日游：市中心博物馆与滨水、西区黑沙滩与步道、北岸德文港与海滩、或激流岛酒庄与海岸。难点不在于景点列表，而在于路程、渡轮班次、海风与降雨概率——把这些变量放进同一天里，才不会排成纸上谈兵。",
      "使用本站时，请先选与你真实出发点一致的片区（例如市中心 / 西区 / 北岸 / Waiheke），再选择一日游长度与出行首日。系统会按区域中心抓取天气预报，并在结果页附上新西兰交通局路况入口摘要与 DOC 安全链接，便于出发前核对。",
      "若你不开车，向导里可选择公共交通；奥克兰都会区请配合 AT 官方行程规划，本站以 Google 地图坐标链接辅助你到点。自驾游客则会得到驾车途经点式的 Google 导航串联，但仍建议你出发前查看实时路况与封闭信息。",
      "一日游的「可执行」意味着：每一段停留有大致时长、下雨时有备选点、每个推荐点可点开地图核对。我们不是长篇攻略搬运，而是把决策所需的官方入口与日历对齐到同一天内。",
      "点击下方按钮可带上推荐区域直接进入向导；你也可以回到首页选择「我住在新西兰」获得更贴近本地日常的默认值。出发前请以官方天气、NZTA 路况与 DOC 为准。",
    ],
    paragraphsEn: [
      "Auckland is built for there-and-back day trips: CBD museums & waterfront, West Auckland beaches & walks, North Shore villages & beaches, or Waiheke wine & coast. The hard part isn’t a bucket list—it’s ferry clocks, drive times, wind, and rain odds on the same calendar day.",
      "Pick the hub that matches where you actually start, choose a day-trip length and first travel day, and we align forecast windows to that hub. Results fold in NZTA road entry points and DOC safety links so you can verify before you leave.",
      "If you’re on public transport, choose transit in the wizard—pair AT journey planner with our map pins. Driving? You’ll get waypoint-style Google routes; still check live roads and closures yourself.",
      "“Runnable” means dwell times, rain alternates, and pins you can open—not a 5,000-word blog. We’re not copying long guides; we surface verifiable links and dates together.",
      "Use the button below to open the planner with a suggested Auckland starting preset. Always confirm live weather, NZTA, and DOC before you travel.",
    ],
    wizardQuery: "intent=local&region=auckland-central",
  },
  "auckland-weekend-trips": {
    slug: "auckland-weekend-trips",
    titleZh: "奥克兰周末短途：两天一夜怎么排才不赶",
    titleEn: "Auckland weekend trips — 2D/1N without feeling rushed",
    metaZh: "周末从奥克兰出发：Matakana、Coromandel、怀卡托温泉带或西区深度；用向导锁定天数与自驾偏好。",
    metaEn:
      "Weekend escapes from Auckland—two days and one night with realistic driving arcs, weather, and NZTA/DOC context.",
    paragraphsZh: [
      "周末游最常见的错误是把「想去的地方」堆满，却没有冷藏链式的车程缓冲。北上 Matakana / Tāwharanui、东向科罗曼德、南下怀卡托湖区与温泉带，或在西区做雨林与海岸组合——每一条都有不同的高峰车流与季节性封闭。",
      "在向导中选择「2 天 1 夜」或「3 天 2 夜」，并如实填写自驾或公共交通。系统按你的首日对齐多日预报；结果页会把雨天备选嵌进每一天，而不是事后补丁。",
      "住宿与预订本站不代订，但行程草案会提示哪些活动 commonly 需要预订（例如缆车、酒庄、旺季渡轮）。请你始终在出发前自行确认开放时间与票价。",
      "若你希望「少开车、多停留」，可在偏好里勾选轻松、亲子或室内备选；我们会倾向缩短单日行驶半径并提示 DOC 步道难度的一般水平（仍以官网为准）。",
      "从下方进入向导时带上适合周末半径的区域预设；随时可在首页改成更符合你住址的出发点。",
    ],
    paragraphsEn: [
      "Weekend loops fail when every pin is “must-see” but drive buffers don’t exist. North to Matakana / Tāwharanui, east toward Coromandel, south into Waikato lakes & hot pools, or west for rainforest + coast—each has different peak traffic and seasonal closures.",
      "Pick 2D/1N or 3D/2N and whether you drive—forecasts span your whole window, and rain alternates land inside each day.",
      "We don’t book hotels or tickets; the draft flags activities that often need bookings (gondolas, wineries, peak ferries)—you confirm hours and prices.",
      "Prefer low mileage? Choose easy/family/indoor-friendly vibes—we shorten daily radius and describe track grades at a high level (DOC remains authoritative).",
      "Open the planner below with a weekend-friendly preset; switch hubs on the home page if you live outside the CBD.",
    ],
    wizardQuery: "intent=local&region=matakana-coast&duration=2d1n",
  },
  "waiheke-island-day-trip": {
    slug: "waiheke-island-day-trip",
    titleZh: "激流岛 Waiheke 一日游：渡轮、酒庄与海岸路线怎么排",
    titleEn: "Waiheke Island day trip — ferries, wine & beaches",
    metaZh: "奥克兰 Fullers 渡轮出发；把船上时间、酒庄预订与海滩停留放进同一天的可执行草案。",
    metaEn:
      "Plan Waiheke from Auckland with ferry time, wine stops, and coast walks—demo-ready day layout.",
    paragraphsZh: [
      "激流岛的约束主要是渡轮：排队、航程、末班时间与岛上接驳方式决定你能诚实走完多少点。一日游建议「海岸 + 酒庄 + 小镇午餐」三角结构，而不是横跨全岛。",
      "在向导中选择 Waiheke 片区、一日游、是否自驾（岛上亦可租车或打车）。公共交通模式下，行程会以公交可达性与步行半径为主；自驾则可串联更多观景点但需自行留意停车位与窄路。",
      "结果页会附带 Open-Meteo 天气预报摘要及 DOC 相关海岸安全入口（若线路靠近保护区或步道）。降雨概率偏高时，备选室内或酒庄室内品鉴会更现实。",
      "本站示例行程页提供版式预览；真实生成请以你的具体日期与偏好为准。欢迎把想法写在向导最后一页的补充说明里。",
    ],
    paragraphsEn: [
      "Ferry clocks dominate Waiheke: queues, sailing time, last sailings, and how you move on-island. A honest day is coast + wine + village lunch—not every corner of the island.",
      "Choose the Waiheke hub, day trip length, and drive vs transit. Transit-first plans favour bus-friendly pins; driving unlocks more viewpoints—mind parking and narrow roads yourself.",
      "Forecasts and DOC coastal safety links appear on the results page; when rain odds are high, indoor tastings beat exposed coastal walks.",
      "Try the sample itinerary layout, then generate your own dates and vibe on the last wizard step.",
    ],
    wizardQuery: "intent=local&region=waiheke&duration=day",
  },
  "piha-muriwai-day-trip": {
    slug: "piha-muriwai-day-trip",
    titleZh: "Piha 与 Muriwai 黑沙滩一日：西海岸自驾与安全要点",
    titleEn: "Piha & Muriwai black-sand beaches — west coast day drive",
    metaZh: "Waitakere 西海岸：黑沙滩、塘鹅栖息地与会堂步道；天气与海况优先于打卡数量。",
    metaEn:
      "West Auckland black-sand beaches: surf hazards, gannets, and rainforest roads—plan with weather first.",
    paragraphsZh: [
      "这条线适合自驾：Arataki 访客中心可作为雨林与安全信息的第一站；Piha 与 Muriwai 相距车程适中但弯道多，雨天路面更滑。请不要按照「网红点数」硬赶，海况与离岸流才是限制因素。",
      "向导中选择西区 Waitakere / 黑沙滩片区、一日游与驾车模式，偏好可选自然、摄影与轻徒步。雨天的备选可能是访客中心与较短步道，而非长时间海滩涉水。",
      "结果页会链接 DOC 官方页面摘要；请务必阅读海滩游泳旗帜与季节性关闭信息。本站不提供救生服务信息实时推送，请以现场告示为准。",
    ],
    paragraphsEn: [
      "Best as a self-drive loop: Arataki for rainforest context; Piha and Muriwai are plausible same-day but winding and slick when wet. Surf hazards—not Instagram counts—should cap what you attempt.",
      "Pick Waitakere-west, day trip, driving, and nature/photo/light-hike vibes. Wet-day alternates skew to visitor centres and shorter walks instead of long swims.",
      "DOC links surface on the results page—read surf flags and seasonal closures. We don’t stream lifeguard feeds; obey on-site signage.",
    ],
    wizardQuery: "intent=local&region=waitakere-west&duration=day&mobility=car",
  },
  "queenstown-one-day-itinerary": {
    slug: "queenstown-one-day-itinerary",
    titleZh: "皇后镇一日游：湖滨、缆车与高海拔天气变化",
    titleEn: "Queenstown one-day itinerary — lakefront, gondola & alpine weather",
    metaZh: "南岛皇后镇单日动线：把缆车预订、湖滨步行与山区温差写进行程节奏。",
    metaEn:
      "Queenstown in one day: lakefront pacing, Skyline timing, and alpine weather swings—planned together.",
    paragraphsZh: [
      "皇后镇的人流与停车位随季节波动极大；一日游更适合「湖滨慢行 + 一项标志性高空/缆车体验」，再把餐饮与拍照留白。不要把米尔福德峡湾同日塞进皇后镇市区行程——车程与现实体能都不允许。",
      "在向导中选择皇后镇湖区、一日游与是否自驾。公共交通友好区域亦可步行接驳部分码头活动；自驾请注意山区公路可能与天气联动封闭（以 NZTA 为准）。",
      "海拔升高会带来温差与阵风；结果页的天气摘要仍应与出发前实况比对。勇敢者项目请自行确认年龄、健康与预订条款。",
    ],
    paragraphsEn: [
      "Queenstown congestion swings by season—pick lakefront walking plus one iconic lift/luge/gondola slot, then leave food & photos breathing room. Don’t same-day Milford from town; distances and fatigue won’t cooperate.",
      "Choose Queenstown-lakes + day trip + mobility. Transit-friendly pins exist for wharf walks; drivers should monitor alpine road notices on NZTA.",
      "Thin air means cold/windy swings—compare forecasts to live conditions. Adventure activities: your booking rules apply.",
    ],
    wizardQuery: "intent=visitor&region=queenstown-lakes&duration=day",
  },
  "new-zealand-itinerary-planner-chinese": {
    slug: "new-zealand-itinerary-planner-chinese",
    titleZh: "新西兰中文行程规划：北岛南岛怎么接到「能走的一天」",
    titleEn: "New Zealand itinerary planner (Chinese travellers) — runnable days north & south",
    metaZh: "面向中文用户：把签证以外的可变因素（天气、路况、步道开放）拆进每日草案；中英双语向导。",
    metaEn:
      "Plan NZ trips with bilingual prompts—weather, roads, and DOC safety folded into each day, not buried in blogs.",
    paragraphsZh: [
      "许多攻略长于「景点名录」，短于「同一天内车程与体力是否匹配」。本站向导先问你从哪个片区出发、停留几天、是否自驾，再生成按日历对齐的天气摘要与官方路况入口，减少「到了才发现封路或大雨」的信息差。",
      "中文界面下，你依然应核对英文为主的官方页面（DOC、NZTA、运营商）；我们在结果页尽量给出可点击的官方链接与简短摘要，方便出发前复核。",
      "若你横跨北岛与南岛，请分段设置多日行程；每一次生成都会重新抓取预报。建议在结果页注册并将行程保存到账户，便于换设备查看与管理。",
      "我们不代办签证、保险与租车合同；行程安排仅为辅助参考，不能替代你对高风险活动的独立判断与现场遵守标志。",
    ],
    paragraphsEn: [
      "Bucket lists rarely answer “can I physically drive this loop today?” Our wizard asks hub, nights, and mobility first—then folds forecasts and NZTA/DOC entry points into each day.",
      "Even in Chinese UI, official operators often publish English-first updates—use our outbound links and verify yourself.",
      "Split North/South loops into segments; each regenerate pulls fresh weather. Sign up on the results page to save itineraries to your account and access them on any device.",
      "We don’t handle visas, insurance, or rentals—plans are aids, not substitutes for your judgement or signage.",
    ],
    wizardQuery: "intent=visitor&region=christchurch-canterbury&duration=2d1n",
  },
};

export function getGuide(slug: string): GuideDoc | undefined {
  return GUIDES[slug as GuideSlug];
}
