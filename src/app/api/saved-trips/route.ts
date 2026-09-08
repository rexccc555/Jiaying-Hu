import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAppLocale } from "@/i18n/config";
import { getSessionFromCookies } from "@/lib/session-api";
import { extractWizardForPersist } from "@/lib/extract-wizard-for-save";
import { serializeSavedTripEnvelope } from "@/lib/saved-trip-payload";
import type { GenerateResponse } from "@/lib/types";

const postSchema = z.object({
  locale: z.enum(["zh", "en"]),
  itinerary: z.record(z.unknown()),
  wizardPayload: z.unknown().optional(),
});

/** 已登录用户保存当前生成的行程（可多条） */
export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(raw);
  if (!parsed.success || !isAppLocale(parsed.data.locale)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const { locale, itinerary, wizardPayload: wizardRaw } = parsed.data;

  const generateResponse = itinerary as unknown as GenerateResponse;
  const wizardForEnvelope = extractWizardForPersist(generateResponse, wizardRaw);

  try {
    const trip = await prisma.savedTrip.create({
      data: {
        userId: session.userId,
        locale,
        payload: serializeSavedTripEnvelope(generateResponse, wizardForEnvelope),
      },
      select: { id: true, locale: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, trip });
  } catch (e) {
    console.error("[saved-trips POST]", e);
    return NextResponse.json({ ok: false, error: "Save failed" }, { status: 500 });
  }
}
