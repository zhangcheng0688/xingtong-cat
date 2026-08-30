import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "星童猫咪 · AI 自闭症家庭干预伙伴",
  description: "让每个家庭都请得起一位懂孩子的干预专家",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF6EE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
