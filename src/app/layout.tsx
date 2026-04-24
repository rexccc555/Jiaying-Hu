import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://takeadayoff.co.nz"),
  title: "Take a Day Off · takeadayoff.co.nz",
  description:
    "Take a Day Off — New Zealand trip planner for day trips, weekends, and multi-day routes (bilingual).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
