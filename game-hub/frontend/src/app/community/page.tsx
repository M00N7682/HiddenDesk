import Link from "next/link";

export default function CommunityPage() {
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
            <Link href="/" className="hover:text-white transition-colors">Store</Link>
            <Link href="#" className="hover:text-white transition-colors">Library</Link>
            <Link href="/community" className="text-white font-bold">Community</Link>
          </nav>
        </div>
      </header>

      {/* Community Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Community Hub</h2>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-colors">
              New Post
            </button>
          </div>

          {/* Pinned / Notice */}
          <div className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">NOTICE</span>
              <span className="text-gray-400 text-sm">Admin • 2 hours ago</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to Hidden Desk Community!</h3>
            <p className="text-gray-300">
              Share your high scores, suggest new stealth game ideas, or report bugs here. 
              Remember to keep your screen brightness low!
            </p>
          </div>

          {/* Discussion List */}
          <div className="space-y-4">
            {[
              { title: "Git Merge Level 10 is impossible!", author: "DevOps_Ninja", replies: 12, likes: 45, tag: "Discussion" },
              { title: "Suggestion: Add a Slack-themed game", author: "RemoteWorker", replies: 8, likes: 32, tag: "Idea" },
              { title: "Paper Reader high score: 150 citations", author: "GradStudent", replies: 5, likes: 18, tag: "Showcase" },
              { title: "How to switch to stealth mode quickly?", author: "Newbie", replies: 3, likes: 7, tag: "Help" },
            ].map((post, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      post.tag === 'Idea' ? 'bg-purple-500/20 text-purple-400' :
                      post.tag === 'Help' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>{post.tag}</span>
                    <span className="text-gray-400 text-sm">{post.author}</span>
                  </div>
                  <span className="text-gray-500 text-xs">10 mins ago</span>
                </div>
                <h4 className="text-lg font-bold mb-3 group-hover:text-blue-400">{post.title}</h4>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <span className="flex items-center gap-1">💬 {post.replies}</span>
                  <span className="flex items-center gap-1">❤️ {post.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
