import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getIpHash } from "@/lib/visitor";

export const dynamic = "force-dynamic";

const MAX_PER_DAY = 5;

const bodySchema = z.object({
  text: z.string().trim().min(4, "任务至少 4 个字").max(200, "任务最多 200 字"),
  nickname: z.string().trim().max(20).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "内容无效";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  try {
    const ipHash = await getIpHash();
    const since = new Date(Date.now() - 86_400_000);
    const recent = await prisma.questSubmission.count({ where: { ipHash, createdAt: { gte: since } } });
    if (recent >= MAX_PER_DAY) {
      return NextResponse.json({ error: "今天投稿太多啦，明天再来" }, { status: 429 });
    }
    await prisma.questSubmission.create({
      data: { text: parsed.data.text, nickname: parsed.data.nickname || null, ipHash },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "投稿失败，请稍后再试" }, { status: 503 });
  }
}
