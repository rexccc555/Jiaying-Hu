import { NextResponse } from "next/server";
import {
  attachXhsGuestCookie,
  attachXhsSessionCookie,
  clearXhsSessionCookie,
  getOrCreateXhsGuestId,
  readXhsEncryptedSession,
} from "@/lib/xhs-guest";
import { encryptSecret } from "@/lib/xhs-crypto";
import { workerConfigured, workerFetch, workerUnavailableResponse } from "@/lib/xhs-worker-client";

export const maxDuration = 60;

/** 开始扫码绑定（无需本站登录） */
export async function POST(req: Request) {
  if (!workerConfigured()) return workerUnavailableResponse("zh");

  let locale: "zh" | "en" = "zh";
  try {
    const body = (await req.json()) as { locale?: string };
    if (body.locale === "en") locale = "en";
  } catch {
    /* empty */
  }

  const guest = await getOrCreateXhsGuestId();

  try {
    const res = await workerFetch("/v1/login/start", {
      method: "POST",
      body: JSON.stringify({ userId: guest.id, locale }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    const out = NextResponse.json(data, { status: res.status });
    if (guest.isNew) attachXhsGuestCookie(out, guest.id);
    return out;
  } catch (e) {
    const out = NextResponse.json(
      { error: e instanceof Error ? e.message : "worker error" },
      { status: 502 },
    );
    if (guest.isNew) attachXhsGuestCookie(out, guest.id);
    return out;
  }
}

/** 查询绑定状态；扫码成功后把会话写入 HttpOnly Cookie */
export async function GET(req: Request) {
  const guest = await getOrCreateXhsGuestId();
  const existingEnc = await readXhsEncryptedSession();
  const bound = Boolean(existingEnc);

  if (!workerConfigured()) {
    const out = NextResponse.json({ bound, worker: false, status: bound ? "bound" : "unbound" });
    if (guest.isNew) attachXhsGuestCookie(out, guest.id);
    return out;
  }

  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) {
    const out = NextResponse.json({ bound, worker: true, status: bound ? "bound" : "unbound" });
    if (guest.isNew) attachXhsGuestCookie(out, guest.id);
    return out;
  }

  try {
    const res = await workerFetch(
      `/v1/login/status?sessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(guest.id)}`,
    );
    const data = (await res.json()) as {
      logged_in?: boolean;
      sessionBlob?: string;
      qrcode_data_url?: string;
      message?: string;
      error?: string;
    };
    if (data.logged_in && data.sessionBlob) {
      const encryptedSession = encryptSecret(data.sessionBlob);
      const out = NextResponse.json({
        bound: true,
        worker: true,
        status: "bound",
        message: data.message,
      });
      if (guest.isNew) attachXhsGuestCookie(out, guest.id);
      attachXhsSessionCookie(out, encryptedSession);
      return out;
    }
    const out = NextResponse.json({
      bound,
      worker: true,
      status: data.logged_in ? "bound" : "pending",
      qrcode_data_url: data.qrcode_data_url,
      message: data.message,
      error: data.error,
    });
    if (guest.isNew) attachXhsGuestCookie(out, guest.id);
    return out;
  } catch (e) {
    const out = NextResponse.json(
      { bound, worker: true, status: "error", error: e instanceof Error ? e.message : "worker error" },
      { status: 502 },
    );
    if (guest.isNew) attachXhsGuestCookie(out, guest.id);
    return out;
  }
}

export async function DELETE() {
  const out = NextResponse.json({ ok: true });
  clearXhsSessionCookie(out);
  return out;
}
