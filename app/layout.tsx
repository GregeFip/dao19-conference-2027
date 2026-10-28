import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAO 19 · 2027｜第十九届国际道学研讨会",
  description: "第十九届国际道学研讨会 Daoism Overseas: Ideas, Practices, and Scriptures。2027年5月25日至29日，中国山东济南五峰山。报名与摘要提交截止：2027年3月1日。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

