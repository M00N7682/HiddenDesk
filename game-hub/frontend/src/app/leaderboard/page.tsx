"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  player_name: string;
  score: number;
  created_at: string;
}

interface GlobalRanking {
  rank: number;
  player_name: string;
  total_score: number;
  games_played: number;
}

const GAMES = [
  { id: "vscode-stealth", name: "Code Dash", icon: "💻" },
  { id: "neon-racer", name: "네온 레이서", icon: "🏎️" },
  { id: "pixel-quest", name: "픽셀 퀘스트", icon: "🎨" },
  { id: "cell-invaders", name: "셀 인베이더", icon: "📊" },
  { id: "paper-reader", name: "논문 리더", icon: "📄" },
  { id: "git-merge", name: "깃 머지", icon: "🔀" },
  { id: "network-flow", name: "네트워크 플로우", icon: "🌐" },
];

type Period = "all" | "weekly" | "monthly";

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("all");
  const [gameLeaderboard, setGameLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalRankings, setGlobalRankings] = useState<GlobalRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const periodLabels: Record<Period, string> = {
    all: "전체",
    weekly: "주간",
    monthly: "월간"
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame, period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    try {
      if (selectedGame) {
        // Fetch specific game leaderboard
        const res = await fetch(`${apiUrl}/api/leaderboard/games/${selectedGame}?period=${period}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setGameLeaderboard(data);
        }
      } else {
        // Fetch global leaderboard
        const res = await fetch(`${apiUrl}/api/leaderboard/global?period=${period}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setGlobalRankings(data.rankings || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50 text-yellow-400";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50 text-gray-300";
      case 3:
        return "bg-gradient-to-r from-orange-600/20 to-orange-700/10 border-orange-500/50 text-orange-400";
      default:
        return "bg-gray-800/50 border-gray-700/50 text-gray-400";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank.toString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">H</div>
            <h1 className="text-xl font-bold tracking-tight">Hidden Desk</h1>
          </Link>
          
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">스토어</Link>
            <Link href="/leaderboard" className="text-white font-bold">리더보드</Link>
            <Link href="/community" className="hover:text-white transition-colors">커뮤니티</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              🏆 리더보드
            </h2>
            <p className="text-gray-400">최고의 플레이어가 되어 랭킹에 이름을 올려보세요!</p>
          </div>

          {/* Game Selector */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              onClick={() => setSelectedGame(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedGame === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              🌍 전체 랭킹
            </button>
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedGame === game.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {game.icon} {game.name}
              </button>
            ))}
          </div>

          {/* Period Selector */}
          <div className="flex justify-center gap-2 mb-8">
            {(["all", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800/50 text-gray-500 hover:bg-gray-800"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800/50 border-b border-gray-700/50 text-sm font-bold text-gray-400">
              <div className="col-span-2 text-center">순위</div>
              <div className="col-span-5">플레이어</div>
              <div className="col-span-3 text-right">
                {selectedGame ? "점수" : "총 점수"}
              </div>
              <div className="col-span-2 text-right">
                {selectedGame ? "달성일" : "플레이"}
              </div>
            </div>

            {/* Table Body */}
            {loading ? (
              <div className="py-20 text-center text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mb-3"></div>
                <p>불러오는 중...</p>
              </div>
            ) : (selectedGame ? gameLeaderboard : globalRankings).length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <p className="text-4xl mb-3">🎮</p>
                <p>아직 기록이 없어요.</p>
                <p className="text-sm mt-1">첫 번째 기록의 주인공이 되어보세요!</p>
              </div>
            ) : selectedGame ? (
              // Game-specific leaderboard
              gameLeaderboard.map((entry) => (
                <div
                  key={`${entry.player_name}-${entry.rank}`}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-700/30 transition-colors hover:bg-gray-800/30 ${getRankStyle(entry.rank)}`}
                >
                  <div className="col-span-2 text-center text-xl">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-5 font-medium text-white truncate">
                    {entry.player_name}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-lg">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </div>
                </div>
              ))
            ) : (
              // Global leaderboard
              globalRankings.map((entry) => (
                <div
                  key={`${entry.player_name}-${entry.rank}`}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-700/30 transition-colors hover:bg-gray-800/30 ${getRankStyle(entry.rank)}`}
                >
                  <div className="col-span-2 text-center text-xl">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-5 font-medium text-white truncate">
                    {entry.player_name}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-lg">
                    {entry.total_score.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right text-sm text-gray-500">
                    {entry.games_played}회
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="font-bold text-blue-400 mb-2">💡 점수 등록 방법</h3>
            <p className="text-gray-300 text-sm">
              각 게임을 플레이하면 자동으로 점수가 기록됩니다. 
              게임 종료 시 닉네임을 입력하면 리더보드에 등록됩니다.
              더 높은 점수로 도전해서 1위를 차지해보세요!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

