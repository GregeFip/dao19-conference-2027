import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Jingfeng Zhongshan Kingdom Seal Script, SIL OFL 1.1.
// The bundled webfont contains only the glyph “道”; see public/dao/JFZSKSealScript-OFL.txt.
const daoSealFont = localFont({
  src: "./fonts/jfzsk-dao-subset.woff2",
  variable: "--font-dazhuan",
  display: "swap",
  preload: true,
  weight: "400",
  fallback: ["STKaiti", "KaiTi", "serif"],
});

export const metadata: Metadata = {
  title: "DAO 19 · 2027｜第十九届国际道学研讨会",
  description: "第十九届国际道学研讨会——道教的海外传播：观念、行为与典籍。2027年7月14日至18日，中国济南。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={daoSealFont.variable}>{children}</body>
    </html>
  );
}
