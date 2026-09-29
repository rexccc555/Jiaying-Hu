"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, requireAdmin, setAdminPassword, tokenForPassword } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getCurrentRound, setCurrentRound } from "@/lib/rounds";
import { getContent, isContentSection, resetSection, saveSection, type GameContent } from "@/lib/content";
import type { SkillBranch, SkillNode } from "@/data/game";
import {
  applyFields,
  LIST_FIELDS,
  LIST_SECTIONS,
  MAIN_QUEST_FIELDS,
  PLAYER_FIELDS,
  SKILL_BRANCH_FIELDS,
  SKILL_NODE_FIELDS,
  type ListSection,
} from "./fields";

function refresh() {
  revalidatePath("/", "layout");
}

function str(fd: FormData, key: string, max: number): string {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

function int(fd: FormData, key: string, min: number, max: number, fallback: number): number {
  const n = Number(fd.get(key));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function taskFields(fd: FormData, fallbackText: string) {
  return {
    title: str(fd, "title", 40) || fallbackText.slice(0, 40),
    zone: str(fd, "zone", 20) || "观众任务",
    difficulty: int(fd, "difficulty", 1, 5, 3),
    xp: int(fd, "xp", 10, 5000, 300),
    desc: str(fd, "desc", 300) || fallbackText,
  };
}

export async function login(fd: FormData) {
  const token = await tokenForPassword(String(fd.get("password") ?? "").slice(0, 200));
  if (!token) {
    await new Promise((r) => setTimeout(r, 800));
    redirect("/admin?e=1");
  }
  await setAdminCookie(token);
  redirect("/admin");
}

async function setAdminCookie(token: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function changePassword(fd: FormData) {
  await requireAdmin();
  const next = String(fd.get("next") ?? "").trim();
  if (next.length < 8 || next.length > 200 || next !== String(fd.get("confirm") ?? "").trim()) {
    redirect("/admin?tab=json&e=pw");
  }
  if (!(await tokenForPassword(String(fd.get("current") ?? "").slice(0, 200)))) {
    redirect("/admin?tab=json&e=pwcur");
  }
  await setAdminCookie(await setAdminPassword(next));
  redirect("/admin?tab=json&ok=pw");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function reviewSubmission(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id", 40);
  const intent = str(fd, "intent", 10);
  const sub = await prisma.questSubmission.findUnique({ where: { id } });
  if (!sub) return;

  if (intent === "reject") {
    await prisma.questSubmission.update({
      where: { id },
      data: { status: "rejected", roundId: null, reviewedAt: new Date() },
    });
  } else {
    const round = intent === "round" ? await getCurrentRound() : null;
    await prisma.questSubmission.update({
      where: { id },
      data: {
        ...taskFields(fd, sub.text),
        status: "approved",
        roundId: round?.id ?? null,
        reviewedAt: new Date(),
      },
    });
  }
  refresh();
}

export async function moveToRound(fd: FormData) {
  await requireAdmin();
  const round = await getCurrentRound();
  await prisma.questSubmission.update({
    where: { id: str(fd, "id", 40) },
    data: { roundId: round.id, status: "approved", reviewedAt: new Date() },
  });
  refresh();
}

export async function removeFromRound(fd: FormData) {
  await requireAdmin();
  await prisma.questSubmission.update({ where: { id: str(fd, "id", 40) }, data: { roundId: null } });
  refresh();
}

export async function restoreSubmission(fd: FormData) {
  await requireAdmin();
  await prisma.questSubmission.update({
    where: { id: str(fd, "id", 40) },
    data: { status: "pending", roundId: null, reviewedAt: null },
  });
  refresh();
}

export async function createOwnTask(fd: FormData) {
  await requireAdmin();
  const text = str(fd, "title", 40);
  if (!text) return;
  const toRound = str(fd, "intent", 10) === "round";
  const round = toRound ? await getCurrentRound() : null;
  await prisma.questSubmission.create({
    data: {
      text,
      nickname: "玩家本人",
      ipHash: "admin",
      ...taskFields(fd, text),
      status: "approved",
      roundId: round?.id ?? null,
      reviewedAt: new Date(),
    },
  });
  refresh();
}

export async function startNewRound(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "roundId", 30).replace(/[^\w-]/g, "");
  const title = str(fd, "roundTitle", 30) || "本周任务大厅";
  const closesAt = str(fd, "closesAt", 10);
  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(closesAt)) return;
  await setCurrentRound({ id, title, closesAt });
  refresh();
}

/* ───────────────────────── 网站内容 ───────────────────────── */

function isListSection(s: string): s is ListSection {
  return (LIST_SECTIONS as readonly string[]).includes(s);
}

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" });
}

/** Resolves the item by hidden id first (so a stale index can't overwrite the wrong row), then by index. */
function findIndex(list: unknown[], fd: FormData): number {
  const key = String(fd.get("key") ?? "");
  if (key) {
    const byKey = list.findIndex((x) => (x as { id?: string; title?: string }).id === key);
    if (byKey >= 0) return byKey;
  }
  const i = Number(fd.get("index"));
  return Number.isInteger(i) && i >= 0 && i < list.length ? i : -1;
}

export async function saveObject(fd: FormData) {
  await requireAdmin();
  const section = str(fd, "section", 20);
  const c = await getContent();
  if (section === "player") await saveSection("player", applyFields(c.player, PLAYER_FIELDS, fd));
  else if (section === "mainQuest") await saveSection("mainQuest", applyFields(c.mainQuest, MAIN_QUEST_FIELDS, fd));
  refresh();
}

export async function saveListItem(fd: FormData) {
  await requireAdmin();
  const section = str(fd, "section", 20);
  if (!isListSection(section)) return;
  const c = await getContent();
  const list = [...c[section]] as unknown[];
  const i = findIndex(list, fd);
  if (i < 0) return;
  const item = applyFields(list[i], LIST_FIELDS[section], fd);
  list[i] = item;
  await saveSection(section, list as GameContent[typeof section]);

  // Finishing a quest at a place clears the fog there.
  if (section === "quests") {
    const q = item as GameContent["quests"][number];
    if (q.status === "done" && q.regionId) {
      const regions = [...c.regions];
      const r = regions.findIndex((x) => x.id === q.regionId);
      if (r >= 0 && !regions[r]!.unlocked) {
        regions[r] = { ...regions[r]!, unlocked: true, firstVisit: regions[r]!.firstVisit || q.date || today() };
        await saveSection("regions", regions);
      }
    }
  }
  refresh();
}

function newItem(section: ListSection, c: GameContent): unknown {
  const stamp = Date.now().toString(36);
  switch (section) {
    case "quests": {
      const max = c.quests.reduce((m, q) => Math.max(m, Number(q.id) || 0), 0);
      return {
        id: String(max + 1).padStart(3, "0"),
        title: "新任务",
        kind: "side",
        zone: "探索副本",
        difficulty: 2,
        xp: 200,
        status: "todo",
        desc: "",
      };
    }
    case "regions":
      return { id: `r-${stamp}`, name: "新地点", nameEn: "", lat: -36.8932, lng: 174.8425, radius: 1000, unlocked: false };
    case "episodes":
      return { id: `EP${String(c.episodes.length + 1).padStart(2, "0")}`, title: "新的一集", status: "planned", summary: "" };
    case "stories":
      return { id: `s-${stamp}`, date: today(), type: "story", title: "新故事", body: "" };
    case "achievements":
      return { id: `a-${stamp}`, title: "新成就", desc: "", kind: "normal", unlocked: false };
    case "dailyCardPool":
      return { title: "新任务卡", xp: 80, zone: "探索" };
  }
}

export async function addListItem(fd: FormData) {
  await requireAdmin();
  const section = str(fd, "section", 20);
  if (!isListSection(section)) return;
  const c = await getContent();
  const item = newItem(section, c);
  const list = section === "stories" ? [item, ...c[section]] : [...c[section], item];
  await saveSection(section, list as GameContent[typeof section]);
  refresh();
}

export async function deleteListItem(fd: FormData) {
  await requireAdmin();
  const section = str(fd, "section", 20);
  if (!isListSection(section)) return;
  const c = await getContent();
  const list = [...c[section]] as unknown[];
  const i = findIndex(list, fd);
  if (i < 0) return;
  list.splice(i, 1);
  await saveSection(section, list as GameContent[typeof section]);
  refresh();
}

export async function moveListItem(fd: FormData) {
  await requireAdmin();
  const section = str(fd, "section", 20);
  if (!isListSection(section)) return;
  const c = await getContent();
  const list = [...c[section]] as unknown[];
  const i = findIndex(list, fd);
  const j = i + (str(fd, "dir", 4) === "up" ? -1 : 1);
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await saveSection(section, list as GameContent[typeof section]);
  refresh();
}

function branchIndex(tree: SkillBranch[], fd: FormData) {
  const b = Number(fd.get("branch"));
  return Number.isInteger(b) && b >= 0 && b < tree.length ? b : -1;
}

export async function saveSkillBranch(fd: FormData) {
  await requireAdmin();
  const tree = structuredClone((await getContent()).skillTree);
  const b = branchIndex(tree, fd);
  if (b < 0) return;
  tree[b] = applyFields(tree[b]!, SKILL_BRANCH_FIELDS, fd);
  await saveSection("skillTree", tree);
  refresh();
}

export async function saveSkillNode(fd: FormData) {
  await requireAdmin();
  const tree = structuredClone((await getContent()).skillTree);
  const b = branchIndex(tree, fd);
  if (b < 0) return;
  const n = Number(fd.get("node"));
  const node = tree[b]!.nodes[n];
  if (!node) return;
  tree[b]!.nodes[n] = applyFields(node, SKILL_NODE_FIELDS, fd);
  await saveSection("skillTree", tree);
  refresh();
}

export async function addSkillNode(fd: FormData) {
  await requireAdmin();
  const tree = structuredClone((await getContent()).skillTree);
  const b = branchIndex(tree, fd);
  if (b < 0) return;
  const node: SkillNode = { id: `${tree[b]!.id}-${Date.now().toString(36)}`, title: "新技能", desc: "", status: "locked" };
  tree[b]!.nodes.push(node);
  await saveSection("skillTree", tree);
  refresh();
}

export async function deleteSkillNode(fd: FormData) {
  await requireAdmin();
  const tree = structuredClone((await getContent()).skillTree);
  const b = branchIndex(tree, fd);
  if (b < 0) return;
  const n = Number(fd.get("node"));
  if (!tree[b]!.nodes[n]) return;
  tree[b]!.nodes.splice(n, 1);
  await saveSection("skillTree", tree);
  refresh();
}

export async function addSkillBranch() {
  await requireAdmin();
  const tree = structuredClone((await getContent()).skillTree);
  tree.push({ id: `b-${Date.now().toString(36)}`, name: "新分支", icon: "⭐", color: "cyan", nodes: [] });
  await saveSection("skillTree", tree);
  refresh();
}

export async function deleteSkillBranch(fd: FormData) {
  await requireAdmin();
  const tree = structuredClone((await getContent()).skillTree);
  const b = branchIndex(tree, fd);
  if (b < 0) return;
  tree.splice(b, 1);
  await saveSection("skillTree", tree);
  refresh();
}

export async function saveJson(fd: FormData) {
  await requireAdmin();
  const section = str(fd, "section", 20);
  if (!isContentSection(section)) return;
  let value: unknown;
  try {
    value = JSON.parse(String(fd.get("json") ?? ""));
  } catch {
    redirect(`/admin?tab=json&section=${section}&e=json`);
  }
  const wantsArray = section !== "player" && section !== "mainQuest";
  if (wantsArray !== Array.isArray(value) || value === null || typeof value !== "object") {
    redirect(`/admin?tab=json&section=${section}&e=shape`);
  }
  await saveSection(section, value as GameContent[typeof section]);
  refresh();
  redirect(`/admin?tab=json&section=${section}&ok=1`);
}

export async function resetContent(fd: FormData) {
  await requireAdmin();
  const section = str(fd, "section", 20);
  if (!isContentSection(section)) return;
  await resetSection(section);
  refresh();
}

