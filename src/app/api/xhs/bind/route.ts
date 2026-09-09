import { NextResponse } from "next/server";
import { getAccountUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { workerConfigured, workerFetch, workerUnavailableResponse } from "@/lib/xhs-worker-client";
import { encryptSecret } from "@/lib/xhs-crypto";

export const maxDuration = 60;

/** 开始扫码绑定：要求已登录账户 */
export async function POST(req: Request) {
  const user = await getAccountUser();
  if (!user) {
    return NextResponse.json({ error: "LOGIN_REQUIRED", loginRequired: true }, { status: 401 });
  }
  if (!workerConfigured()) return workerUnavailableResponse("zh");

  let locale: "zh" | "en" = "zh";
  try {
    const body = (await req.json()) as { locale?: string };
    if (body.locale === "en") locale = "en";
  } catch {
    /* empty */
  }

  try {
    const res = await workerFetch("/v1/login/start", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, locale }),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "worker error" },
      { status: 502 },
    );
  }
}

/** 查询绑定状态；登录成功时 Worker 返回 sessionBlob，主站加密落库 */
export async function GET(req: Request) {
  const user = await getAccountUser();
  if (!user) {
    return NextResponse.json({ error: "LOGIN_REQUIRED", loginRequired: true }, { status: 401 });
  }

  const existing = await prisma.xhsBinding.findUnique({ where: { userId: user.id } });
  const bound = Boolean(existing && existing.status === "active");

  if (!workerConfigured()) {
    return NextResponse.json({ bound, worker: false, status: bound ? "bound" : "unbound" });
  }

  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ bound, worker: true, status: bound ? "bound" : "unbound" });
  }

  try {
    const res = await workerFetch(`/v1/login/status?sessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(user.id)}`);
    const data = (await res.json()) as {
      logged_in?: boolean;
      sessionBlob?: string;
      qrcode_data_url?: string;
      message?: string;
      error?: string;
    };
    if (data.logged_in && data.sessionBlob) {
      const encryptedSession = encryptSecret(data.sessionBlob);
      await prisma.xhsBinding.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          encryptedSession,
          status: "active",
          label: user.email,
        },
        update: {
          encryptedSession,
          status: "active",
          label: user.email,
        },
      });
      return NextResponse.json({ bound: true, worker: true, status: "bound", message: data.message });
    }
    return NextResponse.json({
      bound,
      worker: true,
      status: data.logged_in ? "bound" : "pending",
      qrcode_data_url: data.qrcode_data_url,
      message: data.message,
      error: data.error,
    });
  } catch (e) {
    return NextResponse.json(
      { bound, worker: true, status: "error", error: e instanceof Error ? e.message : "worker error" },
      { status: 502 },
    );
  }
}

export async function DELETE() {
  const user = await getAccountUser();
  if (!user) {
    return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
  }
  await prisma.xhsBinding.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
