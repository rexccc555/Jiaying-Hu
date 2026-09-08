import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/config";
import { isAppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  SESSION_MAX_AGE_SEC,
  SESSION_REMEMBER_MAX_AGE_SEC,
  signSession,
} from "@/lib/auth-session";

const bodySchema = z.object({
  identifier: z.string().min(1).max(254).transform((s) => s.trim()),
  password: z.string().min(1).max(128),
  locale: z.enum(["zh", "en"]).optional(),
  rememberMe: z.boolean().optional().default(false),
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

  const r = raw as { identifier?: unknown; email?: unknown; password?: unknown; locale?: unknown };
  const identifierFromBody =
    typeof r.identifier === "string" && r.identifier.trim()
      ? r.identifier
      : typeof r.email === "string" && r.email.trim()
        ? r.email
        : "";
  const parsed = bodySchema.safeParse({
    ...r,
    identifier: identifierFromBody,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: copy(locGuess).errValidation }, { status: 400 });
  }

  const { identifier, password, locale: locRaw, rememberMe } = parsed.data;
  const locale: AppLocale = locRaw && isAppLocale(locRaw) ? locRaw : locGuess;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: copy(locale).errDb }, { status: 503 });
  }

  const fail = () =>
    NextResponse.json({ ok: false, error: copy(locale).errInvalid }, { status: 401 });

  const looksLikeEmail = identifier.includes("@");
  let user: { id: string; email: string; name: string; passwordHash: string } | null = null;

  if (looksLikeEmail) {
    const emailParsed = z.string().email().max(254).safeParse(identifier.toLowerCase());
    if (!emailParsed.success) {
      return NextResponse.json({ ok: false, error: copy(locale).errValidation }, { status: 400 });
    }
    user = await prisma.user.findUnique({
      where: { email: emailParsed.data },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
  } else {
    const nick = identifier;
    if (nick.length < 1) {
      return NextResponse.json({ ok: false, error: copy(locale).errValidation }, { status: 400 });
    }
    user = await prisma.user.findFirst({
      where: { name: { equals: nick, mode: "insensitive" } },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user) return fail();
  }

  if (!user) return fail();

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return fail();

  const sessionMaxAge = rememberMe ? SESSION_REMEMBER_MAX_AGE_SEC : SESSION_MAX_AGE_SEC;
  let token: string;
  try {
    token = signSession({ userId: user.id, email: user.email, name: user.name }, sessionMaxAge);
  } catch {
    return NextResponse.json({ ok: false, error: copy(locale).errSession }, { status: 503 });
  }

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
  });
  res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(sessionMaxAge));
  return res;
}
