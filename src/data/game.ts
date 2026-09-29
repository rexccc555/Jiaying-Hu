/**
 * 人生重新开服 · 默认存档
 *
 * 日常更新请用网站后台 /admin。这里的内容只是初始值：
 * 某一块在后台保存过之后，网站就以数据库里的版本为准（src/lib/content.ts），
 * 在后台「高级」里点「恢复默认」才会回到这里的内容。
 */

export type QuestStatus = "todo" | "active" | "done" | "failed";
export type QuestKind = "main" | "side" | "viewer" | "daily";

export type Quest = {
  id: string;
  title: string;
  kind: QuestKind;
  zone: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  xp: number;
  status: QuestStatus;
  desc: string;
  episode?: string;
  regionId?: string;
  date?: string;
  videoUrl?: string;
  result?: string;
  statGain?: Partial<Record<StatKey, number>>;
};

export type StatKey = "stamina" | "social" | "english" | "drive";

export type Region = {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  radius: number;
  unlocked: boolean;
  firstVisit?: string;
  note?: string;
};

export type SkillNode = {
  id: string;
  title: string;
  desc: string;
  status: "unlocked" | "active" | "locked";
  questId?: string;
};

export type SkillBranch = {
  id: string;
  name: string;
  icon: string;
  color: "cyan" | "lime" | "amber" | "rose" | "violet";
  nodes: SkillNode[];
};

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  kind: "normal" | "fail" | "hidden";
  unlocked: boolean;
  date?: string;
};

export type Story = {
  id: string;
  date: string;
  type: "announcement" | "story" | "fail" | "update";
  title: string;
  body: string;
  episode?: string;
  videoUrl?: string;
  regionId?: string;
  xp?: number;
};

export type Episode = {
  id: string;
  title: string;
  status: "released" | "filming" | "planned";
  summary: string;
  videoUrl?: string;
};

export type VoteOption = {
  id: string;
  zone: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  xp: number;
  desc: string;
};

/* ───────────────────────── 玩家 ───────────────────────── */

export const player = {
  /** 你的名字 / 昵称 */
  name: "玩家 001",
  title: "新手村居民",
  server: "奥克兰服务器",
  /** 开服日期：用于计算「开服第 N 天」 */
  launchDate: "2026-09-29",
  /** 连续登录天数（手动更新） */
  streakDays: 0,
  /** 头像：放到 public/avatar.jpg 后改成 "/avatar.jpg"；留空显示像素头像 */
  avatar: "",
  bio: "没有天赋，没有装备，也不知道主线任务是什么。唯一的外挂：完成生活里的小事，就能获得经验值。",
  stats: {
    stamina: { label: "体力", value: 20 },
    social: { label: "社交", value: 15 },
    english: { label: "英语", value: 10 },
    drive: { label: "行动力", value: 5 },
  } satisfies Record<StatKey, { label: string; value: number }>,
  /** 关注入口，留空则不显示 */
  socials: [
    { label: "抖音", url: "" },
    { label: "小红书", url: "" },
  ],
};

/** 当前主线任务 */
export const mainQuest = {
  id: "MQ-001",
  title: "找回生活的主动权",
  desc: "连续 30 天，每天完成一件以前不敢做、懒得做或者一直拖着的小事。",
  current: 0,
  target: 30,
  unit: "天",
};

/* ───────────────────────── 任务 ───────────────────────── */

export const quests: Quest[] = [
  {
    id: "001",
    title: "离开安全区",
    kind: "main",
    zone: "新手任务",
    difficulty: 1,
    xp: 100,
    status: "active",
    desc: "在惠灵顿山醒来。拉开窗帘，换好衣服，走出房间。出个门也能升级。",
    episode: "EP01",
    regionId: "mt-wellington",
    statGain: { drive: 2 },
  },
  {
    id: "002",
    title: "海边跑步 1 公里",
    kind: "main",
    zone: "体力副本",
    difficulty: 2,
    xp: 200,
    status: "todo",
    desc: "以前跑两百米就觉得自己不行了。这次目标：1 公里，不许停。",
    episode: "EP01",
    statGain: { stamina: 1 },
  },
  {
    id: "003",
    title: "BOSS：用英语点一杯咖啡",
    kind: "main",
    zone: "社交副本",
    difficulty: 4,
    xp: 300,
    status: "todo",
    desc: "最不想打的一个怪。站在点餐台前，不许用手指着菜单说 this one。",
    episode: "EP01",
    statGain: { social: 1, english: 1 },
  },
  {
    id: "004",
    title: "看完一场海边日落",
    kind: "side",
    zone: "隐藏任务",
    difficulty: 1,
    xp: 100,
    status: "todo",
    desc: "什么都不做，就坐着看太阳落下去。隐藏任务：好好生活。",
    episode: "EP01",
  },
  {
    id: "005",
    title: "高尔夫练习场：从零学挥杆",
    kind: "side",
    zone: "贵族副本",
    difficulty: 3,
    xp: 300,
    status: "todo",
    desc: "挑战一个「有钱人的副本」。预计结果：疯狂挥空，钱包 -30。",
    episode: "EP02",
    statGain: { stamina: 1 },
  },
  {
    id: "006",
    title: "找到一个不花钱的秘密观景点",
    kind: "side",
    zone: "探索副本",
    difficulty: 2,
    xp: 250,
    status: "todo",
    desc: "随机挑一条徒步路线，去一个从没到过的地方。",
    episode: "EP03",
  },
  {
    id: "007",
    title: "20 纽币生存一天",
    kind: "side",
    zone: "生存副本",
    difficulty: 3,
    xp: 350,
    status: "todo",
    desc: "用 20 纽币解决三餐。超市采购、做饭、预算管理，全部算进游戏。",
    episode: "EP04",
  },
];

