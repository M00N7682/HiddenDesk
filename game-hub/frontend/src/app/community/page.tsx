"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Discussion");
  const [authorName, setAuthorName] = useState("");

  const fetchPosts = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !authorName) return;

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
        setAuthorName("");
        fetchPosts(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to create post", error);
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
            <Link href="#" className="hover:text-white transition-colors">라이브러리</Link>
            <Link href="/community" className="text-white font-bold">커뮤니티</Link>
          </nav>
        </div>
      </header>

      {/* Community Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">커뮤니티</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-colors"
            >
              글쓰기
            </button>
          </div>

          {/* Pinned / Notice */}
          <div className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">공지</span>
              <span className="text-gray-400 text-sm">관리자 • 상단 고정</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Hidden Desk 커뮤니티에 오신 것을 환영합니다!</h3>
            <p className="text-gray-300">
              최고 점수를 공유하거나, 새로운 게임 아이디어를 제안하거나, 버그를 신고해 주세요.
              화면 밝기는 낮추는 거 잊지 마세요!
            </p>
          </div>

          {/* Discussion List */}
          <div className="space-y-4">
            {loading ? (
               <div className="text-center py-10 text-gray-500">게시글을 불러오는 중...</div>
            ) : posts.length === 0 ? (
               <div className="text-center py-10 text-gray-500">아직 게시글이 없어요. 첫 번째 글을 작성해 보세요!</div>
            ) : (
              posts.map((post) => (
                <Link href={`/community/${post.id}`} key={post.id}>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          post.category === 'Idea' ? 'bg-purple-500/20 text-purple-400' :
                          post.category === 'Help' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-700 text-gray-300'
                        }`}>{post.category}</span>
                        <span className="text-gray-400 text-sm">{post.author_name}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-lg font-bold mb-3 group-hover:text-blue-400">{post.title}</h4>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <span className="flex items-center gap-1">💬 {post.comments ? post.comments.length : 0}</span>
                      <span className="flex items-center gap-1">❤️ {post.likes}</span>
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
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-gray-700 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-bold mb-6">새 글 작성</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">닉네임</label>
                <input 
                  type="text" 
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="익명"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">카테고리</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Discussion">자유</option>
                  <option value="Idea">아이디어</option>
                  <option value="Bug">버그 신고</option>
                  <option value="Showcase">점수 자랑</option>
                  <option value="Help">질문</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">제목</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">내용</label>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-lg font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  게시
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
