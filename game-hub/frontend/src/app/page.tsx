"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  category: string;
  instructions?: string;
  color: string;
}

const translations = {
  en: {
    games: "Games",
    leaderboard: "Leaderboard",
    community: "Community",
    login: "Login",
    playNow: "Play Now",
    badge: "7 Games Available",
    heroLine1: "Play Games.",
    heroLine2: "Look Busy.",
    heroSub: "The stealth gaming platform for the office. Every game looks like a work app.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "Browse Games",
    whyLabel: "WHY HIDDENDESK",
    whyTitle: "Perfect Disguise, Perfect Play",
    whySub: "Not just games. A stealth gaming experience optimized for the workplace.",
    feat1Title: "Work App Disguise",
    feat1Desc: "Every game looks like VS Code, spreadsheets, or Git GUI. Even your coworker won't notice.",
    feat2Title: "ESC Stealth Mode",
    feat2Desc: "Boss approaching? Hit ESC. Instantly switches to a fake work screen. Game state auto-saved.",
    feat3Title: "Leaderboard & Compete",
    feat3Desc: "Compete with coworkers. Prove who's the real pro on the global rankings.",
    gamesLabel: "GAME LIBRARY",
    gamesTitle: "Start Playing Now",
    gamesSub: "Each game is designed to look like a real work tool.",
    howLabel: "HOW IT WORKS",
    howTitle: "Get Started in 3 Steps",
    step1Title: "Visit the Site",
    step1Desc: "No sign-up required. Just open your browser and you're in.",
    step2Title: "Choose a Game",
    step2Desc: "Pick from 7 games. Each one is disguised as a different work app.",
    step3Title: "Play & Stealth",
    step3Desc: "Enjoy the game. Press ESC to instantly switch to a work screen.",
    finalTitle: "Start Playing Now",
    finalSub: "It's free. No sign-up needed.",
    finalCta: "Play for Free",
    footerDesc: "Look busy, play games. Your secret gaming platform.",
    product: "Product",
    company: "Company",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    copyright: "© 2026 HiddenDesk. All rights reserved.",
    startGame: "Start Game",
    cancel: "Cancel",
    instructions: "Instructions",
  },
  ko: {
    games: "게임",
    leaderboard: "리더보드",
    community: "커뮤니티",
    login: "로그인",
    playNow: "지금 플레이",
    badge: "7개 게임 플레이 가능",
    heroLine1: "Play Games.",
    heroLine2: "Look Busy.",
    heroSub: "회사에서 몰래 즐기는 게임 플랫폼. 모든 게임이 업무 앱처럼 보입니다.",
    ctaPrimary: "무료로 시작하기",
    ctaSecondary: "게임 둘러보기",
    whyLabel: "WHY HIDDENDESK",
    whyTitle: "완벽한 위장, 완벽한 플레이",
    whySub: "단순한 게임이 아닙니다. 업무 환경에 최적화된 스텔스 게이밍 경험.",
    feat1Title: "업무 앱 위장",
    feat1Desc: "모든 게임이 VS Code, 스프레드시트, Git GUI처럼 보입니다. 옆에서 봐도 일하는 것 같아요.",
    feat2Title: "ESC 스텔스 모드",
    feat2Desc: "상사가 다가오면 ESC 한 번. 즉시 가짜 업무 화면으로 전환됩니다. 게임 상태는 자동 저장.",
    feat3Title: "리더보드 & 경쟁",
    feat3Desc: "동료들과 점수를 겨루세요. 글로벌 랭킹으로 누가 진짜 고수인지 증명하세요.",
    gamesLabel: "GAME LIBRARY",
    gamesTitle: "지금 바로 플레이하세요",
    gamesSub: "각 게임은 실제 업무 도구처럼 디자인되어 있습니다.",
    howLabel: "HOW IT WORKS",
    howTitle: "3단계로 시작하세요",
    step1Title: "사이트 접속",
    step1Desc: "회원가입 없이 바로 접속. 브라우저만 있으면 됩니다.",
    step2Title: "게임 선택",
    step2Desc: "7개 게임 중 원하는 걸 고르세요. 각각 다른 업무 앱으로 위장됩니다.",
    step3Title: "플레이 & 스텔스",
    step3Desc: "게임을 즐기다가 ESC를 누르면 즉시 업무 화면으로 전환됩니다.",
    finalTitle: "지금 바로 시작하세요",
    finalSub: "무료입니다. 회원가입도 필요 없어요.",
    finalCta: "무료로 플레이하기",
    footerDesc: "일하는 척, 게임하는 중. 당신의 비밀 게임 플랫폼.",
    product: "Product",
    company: "Company",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    copyright: "© 2026 HiddenDesk. All rights reserved.",
    startGame: "게임 시작",
    cancel: "취소",
    instructions: "조작 방법",
  },
};

