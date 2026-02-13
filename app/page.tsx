import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import { getCachedImages } from '@/lib/imageCache'
import ImageGallery from './components/ImageGallery'
import PostCard from './components/PostCard'
import LoginGate from './components/LoginGate'
import UserProfile from './components/UserProfile'

interface Post {
  id: string
  created_at?: string
  post_time?: string
  like_count?: number
  [key: string]: any
}

export default async function Home() {
  // Check authentication
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  // If not authenticated, show login gate
  if (!user) {
    return <LoginGate />
  }

  const { data: posts, error } = await supabase
    .from('sidechat_posts')
    .select('*')

  // Get cached images (instant after first load)
  const images = await getCachedImages()

  if (error) {
    console.error('Error fetching posts:', error)
  }

  return (
    <div className="min-h-screen bg-slate-950 font-[family-name:var(--font-inter)]">
      {/* Background container with gallery */}
      <div className="fixed inset-0 overflow-hidden">
        <ImageGallery images={images} />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 via-30% to-transparent pointer-events-none z-[1]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/60 pointer-events-none z-[1]"></div>
      </div>

      {/* Floating Course Badge */}
      <div className="fixed top-6 left-6 z-50 font-[family-name:var(--font-space-grotesk)]">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">😂</span>
            <div>
              <p className="font-bold text-xs tracking-wide">THE HUMOR</p>
              <p className="font-bold text-xs tracking-wide">PROJECT</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 pt-24 max-w-7xl relative z-10">
        {/* Hero Header */}
        <header className="mb-12 text-center relative px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 tracking-tight font-[family-name:var(--font-space-grotesk)] uppercase italic">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">COLUMBIA</span>{' '}
            <span className="text-white">SIDECHAT</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Ivy League brainrot
          </p>
        </header>

        {error && (
          <div className="mb-12 p-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl shadow-sm">
            <p className="text-red-700 dark:text-red-300 text-base">
              Error loading posts: {error.message}
            </p>
          </div>
        )}

        {/* Single column scrolling feed */}
        <div className="max-w-2xl mx-auto space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : !error ? (
            <div className="col-span-full text-center py-20">
              <div className="text-6xl mb-4 opacity-50">💭</div>
              <p className="text-slate-400 text-lg">
                No posts found yet
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center pb-8">
          <p className="text-slate-600 text-sm font-[family-name:var(--font-space-grotesk)] tracking-wide">
            THE HUMOR PROJECT
          </p>
        </footer>
      </div>

      {/* User Profile Button */}
      <UserProfile user={user} />
    </div>
  )
}
