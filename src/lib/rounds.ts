import { voteRound as defaultRound, type VoteOption } from "@/data/game";
import { prisma } from "@/lib/prisma";

export type Round = { id: string; title: string; closesAt: string };

const ROUND_KEY = "currentRound";
export const SUBMISSION_OPTION_PREFIX = "s_";

export async function getCurrentRound(): Promise<Round> {
  try {
    const row = await prisma.gameSetting.findUnique({ where: { key: ROUND_KEY } });
    if (row) {
      const parsed = JSON.parse(row.value) as Partial<Round>;
      if (parsed.id && parsed.title && parsed.closesAt) {
        return { id: parsed.id, title: parsed.title, closesAt: parsed.closesAt };
      }
    }
  } catch {
    /* fall back to the round defined in game.ts */
  }
  return { id: defaultRound.id, title: defaultRound.title, closesAt: defaultRound.closesAt };
}

export async function setCurrentRound(round: Round) {
  const value = JSON.stringify(round);
  await prisma.gameSetting.upsert({
    where: { key: ROUND_KEY },
    create: { key: ROUND_KEY, value },
    update: { value },
  });
}

function clampDifficulty(n: number | null | undefined): VoteOption["difficulty"] {
  const v = Math.round(n ?? 3);
  return Math.min(5, Math.max(1, v)) as VoteOption["difficulty"];
}

/** Options = the seed options from game.ts (first round only) + approved submissions assigned to this round. */
export async function getRoundOptions(roundId: string): Promise<VoteOption[]> {
  const seed = roundId === defaultRound.id ? [...defaultRound.options] : [];
  try {
    const rows = await prisma.questSubmission.findMany({
      where: { roundId, status: "approved" },
      orderBy: { reviewedAt: "asc" },
    });
    return [
      ...seed,
      ...rows.map((s) => ({
        id: `${SUBMISSION_OPTION_PREFIX}${s.id}`,
        zone: s.zone || "观众任务",
        title: s.title || s.text.slice(0, 40),
        difficulty: clampDifficulty(s.difficulty),
        xp: s.xp ?? 300,
        desc: s.desc || s.text,
      })),
    ];
  } catch {
    return seed;
  }
}

export function isRoundClosed(round: Round, now = Date.now()) {
  return new Date(`${round.closesAt}T23:59:59+13:00`).getTime() < now;
}
