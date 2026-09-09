import { NextResponse } from "next/server";
import { z } from "zod";
import type { AppLocale } from "@/i18n/config";
import { generateXhsDraft } from "@/lib/xhs-ai-draft";

export const maxDuration = 60;

const bodySchema = z.object({
  locale: z.enum(["zh", "en"]).default("zh"),
  regionId: z.string().optional(),
  tripSummary: z.string().min(8).max(4000),
  stopNames: z.array(z.string()).max(30).optional(),
});

export async function POST(req: Request) {
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
  const locale = parsed.data.locale as AppLocale;
  const draft = await generateXhsDraft({
    locale,
    regionId: parsed.data.regionId,
    tripSummary: parsed.data.tripSummary,
    stopNames: parsed.data.stopNames,
  });
  return NextResponse.json(draft);
}
