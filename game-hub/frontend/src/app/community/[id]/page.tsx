"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author_name: string;
  created_at: string;
  views: number;
  likes: number;
  comments: Comment[];
}

const CATEGORIES: Record<string, { label: string; icon: string; style: string }> = {
  Discussion: { label: "자유", icon: "💬", style: "bg-gray-700 text-gray-300" },
  Idea: { label: "아이디어", icon: "💡", style: "bg-purple-500/20 text-purple-400" },
  Help: { label: "질문", icon: "❓", style: "bg-yellow-500/20 text-yellow-400" },
  Bug: { label: "버그 신고", icon: "🐛", style: "bg-red-500/20 text-red-400" },
  Showcase: { label: "점수 자랑", icon: "🏆", style: "bg-green-500/20 text-green-400" },
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Comment Form State
  const [commentAuthor, setCommentAuthor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('community_nickname') || "";
    }
    return "";
  });
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPost = async () => {
    if (!postId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setLikeCount(data.likes);
      }
    } catch (error) {
      console.error("Failed to fetch post", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async () => {
    if (!postId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/community/posts/${postId}/view`, { method: "POST" });
    } catch (error) {
      console.error("Failed to increment view", error);
    }
  };

  useEffect(() => {
    fetchPost();
    incrementView();
  }, [postId]);

  const handleLike = async () => {
    if (liked) return; // Prevent multiple likes
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likes);
        setLiked(true);
      }
    } catch (error) {
      console.error("Failed to like post", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor || !commentContent || submitting) return;

    // Save nickname to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('community_nickname', commentAuthor);
    }

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: commentAuthor, content: commentContent }),
      });

      if (res.ok) {
        setCommentContent("");
        fetchPost(); // Refresh to show new comment
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeDate = (dateStr: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mb-3"></div>
          <p className="text-gray-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-gray-400 mb-4">게시글을 찾을 수 없습니다</p>
          <Link href="/community" className="text-blue-400 hover:underline">
            ← 커뮤니티로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORIES[post.category] || CATEGORIES.Discussion;

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

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => router.push('/community')}
            className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2 transition-colors"
          >
            <span>←</span> 커뮤니티로 돌아가기
          </button>

          {/* Post Content */}
          <article className="bg-gray-800/70 border border-gray-700/50 rounded-2xl overflow-hidden mb-8">
            {/* Post Header */}
            <div className="p-6 pb-4 border-b border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${categoryInfo.style}`}>
                  <span>{categoryInfo.icon}</span>
                  <span>{categoryInfo.label}</span>
                </span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {post.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{post.author_name}</div>
                    <div className="text-gray-500 text-sm">{formatDate(post.created_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1">👁️ {post.views}</span>
                </div>
              </div>
            </div>
            
            {/* Post Body */}
            <div className="p-6">
              <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                {post.content}
              </div>
            </div>
            
            {/* Post Footer */}
            <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700/50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleLike}
                  disabled={liked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    liked 
                      ? 'bg-red-500/20 text-red-400 cursor-default' 
                      : 'bg-gray-700 text-gray-300 hover:bg-red-500/20 hover:text-red-400'
                  }`}
                >
                  <span>{liked ? '❤️' : '🤍'}</span>
                  <span>좋아요 {likeCount}</span>
                </button>
                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700 text-gray-300">
                  <span>💬</span>
                  <span>댓글 {post.comments?.length || 0}</span>
                </span>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                💬 댓글 <span className="text-blue-400">{post.comments?.length || 0}</span>
              </h3>
            </div>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="p-6 border-b border-gray-700/50">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                  {commentAuthor ? commentAuthor.charAt(0).toUpperCase() : '?'}
                </div>
                <input 
                  type="text" 
                  required
                  maxLength={20}
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="닉네임"
                />
              </div>
              <div className="pl-13">
                <textarea 
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="댓글을 입력하세요..."
                />
                <div className="flex justify-end mt-3">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-colors"
                  >
                    {submitting ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </div>
            </form>

            {/* Comment List */}
            <div className="divide-y divide-gray-700/50">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center font-bold shrink-0">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-blue-400">{comment.author_name}</span>
                          <span className="text-gray-500 text-sm">{formatRelativeDate(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-3xl mb-2">💭</p>
                  <p>아직 댓글이 없어요</p>
                  <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
