import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";
import "./globals.css";

// 字体在构建时下载、由本站自己的域名提供，不依赖 fonts.googleapis.com，
// 中国大陆也能正常加载。中文回退到系统宋体（宋体/Songti，人人都有）。
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-latin",
  display: "swap",
});
const body = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "想象引擎 ImagineLab — 从人类想象中发现下一代 AI 产品",
  description:
    "面向 AI 从业者的创意发现与产品推演系统：输入你正在思考的 AI 产品问题，从影视等人类想象场景中获得交互机制与产品启发。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`antialiased ${display.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
