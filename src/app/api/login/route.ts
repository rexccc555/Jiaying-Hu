import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/config";
import { isAppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { AUTH_COOKIE_NAME, authCookieOptions, signSession } from "@/lib/auth-session";

const bodySchema = z.object({
  email: z.string().email().max(254).transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1).max(128),
  locale: z.enum(["zh", "en"]).optional(),
});

function copy(locale: AppLocale) {
  return messages[locale].loginPage;
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
    return NextResponse.json({ ok: false, error: copy(locGuess).errValidation }, { status: 400 });
  }

  const { email, password, locale: locRaw } = parsed.data;
  const locale: AppLocale = locRaw && isAppLocale(locRaw) ? locRaw : locGuess;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: copy(locale).errDb }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, passwordHash: true },
  });

  const fail = () =>
    NextResponse.json({ ok: false, error: copy(locale).errInvalid }, { status: 401 });

  if (!user) return fail();

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return fail();

  let token: string;
  try {
    token = signSession({ userId: user.id, email: user.email, name: user.name });
  } catch {
    return NextResponse.json({ ok: false, error: copy(locale).errSession }, { status: 503 });
  }

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
  });
  res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
  return res;
}
