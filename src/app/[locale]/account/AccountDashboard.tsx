"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

/** 由服务端传入；日期字段为 ISO 字符串 */
export type AccountDashboardUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  planningReminderOptIn: boolean;
  productNewsOptIn: boolean;
  createdAt: string;
  savedTrips: { id: string; locale: string; createdAt: string; listTitle: string }[];
};

type Props = {
  locale: AppLocale;
  user: AccountDashboardUser;
  showWelcome?: boolean;
};

export function AccountDashboard({ locale, user: initialUser, showWelcome }: Props) {
  const router = useRouter();
  const t = messages[locale].accountPage;
  const [user, setUser] = useState(initialUser);
  const [prefsBusy, setPrefsBusy] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<"idle" | "saving" | "saved" | "err">("idle");
  const [tripBusyId, setTripBusyId] = useState<string | null>(null);

  const dfDate = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-NZ", {
        dateStyle: "medium",
      }),
    [locale],
  );
  const dfDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-NZ", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const createdAtDate = useMemo(() => new Date(user.createdAt), [user.createdAt]);

  const initial =
    user.name?.trim()?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "?";

  const patchPrefs = async (patch: { planningReminderOptIn?: boolean; productNewsOptIn?: boolean }) => {
    setPrefsMsg("saving");
    setPrefsBusy(true);
    try {
      const res = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as { ok?: boolean; preferences?: Partial<AccountDashboardUser> };
      const prefs = data.preferences;
      if (!res.ok || !data.ok || !prefs) {
        setPrefsMsg("err");
        return;
      }
      setUser((u) => ({
        ...u,
        planningReminderOptIn: prefs.planningReminderOptIn ?? u.planningReminderOptIn,
        productNewsOptIn: prefs.productNewsOptIn ?? u.productNewsOptIn,
      }));
      setPrefsMsg("saved");
      window.setTimeout(() => setPrefsMsg("idle"), 2000);
    } catch {
      setPrefsMsg("err");
    } finally {
      setPrefsBusy(false);
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (typeof window !== "undefined" && !window.confirm(messages[locale].result.savedTripView.deleteConfirm)) {
      return;
    }
    setTripBusyId(tripId);
    try {
      const res = await fetch(`/api/saved-trips/${tripId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        alert(t.tripDeleteFail);
        return;
      }
      setUser((u) => ({
        ...u,
        savedTrips: u.savedTrips.filter((x) => x.id !== tripId),
      }));
      router.refresh();
    } finally {
      setTripBusyId(null);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-8 sm:pt-12">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-b from-sky-100/90 via-indigo-50/40 to-transparent blur-2xl" />

      {showWelcome ? (
        <div className="relative mb-8 rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-5 py-4 text-sm font-medium text-emerald-950 shadow-sm">
          {t.welcomeBanner}
        </div>
      ) : null}

      <header className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white via-sky-50/70 to-indigo-50/80 p-8 shadow-xl shadow-sky-900/[0.06] ring-1 ring-slate-200/60 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-sky-600/25"
              aria-hidden
            >
              {initial}
            </div>
            <div>
              <p className="text-sm font-medium text-sky-800/90">{t.welcomeKicker}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t.greetingTemplate.replace("{name}", user.name)}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{t.welcomeSub}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={`/${locale}/wizard`}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-[0.98]"
            >
              {t.ctaPlan}
            </Link>
            <Link
              href={`/${locale}`}
              className="text-center text-sm font-medium text-slate-600 underline-offset-2 hover:text-sky-800 hover:underline"
            >
              {t.ctaHome}
            </Link>
          </div>
        </div>
        <p className="mt-6 border-t border-slate-200/80 pt-6 text-xs leading-relaxed text-slate-500">
          {t.memberSince}{" "}
          <time dateTime={createdAtDate.toISOString()}>{dfDate.format(createdAtDate)}</time>
        </p>
      </header>

      <div className="relative mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-lg shadow-slate-900/[0.04] backdrop-blur sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-slate-900">{t.sectionProfile}</h2>
          </div>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.nicknameLabel}</dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.emailLabel}</dt>
              <dd className="mt-1 break-all text-base text-slate-800">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.phoneLabel}</dt>
              <dd className="mt-1 text-base text-slate-800">{user.phone?.trim() ? user.phone : t.emptyDash}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-lg shadow-slate-900/[0.04] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-slate-900">{t.sectionPrefs}</h2>
            </div>
            <span className="text-xs text-slate-500">
              {prefsMsg === "saving" ? t.prefsSaving : prefsMsg === "saved" ? t.prefsSaved : prefsMsg === "err" ? t.prefsErr : null}
            </span>
          </div>
          <ul className="mt-6 space-y-4">
            <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <input
                id="pref-reminder"
                type="checkbox"
                disabled={prefsBusy}
                checked={user.planningReminderOptIn}
                onChange={(e) => void patchPrefs({ planningReminderOptIn: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40"
              />
              <label htmlFor="pref-reminder" className="cursor-pointer text-sm">
                <span className="font-semibold text-slate-900">{t.prefReminderTitle}</span>
                <span className="mt-0.5 block text-xs text-slate-600">
                  {user.planningReminderOptIn ? t.prefReminderOn : t.prefReminderOff}
                </span>
              </label>
            </li>
            <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <input
                id="pref-news"
                type="checkbox"
                disabled={prefsBusy}
                checked={user.productNewsOptIn}
                onChange={(e) => void patchPrefs({ productNewsOptIn: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/40"
              />
              <label htmlFor="pref-news" className="cursor-pointer text-sm">
                <span className="font-semibold text-slate-900">{t.prefNewsTitle}</span>
                <span className="mt-0.5 block text-xs text-slate-600">
                  {user.productNewsOptIn ? t.prefNewsOn : t.prefNewsOff}
                </span>
              </label>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-slate-500">{t.prefsFootnote}</p>
        </section>
      </div>

      <section className="relative mt-8 rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-lg shadow-slate-900/[0.04] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.sectionTrips}</h2>
              <p className="text-xs text-slate-500">{t.tripsSub}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-slate-600">
              {t.tripsCountPrefix}{" "}
              <span className="font-bold text-sky-800">{user.savedTrips.length}</span>
            </p>
            <Link
              href={`/${locale}/wizard`}
              className="inline-flex rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-sky-700 sm:text-sm"
            >
              {t.tripAddCta}
            </Link>
          </div>
        </div>

        {user.savedTrips.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
            <p className="text-sm text-slate-600">{t.tripsEmpty}</p>
            <Link
              href={`/${locale}/wizard`}
              className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50"
            >
              {t.ctaPlan}
            </Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100">
            {user.savedTrips.map((trip) => (
              <li
                key={trip.id}
                className="flex flex-col gap-3 py-4 first:pt-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={`/${locale}/saved/${trip.id}#adjust-trip`}
                  className="min-w-0 flex-1 rounded-xl py-1 outline-none ring-sky-500/0 transition hover:bg-slate-50 focus-visible:ring-2"
                >
                  <p className="font-medium text-slate-900">{trip.listTitle}</p>
                  <p className="text-xs text-slate-500">
                    <time dateTime={trip.createdAt}>{dfDateTime.format(new Date(trip.createdAt))}</time>
                  </p>
                </Link>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link
                    href={`/${locale}/saved/${trip.id}#adjust-trip`}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50"
                  >
                    {t.tripEdit}
                  </Link>
                  <button
                    type="button"
                    disabled={tripBusyId === trip.id}
                    onClick={() => void deleteTrip(trip.id)}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-60"
                  >
                    {tripBusyId === trip.id ? "…" : t.tripDelete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
