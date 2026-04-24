import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/config";
import { isAppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

const bodySchema = z.object({
  email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).trim(),
  locale: z.enum(["zh", "en"]),
  itinerary: z.record(z.unknown()),
  /** 必须为 true：用户已勾选同意条款 */
  acceptTerms: z.boolean(),
  marketingOptIn: z.boolean().optional().default(false),
});

function reg(locale: AppLocale) {
  return messages[locale].result.register;
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const locGuess: AppLocale = isAppLocale((raw as { locale?: string })?.locale ?? "")
    ? ((raw as { locale: AppLocale }).locale as AppLocale)
    : "zh";

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: reg(locGuess).errValidation }, { status: 400 });
  }

  const { email, password, name, locale, itinerary, acceptTerms, marketingOptIn } = parsed.data;
  if (!acceptTerms) {
    return NextResponse.json({ ok: false, error: reg(locale).errTerms }, { status: 400 });
  }
  const phoneRaw = (raw as { phone?: unknown }).phone;
  const phone =
    typeof phoneRaw === "string" && phoneRaw.trim().length > 0
      ? phoneRaw.trim().slice(0, 30)
      : undefined;

  if (!isAppLocale(locale)) {
    return NextResponse.json({ ok: false, error: reg("zh").errValidation }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: reg(locale).errDb }, { status: 503 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone: phone ?? null,
          marketingOptIn,
        },
      });
      const trip = await tx.savedTrip.create({
        data: {
          userId: user.id,
          locale,
          payload: JSON.stringify(itinerary),
        },
      });
      return { user, trip };
    });

    return NextResponse.json({
      ok: true,
      userId: result.user.id,
      tripId: result.trip.id,
      message: reg(locale).success,
    });
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? (e as { code?: string }).code
        : undefined;
    if (code === "P2002") {
      return NextResponse.json({ ok: false, error: reg(locale).errDuplicate }, { status: 409 });
    }
    console.error("[register-save]", e);
    const devMsg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null && "message" in e && typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : String(e);
    const devHint = process.env.NODE_ENV === "development" ? devMsg.slice(0, 400) : undefined;
    return NextResponse.json(
      { ok: false, error: reg(locale).errGeneric, ...(devHint ? { hint: devHint } : {}) },
      { status: 500 },
    );
  }
}
