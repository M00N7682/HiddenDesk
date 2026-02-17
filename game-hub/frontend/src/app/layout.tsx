import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Hidden Desk - 업무 집중 안 될 때 3분만에 끝나는 웹게임 | 회사/학교 몰래 게임",
  description: "업무 집중 안 될 때, 회사나 학교에서 몰래 할 수 있는 스텔스 웹게임 모음입니다. 3분만에 끝나는 미니게임, 월급루팡 게임, 엑셀/VSCode 위장 게임을 즐겨보세요. 설치 없이 브라우저에서 바로 플레이 가능합니다.",
  keywords: ["업무 집중 안 될 때", "3분만에 끝나는 웹게임", "회사에서 몰래할 수 있는 게임", "학교에서 몰래할 수 있는 게임", "월급루팡 게임", "스텔스 게임", "Hidden Desk", "미니게임", "웹게임"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-icon.svg",
  },
  openGraph: {
    title: "Hidden Desk - 완벽한 업무 위장 게임 플랫폼",
    description: "상사 눈치 보지 않고 즐기는 스텔스 게임. 엑셀, VS Code, 터미널 테마로 완벽 위장!",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${dmMono.variable} antialiased`}
      >
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6954281467005157"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
