import { NextResponse } from "next/server";

const WORKER = () => (process.env.XHS_WORKER_URL || "").replace(/\/$/, "");
const SECRET = () => process.env.XHS_WORKER_SECRET?.trim() || "";

export function workerConfigured(): boolean {
  return Boolean(WORKER() && SECRET());
}

export async function workerFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = WORKER();
  const secret = SECRET();
  if (!base || !secret) {
    throw new Error("XHS worker not configured");
  }
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${secret}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${base}${path}`, { ...init, headers, cache: "no-store" });
}

export function workerUnavailableResponse(locale: "zh" | "en") {
  return NextResponse.json(
    {
      error:
        locale === "zh"
          ? "云端发布服务尚未配置（XHS_WORKER_URL / XHS_WORKER_SECRET）。文案生成仍可用。"
          : "Publish worker is not configured (XHS_WORKER_URL / XHS_WORKER_SECRET). Draft generation still works.",
      code: "WORKER_UNCONFIGURED",
    },
    { status: 503 },
  );
}
