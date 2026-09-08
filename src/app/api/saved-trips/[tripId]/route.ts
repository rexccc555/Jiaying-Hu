import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session-api";
import { parseSavedTripPayload } from "@/lib/saved-trip-payload";
import type { GenerateResponse, WizardInput } from "@/lib/types";

type Ctx = { params: Promise<{ tripId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
  }

  const { tripId } = await ctx.params;
  if (!tripId) {
    return NextResponse.json({ ok: false, error: "Missing trip id" }, { status: 400 });
  }

  const row = await prisma.savedTrip.findFirst({
    where: { id: tripId, userId: session.userId },
    select: { id: true, locale: true, createdAt: true, payload: true },
  });
  if (!row) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  let generateResponse: GenerateResponse;
  let wizardPayload: WizardInput | null;
  try {
    const parsed = parseSavedTripPayload(row.payload);
    generateResponse = parsed.generateResponse;
    wizardPayload = parsed.wizardPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Corrupt payload" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    trip: {
      id: row.id,
      locale: row.locale,
      createdAt: row.createdAt.toISOString(),
      itinerary: generateResponse,
      wizardPayload,
    },
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
  }

  const { tripId } = await ctx.params;
  if (!tripId) {
    return NextResponse.json({ ok: false, error: "Missing trip id" }, { status: 400 });
  }

  try {
    const res = await prisma.savedTrip.deleteMany({
      where: { id: tripId, userId: session.userId },
    });
    if (res.count === 0) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[saved-trips DELETE]", e);
    return NextResponse.json({ ok: false, error: "Delete failed" }, { status: 500 });
  }
}
