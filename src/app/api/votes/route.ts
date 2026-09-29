import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentRound, getRoundOptions, isRoundClosed } from "@/lib/rounds";
import { attachVisitor, getIpHash, getVisitor } from "@/lib/visitor";

export const dynamic = "force-dynamic";

/** Shared Wi-Fi (cafés, dorms) can hold several real viewers. */
const MAX_VOTES_PER_IP = 5;

async function tally(roundId: string, optionIds: string[]) {
  const rows = await prisma.questVote.groupBy({
    by: ["optionId"],
    where: { roundId },
    _count: { _all: true },
  });
  const counts: Record<string, number> = Object.fromEntries(optionIds.map((id) => [id, 0]));
  for (const r of rows) {
    if (r.optionId in counts) counts[r.optionId] = r._count._all;
  }
  return counts;
}

export async function GET() {
  const visitor = await getVisitor();
  const round = await getCurrentRound();
  const options = await getRoundOptions(round.id);
  const ids = options.map((o) => o.id);
  try {
    const [counts, mine] = await Promise.all([
      tally(round.id, ids),
      prisma.questVote.findUnique({
        where: { roundId_voterId: { roundId: round.id, voterId: visitor.id } },
        select: { optionId: true },
      }),
    ]);
    return attachVisitor(NextResponse.json({ roundId: round.id, counts, myVote: mine?.optionId ?? null }), visitor);
  } catch {
    return attachVisitor(
      NextResponse.json({ roundId: round.id, counts: null, myVote: null, error: "投票服务暂时不可用" }, { status: 503 }),
      visitor,
    );
  }
}

const bodySchema = z.object({ optionId: z.string().min(1).max(64) });

export async function POST(req: Request) {
  const visitor = await getVisitor();
  const round = await getCurrentRound();
  const options = await getRoundOptions(round.id);
  const ids = options.map((o) => o.id);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !ids.includes(parsed.data.optionId)) {
    return attachVisitor(NextResponse.json({ error: "无效的选项" }, { status: 400 }), visitor);
  }
  if (isRoundClosed(round)) {
    return attachVisitor(NextResponse.json({ error: "本轮投票已结束" }, { status: 400 }), visitor);
  }

  try {
    const existing = await prisma.questVote.findUnique({
      where: { roundId_voterId: { roundId: round.id, voterId: visitor.id } },
    });
    if (existing) {
      return attachVisitor(
        NextResponse.json(
          { error: "你本轮已经投过票了", myVote: existing.optionId, counts: await tally(round.id, ids) },
          { status: 409 },
        ),
        visitor,
      );
    }
    const ipHash = await getIpHash();
    const sameIp = await prisma.questVote.count({ where: { roundId: round.id, ipHash } });
    if (sameIp >= MAX_VOTES_PER_IP) {
      return attachVisitor(NextResponse.json({ error: "这个网络本轮投票次数已达上限" }, { status: 429 }), visitor);
    }
    await prisma.questVote.create({
      data: { roundId: round.id, optionId: parsed.data.optionId, voterId: visitor.id, ipHash },
    });
    return attachVisitor(
      NextResponse.json({ ok: true, myVote: parsed.data.optionId, counts: await tally(round.id, ids) }),
      visitor,
    );
  } catch {
    return attachVisitor(NextResponse.json({ error: "投票失败，请稍后再试" }, { status: 503 }), visitor);
  }
}
