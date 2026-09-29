export type FieldType = "text" | "textarea" | "number" | "select" | "checkbox" | "date" | "url";

export type Field = {
  /** Dotted path inside the item, e.g. "statGain.stamina" or "socials.0.url". */
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  /** Options filled in at render time from other sections. */
  optionsFrom?: "regions" | "episodes" | "quests";
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** Grid width out of 4 columns. */
  span?: 1 | 2 | 4;
  placeholder?: string;
};

const opts = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

export const QUEST_STATUS_OPTIONS = opts([
  ["todo", "待挑战"],
  ["active", "进行中"],
  ["done", "已完成"],
  ["failed", "挑战失败"],
]);

export const PLAYER_FIELDS: Field[] = [
  { name: "name", label: "名字", type: "text", required: true },
  { name: "title", label: "默认称号", type: "text" },
  { name: "server", label: "所在服务器", type: "text" },
  { name: "launchDate", label: "开服日期", type: "date", required: true },
  { name: "streakDays", label: "连续登录天数", type: "number", min: 0 },
  { name: "avatar", label: "头像图片链接（留空用像素头像）", type: "text", span: 2, placeholder: "https://… 或 /avatar.jpg" },
  { name: "bio", label: "简介", type: "textarea", span: 4 },
  { name: "stats.stamina.value", label: "初始体力", type: "number", min: 0, max: 100 },
  { name: "stats.social.value", label: "初始社交", type: "number", min: 0, max: 100 },
  { name: "stats.english.value", label: "初始英语", type: "number", min: 0, max: 100 },
  { name: "stats.drive.value", label: "初始行动力", type: "number", min: 0, max: 100 },
  { name: "socials.0.url", label: "抖音主页链接", type: "url", span: 2 },
  { name: "socials.1.url", label: "小红书主页链接", type: "url", span: 2 },
];

export const MAIN_QUEST_FIELDS: Field[] = [
  { name: "id", label: "编号", type: "text", required: true },
  { name: "title", label: "主线标题", type: "text", required: true, span: 2 },
  { name: "unit", label: "单位", type: "text" },
  { name: "current", label: "当前进度", type: "number", min: 0 },
  { name: "target", label: "目标", type: "number", min: 1 },
  { name: "desc", label: "说明", type: "textarea", span: 4 },
];

export const LIST_SECTIONS = ["quests", "regions", "episodes", "stories", "achievements", "dailyCardPool"] as const;
export type ListSection = (typeof LIST_SECTIONS)[number];

export const LIST_FIELDS: Record<ListSection, Field[]> = {
  quests: [
    { name: "id", label: "编号", type: "text", required: true },
    { name: "status", label: "状态", type: "select", options: QUEST_STATUS_OPTIONS, required: true },
    {
      name: "kind",
      label: "类型",
      type: "select",
      required: true,
      options: opts([
        ["main", "主线"],
        ["side", "支线"],
        ["viewer", "观众任务"],
        ["daily", "每日"],
      ]),
    },
    { name: "zone", label: "副本", type: "text", required: true },
    { name: "title", label: "标题", type: "text", required: true, span: 4 },
    { name: "desc", label: "说明", type: "textarea", span: 4 },
    { name: "difficulty", label: "难度 1–5", type: "number", min: 1, max: 5, required: true },
    { name: "xp", label: "经验值", type: "number", min: 0, step: 10, required: true },
    { name: "episode", label: "所属剧集", type: "select", optionsFrom: "episodes" },
    { name: "regionId", label: "发生地点", type: "select", optionsFrom: "regions" },
    { name: "date", label: "完成日期", type: "date" },
    { name: "videoUrl", label: "视频链接", type: "url", span: 2 },
    { name: "statGain.stamina", label: "体力 +", type: "number", min: 0 },
    { name: "statGain.social", label: "社交 +", type: "number", min: 0 },
    { name: "statGain.english", label: "英语 +", type: "number", min: 0 },
    { name: "statGain.drive", label: "行动力 +", type: "number", min: 0 },
    { name: "result", label: "结算报告（完成/失败后写）", type: "textarea", span: 4 },
  ],
  regions: [
    { name: "unlocked", label: "已点亮（驱散迷雾）", type: "checkbox" },
    { name: "name", label: "中文名", type: "text", required: true },
    { name: "nameEn", label: "英文名", type: "text" },
    { name: "id", label: "编号", type: "text", required: true },
    { name: "firstVisit", label: "首次到访", type: "text", placeholder: "2026-10-02 或 出生点" },
    { name: "lat", label: "纬度", type: "number", step: 0.0001, required: true },
    { name: "lng", label: "经度", type: "number", step: 0.0001, required: true },
    { name: "radius", label: "迷雾半径（米）", type: "number", min: 100, step: 100, required: true },
    { name: "note", label: "地点记录", type: "textarea", span: 4 },
  ],
  episodes: [
    { name: "id", label: "编号", type: "text", required: true },
    {
      name: "status",
      label: "状态",
      type: "select",
      required: true,
      options: opts([
        ["planned", "未解锁"],
        ["filming", "拍摄中"],
        ["released", "已上线"],
      ]),
    },
    { name: "title", label: "标题", type: "text", required: true, span: 2 },
    { name: "summary", label: "简介", type: "textarea", span: 4 },
    { name: "videoUrl", label: "视频链接", type: "url", span: 4 },
  ],
  stories: [
    { name: "date", label: "日期", type: "date", required: true },
    {
      name: "type",
      label: "类型",
      type: "select",
      required: true,
      options: opts([
        ["story", "冒险记录"],
        ["fail", "失败记录"],
        ["announcement", "公告"],
        ["update", "版本更新"],
      ]),
    },
    { name: "episode", label: "所属剧集", type: "select", optionsFrom: "episodes" },
    { name: "regionId", label: "地点", type: "select", optionsFrom: "regions" },
    { name: "title", label: "标题", type: "text", required: true, span: 4 },
    { name: "body", label: "正文（空一行分段）", type: "textarea", span: 4 },
    { name: "videoUrl", label: "视频链接", type: "url", span: 2 },
    { name: "xp", label: "经验值（可选）", type: "number", min: 0 },
    { name: "id", label: "编号", type: "text", required: true },
  ],
  achievements: [
    { name: "unlocked", label: "已解锁", type: "checkbox" },
    {
      name: "kind",
      label: "类型",
      type: "select",
      required: true,
      options: opts([
        ["normal", "普通成就"],
        ["fail", "失败图鉴"],
        ["hidden", "隐藏成就"],
      ]),
    },
    { name: "date", label: "解锁日期", type: "date" },
    { name: "id", label: "编号", type: "text", required: true },
    { name: "title", label: "标题", type: "text", required: true, span: 2 },
    { name: "desc", label: "条件说明", type: "text", span: 2 },
  ],
  dailyCardPool: [
    { name: "title", label: "任务卡内容", type: "text", required: true, span: 2 },
    { name: "zone", label: "分类", type: "text", required: true },
    { name: "xp", label: "经验值", type: "number", min: 0, step: 10, required: true },
  ],
};