const gameTranslations: Record<string, { ko: { title: string; description: string; instructions?: string } }> = {
  "vscode-stealth": {
    ko: {
      title: "Code Dash",
      description: "VS Code 에디터에서 코드를 타이핑하는 액션 게임",
      instructions: "방향키로 이동하며 버그를 피하세요. ESC를 누르면 코딩 화면으로 위장됩니다.",
    },
  },
  "neon-racer": {
    ko: {
      title: "Neon Racer",
      description: "터미널 UI로 위장한 네온 레이싱 게임",
      instructions: "방향키로 조작하며 방화벽을 피하세요. ESC를 누르면 터미널 화면으로 위장됩니다.",
    },
  },
  "pixel-quest": {
    ko: {
      title: "Pixel Quest",
      description: "스프레드시트 속 숨겨진 RPG 어드벤처",
      instructions: "방향키로 이동, 스페이스바로 공격하세요. ESC를 누르면 그림판 화면으로 위장됩니다.",
    },
  },
  "cell-invaders": {
    ko: {
      title: "Cell Invaders",
      description: "엑셀 셀 속에서 벌어지는 슈팅 게임",
      instructions: "방향키로 이동, 스페이스바로 공격하세요. ESC를 누르면 엑셀 화면으로 위장됩니다.",
    },
  },
  "paper-reader": {
    ko: {
      title: "Paper Reader",
      description: "논문 리더 속에 숨겨진 러너 게임",
      instructions: "방향키로 형광펜을 조작해 파란색 용어를 연결하세요. ESC를 누르면 논문 화면으로 위장됩니다.",
    },
  },
  "git-merge": {
    ko: {
      title: "Git Merge",
      description: "Git GUI로 위장한 전략 퍼즐 게임",
      instructions: "마우스로 같은 색 커밋을 연결하세요. ESC를 누르면 터미널 화면으로 위장됩니다.",
    },
  },
  "network-flow": {
    ko: {
      title: "Network Flow",
      description: "네트워크 관리 도구처럼 생긴 퍼즐 게임",
      instructions: "타일을 클릭해 케이블 방향을 바꾸세요. ESC를 누르면 터미널 화면으로 위장됩니다.",
    },
  },
};

