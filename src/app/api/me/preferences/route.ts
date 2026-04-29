import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session-api";

const bodySchema = z.object({
  planningReminderOptIn: z.boolean().optional(),
  productNewsOptIn: z.boolean().optional(),
});

export async function PATCH(req: Request) {
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

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const { planningReminderOptIn, productNewsOptIn } = parsed.data;
  if (planningReminderOptIn === undefined && productNewsOptIn === undefined) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(planningReminderOptIn !== undefined ? { planningReminderOptIn } : {}),
        ...(productNewsOptIn !== undefined ? { productNewsOptIn } : {}),
      },
      select: {
        planningReminderOptIn: true,
        productNewsOptIn: true,
      },
    });
    return NextResponse.json({ ok: true, preferences: user });
  } catch (e) {
    console.error("[me/preferences]", e);
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }
}
