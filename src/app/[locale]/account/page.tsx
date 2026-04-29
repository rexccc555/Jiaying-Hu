import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountDashboard } from "./AccountDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { getAccountUser } from "@/lib/auth-server";
import { savedTripListLabel } from "@/lib/saved-trip-list-title";
import { isAppLocale, type AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ welcome?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: AppLocale = isAppLocale(raw) ? raw : "zh";
  const base = getSiteUrl();
  const t = messages[locale].accountPage;
  return {
    title: `${t.metaTitle} · takeadayoff.co.nz`,
    description: t.metaDescription,
    alternates: {
      canonical: `${base}/${locale}/account`,
    },
  };
}

export default async function AccountPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isAppLocale(raw)) notFound();
  const locale = raw as AppLocale;
  const sp = await searchParams;
  const welcomeRaw = sp.welcome;
  const showWelcome =
    welcomeRaw === "1" || (Array.isArray(welcomeRaw) && welcomeRaw.includes("1"));

  const user = await getAccountUser();
  const t = messages[locale].accountPage;

  if (!user) {
    redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/account`)}`);
  }

  const clientUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    planningReminderOptIn: user.planningReminderOptIn,
    productNewsOptIn: user.productNewsOptIn,
    createdAt: user.createdAt.toISOString(),
    savedTrips: user.savedTrips.map((trip) => ({
      id: trip.id,
      locale: trip.locale,
      createdAt: trip.createdAt.toISOString(),
      listTitle: savedTripListLabel(trip.payload, locale),
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50/30">
      <AccountDashboard locale={locale} user={clientUser} showWelcome={showWelcome} />
      <div className="mx-auto max-w-5xl px-4 pb-8">
        <p className="text-center text-xs text-slate-400">
          <Link href={`/${locale}/privacy`} className="underline-offset-2 hover:text-slate-600 hover:underline">
            {t.footerPrivacy}
          </Link>
          <span className="mx-2">·</span>
          <Link href={`/${locale}/terms`} className="underline-offset-2 hover:text-slate-600 hover:underline">
            {t.footerTerms}
          </Link>
        </p>
      </div>
      <SiteFooter locale={locale} />
    </main>
  );
}
