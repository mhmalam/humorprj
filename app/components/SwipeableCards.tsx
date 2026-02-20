'use client'

import { useState, useEffect, useRef } from 'react'
import { submitVote } from '@/app/actions/voteActions'

interface Image {
  id: string
  url: string
  [key: string]: any
}

interface Caption {
  id: string
  content: string
  image_id: string
  url?: string  // URL might be directly on caption
  images?: Image  // Or nested in images relation
  [key: string]: any
}

interface SwipeableCardsProps {
  captions: Caption[]
  userId: string
}

export default function SwipeableCards({ captions, userId }: SwipeableCardsProps) {
  const [mounted, setMounted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voteQueue, setVoteQueue] = useState<Array<{ captionId: string, voteType: 'upvote' | 'downvote' }>>([])
  const [votedCaptions, setVotedCaptions] = useState<Set<string>>(new Set())
  const [imageError, setImageError] = useState(false)
  const processingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset image error when caption changes
  useEffect(() => {
    setImageError(false)
  }, [currentIndex])

  // Fast parallel vote processing
  useEffect(() => {
    if (voteQueue.length === 0 || processingRef.current) return

    const processAllVotes = async () => {
      processingRef.current = true
      
      // Process all votes in parallel for maximum speed
      const promises = voteQueue.map(vote => 
        submitVote(vote.captionId, vote.voteType)
          .then(result => {
            if (result.success) {
              console.log('Vote processed:', vote.captionId)
            } else {
              // Only log non-duplicate errors
              if (!result.error?.includes('duplicate') && !result.error?.includes('already exists')) {
                console.error('Vote failed:', result.error)
              }
            }
            return result
          })
          .catch(err => {
            console.error('Vote error:', err)
            return { success: false, error: err.message }
          })
      )
      
      await Promise.all(promises)
      
      // Clear the queue
      setVoteQueue([])
      processingRef.current = false
    }

    processAllVotes()
  }, [voteQueue.length])

  // Preload next 3 images
  useEffect(() => {
    if (!mounted) return
    
    const preloadImages = () => {
      for (let i = currentIndex + 1; i <= Math.min(currentIndex + 3, captions.length - 1); i++) {
        const imageUrl = captions[i]?.images?.url
        if (imageUrl) {
          const img = new Image()
          img.src = imageUrl
        }
      }
    }
    
    preloadImages()
  }, [mounted, currentIndex, captions])

  const currentCaption = captions[currentIndex]

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!currentCaption) return

    // Skip if already voted on this caption
    if (votedCaptions.has(currentCaption.id)) {
      console.log('Already voted on this caption, skipping...')
      setCurrentIndex(prev => prev + 1)
      return
    }

    // Mark as voted
    setVotedCaptions(prev => new Set(prev).add(currentCaption.id))

    // Add to queue
    setVoteQueue(prev => [...prev, { 
      captionId: currentCaption.id, 
      voteType 
    }])
    
    console.log('Vote queued:', { 
      captionId: currentCaption.id,
      voteType,
      queueLength: voteQueue.length + 1
    })
    
    // Instantly move to next caption
    setCurrentIndex(prev => prev + 1)
  }

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-4">
        <div className="w-full mb-4">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          </div>
        </div>
        <div className="relative w-full aspect-[4/5] mb-4">
          <div className="w-full h-full bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full animate-pulse"></div>
          <div className="w-16 h-16 bg-slate-800 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!currentCaption) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-8xl animate-bounce">🎉🎊🎉</div>
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 uppercase">
          YOOO YOU DID IT!!!
        </h2>
        <p className="text-yellow-400 text-xl font-bold animate-pulse">ALL CAPTIONS RATED FR FR</p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="px-8 py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-2xl font-black text-lg hover:scale-110 transition-transform border-4 border-yellow-400 shadow-2xl uppercase animate-pulse"
        >
          DO IT AGAIN! 🔥
        </button>
      </div>
    )
  }

  const imageUrl = currentCaption.images?.url || currentCaption.url
  
  // Use proxy to avoid CORS when loading external images
  const imageSrc = imageUrl ? `/api/image?url=${encodeURIComponent(imageUrl)}` : undefined
  
  // Log image URL for debugging
  console.log('Current caption:', currentCaption)
  console.log('Image URL from images.url:', currentCaption.images?.url)
  console.log('Image URL from url:', currentCaption.url)
  console.log('Final image URL used:', imageSrc)

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto px-4">
      {/* Card - Clean professional style */}
      <div className="relative w-full aspect-[4/5] mb-6 transition-transform hover:scale-[1.02]">
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Image with overlay */}
          <div className="relative w-full h-full bg-slate-900">
            {!imageError ? (
              <img 
                src={imageUrl} 
                alt="Caption image" 
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl)
                  setImageError(true)
                }}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-8">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-slate-400 text-center text-sm mb-2">Image failed to load</p>
                <p className="text-slate-600 text-xs text-center break-all">{imageUrl}</p>
                <button 
                  onClick={() => setImageError(false)}
                  className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white"
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Clean gradient overlay */}
            {!imageError && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            )}
            
            {/* Caption overlay - Professional */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-2xl leading-snug text-white font-bold text-center">
                {currentCaption.content}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Clean thumbs */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <button
          onClick={() => handleVote('downvote')}
          className="relative w-20 h-20 bg-slate-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Thumbs Down"
        >
          <span className="text-5xl">
            👎
          </span>
        </button>

        <button
          onClick={() => handleVote('upvote')}
          className="relative w-20 h-20 bg-slate-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Thumbs Up"
        >
          <span className="text-5xl">
            👍
          </span>
        </button>
      </div>

      {/* Queue indicator - Clean */}
      {voteQueue.length > 0 && (
        <div className="bg-slate-800 text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
          Processing {voteQueue.length} vote{voteQueue.length > 1 ? 's' : ''}...
        </div>
      )}
    </div>
  )
}
