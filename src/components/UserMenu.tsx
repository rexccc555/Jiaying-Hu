"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

type MeUser = { id: string; email: string; name: string };

export function UserMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  const locale: AppLocale = isAppLocale(maybeLocale) ? maybeLocale : "zh";
  const t = messages[locale];
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<MeUser | null | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = (await res.json()) as { user: MeUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe, pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const registerHref = `/${locale}?registerHint=1`;
  const loginNext =
    pathname && !pathname.split("/").some((p) => p === "login") ? pathname : `/${locale}`;

  const logout = async () => {
    setOpen(false);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    setUser(null);
    router.refresh();
  };

  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "";

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.nav.accountMenuAria}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold shadow-inner outline-none ring-sky-500/30 transition focus-visible:ring-2 ${
          user
            ? "border-sky-300 bg-gradient-to-br from-sky-500 to-indigo-600 text-white hover:opacity-95"
            : "border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-600 hover:border-sky-300 hover:text-sky-800"
        }`}
      >
        {user && initial ? (
          <span aria-hidden>{initial}</span>
        ) : (
          <svg
            className="h-[1.15rem] w-[1.15rem]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="8" r="4" />
          </svg>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 min-w-[11rem] rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-900/10"
        >
          {user ? (
            <>
              <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
                <span className="line-clamp-2 font-medium text-slate-800">{user.name}</span>
                <span className="mt-0.5 block truncate text-[11px]">{user.email}</span>
              </p>
              <Link
                role="menuitem"
                href={`/${locale}`}
                className="block px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-sky-50"
                onClick={() => setOpen(false)}
              >
                {t.nav.home}
              </Link>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
                onClick={() => void logout()}
              >
                {t.nav.logout}
              </button>
            </>
          ) : (
            <>
              <Link
                role="menuitem"
                href={`/${locale}/login?next=${encodeURIComponent(loginNext)}`}
                className="block px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-sky-50"
                onClick={() => setOpen(false)}
              >
                {t.nav.login}
              </Link>
              <Link
                role="menuitem"
                href={registerHref}
                className="block px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-sky-50"
                onClick={() => setOpen(false)}
              >
                {t.nav.register}
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