/* ───────────────────────── 本周投票 ───────────────────────── */

export const voteRound = {
  /** 每开一轮新投票就换一个 id，旧票会自动清零 */
  id: "2026-W40",
  title: "本周任务大厅",
  closesAt: "2026-10-11",
  options: [
    {
      id: "stranger-event",
      zone: "社交副本",
      title: "独自参加一场陌生人的活动",
      difficulty: 4,
      xp: 400,
      desc: "在 Meetup / Eventbrite 上随机报名一个本地活动，一个人去，至少和一个人聊满 5 分钟。",
    },
    {
      id: "english-only-day",
      zone: "语言副本",
      title: "一天只说英语",
      difficulty: 5,
      xp: 500,
      desc: "从起床到睡觉，说话、打字、自言自语全部英语。说一句中文，XP -20。",
    },
    {
      id: "nz20-town",
      zone: "探索副本",
      title: "用 20 纽币探索一座陌生小镇",
      difficulty: 3,
      xp: 300,
      desc: "坐公交或开车去一个没去过的小镇，交通以外只允许花 20 纽币。",
    },
  ] satisfies VoteOption[],
};

/* ───────────────────────── 地图 ───────────────────────── */

/**
 * 奥克兰服务器地图。lat/lng 是区域中心，radius 是驱散迷雾的半径（米）。
 * 新去一个地方：把 unlocked 改成 true；不在列表里的地方，照格式加一条即可。
 */
export const regions: Region[] = [
  {
    id: "mt-wellington",
    name: "惠灵顿山",
    nameEn: "Mt Wellington · Maungarei",
    lat: -36.8932,
    lng: 174.8425,
    radius: 1500,
    unlocked: true,
    firstVisit: "出生点",
    note: "新手村。玩家在这里醒来，第一集从这里出门。",
  },
  { id: "ellerslie", name: "埃勒斯利", nameEn: "Ellerslie", lat: -36.8985, lng: 174.8085, radius: 1000, unlocked: false },
  { id: "panmure", name: "潘穆尔", nameEn: "Panmure", lat: -36.9005, lng: 174.8575, radius: 1000, unlocked: false },
  { id: "sylvia-park", name: "西尔维亚公园", nameEn: "Sylvia Park", lat: -36.9165, lng: 174.8415, radius: 800, unlocked: false },
  { id: "mission-bay", name: "使命湾", nameEn: "Mission Bay", lat: -36.8485, lng: 174.8335, radius: 1000, unlocked: false },
  { id: "newmarket", name: "新市场", nameEn: "Newmarket", lat: -36.8695, lng: 174.7775, radius: 900, unlocked: false },
  { id: "mt-eden", name: "伊甸山", nameEn: "Mt Eden · Maungawhau", lat: -36.8775, lng: 174.7645, radius: 900, unlocked: false },
  { id: "cbd", name: "奥克兰市中心", nameEn: "Auckland CBD", lat: -36.8485, lng: 174.7633, radius: 1200, unlocked: false },
  { id: "ponsonby", name: "庞森比", nameEn: "Ponsonby", lat: -36.8545, lng: 174.7435, radius: 900, unlocked: false },
  { id: "one-tree-hill", name: "独树山", nameEn: "One Tree Hill · Maungakiekie", lat: -36.9, lng: 174.7835, radius: 900, unlocked: false },
  { id: "onehunga", name: "奥尼杭格", nameEn: "Onehunga", lat: -36.9235, lng: 174.785, radius: 1000, unlocked: false },
  { id: "devonport", name: "德文港", nameEn: "Devonport", lat: -36.8295, lng: 174.797, radius: 1000, unlocked: false },
  { id: "takapuna", name: "塔卡普纳", nameEn: "Takapuna", lat: -36.788, lng: 174.77, radius: 1200, unlocked: false },
  { id: "howick", name: "豪威克", nameEn: "Howick", lat: -36.8995, lng: 174.93, radius: 1200, unlocked: false },
  { id: "botany", name: "博塔尼", nameEn: "Botany", lat: -36.93, lng: 174.912, radius: 1000, unlocked: false },
  { id: "manukau", name: "马努考", nameEn: "Manukau", lat: -36.993, lng: 174.88, radius: 1400, unlocked: false },
  { id: "henderson", name: "亨德森", nameEn: "Henderson", lat: -36.879, lng: 174.631, radius: 1400, unlocked: false },
  { id: "albany", name: "奥尔巴尼", nameEn: "Albany", lat: -36.728, lng: 174.696, radius: 1400, unlocked: false },
  { id: "piha", name: "皮哈海滩", nameEn: "Piha", lat: -36.954, lng: 174.469, radius: 1500, unlocked: false },
  { id: "waiheke", name: "激流岛", nameEn: "Waiheke Island", lat: -36.8, lng: 175.08, radius: 3500, unlocked: false },
];

