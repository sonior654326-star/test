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
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0c10] text-zinc-200">
        {children}
      </body>
    </html>
  );
}
