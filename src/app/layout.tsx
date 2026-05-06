import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Issue Map",
  description: "GitHub 프로필과 온보딩 기반으로 기여 가능한 오픈소스 이슈를 매칭해주는 사이트입니다.",
  icons: {
    icon: "/brand-signature.svg",
    shortcut: "/brand-signature.svg",
    apple: "/brand-signature.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        {/* Vercel Web Analytics: 방문자 수 및 페이지뷰 수집 */}
        <Analytics />
      </body>
    </html>
  );
}