/* ───────────────────────── 技能树 ───────────────────────── */

export const skillTree: SkillBranch[] = [
  {
    id: "english",
    name: "英语",
    icon: "💬",
    color: "cyan",
    nodes: [
      { id: "en-1", title: "敢开口点咖啡", desc: "不用手指菜单，完整说一句点单。", status: "active", questId: "003" },
      { id: "en-2", title: "一天只说英语", desc: "24 小时英语生存。", status: "locked" },
      { id: "en-3", title: "独自打电话", desc: "打给餐厅 / 医生 / 客服，不挂断。", status: "locked" },
      { id: "en-4", title: "参加本地活动", desc: "在全英文环境里待满一整场。", status: "locked" },
    ],
  },
  {
    id: "sport",
    name: "运动",
    icon: "🏃",
    color: "lime",
    nodes: [
      { id: "sp-1", title: "跑完 1 公里", desc: "不停下来。", status: "active", questId: "002" },
      { id: "sp-2", title: "第一次进健身房", desc: "进去，并且没有十分钟就走。", status: "locked" },
      { id: "sp-3", title: "学会挥杆", desc: "高尔夫练习场击中 10 个球。", status: "locked", questId: "005" },
      { id: "sp-4", title: "打完 18 洞", desc: "终极贵族技能。", status: "locked" },
    ],
  },
  {
    id: "social",
    name: "社交",
    icon: "🤝",
    color: "amber",
    nodes: [
      { id: "so-1", title: "和店员闲聊一句", desc: "不只是 thank you。", status: "locked" },
      { id: "so-2", title: "独自参加陌生人活动", desc: "观众投票任务候选。", status: "locked" },
      { id: "so-3", title: "交到一个本地朋友", desc: "加上联系方式，并且第二次见面。", status: "locked" },
    ],
  },
  {
    id: "survival",
    name: "生存",
    icon: "🛒",
    color: "rose",
    nodes: [
      { id: "su-1", title: "自己做一顿饭", desc: "不是泡面。", status: "locked" },
      { id: "su-2", title: "20 纽币过一天", desc: "三餐全包。", status: "locked", questId: "007" },
      { id: "su-3", title: "记账一个月", desc: "每一笔都记。", status: "locked" },
    ],
  },
  {
    id: "explore",
    name: "探索",
    icon: "🧭",
    color: "violet",
    nodes: [
      { id: "ex-1", title: "离开安全区", desc: "走出房间。", status: "active", questId: "001" },
      { id: "ex-2", title: "发现秘密观景点", desc: "一条从没走过的徒步线。", status: "locked", questId: "006" },
      { id: "ex-3", title: "解锁第一个新地区", desc: "走出惠灵顿山新手村。", status: "locked" },
      { id: "ex-4", title: "驱散半个奥克兰的迷雾", desc: "点亮地图上一半的区域。", status: "locked" },
    ],
  },
];

/* ───────────────────────── 成就 ───────────────────────── */

