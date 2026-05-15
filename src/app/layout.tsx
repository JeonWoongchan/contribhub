import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_TITLE, SITE_URL } from "@/lib/seo";

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
  metadataBase: SITE_URL,
  applicationName: SITE_TITLE,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_TITLE }],
  creator: SITE_TITLE,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE_TITLE} 서비스 미리보기`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
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
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
        {/* Vercel Web Analytics: 방문자 수 및 페이지뷰 수집 */}
        <Analytics />
      </body>
    </html>
  );
}
