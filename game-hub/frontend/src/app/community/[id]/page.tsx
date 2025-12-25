"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Comment Form State
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");

  const fetchPost = async () => {
    if (!postId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch (error) {
      console.error("Failed to fetch post", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor || !commentContent) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: commentAuthor, content: commentContent }),
      });

      if (res.ok) {
        setCommentAuthor("");
        setCommentContent("");
        fetchPost(); // Refresh to show new comment
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">불러오는 중...</div>;
  }

  if (!post) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">게시글을 찾을 수 없습니다</div>;
  }

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

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/community" className="text-gray-400 hover:text-white mb-6 inline-block">
            ← 커뮤니티로 돌아가기
          </Link>

          {/* Post Content */}
          <article className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                post.category === 'Idea' ? 'bg-purple-500/20 text-purple-400' :
                post.category === 'Help' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-700 text-gray-300'
              }`}>{post.category}</span>
              <span className="text-gray-400 text-sm"><span className="text-white font-bold">{post.author_name}</span> 님</span>
              <span className="text-gray-500 text-sm">• {new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
            
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-700 text-gray-400">
              <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <span>❤️</span> 좋아요 {post.likes}
              </button>
              <span className="flex items-center gap-2">
                <span>💬</span> 댓글 {post.comments ? post.comments.length : 0}
              </span>
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-gray-900 rounded-xl">
            <h3 className="text-xl font-bold mb-6">댓글</h3>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">닉네임</label>
                <input 
                  type="text" 
                  required
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-full md:w-1/3 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="익명"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">댓글</label>
                <textarea 
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="댓글을 입력하세요"
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-colors"
                >
                  댓글 작성
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-blue-400">{comment.author_name}</span>
                      <span className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-800/30 rounded-xl border border-gray-800">
                  아직 댓글이 없어요. 첫 번째 댓글을 남겨보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
