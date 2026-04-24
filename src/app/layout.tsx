import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { cn } from "@/lib/utils";

const notoSans = Noto_Sans_TC({ subsets: ['latin'], variable: '--font-sans' });
const notoSerif = Noto_Serif_TC({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: "美髮預約系統",
  description: "線上預約美髮服務",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={cn("font-sans", notoSans.variable, notoSerif.variable)}>
      <body className="bg-muted">{children}</body>
    </html>
  );
}
