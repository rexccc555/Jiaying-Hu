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

function withGuest(res: NextResponse, guest: { id: string; needsSet: boolean }): NextResponse {
  if (guest.needsSet) attachXhsGuestCookie(res, guest.id);
  return res;
}

/** 开始扫码绑定（无需本站登录） */
export async function POST(req: Request) {
  if (!workerConfigured()) return workerUnavailableResponse("zh");

  let locale: "zh" | "en" = "zh";
  let preferredGuest: string | null = null;
  try {
    const body = (await req.json()) as { locale?: string; guestId?: string };
    if (body.locale === "en") locale = "en";
    preferredGuest = body.guestId || null;
  } catch {
    /* empty */
  }

  const guest = await getOrCreateXhsGuestId(preferredGuest);

  try {
    const res = await workerFetch("/v1/login/start", {
      method: "POST",
      body: JSON.stringify({ userId: guest.id, locale }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    return withGuest(
      NextResponse.json({ ...data, guestId: guest.id }, { status: res.status }),
      guest,
    );
  } catch (e) {
    return withGuest(
      NextResponse.json(
        { error: e instanceof Error ? e.message : "worker error", guestId: guest.id },
        { status: 502 },
      ),
      guest,
    );
  }
}

/** 查询绑定状态；扫码成功后把会话写入 HttpOnly Cookie */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const preferredGuest = url.searchParams.get("guestId");
  const guest = await getOrCreateXhsGuestId(preferredGuest);
  const existingEnc = await readXhsEncryptedSession();
  const bound = Boolean(existingEnc);

  if (!workerConfigured()) {
    return withGuest(
      NextResponse.json({
        bound,
        worker: false,
        status: bound ? "bound" : "unbound",
        guestId: guest.id,
      }),
      guest,
    );
  }

  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return withGuest(
      NextResponse.json({
        bound,
        worker: true,
        status: bound ? "bound" : "unbound",
        guestId: guest.id,
      }),
      guest,
    );
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
      detail?: string;
    };

    if (!res.ok) {
      return withGuest(
        NextResponse.json(
          {
            bound,
            worker: true,
            status: "error",
            guestId: guest.id,
            error: data.error || data.detail || data.message || "绑定会话丢失，请重新扫码",
          },
          { status: 200 },
        ),
        guest,
      );
    }

    if (data.logged_in && data.sessionBlob) {
      const encryptedSession = encryptSecret(data.sessionBlob);
      const out = NextResponse.json({
        bound: true,
        worker: true,
        status: "bound",
        guestId: guest.id,
        message: data.message,
      });
      attachXhsSessionCookie(out, encryptedSession);
      return withGuest(out, guest);
    }

    return withGuest(
      NextResponse.json({
        bound,
        worker: true,
        status: data.logged_in ? "bound" : "pending",
        guestId: guest.id,
        qrcode_data_url: data.qrcode_data_url,
        message: data.message,
        error: data.error,
      }),
      guest,
    );
  } catch (e) {
    return withGuest(
      NextResponse.json(
        {
          bound,
          worker: true,
          status: "error",
          guestId: guest.id,
          error: e instanceof Error ? e.message : "worker error",
        },
        { status: 502 },
      ),
      guest,
    );
  }
}

export async function DELETE() {
  const out = NextResponse.json({ ok: true });
  clearXhsSessionCookie(out);
  return out;
}
