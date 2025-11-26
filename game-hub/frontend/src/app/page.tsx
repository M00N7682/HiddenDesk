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
    footer: "© 2025 Hidden Desk. All rights reserved.",
    startGame: "Start Game",
    cancel: "Cancel",
    instructions: "Instructions"
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
    footer: "© 2025 Hidden Desk. All rights reserved.",
    startGame: "게임 시작",
    cancel: "취소",
    instructions: "게임 방법"
  }
};

const gameTranslations: Record<string, { ko: { title: string; description: string; instructions?: string } }> = {
  "vscode-stealth": {
    ko: {
      title: "Code Dash",
      description: "VSCode로 위장한 스텔스 게임입니다. 오류를 피하고 버그를 수정하세요!",
      instructions: "방향키로 이동하여 버그를 피하세요. ESC를 눌러 코딩 모드로 전환하세요."
    }
  },
  "neon-racer": {
    ko: {
      title: "네온 레이서",
      description: "터미널 레이서에서 데이터 스트림을 탐색하고 방화벽을 피하세요. ESC를 눌러 스텔스 모드로 전환하세요.",
      instructions: "방향키로 이동하여 방화벽을 피하세요. ESC를 눌러 터미널 모드로 전환하세요."
    }
  },
  "pixel-quest": {
    ko: {
      title: "픽셀 퀘스트",
      description: "그림판으로 위장한 RPG에서 글리치 픽셀로부터 캔버스를 방어하세요. ESC를 눌러 업무 모드로 전환하세요.",
      instructions: "방향키로 이동하고 스페이스바로 공격하세요. ESC를 눌러 그림판 모드로 전환하세요."
    }
  },
  "cell-invaders": {
    ko: {
      title: "셀 인베이더",
      description: "스프레드시트 슈팅 게임에서 에러 코드를 제거하세요. 완벽한 업무 위장. ESC를 눌러 차트 모드로 전환하세요.",
      instructions: "방향키로 이동하고 스페이스바로 공격하세요. ESC를 눌러 엑셀 모드로 전환하세요."
    }
  },
  "paper-reader": {
    ko: {
      title: "논문 리더",
      description: "PDF 테마의 러닝 게임에서 핵심 용어를 강조하고 오타를 피하세요. ESC를 눌러 초록 보기로 전환하세요.",
      instructions: "방향키로 형광펜을 조종하여 파란색 핵심 용어를 연결하세요. 벽이나 꼬리에 부딪히지 마세요. ESC를 눌러 논문 모드로 전환하세요."
    }
  },
  "git-merge": {
    ko: {
      title: "깃 머지",
      description: "Git GUI로 위장한 퍼즐 게임입니다. 커밋 노드를 연결하여 충돌을 해결하세요. ESC를 눌러 터미널 모드로 전환하세요.",
      instructions: "마우스로 같은 색깔의 커밋 노드를 연결하세요. 선이 겹치지 않게 모든 칸을 채우세요. ESC를 눌러 터미널 모드로 전환하세요."
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
      category: "Action",
      instructions: "Use Arrow keys to move. Avoid bugs. Fix errors. Press ESC for stealth mode."
    },
    {
      id: "neon-racer",
      title: "Neon Racer",
      description: "Navigate data streams and avoid firewalls in this terminal-based racer. Press ESC for stealth mode.",
      thumbnail: "/thumbnails/02_neon-racer.png",
      url: "https://hidden-desk-ptvg.vercel.app",
      category: "Racing",
      instructions: "Use Arrow keys to steer. Avoid firewalls. Press ESC for stealth mode."
    },
    {
      id: "pixel-quest",
      title: "Pixel Quest",
      description: "Defend your canvas from glitch pixels in this paint-tool disguised RPG. Press ESC to switch to work mode.",
      thumbnail: "/thumbnails/pixel-quest.png",
      url: "https://hidden-desk-9hye.vercel.app/",
      category: "RPG",
      instructions: "Use Arrow keys to move. Space to shoot/interact. Press ESC for stealth mode."
    },
    {
      id: "cell-invaders",
      title: "Cell Invaders",
      description: "Eliminate error codes in this spreadsheet shooter. Looks exactly like work. Press ESC for chart mode.",
      thumbnail: "/thumbnails/cellinvaders.png",
      url: "https://cellinvader.vercel.app/",
      category: "Shooter",
      instructions: "Use Arrow keys to move. Space to shoot. Press ESC for stealth mode."
    },
    {
      id: "paper-reader",
      title: "Paper Reader",
      description: "Highlight key terms and avoid typos in this PDF-themed runner. Press ESC for abstract view.",
      thumbnail: "/thumbnails/paperreader.png",
      url: "https://paperreader.vercel.app/",
      category: "Runner",
      instructions: "Use Arrow keys to guide the highlighter. Connect blue key terms. Avoid walls and tail. Press ESC for stealth mode."
    },
    {
      id: "git-merge",
      title: "Git Merge",
      description: "A puzzle game disguised as a Git GUI. Connect commit nodes to resolve conflicts. Press ESC for terminal mode.",
      thumbnail: "/thumbnails/gitmerge.png",
      url: "https://gitmerge.vercel.app/",
      category: "Puzzle",
      instructions: "Use mouse to connect matching colored commit nodes. Fill the grid without crossing lines. Press ESC for terminal mode."
    }
  ];  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false); // Set to false to show initial data immediately
  const [lang, setLang] = useState<'en' | 'ko'>('en');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
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
                    <button 
                      onClick={() => {
                        if (localizedGame.url !== "#") {
                          setSelectedGame(localizedGame);
                        }
                      }}
                      className={`block w-full py-3 rounded-lg text-center font-bold transition-colors ${
                          localizedGame.url === "#" 
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {localizedGame.url === "#" ? t.comingSoon : t.playNow}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Game Instructions Modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-700 relative">
            <button 
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-4 shadow-lg">
                <Image 
                  src={selectedGame.thumbnail} 
                  alt={selectedGame.title} 
                  fill 
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">{selectedGame.title}</h3>
              <p className="text-gray-400 text-sm">{selectedGame.description}</p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-700/50">
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">{t.instructions}</h4>
              <p className="text-gray-300 leading-relaxed">
                {selectedGame.instructions || "No instructions available."}
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedGame(null)}
                className="flex-1 py-3 rounded-lg font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                {t.cancel}
              </button>
              <a 
                href={selectedGame.url} 
                target="_blank"
                onClick={() => setSelectedGame(null)}
                className="flex-1 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white text-center transition-colors"
              >
                {t.startGame}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}

