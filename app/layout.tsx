import type { Metadata } from "next";
import "./globals.css";
import "./registration-overrides.css";

export const metadata: Metadata = {
  title: "NEXUS 2026｜国际智能科学前沿大会",
  description: "第八届国际智能科学前沿大会测试网站——会议介绍、特邀嘉宾、学术日程与在线报名体验。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
