"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getRegionById, getRegionsWithPois } from "@/data/regions";
import type { WizardInput } from "@/lib/types";
import { SiteFooter } from "@/components/SiteFooter";
import type { AppLocale } from "@/i18n/config";
import { messages, STYLE_TAG_ORDER, type StyleTagId } from "@/i18n/messages";
import { parseWizardIntent, type WizardIntent } from "@/lib/wizard-intent";
import { regionBlurb, regionTitle } from "@/lib/region-display";
import { getDocHubsForRegion } from "@/data/doc-hubs";
import {
  maxStartDateForDuration,
  todayIsoPacificAuckland,
  tripEndDateIso,
  tripCalendarSpan,
} from "@/lib/dates-auckland";
import type { TripWeatherDaily } from "@/lib/weather";
import { buildOpenMeteoTripForecastUrl, parseOpenMeteoDailyJson } from "@/lib/weather";
import { FREE_DEST_NOTES_MIN_LEN, NZ_OPEN_REGION_ID } from "@/lib/wizard-constants";
import { orderRegionsForWizardIntent, regionSubgroupsForIntent } from "@/lib/wizard-region-order";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export default function WizardClient({ locale }: { locale: AppLocale }) {
  const t = messages[locale];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [regionId, setRegionId] = useState<string | null>(null);
  const [whereNotes, setWhereNotes] = useState("");
  const [partyType, setPartyType] = useState<WizardInput["partyType"] | null>(null);
  const [duration, setDuration] = useState<WizardInput["duration"] | null>(null);
  const [mobility, setMobility] = useState<WizardInput["mobility"] | null>(null);
  const [budgetBand, setBudgetBand] = useState<WizardInput["budgetBand"] | null>(null);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [forecastPreview, setForecastPreview] = useState<TripWeatherDaily[] | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastErr, setForecastErr] = useState(false);

  const intent: WizardIntent = useMemo(
    () => parseWizardIntent(searchParams.get("intent")),
    [searchParams],
  );

  /** unset 时仅占位长度；未选类型前不会进入主步骤条 */
  const stepTitles = intent === "local" ? t.wizard.stepsLocal : t.wizard.stepsVisitor;

  useEffect(() => {
    const demo = searchParams.get("demo");
    const today = todayIsoPacificAuckland();
    const apply = (
      r: string,
      party: WizardInput["partyType"],
      dur: WizardInput["duration"],
      mob: WizardInput["mobility"],
      bud: WizardInput["budgetBand"],
      styles: StyleTagId[],
    ) => {
      setRegionId(r);
      setPartyType(party);
      setDuration(dur);
      setMobility(mob);
      setBudgetBand(bud);
      setStyleTags(styles);
      setStartDate(today);
      setStep(0);
    };
    if (demo === "west") {
      apply("waitakere-west", "couple", "2d1n", "car", "mid", ["nature", "photo", "light_hike"]);
      return;
    }
    if (demo === "waiheke") {
      apply("waiheke", "couple", "day", "public_transit", "comfort", ["food", "couple", "nature"]);
      return;
    }
    if (demo === "queenstown") {
      apply("queenstown-lakes", "couple", "day", "car", "mid", ["photo", "adventure", "couple"]);
      return;
    }
    if (demo === "northland") {
      apply("northland", "family", "3d2n", "car", "mid", ["nature", "culture", "history"]);
      return;
    }
    if (demo === "rotorua") {
      apply("rotorua-lakes", "family", "2d1n", "car", "mid", ["culture", "nature", "hot_spring"]);
      return;
    }
    if (demo === "taupo") {
      apply("taupo-central", "couple", "day", "car", "comfort", ["nature", "photo", "easy"]);
      return;
    }
    if (demo === "wellington") {
      apply("wellington-harbour", "solo", "day", "public_transit", "mid", ["culture", "easy", "food"]);
      return;
    }
    if (demo === "nelson") {
      apply("nelson-tasman", "couple", "2d1n", "car", "mid", ["nature", "light_hike", "photo"]);
      return;
    }
    if (demo === "christch") {
      apply("christchurch-canterbury", "family", "day", "car", "budget", ["easy", "culture", "family"]);
      return;
    }
    if (demo === "mackenzie") {
      apply("mackenzie-basin", "couple", "2d1n", "car", "comfort", ["photo", "nature", "couple"]);
      return;
    }
    if (demo === "fiordland") {
      apply("fiordland", "couple", "3d2n", "car", "mid", ["adventure", "nature", "photo"]);
      return;
    }
    if (demo === "auckland-day") {
      apply("auckland-central", "solo", "day", "public_transit", "mid", ["culture", "easy", "food"]);
      return;
    }

    const r = searchParams.get("region");
    if (r && getRegionById(r)) setRegionId(r);
    const tg = searchParams.get("tags");
    if (tg) {
      const parts = tg.split(",").map((s) => s.trim()).filter(Boolean);
      const valid = parts.filter((x): x is StyleTagId =>
        (STYLE_TAG_ORDER as readonly string[]).includes(x),
      );
      if (valid.length) setStyleTags(valid);
    }

    const mobQ = searchParams.get("mobility");
    if (mobQ === "car" || mobQ === "public_transit") {
      setMobility(mobQ);
    }

    const durQ = searchParams.get("duration");
    if (durQ === "day" || durQ === "2d1n" || durQ === "3d2n") {
      setDuration(durQ);
    } else {
      const int = parseWizardIntent(searchParams.get("intent"));
      if (int === "local") setDuration("day");
      else if (int === "visitor") setDuration("2d1n");
    }
  }, [searchParams]);

  useEffect(() => {
    if (step === 6 && !startDate) {
      setStartDate(todayIsoPacificAuckland());
    }
  }, [step, startDate]);

  const effectiveRegionId = useMemo(() => {
    const trimmed = whereNotes.trim();
    return regionId ?? (trimmed.length >= FREE_DEST_NOTES_MIN_LEN ? NZ_OPEN_REGION_ID : null);
  }, [regionId, whereNotes]);

  useEffect(() => {
    if (step !== 6 || !effectiveRegionId || !duration || !ISO_RE.test(startDate)) {
      return;
    }
    const region = getRegionById(effectiveRegionId);
    if (!region) return;

    const end = tripEndDateIso(startDate, duration);
    const ctrl = new AbortController();
    setForecastLoading(true);
    setForecastErr(false);
    setForecastPreview(null);

    const url = buildOpenMeteoTripForecastUrl({
      lat: region.centerLat,
      lng: region.centerLng,
      startDate,
      endDate: end,
    });

    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<unknown>;
      })
      .then((json) => {
        const d = parseOpenMeteoDailyJson(json);
        if (!d?.length) throw new Error("parse");
        setForecastPreview(d);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        setForecastErr(true);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setForecastLoading(false);
      });

    return () => ctrl.abort();
  }, [step, effectiveRegionId, duration, startDate]);

  const regionsWithPois = useMemo(() => getRegionsWithPois(), []);
  const orderedRegions = useMemo(
    () => orderRegionsForWizardIntent(regionsWithPois, intent),
    [regionsWithPois, intent],
  );
  const regionSubgroups = useMemo(
    () => regionSubgroupsForIntent(intent, orderedRegions),
    [intent, orderedRegions],
  );

  const dateBounds = useMemo(() => {
    if (!duration) {
      const d = todayIsoPacificAuckland();
      return { min: d, max: d };
    }
    return {
      min: todayIsoPacificAuckland(),
      max: maxStartDateForDuration(duration),
    };
  }, [duration]);

  const tripPreview = useMemo(() => {
    if (!startDate || !ISO_RE.test(startDate) || !duration) return null;
    const end = tripEndDateIso(startDate, duration);
    const span = tripCalendarSpan(duration);
    return { end, span };
  }, [startDate, duration]);

  const progress = useMemo(() => ((step + 1) / stepTitles.length) * 100, [step, stepTitles.length]);

  const canNext = useMemo(() => {
    if (step === 0) {
      return Boolean(regionId) || whereNotes.trim().length >= FREE_DEST_NOTES_MIN_LEN;
    }
    // 与界面顺序一致：天数 → 交通 → 人数 → 预算 → 风格 → 日期
    if (step === 1) return Boolean(duration);
    if (step === 2) return Boolean(mobility);
    if (step === 3) return Boolean(partyType);
    if (step === 4) return Boolean(budgetBand);
    if (step === 5) return styleTags.length > 0;
    if (step === 6) return Boolean(startDate && ISO_RE.test(startDate));
    return true;
  }, [step, regionId, whereNotes, partyType, duration, mobility, budgetBand, styleTags, startDate]);

  const toggleStyle = (s: string) => {
    setStyleTags((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const goNext = () => {
    if (!canNext) return;
    setError(null);
    setStep((s) => (s < 7 ? ((s + 1) as Step) : s));
  };

  const goPrev = () => {
    setError(null);
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  };

  const buildPayload = useCallback((): WizardInput | null => {
    const trimmed = whereNotes.trim();
    const eff = regionId ?? (trimmed.length >= FREE_DEST_NOTES_MIN_LEN ? NZ_OPEN_REGION_ID : null);
    if (!eff || !partyType || !duration || !mobility || !budgetBand) return null;
    if (styleTags.length === 0) return null;
    if (!startDate || !ISO_RE.test(startDate)) return null;
    return {
      regionId: eff,
      partyType,
      duration,
      mobility,
      budgetBand,
      styleTags,
      startDate,
      locale,
      ...(trimmed ? { whereNotes: trimmed } : {}),
    };
  }, [regionId, partyType, duration, mobility, budgetBand, styleTags, startDate, locale, whereNotes]);

  const payloadReady = buildPayload() !== null;

  const submit = async () => {
    const payload = buildPayload();
    if (!payload) {
      setError(t.wizard.errors.incomplete);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const rawText = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(rawText) as unknown;
      } catch {
        setError(t.wizard.errors.network);
        return;
      }
      if (!res.ok) {
        const errBody = data as { error?: string };
        setError(typeof errBody.error === "string" ? errBody.error : t.wizard.errors.failed);
        return;
      }
      sessionStorage.setItem("nzItineraryResult", JSON.stringify(data));
      sessionStorage.setItem("nzWizardLastPayload", JSON.stringify(payload));
      router.push(`/${locale}/result`);
    } catch {
      setError(t.wizard.errors.network);
    } finally {
      setLoading(false);
    }
  };

  const styleLabels = t.styleTags as Record<string, string>;
  const docLinks = effectiveRegionId ? getDocHubsForRegion(effectiveRegionId, locale) : [];

  function subgroupHeading(key: string) {
    switch (key) {
      case "localMetro":
        return t.wizard.regionGroupLocalMetro;
      case "localNorth":
        return t.wizard.regionGroupLocalNorth;
      case "localSouth":
        return t.wizard.regionGroupLocalSouth;
      case "visitorNorth":
        return t.wizard.regionGroupVisitorNorth;
      case "visitorSouth":
        return t.wizard.regionGroupVisitorSouth;
      default:
        return "";
    }
  }

  if (intent === "unset") {
    const applyIntent = (next: "local" | "visitor") => {
      const q = new URLSearchParams(searchParams.toString());
      q.set("intent", next);
      const s = q.toString();
      router.replace(`/${locale}/wizard?${s}`, { scroll: false });
    };

    return (
      <main className="min-h-screen pb-24">
        <div className="mx-auto max-w-lg px-4 pt-8">
          <div className="glass mb-6 rounded-2xl px-4 py-3">
            <Link href={`/${locale}`} className="text-sm font-semibold text-sky-700 hover:underline">
              ← {t.wizard.backHome}
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t.wizard.intentPickTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.wizard.intentPickSub}</p>
          <div className="mt-8 grid gap-4">
            <button
              type="button"
              onClick={() => applyIntent("local")}
              className="group rounded-3xl border border-white/70 bg-white/90 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
            >
              <h2 className="text-lg font-bold text-slate-900">{t.wizard.intentPickLocalTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.wizard.intentPickLocalSub}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-sky-700 group-hover:underline">
                {t.wizard.intentPickCta}
              </span>
            </button>
            <button
              type="button"
              onClick={() => applyIntent("visitor")}
              className="group rounded-3xl border border-sky-100/90 bg-gradient-to-br from-white/95 to-sky-50/80 p-6 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <h2 className="text-lg font-bold text-slate-900">{t.wizard.intentPickVisitorTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.wizard.intentPickVisitorSub}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-sky-700 group-hover:underline">
                {t.wizard.intentPickCta}
              </span>
            </button>
          </div>
        </div>
        <SiteFooter locale={locale} />
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <div className="mx-auto max-w-lg px-4 pt-8">
        <div className="glass mb-6 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/${locale}`} className="text-sm font-semibold text-sky-700 hover:underline">
              ← {t.wizard.backHome}
            </Link>
            <span className="text-xs font-medium text-slate-500">
              {t.wizard.step} {step + 1} / {stepTitles.length}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              intent === "local"
                ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80"
                : "bg-sky-100 text-sky-900 ring-1 ring-sky-200/80"
            }`}
          >
            {intent === "local" ? t.wizard.entryBannerLocal : t.wizard.entryBannerVisitor}
          </span>
          {styleTags.length > 0 || mobility ? (
            <span className="text-xs leading-snug text-slate-600">
              {t.wizard.prefAppliedPrefix}
              {[
                ...styleTags.map((id) => styleLabels[id] ?? id),
                ...(mobility
                  ? [t.wizard.mobility.find((m) => m.id === mobility)?.label ?? mobility]
                  : []),
              ].join(locale === "en" ? ", " : "、")}
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {stepTitles[step]}
        </h1>
        {step === 0 ? (
          <div className="mt-2 space-y-1">
            <p className="text-base leading-relaxed text-slate-700">
              {intent === "local" ? t.wizard.step0IntroLocal : t.wizard.step0IntroVisitor}
            </p>
            <p className="text-sm text-slate-500">{t.wizard.step0Kicker}</p>
          </div>
        ) : null}

        {step === 0 && (
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">
                {intent === "local" ? t.wizard.regionPickTitleLocal : t.wizard.regionPickTitleVisitor}
              </p>
              <p className="text-xs leading-relaxed text-slate-600">
                {intent === "local" ? t.wizard.regionPickSubLocal : t.wizard.regionPickSubVisitor}
              </p>
            </div>
            <div className="space-y-6">
              {regionSubgroups.map((g) => (
                <div key={g.key}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {subgroupHeading(g.key)}
                  </p>
                  <div className="grid gap-3">
                    {g.regionIds.map((rid) => {
                      const r = orderedRegions.find((x) => x.id === rid);
                      if (!r) return null;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRegionId((cur) => (cur === r.id ? null : r.id))}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            regionId === r.id
                              ? "border-sky-500 bg-white shadow-lg shadow-sky-500/15 ring-2 ring-sky-200"
                              : "glass border-white/60 hover:border-sky-200"
                          }`}
                        >
                          <p className="font-semibold text-slate-900">{regionTitle(r, locale)}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{regionBlurb(r, locale)}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => setRegionId((cur) => (cur === NZ_OPEN_REGION_ID ? null : NZ_OPEN_REGION_ID))}
                className={`rounded-2xl border border-dashed px-4 py-4 text-left transition ${
                  regionId === NZ_OPEN_REGION_ID
                    ? "border-sky-500 bg-white shadow-lg shadow-sky-500/15 ring-2 ring-sky-200"
                    : "border-slate-200 bg-white/70 hover:border-sky-200"
                }`}
              >
                <p className="font-semibold text-slate-900">{t.wizard.nzOpenCardTitle}</p>
                <p className="mt-1 text-sm text-slate-600">{t.wizard.nzOpenCardSub}</p>
              </button>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-slate-600">{t.wizard.step0OptionalNotesHint}</p>
              <textarea
                id="where-notes-early"
                value={whereNotes}
                onChange={(e) => setWhereNotes(e.target.value)}
                rows={2}
                maxLength={1200}
                placeholder={t.wizard.whereNotesPlaceholder}
                className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-900 shadow-inner placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">
              {intent === "local" ? t.wizard.durationStepHintLocal : t.wizard.durationStepHintVisitor}
            </p>
            <div className="grid gap-3">
            {t.wizard.duration.map((o) => (
              <ChoiceRow
                key={o.id}
                selected={duration === o.id}
                label={o.label}
                onClick={() => setDuration(o.id)}
              />
            ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 grid gap-3">
            {t.wizard.mobility.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setMobility(o.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  mobility === o.id
                    ? "border-sky-500 bg-white shadow-lg shadow-sky-500/15 ring-2 ring-sky-200"
                    : "glass border-white/60 hover:border-sky-200"
                }`}
              >
                <p className="font-semibold text-slate-900">{o.label}</p>
                <p className="mt-1 text-sm text-slate-600">{o.hint}</p>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 grid gap-3">
            {t.wizard.party.map((o) => (
              <ChoiceRow
                key={o.id}
                selected={partyType === o.id}
                label={o.label}
                onClick={() => setPartyType(o.id)}
              />
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="mt-6 grid gap-3">
            {t.wizard.budget.map((o) => (
              <ChoiceRow
                key={o.id}
                selected={budgetBand === o.id}
                label={o.label}
                onClick={() => setBudgetBand(o.id)}
              />
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="mt-6">
            <p className="text-sm text-slate-600">{t.wizard.styleHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLE_TAG_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleStyle(id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    styleTags.includes(id)
                      ? "border-transparent bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md"
                      : "border-slate-200 bg-white/90 text-slate-800 hover:border-sky-300"
                  }`}
                >
                  {styleLabels[id] ?? id}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="mt-6 space-y-5">
            <p className="text-sm leading-relaxed text-slate-600">{t.wizard.dateHint}</p>
            <div className="glass rounded-2xl p-4">
              <label className="block text-sm font-semibold text-slate-800">
                {t.wizard.summary.startDate}
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base font-medium text-slate-900 shadow-inner"
                value={startDate}
                min={dateBounds.min}
                max={dateBounds.max}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {tripPreview && duration ? (
                <p className="mt-3 text-xs text-slate-500">
                  {locale === "zh"
                    ? `行程共 ${tripPreview.span} 个日历日：${startDate} ～ ${tripPreview.end}`
                    : `${tripPreview.span} calendar day(s): ${startDate} → ${tripPreview.end}`}
                </p>
              ) : null}
            </div>

            {duration && startDate && ISO_RE.test(startDate) ? (
              <div className="glass rounded-2xl p-4">
                <p className="text-sm font-semibold text-slate-900">{t.wizard.forecastTitle}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.wizard.forecastHint}</p>
                {forecastLoading ? (
                  <p className="mt-3 text-sm text-sky-700">{t.wizard.forecastLoading}</p>
                ) : null}
                {forecastErr ? (
                  <p className="mt-3 text-sm text-amber-800">{t.wizard.forecastError}</p>
                ) : null}
                {forecastPreview && forecastPreview.length > 0 && !forecastLoading ? (
                  <ul className="mt-3 space-y-2">
                    {forecastPreview.map((d) => (
                      <li
                        key={d.date}
                        className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-slate-800"
                      >
                        <span className="font-medium tabular-nums">{d.date}</span>
                        <span className="text-slate-600">
                          {t.result.maxTemp} {d.maxC}°C · {t.result.rainChance} {d.rainPct}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {docLinks.length > 0 ? (
              <div className="glass rounded-2xl p-4">
                <p className="text-sm font-semibold text-slate-900">DOC</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{t.wizard.docInline}</p>
                <ul className="mt-3 space-y-2">
                  {docLinks.map((l) => (
                    <li key={l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-sky-700 hover:underline"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {step === 7 && (
          <div className="glass mt-6 space-y-4 rounded-2xl p-5 text-sm text-slate-700">
            <SummaryRow
              label={t.wizard.summary.region}
              value={
                (() => {
                  const r = effectiveRegionId ? getRegionById(effectiveRegionId) : undefined;
                  return r ? regionTitle(r, locale) : undefined;
                })()
              }
            />
            {whereNotes.trim() ? (
              <SummaryRow label={t.wizard.summary.whereNotes} value={whereNotes.trim()} />
            ) : null}
            <SummaryRow
              label={t.wizard.summary.party}
              value={t.wizard.party.find((p) => p.id === partyType)?.label}
            />
            <SummaryRow
              label={t.wizard.summary.duration}
              value={t.wizard.duration.find((d) => d.id === duration)?.label}
            />
            <SummaryRow
              label={t.wizard.summary.mobility}
              value={t.wizard.mobility.find((m) => m.id === mobility)?.label}
            />
            <SummaryRow
              label={t.wizard.summary.budget}
              value={t.wizard.budget.find((b) => b.id === budgetBand)?.label}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.wizard.summary.styles}
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {styleTags.map((id) => styleLabels[id] ?? id).join(locale === "en" ? ", " : "、")}
              </p>
            </div>
            <SummaryRow label={t.wizard.summary.startDate} value={startDate || undefined} />
            {tripPreview && duration ? (
              <SummaryRow
                label={locale === "zh" ? "行程至" : "Through"}
                value={tripPreview.end}
              />
            ) : null}
            <p className="text-xs text-slate-500">{t.wizard.confirmHint}</p>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0 || loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white/90 py-3 text-sm font-semibold text-slate-800 shadow-sm disabled:opacity-40"
          >
            {t.wizard.prev}
          </button>
          {step < 7 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext || loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-40"
            >
              {t.wizard.next}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading || !payloadReady}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
            >
              {loading ? t.wizard.generating : t.wizard.generate}
            </button>
          )}
        </div>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}

function ChoiceRow({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
        selected
          ? "border-sky-500 bg-white text-slate-900 shadow-lg shadow-sky-500/15 ring-2 ring-sky-200"
          : "glass border-white/60 text-slate-900 hover:border-sky-200"
      }`}
    >
      {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100/80 pb-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-slate-900">{value ?? "—"}</span>
    </div>
  );
}