export const SKILL_NODE_FIELDS: Field[] = [
  { name: "title", label: "技能", type: "text", required: true },
  {
    name: "status",
    label: "状态",
    type: "select",
    required: true,
    options: opts([
      ["locked", "未解锁"],
      ["active", "修炼中"],
      ["unlocked", "已点亮"],
    ]),
  },
  { name: "questId", label: "关联任务", type: "select", optionsFrom: "quests" },
  { name: "id", label: "编号", type: "text", required: true },
  { name: "desc", label: "说明", type: "text", span: 4 },
];

export const SKILL_BRANCH_FIELDS: Field[] = [
  { name: "name", label: "分支名", type: "text", required: true },
  { name: "icon", label: "图标（emoji）", type: "text" },
  {
    name: "color",
    label: "颜色",
    type: "select",
    required: true,
    options: opts([
      ["cyan", "青"],
      ["lime", "绿"],
      ["amber", "黄"],
      ["rose", "红"],
      ["violet", "紫"],
    ]),
  },
  { name: "id", label: "编号", type: "text", required: true },
];

/* ───────────── helpers shared by the form renderer and the server parser ───────────── */

export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i]!;
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = /^\d+$/.test(keys[i + 1]!) ? [] : {};
    cur = cur[k] as Record<string, unknown>;
  }
  const last = keys.at(-1)!;
  if (value === undefined) delete cur[last];
  else cur[last] = value;
}

/** Applies submitted form values onto a copy of `base`, keeping fields the form doesn't show. */
export function applyFields<T>(base: T, fields: Field[], fd: FormData): T {
  const out = structuredClone(base) as Record<string, unknown>;
  for (const f of fields) {
    const raw = fd.get(f.name);
    let value: unknown;
    if (f.type === "checkbox") {
      value = raw === "on";
    } else if (f.type === "number") {
      const s = String(raw ?? "").trim();
      if (s === "") value = f.required ? (f.min ?? 0) : undefined;
      else {
        let n = Number(s);
        if (!Number.isFinite(n)) n = f.min ?? 0;
        if (f.min != null) n = Math.max(f.min, n);
        if (f.max != null) n = Math.min(f.max, n);
        value = n === 0 && !f.required && f.name.startsWith("statGain.") ? undefined : n;
      }
    } else {
      const s = String(raw ?? "").trim();
      value = s === "" && !f.required ? undefined : s;
    }
    setPath(out, f.name, value);
  }
  if (out.statGain && typeof out.statGain === "object" && !Object.keys(out.statGain).length) delete out.statGain;
  return out as T;
}
