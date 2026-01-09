"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author_name: string;
  created_at: string;
  views: number;
  likes: number;
  comments: any[];
}

interface Stats {
  total_posts: number;
  total_comments: number;
  categories: Record<string, number>;
}

const CATEGORIES = [
  { id: "all", label: "전체", icon: "📋" },
  { id: "Discussion", label: "자유", icon: "💬" },
  { id: "Showcase", label: "점수 자랑", icon: "🏆" },
  { id: "Idea", label: "아이디어", icon: "💡" },
  { id: "Help", label: "질문", icon: "❓" },
  { id: "Bug", label: "버그 신고", icon: "🐛" },
];

const SORT_OPTIONS = [
  { id: "latest", label: "최신순" },
  { id: "popular", label: "인기순" },
  { id: "views", label: "조회순" },
  { id: "comments", label: "댓글순" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Discussion");
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('community_nickname') || "";
    }
    return "";
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const params = new URLSearchParams();
      
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      params.append("sort", sortBy);
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      
      const res = await fetch(`${apiUrl}/api/community/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [fetchPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !authorName) return;

    // Save nickname to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_nickname', authorName);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, author_name: authorName }),
      });

      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setContent("");
        fetchPosts();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'Idea': return 'bg-purple-500/20 text-purple-400';
      case 'Help': return 'bg-yellow-500/20 text-yellow-400';
      case 'Bug': return 'bg-red-500/20 text-red-400';
      case 'Showcase': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find(c => c.id === cat);
    return found ? found.label : cat;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
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
            <Link href="/leaderboard" className="hover:text-white transition-colors">리더보드</Link>
            <Link href="/community" className="text-white font-bold">커뮤니티</Link>
          </nav>
        </div>
      </header>

      {/* Community Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              커뮤니티
            </h2>
            <p className="text-gray-400">점수를 자랑하고, 아이디어를 공유하고, 함께 즐겨요!</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.total_posts}</div>
                <div className="text-gray-400 text-sm">전체 게시글</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.total_comments}</div>
                <div className="text-gray-400 text-sm">전체 댓글</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.categories?.Idea || 0}</div>
                <div className="text-gray-400 text-sm">아이디어</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.categories?.Showcase || 0}</div>
                <div className="text-gray-400 text-sm">점수 자랑</div>
              </div>
            </div>
          )}

          {/* Search & Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="제목이나 내용으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            
            {/* Write Button */}
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
            >
              ✏️ 글쓰기
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.id !== "all" && stats?.categories?.[cat.id] && (
                  <span className="bg-gray-700/50 px-1.5 py-0.5 rounded text-xs">
                    {stats.categories[cat.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Pinned Notice */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/30 text-blue-300 text-xs font-bold px-2 py-1 rounded">📌 공지</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Hidden Desk 커뮤니티에 오신 것을 환영합니다!</h3>
            <p className="text-gray-400 text-sm">
              점수를 공유하고, 새 게임 아이디어를 제안하고, 버그를 신고해 주세요. 서로 존중하며 즐거운 커뮤니티를 만들어가요! 🎮
            </p>
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin inline-block w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mb-3"></div>
                <p className="text-gray-500">게시글을 불러오는 중...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-gray-400 mb-1">
                  {debouncedSearch ? `"${debouncedSearch}" 검색 결과가 없습니다.` : "아직 게시글이 없어요."}
                </p>
                <p className="text-gray-500 text-sm">첫 번째 글을 작성해 보세요!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link href={`/community/${post.id}`} key={post.id}>
                  <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl p-5 hover:border-blue-500/50 hover:bg-gray-800 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getCategoryStyle(post.category)}`}>
                            {getCategoryLabel(post.category)}
                          </span>
                          <span className="text-gray-500 text-sm">{post.author_name}</span>
                          <span className="text-gray-600 text-sm">•</span>
                          <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
                        </div>
                        <h4 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors truncate">
                          {post.title}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-1">{post.content}</p>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-gray-500 text-sm shrink-0">
                        <span className="flex items-center gap-1" title="조회수">
                          👁️ {post.views}
                        </span>
                        <span className="flex items-center gap-1" title="좋아요">
                          ❤️ {post.likes}
                        </span>
                        <span className="flex items-center gap-1" title="댓글">
                          💬 {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      {/* New Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-700 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-bold mb-6">✏️ 새 글 작성</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">닉네임</label>
                <input 
                  type="text" 
                  required
                  maxLength={20}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="닉네임을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">카테고리</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        category === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">제목</label>
                <input 
                  type="text" 
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">내용</label>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