export default function Home() {
  const initialGames: Game[] = [
    { id: "vscode-stealth", title: "Code-Dash", description: "A typing action game inside a VS Code editor.", thumbnail: "/thumbnails/codedash.png", url: "https://game1-xi-snowy.vercel.app/", category: "Action", instructions: "Use Arrow keys to move. Avoid bugs. Press ESC for stealth mode.", color: "accent" },
    { id: "neon-racer", title: "Neon Racer", description: "A neon racing game disguised as a terminal UI.", thumbnail: "/thumbnails/02_neon-racer.png", url: "https://hidden-desk-ptvg.vercel.app", category: "Racing", instructions: "Use Arrow keys to steer. Avoid firewalls. Press ESC for stealth mode.", color: "green" },
    { id: "pixel-quest", title: "Pixel Quest", description: "An RPG adventure hidden inside a spreadsheet.", thumbnail: "/thumbnails/pixel-quest.png", url: "https://hidden-desk-9hye.vercel.app/", category: "RPG", instructions: "Use Arrow keys to move. Space to shoot. Press ESC for stealth mode.", color: "purple" },
    { id: "cell-invaders", title: "Cell Invaders", description: "A shooting game inside Excel cells.", thumbnail: "/thumbnails/cellinvader.png", url: "https://cellinvader.vercel.app/", category: "Shooter", instructions: "Use Arrow keys to move. Space to shoot. Press ESC for stealth mode.", color: "red" },
    { id: "paper-reader", title: "Paper Reader", description: "A runner game hidden in a paper reader.", thumbnail: "/thumbnails/paperreader.png", url: "https://paperreader.vercel.app/", category: "Runner", instructions: "Use Arrow keys to guide the highlighter. Press ESC for stealth mode.", color: "yellow" },
    { id: "git-merge", title: "Git Merge", description: "A strategy puzzle disguised as a Git GUI.", thumbnail: "/thumbnails/gitmerge.png", url: "https://gitmerge.vercel.app/", category: "Puzzle", instructions: "Use mouse to connect matching colored nodes. Press ESC for terminal mode.", color: "blue" },
  ];

  const [games, setGames] = useState<Game[]>(initialGames);
  const [lang, setLang] = useState<"en" | "ko">("en");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const t = translations[lang];

  const getLocalizedGame = (game: Game) => {
    if (lang === "ko" && gameTranslations[game.id]?.ko) {
      return { ...game, ...gameTranslations[game.id].ko };
    }
    return game;
  };

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/games`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const mergedData = data.map((apiGame: Game) => {
            const localGame = initialGames.find((g) => g.id === apiGame.id);
            if (localGame && (apiGame.url === "#" || !apiGame.url) && localGame.url !== "#") {
              return { ...apiGame, url: localGame.url, color: localGame.color };
            }
            return { ...apiGame, color: localGame?.color || "accent" };
          });
          setGames(mergedData);
        }
      })
      .catch(() => {});
  }, []);

  const categoryColors: Record<string, { bg: string; text: string }> = {
    Action: { bg: "bg-[#FF5C0018]", text: "text-accent" },
    Racing: { bg: "bg-[#22C55E18]", text: "text-success" },
    RPG: { bg: "bg-[#8B5CF618]", text: "text-[#8B5CF6]" },
    Shooter: { bg: "bg-[#EF444418]", text: "text-[#EF4444]" },
    Runner: { bg: "bg-[#F59E0B18]", text: "text-[#F59E0B]" },
    Puzzle: { bg: "bg-[#3B82F618]", text: "text-[#3B82F6]" },
  };

  const scrollToGames = () => {
    document.getElementById("games-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-page text-text-primary font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-page/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-[1440px] mx-auto px-20 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-icon.svg" alt="HiddenDesk" width={28} height={28} />
            <span className="text-lg">
              <span className="font-light">Hidden</span>
              <span className="font-bold text-accent">Desk</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm text-text-secondary">
            <a href="#games-section" className="hover:text-white transition-colors">{t.games}</a>
            <a href="/leaderboard" className="hover:text-white transition-colors">{t.leaderboard}</a>
            <a href="/community" className="hover:text-white transition-colors">{t.community}</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${lang === "en" ? "bg-accent text-white" : "text-text-muted hover:text-white"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ko")}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${lang === "ko" ? "bg-accent text-white" : "text-text-muted hover:text-white"}`}
              >
                KR
              </button>
            </div>
            <span className="text-sm text-text-secondary hidden lg:block">{t.login}</span>
            <button className="bg-accent hover:bg-accent-light text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
              {t.playNow}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-20 pt-24 pb-20 flex flex-col items-center gap-10 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-medium text-text-secondary">{t.badge}</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-7xl font-normal tracking-tight text-white" style={{ fontFamily: "var(--font-serif)" }}>
            {t.heroLine1}
          </h1>
          <h1 className="text-7xl font-normal tracking-tight bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent" style={{ fontFamily: "var(--font-serif)" }}>
            {t.heroLine2}
          </h1>
        </div>
        <p className="text-lg text-text-muted text-center max-w-[500px]">{t.heroSub}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={scrollToGames}
            className="bg-gradient-to-br from-accent to-accent-light text-white text-base font-semibold px-8 py-4 rounded-xl flex items-center gap-2.5 shadow-[0_4px_24px_rgba(255,92,0,0.33)] hover:shadow-[0_6px_32px_rgba(255,92,0,0.5)] transition-shadow"
          >
            {t.ctaPrimary}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          <button
            onClick={scrollToGames}
            className="text-white text-base font-medium px-8 py-4 rounded-xl border border-border hover:border-text-muted transition-colors flex items-center gap-2.5"
          >
            {t.ctaSecondary}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-20 py-24 max-w-[1440px] mx-auto flex flex-col items-center gap-14">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-semibold text-accent tracking-[3px]">{t.whyLabel}</span>
          <h2 className="text-4xl tracking-tight text-white" style={{ fontFamily: "var(--font-serif)" }}>{t.whyTitle}</h2>
          <p className="text-base text-text-muted text-center max-w-[500px]">{t.whySub}</p>
        </div>
        <div className="grid grid-cols-3 gap-6 w-full">
          {[
            { icon: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2M2 12h20", title: t.feat1Title, desc: t.feat1Desc },
            { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", title: t.feat2Title, desc: t.feat2Desc },
            { icon: "M6 9H4.5a2.5 2.5 0 0 1 0-5C5.9 4 7 5.1 7 6.5V8M18 9h1.5a2.5 2.5 0 0 0 0-5C18.1 4 17 5.1 17 6.5V8M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2 7 13M12 2v8", title: t.feat3Title, desc: t.feat3Desc },
          ].map((feat, i) => (
            <div key={i} className="bg-card border border-border-subtle rounded-2xl p-8 flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-[#FF5C0018] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={feat.icon}/></svg>
              </div>
              <h3 className="text-lg font-semibold text-white">{feat.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Games Section */}
      <section id="games-section" className="bg-[#080808] px-20 py-24 scroll-mt-20">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-14">
          <div className="flex flex-col items-center gap-4">
            <span className="text-xs font-semibold text-accent tracking-[3px]">{t.gamesLabel}</span>
            <h2 className="text-4xl tracking-tight text-white" style={{ fontFamily: "var(--font-serif)" }}>{t.gamesTitle}</h2>
            <p className="text-base text-text-muted">{t.gamesSub}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 w-full">
            {games.map((game) => {
              const g = getLocalizedGame(game);
              const colors = categoryColors[game.category] || categoryColors.Action;
              return (
                <div
                  key={g.id}
                  className="bg-card border border-border-subtle rounded-2xl overflow-hidden group cursor-pointer hover:border-border transition-colors"
                  onClick={() => g.url !== "#" && setSelectedGame(g)}
                >
                  <div className="relative h-[180px] w-full overflow-hidden">
                    <Image src={g.thumbnail} alt={g.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <span className={`self-start px-2.5 py-1 rounded-full text-[11px] font-medium ${colors.bg} ${colors.text}`}>{game.category}</span>
                    <h4 className="text-base font-semibold text-white">{g.title}</h4>
                    <p className="text-[13px] text-text-muted leading-relaxed">{g.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-20 py-24 max-w-[1440px] mx-auto flex flex-col items-center gap-14">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-semibold text-accent tracking-[3px]">{t.howLabel}</span>
          <h2 className="text-4xl tracking-tight text-white" style={{ fontFamily: "var(--font-serif)" }}>{t.howTitle}</h2>
        </div>
        <div className="grid grid-cols-3 gap-8 w-full">
          {[
            { num: "1", title: t.step1Title, desc: t.step1Desc, style: "bg-gradient-to-br from-accent to-accent-light text-white" },
            { num: "2", title: t.step2Title, desc: t.step2Desc, style: "border-2 border-accent text-accent" },
            { num: "3", title: t.step3Title, desc: t.step3Desc, style: "border-2 border-border text-text-muted" },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-5 p-8">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${step.style}`}>
                <span className="text-2xl font-medium" style={{ fontFamily: "var(--font-mono)" }}>{step.num}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-text-muted text-center leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-20 py-28 flex flex-col items-center gap-8" style={{ background: "radial-gradient(ellipse at center, rgba(255,92,0,0.08) 0%, #0A0A0B 70%)" }}>
        <h2 className="text-5xl tracking-tight text-white" style={{ fontFamily: "var(--font-serif)" }}>{t.finalTitle}</h2>
        <p className="text-lg text-text-muted">{t.finalSub}</p>
        <button
          onClick={scrollToGames}
          className="bg-gradient-to-br from-accent to-accent-light text-white text-lg font-semibold px-10 py-4.5 rounded-xl flex items-center gap-2.5 shadow-[0_8px_32px_rgba(255,92,0,0.27)] hover:shadow-[0_10px_40px_rgba(255,92,0,0.45)] transition-shadow"
        >
          {t.finalCta}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-[#080808]">
        <div className="max-w-[1440px] mx-auto px-20 py-14 flex flex-col gap-10">
          <div className="flex justify-between">
            <div className="flex flex-col gap-3 max-w-[260px]">
              <span className="text-base">
                <span className="font-light">Hidden</span>
                <span className="font-bold text-accent">Desk</span>
              </span>
              <p className="text-[13px] text-text-muted leading-relaxed">{t.footerDesc}</p>
            </div>
            <div className="flex gap-20">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-text-secondary tracking-wide">{t.product}</span>
                <a href="#games-section" className="text-[13px] text-text-muted hover:text-white transition-colors">{t.games}</a>
                <a href="/leaderboard" className="text-[13px] text-text-muted hover:text-white transition-colors">{t.leaderboard}</a>
                <a href="/community" className="text-[13px] text-text-muted hover:text-white transition-colors">{t.community}</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-text-secondary tracking-wide">{t.company}</span>
                <a href="#" className="text-[13px] text-text-muted hover:text-white transition-colors">{t.about}</a>
                <a href="#" className="text-[13px] text-text-muted hover:text-white transition-colors">{t.blog}</a>
                <a href="#" className="text-[13px] text-text-muted hover:text-white transition-colors">{t.contact}</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border-subtle" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-disabled">{t.copyright}</span>
            <div className="flex gap-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:stroke-white transition-colors cursor-pointer"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:stroke-white transition-colors cursor-pointer"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:stroke-white transition-colors cursor-pointer"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>
            </div>
          </div>
        </div>
      </footer>

      {/* Game Instructions Modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedGame(null)}>
          <div className="bg-card rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-border-subtle relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-4 shadow-lg">
                <Image src={selectedGame.thumbnail} alt={selectedGame.title} fill className="object-cover" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{selectedGame.title}</h3>
              <p className="text-text-muted text-sm">{selectedGame.description}</p>
            </div>
            <div className="bg-page/50 rounded-xl p-6 mb-8 border border-border-subtle">
              <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-3">{t.instructions}</h4>
              <p className="text-text-secondary leading-relaxed">{selectedGame.instructions || "No instructions available."}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSelectedGame(null)} className="flex-1 py-3 rounded-lg font-bold bg-elevated hover:bg-border-subtle text-white transition-colors">
                {t.cancel}
              </button>
              <a href={selectedGame.url} target="_blank" onClick={() => setSelectedGame(null)} className="flex-1 py-3 rounded-lg font-bold bg-gradient-to-r from-accent to-accent-light text-white text-center transition-colors">
                {t.startGame}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