export const achievements: Achievement[] = [
  { id: "a-login", title: "欢迎玩家，重新登录人生", desc: "开服。", kind: "normal", unlocked: true, date: "2026-09-29" },
  { id: "a-out", title: "第一次离开安全区", desc: "完成新手任务：走出房间。", kind: "normal", unlocked: false },
  { id: "a-lv2", title: "新手村毕业", desc: "升到 Lv.2。", kind: "normal", unlocked: false },
  { id: "a-coffee", title: "这次我没逃", desc: "用英语完成一次点单。", kind: "normal", unlocked: false },
  { id: "a-map", title: "迷雾驱散者", desc: "点亮第一个新地区。", kind: "normal", unlocked: false },
  { id: "f-social", title: "社交恐惧症体验卡", desc: "英语交流失败一次。", kind: "fail", unlocked: false },
  { id: "f-gym", title: "健身房十分钟体验卡", desc: "练到一半就回家。", kind: "fail", unlocked: false },
  { id: "f-wallet", title: "钱包空空但精神富有", desc: "挑战失败导致金币清零。", kind: "fail", unlocked: false },
  { id: "f-golf", title: "贵族技能学习失败", desc: "连续挥空 10 次。", kind: "fail", unlocked: false },
  { id: "h-sunset", title: "？？？", desc: "隐藏成就：好好生活。", kind: "hidden", unlocked: false },
];

/* ───────────────────────── 剧情章节 ───────────────────────── */

export const episodes: Episode[] = [
  {
    id: "EP01",
    title: "今天，我决定重新开始练级",
    status: "filming",
    summary: "人生卡关的一天：离开安全区、海边跑步、英语点单 BOSS，最后坐在海边看日落。",
  },
  {
    id: "EP02",
    title: "我决定挑战一个有钱人的副本",
    status: "planned",
    summary: "从零学高尔夫。疯狂挥空之后，系统弹出：贵族技能学习失败，钱包 -30。",
  },
  {
    id: "EP03",
    title: "在新西兰，我发现一个不花钱的隐藏副本",
    status: "planned",
    summary: "随机挑一条徒步路线，找到一个没人知道的观景点。",
  },
  {
    id: "EP04",
    title: "我带着 20 纽币，挑战新西兰生存副本",
    status: "planned",
    summary: "三餐预算 20 纽币，超市、做饭、预算管理全部游戏化。",
  },
];

/* ───────────────────────── 故事档案 ───────────────────────── */

export const stories: Story[] = [
  {
    id: "s-000",
    date: "2026-09-29",
    type: "announcement",
    title: "开服公告：人生重新开服",
    body:
      "不知道你有没有过这种感觉：每天一睁眼，就不知道自己要干嘛。\n\n后来我想，既然人生这么无聊，那为什么不把它当成游戏玩？\n\n从今天开始，我把自己在新西兰的生活当成一个开放世界游戏。每完成一件现实里的小事，就结算一次经验值。成功会记下来，失败也会记下来——失败有专门的图鉴。\n\n这里是游戏大厅。你可以随时回来看看我升级了没有，也可以去任务大厅给我派任务。",
    regionId: "mt-wellington",
  },
];

/* ───────────────────────── 观众任务卡 ───────────────────────── */

export const dailyCardPool: { title: string; xp: number; zone: string }[] = [
  { title: "独自去一家从没去过的咖啡馆", xp: 100, zone: "探索" },
  { title: "出门走 20 分钟，不带耳机", xp: 80, zone: "体力" },
  { title: "给一个很久没联系的朋友发消息", xp: 120, zone: "社交" },
  { title: "把拖了最久的一件小事做完", xp: 150, zone: "行动力" },
  { title: "早睡一次，11 点前放下手机", xp: 100, zone: "体力" },
  { title: "自己做一顿饭，拍下来", xp: 100, zone: "生存" },
  { title: "对店员说一句 thank you 之外的话", xp: 120, zone: "社交" },
  { title: "去一个公园坐 10 分钟，什么都不做", xp: 60, zone: "隐藏" },
  { title: "学会一个新单词，并且今天用一次", xp: 80, zone: "语言" },
  { title: "收拾好你的桌面", xp: 60, zone: "行动力" },
  { title: "看一次日出或日落", xp: 100, zone: "隐藏" },
  { title: "走一条从没走过的路回家", xp: 80, zone: "探索" },
  { title: "做 20 个深蹲", xp: 60, zone: "体力" },
  { title: "给自己写下明天要完成的 3 件事", xp: 60, zone: "行动力" },
  { title: "在社交软件上认真夸一个人", xp: 80, zone: "社交" },
  { title: "一整天不点外卖", xp: 100, zone: "生存" },
  { title: "去图书馆或书店待 30 分钟", xp: 90, zone: "探索" },
  { title: "把手机屏幕使用时间减少 1 小时", xp: 120, zone: "行动力" },
];
