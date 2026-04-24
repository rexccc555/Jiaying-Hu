"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { GenerateResponse, WizardInput } from "@/lib/types";
import { SiteFooter } from "@/components/SiteFooter";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { RegisterSaveCard } from "./RegisterSaveCard";
import { getPoiById } from "@/data/pois";
import {
  AT_JOURNEY_PLANNER_URL,
  AT_MOBILE_ANDROID_URL,
  AT_MOBILE_IOS_URL,
} from "@/lib/auckland-transit-links";
import { poiGoogleMapsUrl } from "@/lib/google-maps-urls";
import { resolveBlockPrimaryPlace } from "@/lib/itinerary-block-map";
import { TNZ_GETTING_AROUND_URL } from "@/lib/nz-transit-links";
import { usesAucklandTransit } from "@/lib/transit-regions";
import { addCalendarDaysIso } from "@/lib/dates-auckland";

function isoToMonthDayParen(iso: string): string | null {
  const p = iso.split("-");
  if (p.length < 3) return null;
  return `${p[1]}-${p[2]}`;
}

const STORAGE_KEY = "nzItineraryResult";
const WIZARD_PAYLOAD_KEY = "nzWizardLastPayload";

function mergeWhereNotes(prev: string | undefined, feedback: string, loc: AppLocale): string {
  const p = (prev ?? "").trim();
  const f = feedback.trim();
  if (!f) return p;
  if (!p) return f;
  return loc === "zh" ? `${p}\n（希望调整：${f}）` : `${p}\n(Request: ${f})`;
}

