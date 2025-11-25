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
}

const translations = {
  en: {
    store: "Store",
    library: "Library",
    community: "Community",
    heroTitle: "Play Without Limits",
    heroDesc: "Discover a curated collection of indie games, stealth runners, and retro classics. Play instantly in your browser.",
    featured: "Featured Games",
    all: "All",
    action: "Action",
    rpg: "RPG",
    playNow: "Play Now",
    comingSoon: "Coming Soon",
    footer: "© 2025 Hidden Desk. All rights reserved."
  },
  ko: {
    store: "스토어",
    library: "라이브러리",
    community: "커뮤니티",
    heroTitle: "무한한 플레이",
    heroDesc: "몰래할 수 있는 게임들만 모아놨습니다. 브라우저에서 즉시 플레이하세요.",
    featured: "추천 게임",
    all: "전체",
    action: "액션",
    rpg: "RPG",
    playNow: "플레이 하기",
    comingSoon: "출시 예정",
    footer: "© 2025 Hidden Desk. All rights reserved."
  }
};

const gameTranslations: Record<string, { ko: { title: string; description: string } }> = {
  "vscode-stealth": {
    ko: {
      title: "Code Dash",
      description: "VSCode로 위장한 스텔스 게임입니다. 오류를 피하고 버그를 수정하세요!"
    }
  },
  "neon-racer": {
    ko: {
      title: "네온 레이서",
      description: "터미널 레이서에서 데이터 스트림을 탐색하고 방화벽을 피하세요. ESC를 눌러 스텔스 모드로 전환하세요."
    }
  },
  "pixel-quest": {
    ko: {
      title: "픽셀 퀘스트",
      description: "그림판으로 위장한 RPG에서 글리치 픽셀로부터 캔버스를 방어하세요. ESC를 눌러 업무 모드로 전환하세요."
    }
  },
  "cell-invaders": {
    ko: {
      title: "셀 인베이더",
      description: "스프레드시트 슈팅 게임에서 에러 코드를 제거하세요. 완벽한 업무 위장. ESC를 눌러 차트 모드로 전환하세요."
    }
  }
};

export default function Home() {
  // Fallback data in case API fails or is loading
  const initialGames: Game[] = [
    {
      id: "vscode-stealth",
      title: "VS Code Stealth Runner",
      description: "A stealth game disguised as a code editor. Avoid errors and fix bugs!",
      thumbnail: "/thumbnails/codedash.png", 
      url: "https://game1-xi-snowy.vercel.app/", 
      category: "Action"
    },
    {
      id: "neon-racer",
      title: "Neon Racer",
      description: "Navigate data streams and avoid firewalls in this terminal-based racer. Press ESC for stealth mode.",
      thumbnail: "/thumbnails/02_neon-racer.png",
      url: "https://hidden-desk-ptvg.vercel.app",
      category: "Racing"
    },
    {
      id: "pixel-quest",
      title: "Pixel Quest",
      description: "Defend your canvas from glitch pixels in this paint-tool disguised RPG. Press ESC to switch to work mode.",
      thumbnail: "/thumbnails/pixel-quest.png",
      url: "https://hidden-desk-9hye.vercel.app/",
      category: "RPG"
    },
    {
      id: "cell-invaders",
      title: "Cell Invaders",
      description: "Eliminate error codes in this spreadsheet shooter. Looks exactly like work. Press ESC for chart mode.",
      thumbnail: "/thumbnails/cell-invaders.png",
      url: "#",
      category: "Shooter"
    }
  ];  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false); // Set to false to show initial data immediately
  const [lang, setLang] = useState<'en' | 'ko'>('en');
  const t = translations[lang];

  const getLocalizedGame = (game: Game) => {
    if (lang === 'ko' && gameTranslations[game.id]?.ko) {
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
          // Merge with initialGames to prefer local URLs if API has placeholders (handling stale backend)
          const mergedData = data.map((apiGame: Game) => {
             const localGame = initialGames.find(g => g.id === apiGame.id);
             if (localGame && (apiGame.url === "#" || !apiGame.url) && localGame.url !== "#") {
                 return { ...apiGame, url: localGame.url };
             }
             return apiGame;
          });
          setGames(mergedData);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch games, using fallback:", err);
        // Keep using initialGames if fetch fails
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">H</div>
            <h1 className="text-xl font-bold tracking-tight">Hidden Desk</h1>
          </div>
          
          <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-white transition-colors">{t.store}</a>
              <a href="#" className="hover:text-white transition-colors">{t.library}</a>
              <a href="#" className="hover:text-white transition-colors">{t.community}</a>
            </nav>
            
            {/* Language Toggle */}
            <div 
              className="relative w-14 h-7 bg-gray-800 rounded-full cursor-pointer p-1 transition-colors hover:bg-gray-700"
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
            >
              <div 
                className={`absolute top-1 w-5 h-5 bg-blue-500 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-white ${
                  lang === 'en' ? 'left-1' : 'left-8'
                }`}
              >
                {lang === 'en' ? 'EN' : 'KO'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-gray-900 pointer-events-none" />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            {t.heroTitle}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            {t.heroDesc}
          </p>
        </div>
      </section>

      {/* Games Grid */}
      <main className="container mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold">{t.featured}</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-gray-800 text-xs font-medium text-gray-300 cursor-pointer hover:bg-gray-700">{t.all}</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/50 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-700">{t.action}</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/50 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-700">{t.rpg}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => {
              const localizedGame = getLocalizedGame(game);
              return (
                <div key={localizedGame.id} className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="relative h-48 w-full bg-gray-700 overflow-hidden">
                    <Image
                        src={localizedGame.thumbnail}
                        alt={localizedGame.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                      {localizedGame.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{localizedGame.title}</h4>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{localizedGame.description}</p>
                    <a 
                      href={localizedGame.url} 
                      target="_blank"
                      className={`block w-full py-3 rounded-lg text-center font-bold transition-colors ${
                          localizedGame.url === "#" 
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {localizedGame.url === "#" ? t.comingSoon : t.playNow}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}

