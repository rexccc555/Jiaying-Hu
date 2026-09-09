import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccountUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/xhs-crypto";
import { workerConfigured, workerFetch, workerUnavailableResponse } from "@/lib/xhs-worker-client";

export const maxDuration = 120;

const bodySchema = z.object({
  locale: z.enum(["zh", "en"]).default("zh"),
  title: z.string().min(1).max(40),
  content: z.string().min(1).max(2000),
  tags: z.array(z.string()).max(10).default([]),
  imageUrls: z.array(z.string().url()).max(18).default([]),
  mode: z.enum(["preview", "confirm"]).default("preview"),
  jobId: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getAccountUser();
  if (!user) {
    return NextResponse.json({ error: "LOGIN_REQUIRED", loginRequired: true }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }
  if (!workerConfigured()) return workerUnavailableResponse(parsed.data.locale);

  const binding = await prisma.xhsBinding.findUnique({ where: { userId: user.id } });
  if (!binding || binding.status !== "active") {
    return NextResponse.json(
      {
        error: "NOT_BOUND",
        message: parsed.data.locale === "en" ? "Bind Xiaohongshu first" : "请先扫码绑定小红书账号",
      },
      { status: 400 },
    );
  }

  let sessionBlob: string;
  try {
    sessionBlob = decryptSecret(binding.encryptedSession);
  } catch {
    return NextResponse.json(
      {
        error: "SESSION_CORRUPT",
        message: parsed.data.locale === "en" ? "Binding expired—scan again" : "绑定已失效，请重新扫码",
      },
      { status: 400 },
    );
  }

  const { mode, jobId, ...draft } = parsed.data;

  try {
    if (mode === "confirm") {
      if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
      const res = await workerFetch(`/v1/jobs/${encodeURIComponent(jobId)}/confirm`, {
        method: "POST",
        body: JSON.stringify({ userId: user.id, sessionBlob }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const res = await workerFetch("/v1/jobs", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        sessionBlob,
        title: draft.title,
        content: draft.content,
        tags: draft.tags,
        imageUrls: draft.imageUrls,
        mode: "preview",
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "worker error" },
      { status: 502 },
    );
  }
}

export async function GET(req: Request) {
  const user = await getAccountUser();
  if (!user) {
    return NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 });
  }
  if (!workerConfigured()) return workerUnavailableResponse("zh");
  const jobId = new URL(req.url).searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
  try {
    const res = await workerFetch(`/v1/jobs/${encodeURIComponent(jobId)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "worker error" },
      { status: 502 },
    );
  }
}
