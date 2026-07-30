import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAO 19 · 2027｜第十九届国际道学研讨会",
  description: "第十九届国际道学研讨会——道教的海外传播：观念、行为与典籍。2027年7月14日至18日，中国济南。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
