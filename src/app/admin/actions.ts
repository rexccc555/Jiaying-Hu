"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, requireAdmin, tokenForPassword } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getCurrentRound, setCurrentRound } from "@/lib/rounds";

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/quests");
  revalidatePath("/");
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
  const token = tokenForPassword(String(fd.get("password") ?? ""));
  if (!token) {
    await new Promise((r) => setTimeout(r, 800));
    redirect("/admin?e=1");
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
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
