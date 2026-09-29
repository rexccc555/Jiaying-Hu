import type { Metadata, Viewport } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { GameNav } from "@/components/GameNav";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://takeadayoff.co.nz"),
  title: {
    default: "人生重新开服 · LIFE: NEW GAME",
    template: "%s · 人生重新开服",
  },
  description: "如果人生没动力，那就把自己当成游戏角色。一个普通人在新西兰的真人开放世界游戏：等级、任务、地图、技能树和失败图鉴。",
  openGraph: {
    title: "人生重新开服 · LIFE: NEW GAME",
    description: "一个普通人在新西兰的真人开放世界游戏。来看看我升级了没有，也可以给我派任务。",
    locale: "zh_CN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b14",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hans">
      <body className={`${inter.variable} ${pixel.variable} min-h-screen font-sans antialiased`}>
        <Analytics />
        <GameNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
