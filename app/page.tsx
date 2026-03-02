import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'
import { getCachedImages } from '@/lib/imageCache'
import ImageGallery from './components/ImageGallery'
import SwipeableCards from './components/SwipeableCards'
import LoginGate from './components/LoginGate'
import UserProfile from './components/UserProfile'
import ImageCaptionGenerator from './components/ImageCaptionGenerator'

interface Image {
  id: string
  url: string
  [key: string]: any
}

interface Caption {
  id: string
  content: string
  image_id: string
  images?: Image
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

  // Fetch captions
  const { data: captionsData, error: captionsError } = await supabase
    .from('captions')
    .select('*')
    .not('image_id', 'is', null)

  let captions = null

  // Fetch images separately and join manually
  if (captionsData && captionsData.length > 0) {
    const imageIds = captionsData.map(c => c.image_id).filter(Boolean)
    
    console.log('Image IDs to fetch:', imageIds.slice(0, 5)) // Log first 5
    
    const { data: imagesData } = await supabase
      .from('images')
      .select('id, url')
      .in('id', imageIds)
    
    console.log('Images fetched from DB:', imagesData?.slice(0, 5)) // Log first 5
    
    // Join manually and filter out captions without images
    captions = captionsData
      .map(caption => {
        const matchedImage = imagesData?.find(img => img.id === caption.image_id)
        if (!matchedImage) {
          console.warn('No image found for caption:', caption.id, 'image_id:', caption.image_id)
        }
        return {
          ...caption,
          images: matchedImage || null
        }
      })
      .filter(caption => caption.images !== null) // Only keep captions with images
  }

  const error = captionsError

  console.log('Final captions with images:', captions?.slice(0, 2)) // Log first 2 for debugging

  // Get cached images (instant after first load)
  const images = await getCachedImages()

  if (error) {
    console.error('Error fetching captions:', error)
  }

  return (
    <div className="min-h-screen bg-slate-950 font-[family-name:var(--font-inter)]">
      {/* Background container with gallery */}
      <div className="fixed inset-0 overflow-hidden">
        <ImageGallery images={images} />
        
        {/* Clean gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent pointer-events-none z-[1]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/70 pointer-events-none z-[1]"></div>
      </div>

      {/* Floating Course Badge - Clean */}
      <div className="fixed top-4 left-4 z-50 font-[family-name:var(--font-space-grotesk)]">
        <div className="bg-slate-800 text-white px-3 py-2 rounded-xl shadow-lg border border-slate-700 hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="text-lg">😂</span>
            <div>
              <p className="font-bold text-[10px] tracking-wide leading-tight">THE HUMOR</p>
              <p className="font-bold text-[10px] tracking-wide leading-tight">PROJECT</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pt-20 max-w-6xl relative z-10">
        {/* Hero Header */}
        <header className="mb-6 text-center relative px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-tight font-[family-name:var(--font-space-grotesk)] uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">MEME </span>
            <span className="text-white">CAPTION LAB</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto font-medium">
            Generate fresh meme captions and then vote on the funniest ones.
          </p>
        </header>

        {/* Image upload + caption generation */}
        <ImageCaptionGenerator />

        {error && (
          <div className="mb-12 p-6 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl shadow-sm">
            <p className="text-red-700 dark:text-red-300 text-base">
              Error loading captions: {error.message}
            </p>
          </div>
        )}

        {/* Swipeable Cards */}
        <div className="flex items-center justify-center min-h-[60vh]">
          {captions && captions.length > 0 ? (
            <SwipeableCards captions={captions} userId={user.id} />
          ) : !error ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3 opacity-50">💭</div>
              <p className="text-slate-400 text-base">
                No captions found yet
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center pb-4">
          <p className="text-slate-600 text-xs font-[family-name:var(--font-space-grotesk)] tracking-wide">
            THE HUMOR PROJECT
          </p>
        </footer>
      </div>

      {/* User Profile Button */}
      <UserProfile user={user} />
    </div>
  )
}
