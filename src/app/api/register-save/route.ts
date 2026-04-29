import { NextResponse } from "next/server";
import { after } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/config";
import { isAppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { AUTH_COOKIE_NAME, authCookieOptions, SESSION_MAX_AGE_SEC, signSession } from "@/lib/auth-session";
import { extractWizardForPersist } from "@/lib/extract-wizard-for-save";
import { serializeSavedTripEnvelope } from "@/lib/saved-trip-payload";
import { sendWelcomeEmailAfterRegistration } from "@/lib/email/welcome-email";
import type { GenerateResponse } from "@/lib/types";

const bodySchema = z.object({
  email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  name: z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(80)),
  locale: z.enum(["zh", "en"]),
  itinerary: z.record(z.unknown()),
  /** 可选：向导最后一次 payload，便于日后打开已保存行程后继续「改一改」 */
  wizardPayload: z.unknown().optional(),
  /** 必须为 true：用户已勾选同意条款 */
  acceptTerms: z.boolean(),
  planningReminderOptIn: z.boolean().optional().default(false),
  productNewsOptIn: z.boolean().optional().default(false),
});

function reg(locale: AppLocale) {
  return messages[locale].result.register;
}

function p2002Target(e: Prisma.PrismaClientKnownRequestError): string[] {
  const t = e.meta?.target;
  if (Array.isArray(t)) return t as string[];
  if (typeof t === "string") return [t];
  return [];
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

  const {
    email,
    password,
    name: nickname,
    locale,
    itinerary,
    wizardPayload: wizardPayloadRaw,
    acceptTerms,
    planningReminderOptIn,
    productNewsOptIn,
  } = parsed.data;

  const generateResponse = itinerary as unknown as GenerateResponse;
  const wizardForEnvelope = extractWizardForPersist(generateResponse, wizardPayloadRaw);
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

  const emailTaken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (emailTaken) {
    return NextResponse.json({ ok: false, error: reg(locale).errDuplicateEmail }, { status: 409 });
  }

  const nickTaken = await prisma.user.findFirst({
    where: { name: { equals: nickname, mode: "insensitive" } },
    select: { id: true },
  });
  if (nickTaken) {
    return NextResponse.json({ ok: false, error: reg(locale).errDuplicateNick }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: nickname,
          phone: phone ?? null,
          planningReminderOptIn,
          productNewsOptIn,
        },
      });
      const trip = await tx.savedTrip.create({
        data: {
          userId: user.id,
          locale,
          payload: serializeSavedTripEnvelope(generateResponse, wizardForEnvelope),
        },
      });
      return { user, trip };
    });

    let token: string;
    try {
      token = signSession(
        { userId: result.user.id, email: result.user.email, name: result.user.name },
        SESSION_MAX_AGE_SEC,
      );
    } catch {
      return NextResponse.json({ ok: false, error: reg(locale).errSession }, { status: 503 });
    }

    const res = NextResponse.json({
      ok: true,
      userId: result.user.id,
      tripId: result.trip.id,
      message: reg(locale).success,
    });
    res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(SESSION_MAX_AGE_SEC));

    after(async () => {
      try {
        await sendWelcomeEmailAfterRegistration({
          to: result.user.email,
          nickname: result.user.name,
          locale,
        });
      } catch (e) {
        console.error("[register-save] welcome email failed", e);
      }
    });

    return res;
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const fields = p2002Target(e);
      if (fields.includes("email")) {
        return NextResponse.json({ ok: false, error: reg(locale).errDuplicateEmail }, { status: 409 });
      }
      if (fields.includes("name")) {
        return NextResponse.json({ ok: false, error: reg(locale).errDuplicateNick }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: reg(locale).errDuplicateGeneric }, { status: 409 });
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
