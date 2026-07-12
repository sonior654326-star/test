import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="zh-CN" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
