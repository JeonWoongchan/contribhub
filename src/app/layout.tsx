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
  metadataBase: SITE_URL, // 상대 URL을 절대 URL로 변환하는 기준 도메인
  applicationName: SITE_TITLE, // 브라우저와 검색엔진에 전달되는 애플리케이션 이름
  title: {
    default: SITE_TITLE, // 페이지별 title이 없을 때 사용하는 기본 제목
    template: `%s | ${SITE_TITLE}`, // 페이지별 title 뒤에 서비스명을 붙이는 제목 형식
  },
  description: SITE_DESCRIPTION, // 검색 결과와 공유 미리보기에 사용되는 기본 설명
  keywords: SITE_KEYWORDS, // 서비스 주제를 나타내는 보조 키워드
  authors: [{ name: SITE_TITLE }], // 콘텐츠 작성 주체
  creator: SITE_TITLE, // 사이트 생성 주체
  openGraph: { // 소셜 공유 미리보기를 위한 Open Graph 기본값
    type: "website", // 웹사이트 유형의 Open Graph 객체
    locale: "ko_KR", // 한국어 페이지임을 나타내는 지역 정보
    siteName: SITE_TITLE, // Open Graph에 표시되는 사이트 이름
    title: SITE_TITLE, // Open Graph에 표시되는 기본 제목
    description: SITE_DESCRIPTION, // Open Graph에 표시되는 기본 설명
    images: [
      {
        url: "/opengraph-image", // Open Graph 공유 이미지 경로
        width: 1200, // 공유 이미지 권장 너비
        height: 630, // 공유 이미지 권장 높이
        alt: `${SITE_TITLE} 서비스 미리보기`, // 공유 이미지 대체 텍스트
      },
    ],
  },
  twitter: { // X/Twitter 공유 미리보기를 위한 카드 기본값
    card: "summary_large_image", // 큰 이미지가 포함된 Twitter 카드 형식
    title: SITE_TITLE, // Twitter 카드에 표시되는 기본 제목
    description: SITE_DESCRIPTION, // Twitter 카드에 표시되는 기본 설명
    images: ["/twitter-image"], // Twitter 카드 공유 이미지 경로
  },
  icons: { // 브라우저 탭과 홈 화면에 사용되는 아이콘
    icon: "/brand-signature.svg", // 기본 파비콘
    shortcut: "/brand-signature.svg", // 바로가기 아이콘
    apple: "/brand-signature.svg", // Apple 터치 아이콘
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