export default function ResultClient({ locale }: { locale: AppLocale }) {
  const t = messages[locale];
  const [data, setData] = useState<GenerateResponse | null>(null);
  const [adjustNotes, setAdjustNotes] = useState("");
  const [adjustBusy, setAdjustBusy] = useState(false);
  const [adjustErr, setAdjustErr] = useState<string | null>(null);
  const [hasWizardPayload, setHasWizardPayload] = useState(false);
  const [hashWantsRegister, setHashWantsRegister] = useState(false);

  useEffect(() => {
    const syncHash = () => setHashWantsRegister(window.location.hash === "#register-save");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setData(JSON.parse(raw) as GenerateResponse);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    setHasWizardPayload(Boolean(sessionStorage.getItem(WIZARD_PAYLOAD_KEY)));
  }, [data]);

  const handleAdjustRegenerate = useCallback(async () => {
    const raw = sessionStorage.getItem(WIZARD_PAYLOAD_KEY);
    const note = adjustNotes.trim();
    if (!raw) {
      setAdjustErr(t.result.adjustNoPayload);
      return;
    }
    if (!note) {
      setAdjustErr(t.result.adjustNeedText);
      return;
    }
    let base: WizardInput;
    try {
      base = JSON.parse(raw) as WizardInput;
    } catch {
      setAdjustErr(t.result.adjustNoPayload);
      return;
    }
    setAdjustErr(null);
    setAdjustBusy(true);
    try {
      const body: WizardInput = {
        ...base,
        locale,
        whereNotes: mergeWhereNotes(base.whereNotes, note, locale),
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const rawText = await res.text();
      let json: GenerateResponse & { error?: string };
      try {
        json = JSON.parse(rawText) as GenerateResponse & { error?: string };
      } catch {
        setAdjustErr(t.result.adjustFail);
        return;
      }
      if (!res.ok) {
        setAdjustErr(typeof json.error === "string" ? json.error : t.result.adjustFail);
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      sessionStorage.setItem(WIZARD_PAYLOAD_KEY, JSON.stringify(body));
      setData(json as GenerateResponse);
      setAdjustNotes("");
    } catch {
      setAdjustErr(t.result.adjustFail);
    } finally {
      setAdjustBusy(false);
    }
  }, [adjustNotes, locale, t]);

  const scrollToRegisterSave = useCallback(() => {
    if (typeof window === "undefined" || window.location.hash !== "#register-save") return;
    window.requestAnimationFrame(() => {
      document.getElementById("register-save")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (!data) return;
    if (typeof window === "undefined" || window.location.hash !== "#register-save") return;
    const id = window.setTimeout(() => {
      scrollToRegisterSave();
    }, 100);
    return () => window.clearTimeout(id);
  }, [data, scrollToRegisterSave]);

  useEffect(() => {
    if (!data) return;
    const onHash = () => {
      if (window.location.hash === "#register-save") scrollToRegisterSave();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [data, scrollToRegisterSave]);

  if (!data) {
    return (
      <main className="min-h-[50vh] px-4 py-20 text-center">
        <p className="text-lg text-slate-700">{t.result.noData}</p>
        {hashWantsRegister ? (
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600">{t.result.needItineraryToRegister}</p>
        ) : null}
        <Link
          href={`/${locale}/wizard`}
          className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700"
        >
          {t.result.goWizard}
        </Link>
        <SiteFooter locale={locale} />
      </main>
    );
  }

  const copyText = () => {
    const lines: string[] = [];
    for (let idx = 0; idx < data.itinerary.days.length; idx++) {
      const d = data.itinerary.days[idx]!;
      const dayNum = idx + 1;
      const dateParen =
        data.tripDates?.startDate != null
          ? isoToMonthDayParen(addCalendarDaysIso(data.tripDates.startDate, idx))
          : null;
      const head =
        locale === "zh"
          ? dateParen
            ? `${t.result.dayPrefix} ${dayNum} ${t.result.daySuffix} · ${d.theme}（${dateParen}）`
            : `${t.result.dayPrefix} ${dayNum} ${t.result.daySuffix} · ${d.theme}`
          : dateParen
            ? `${t.result.dayPrefix} ${dayNum} · ${d.theme} (${dateParen})`
            : `${t.result.dayPrefix} ${dayNum} · ${d.theme}`;
      lines.push(head);
      for (const b of d.blocks) {
        lines.push(
          `${b.startTime}-${b.endTime} ${b.title} (${t.result.drive} ${b.driveMinutesFromPrev} ${t.result.driveUnit}, ${t.result.stay} ${b.stayMinutes} ${t.result.stayUnit})`,
        );
        if (b.notes) lines.push(`  ${b.notes}`);
        if (b.rainPlan) lines.push(`  ${t.result.rain}: ${b.rainPlan.title}`);
        const mapRegion = data.meta?.regionId ?? "auckland-central";
        const primary = resolveBlockPrimaryPlace(b, mapRegion);
        if (primary) {
          const place = {
            name: primary.name,
            regionId: primary.regionId,
            googlePlaceId: primary.googlePlaceId,
          };
          lines.push(
            `  ${t.result.googleThisPlace.replace("{name}", primary.name)}: ${poiGoogleMapsUrl(primary.lat, primary.lng, place)}`,
          );
        }
        if (b.rainPlan?.poiTemplateId) {
          const rp = getPoiById(b.rainPlan.poiTemplateId);
          if (rp && Number.isFinite(rp.lat) && Number.isFinite(rp.lng)) {
            const rpPlace = {
              name: rp.name,
              regionId: rp.regionId,
              googlePlaceId: rp.googlePlaceId,
            };
            lines.push(
              `  ${t.result.googleRainPlace.replace("{name}", rp.name)}: ${poiGoogleMapsUrl(rp.lat, rp.lng, rpPlace)}`,
            );
          }
        }
      }
      const g =
        data.dayMapLinks && data.dayMapLinks.length === data.itinerary.days.length
          ? data.dayMapLinks[idx]
          : data.dayMapLinks?.find((x) => x.day === d.day);
      if (g) lines.push(`${t.result.googleDayNav.replace("{day}", String(dayNum))}: ${g.url}`);
      lines.push("");
    }
    if (data.meta?.mobility === "public_transit") {
      if (usesAucklandTransit(data.meta?.regionId)) {
        lines.push(
          t.result.transitPlanTitle,
          `${t.result.transitPlannerCta}: ${AT_JOURNEY_PLANNER_URL}`,
          `${t.result.transitIosCta}: ${AT_MOBILE_IOS_URL}`,
          `${t.result.transitAndroidCta}: ${AT_MOBILE_ANDROID_URL}`,
          "",
        );
      } else {
        lines.push(
          t.result.transitNzPlanTitle,
          `${t.result.transitNzTnzCta}: ${TNZ_GETTING_AROUND_URL}`,
          "",
        );
      }
    }
    if (data.tripDates) {
      lines.push(
        `${t.result.tripWhen}: ${data.tripDates.startDate} — ${data.tripDates.endDate}`,
        "",
      );
    }
    lines.push(
      `${t.result.budgetTitle}: ${data.itinerary.budgetBandEstimate.currency} ${data.itinerary.budgetBandEstimate.low}-${data.itinerary.budgetBandEstimate.high} (${data.itinerary.budgetBandEstimate.assumptions})`,
    );
    if (data.docHubs?.length) {
      lines.push("", t.result.docTitle);
      for (const d of data.docHubs) lines.push(`${d.label}: ${d.url}`);
    }
    void navigator.clipboard.writeText(lines.join("\n"));
  };

  const metaLine = data.meta.usedOpenAI
    ? t.result.metaOpenAI
    : data.meta.aiUnavailableReason === "no_api_key"
      ? t.result.metaLocalNoKey
      : data.meta.aiUnavailableReason === "upstream_failed"
        ? t.result.metaLocalUpstreamFailed
        : t.result.metaLocal;

  return (
    <main className="pb-24">
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={`/${locale}/wizard`} className="text-sm font-semibold text-sky-700 hover:underline">
            ← {t.result.back}
          </Link>
          <button
            type="button"
            onClick={copyText}
            className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-sky-300"
          >
            {t.result.copy}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">{metaLine}</p>
        {data.meta.upstreamDebug ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/90 p-2 font-mono text-[11px] leading-snug text-amber-950">
            DEBUG: {data.meta.upstreamDebug}
          </p>
        ) : null}

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{t.result.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{data.meta.disclaimer}</p>

        {data.tripDates ? (
          <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-2 text-sm font-medium text-sky-950">
            <span className="text-sky-800/90">{t.result.tripWhen}:</span>
            <span>
              {data.tripDates.startDate}
              {locale === "zh" ? " ～ " : " → "}
              {data.tripDates.endDate}
            </span>
          </p>
        ) : null}

        {data.docHubs && data.docHubs.length > 0 ? (
          <section className="glass mt-6 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-900">{t.result.docTitle}</h2>
            <ul className="mt-3 space-y-2">
              {data.docHubs.map((d) => (
                <li key={d.url}>
                  <a
                    className="text-sm font-semibold text-sky-700 hover:underline"
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data.meta?.mobility === "public_transit" ? (
          usesAucklandTransit(data.meta?.regionId) ? (
            <section className="glass mt-6 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-slate-900">{t.result.transitPlanTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.result.transitPlanBody}</p>
              <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <li>
                  <a
                    className="inline-flex rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-700"
                    href={AT_JOURNEY_PLANNER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.result.transitPlannerCta}
                    <span className="ml-1" aria-hidden>
                      ↗
                    </span>
                  </a>
                </li>
                <li className="flex flex-wrap gap-2">
                  <a
                    className="text-sm font-semibold text-sky-700 hover:underline"
                    href={AT_MOBILE_IOS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.result.transitIosCta}
                  </a>
                  <span className="text-slate-300" aria-hidden>
                    ·
                  </span>
                  <a
                    className="text-sm font-semibold text-sky-700 hover:underline"
                    href={AT_MOBILE_ANDROID_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.result.transitAndroidCta}
                  </a>
                </li>
              </ul>
            </section>
          ) : (
            <section className="glass mt-6 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-slate-900">{t.result.transitNzPlanTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.result.transitNzPlanBody}</p>
              <a
                className="mt-4 inline-flex rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-700"
                href={TNZ_GETTING_AROUND_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.result.transitNzTnzCta}
                <span className="ml-1" aria-hidden>
                  ↗
                </span>
              </a>
            </section>
          )
        ) : null}

        <div className="mt-10 space-y-8">
          {data.itinerary.days.map((day, idx) => {
            const dayNum = idx + 1;
            const mapLink =
              data.dayMapLinks && data.dayMapLinks.length === data.itinerary.days.length
                ? data.dayMapLinks[idx]
                : data.dayMapLinks?.find((l) => l.day === day.day);
            const navMode =
              data.meta?.mobility === "car"
                ? t.result.googleModeDrive
                : t.result.googleModeTransit;
            const dateParen =
              data.tripDates?.startDate != null
                ? isoToMonthDayParen(addCalendarDaysIso(data.tripDates.startDate, idx))
                : null;
            const dayHeading =
              locale === "zh"
                ? dateParen
                  ? `${t.result.dayPrefix} ${dayNum} ${t.result.daySuffix} · ${day.theme}（${dateParen}）`
                  : `${t.result.dayPrefix} ${dayNum} ${t.result.daySuffix} · ${day.theme}`
                : dateParen
                  ? `${t.result.dayPrefix} ${dayNum} · ${day.theme} (${dateParen})`
                  : `${t.result.dayPrefix} ${dayNum} · ${day.theme}`;
            return (
            <section key={`day-${dayNum}-${idx}`} className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-xl font-bold text-slate-900">{dayHeading}</h2>
                {mapLink ? (
                  <a
                    href={mapLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
                  >
                    <span className="hidden sm:inline">
                      {t.result.googleDayNav.replace("{day}", String(dayNum))}
                    </span>
                    <span className="sm:hidden">Google Maps</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                      {navMode}
                    </span>
                  </a>
                ) : null}
              </div>
              {mapLink ? (
                <p className="mt-2 text-xs text-slate-500">{t.result.googleDayNavHint}</p>
              ) : null}
              <ol className="mt-5 space-y-5">
                {day.blocks.map((b, i) => (
                  <li key={i} className="relative border-l-2 border-sky-400 pl-5">
                    <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-sky-500" />
                    <p className="text-sm font-semibold text-sky-800">
                      {b.startTime} — {b.endTime}
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{b.title}</p>
                    {b.customPlace && !b.poiTemplateId ? (
                      <div className="mt-1 space-y-1">
                        <p className="text-xs font-medium text-amber-800">{t.result.gptCustomStopTag}</p>
                        {b.customPlace.officialUrl ? (
                          <a
                            href={b.customPlace.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-xs font-semibold text-sky-700 hover:underline"
                          >
                            {t.result.customPlaceOfficial}
                            <span aria-hidden> ↗</span>
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    {(() => {
                      const mapRegion = data.meta?.regionId ?? "auckland-central";
                      const primary = resolveBlockPrimaryPlace(b, mapRegion);
                      const placeUrl = primary
                        ? poiGoogleMapsUrl(primary.lat, primary.lng, {
                            name: primary.name,
                            regionId: primary.regionId,
                            googlePlaceId: primary.googlePlaceId,
                          })
                        : null;
                      const rainPoi = b.rainPlan?.poiTemplateId
                        ? getPoiById(b.rainPlan.poiTemplateId)
                        : undefined;
                      const rainUrl =
                        rainPoi &&
                        Number.isFinite(rainPoi.lat) &&
                        Number.isFinite(rainPoi.lng)
                          ? poiGoogleMapsUrl(rainPoi.lat, rainPoi.lng, {
                              name: rainPoi.name,
                              regionId: rainPoi.regionId,
                              googlePlaceId: rainPoi.googlePlaceId,
                            })
                          : null;
                      if (!placeUrl && !rainUrl) return null;
                      return (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {placeUrl && primary ? (
                            <a
                              href={placeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-sky-700 hover:underline"
                            >
                              {t.result.googleThisPlace.replace("{name}", primary.name)}
                              <span aria-hidden>↗</span>
                            </a>
                          ) : null}
                          {rainUrl && rainPoi ? (
                            <a
                              href={rainUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-amber-800 hover:underline"
                            >
                              {t.result.googleRainPlace.replace(
                                "{name}",
                                rainPoi.name,
                              )}
                              <span aria-hidden>↗</span>
                            </a>
                          ) : null}
                          {placeUrl || rainUrl ? (
                            <p className="text-xs leading-relaxed text-slate-500">{t.result.googlePoiHint}</p>
                          ) : null}
                        </div>
                      );
                    })()}
                    <p className="mt-2 text-sm text-slate-600">
                      {b.driveMinutesFromPrev > 0
                        ? `${t.result.drive} ${b.driveMinutesFromPrev} ${t.result.driveUnit} · `
                        : ""}
                      {t.result.stay} {b.stayMinutes} {t.result.stayUnit}
                    </p>
                    {b.notes ? <p className="mt-2 text-sm text-slate-700">{b.notes}</p> : null}
                    {b.rainPlan ? (
                      <p className="mt-2 text-sm font-medium text-amber-900">
                        {t.result.rain}: {b.rainPlan.title}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
            );
          })}
        </div>

        <section className="glass mt-10 rounded-3xl border border-sky-200/70 bg-sky-50/50 p-6">
          <h2 className="text-lg font-bold text-slate-900">{t.result.adjustTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.result.adjustHint}</p>
          {hasWizardPayload ? (
            <div className="mt-4 space-y-3">
              <textarea
                value={adjustNotes}
                onChange={(e) => {
                  setAdjustNotes(e.target.value);
                  setAdjustErr(null);
                }}
                rows={3}
                maxLength={1200}
                placeholder={t.result.adjustPlaceholder}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-sm text-slate-900 shadow-inner placeholder:text-slate-400"
              />
              {adjustErr ? <p className="text-sm text-rose-700">{adjustErr}</p> : null}
              <button
                type="button"
                onClick={() => void handleAdjustRegenerate()}
                disabled={adjustBusy || !adjustNotes.trim()}
                className="rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
              >
                {adjustBusy ? t.result.adjustSubmitting : t.result.adjustSubmit}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-600">{t.result.adjustNoPayload}</p>
              <Link
                href={`/${locale}/wizard?intent=visitor`}
                className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 hover:border-sky-300"
              >
                {t.result.goWizard}
              </Link>
            </div>
          )}
        </section>

        <section className="glass mt-10 rounded-3xl border border-emerald-200/60 bg-emerald-50/50 p-6">
          <h2 className="text-lg font-bold text-emerald-950">{t.result.budgetTitle}</h2>
          <p className="mt-2 text-3xl font-bold text-emerald-900">
            {data.itinerary.budgetBandEstimate.currency}{" "}
            {data.itinerary.budgetBandEstimate.low} — {data.itinerary.budgetBandEstimate.high}
          </p>
          <p className="mt-1 text-sm text-emerald-900/90">
            {data.itinerary.budgetBandEstimate.assumptions}
          </p>
        </section>

        <RegisterSaveCard locale={locale} itinerary={data} />

        {data.itinerary.warnings.length > 0 && (
          <section className="glass mt-8 rounded-3xl border border-amber-200/80 bg-amber-50/60 p-6">
            <h2 className="text-lg font-bold text-amber-950">{t.result.warningsTitle}</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-amber-950">
              {data.itinerary.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">{t.result.liveTitle}</h2>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-semibold text-slate-900">
              {t.result.weather} · {data.weather.provider}
            </h3>
            {data.weather.tripContext ? (
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{data.weather.tripContext}</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{data.weather.summary}</p>
            {data.weather.daily && data.weather.daily.length > 0 && (
              <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                {data.weather.daily.map((d) => (
                  <li key={d.date} className="rounded-xl bg-white/80 px-3 py-2">
                    <span className="font-semibold text-slate-800">{d.date}</span>
                    <br />
                    {t.result.maxTemp} {d.maxC}°C · {t.result.rainChance} {d.rainPct}%
                  </li>
                ))}
              </ul>
            )}
            <a
              className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline"
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
            >
              {t.result.openMeteoLink}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.result.openMeteoCredit}</p>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-semibold text-slate-900">
              {t.result.roads} · {data.roads.provider}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{data.roads.summary}</p>
            <a
              className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline"
              href={data.roads.moreUrl}
              target="_blank"
              rel="noreferrer"
            >
              NZTA Journeys →
            </a>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.result.nztaCredit}</p>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-semibold text-slate-900">{t.result.safety}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {data.safetyLinks.map((l) => (
                <li key={l.url}>
                  <a className="font-medium text-sky-700 hover:underline" href={l.url} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-semibold text-slate-900">{t.result.sources}</h3>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
              {data.sources.map((s) => (
                <li key={s.url}>
                  <a className="text-sky-700 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
