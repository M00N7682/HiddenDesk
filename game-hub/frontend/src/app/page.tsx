
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

export default function Home() {
  // Fallback data in case API fails or is loading
  const initialGames: Game[] = [
    {
      id: "vscode-stealth",
      title: "VS Code Stealth Runner",
      description: "A stealth game disguised as a code editor. Avoid errors and fix bugs!",
      thumbnail: "/thumbnails/codedash.png", 
      url: "https://vscode-stealth-game-deploy.vercel.app", 
      category: "Action"
    },
    {
      id: "coming-soon-1",
      title: "Neon Racer",
      description: "Cyberpunk racing game coming soon.",
      thumbnail: "/thumbnails/neon-racer.png",
      url: "#",
      category: "Racing"
    },
    {
      id: "coming-soon-2",
      title: "Pixel Quest",
      description: "An epic 8-bit adventure awaits.",
      thumbnail: "/thumbnails/pixel-quest.png",
      url: "#",
      category: "RPG"
    }
  ];  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false); // Set to false to show initial data immediately

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/games`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setGames(data);
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
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Store</a>
            <a href="#" className="hover:text-white transition-colors">Library</a>
            <a href="#" className="hover:text-white transition-colors">Community</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-gray-900 pointer-events-none" />
        <div className="container mx-auto relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Play Without Limits
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Discover a curated collection of indie games, stealth runners, and retro classics.
            Play instantly in your browser.
          </p>
        </div>
      </section>

      {/* Games Grid */}
      <main className="container mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold">Featured Games</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-gray-800 text-xs font-medium text-gray-300 cursor-pointer hover:bg-gray-700">All</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/50 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-700">Action</span>
            <span className="px-3 py-1 rounded-full bg-gray-800/50 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-700">RPG</span>
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
            {games.map((game) => (
              <div key={game.id} className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="relative h-48 w-full bg-gray-700 overflow-hidden">
                  <Image
                      src={game.thumbnail}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                    {game.category}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{game.title}</h4>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{game.description}</p>
                  <a 
                    href={game.url} 
                    target="_blank"
                    className={`block w-full py-3 rounded-lg text-center font-bold transition-colors ${
                        game.url === "#" 
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {game.url === "#" ? "Coming Soon" : "Play Now"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 py-12">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Hidden Desk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

