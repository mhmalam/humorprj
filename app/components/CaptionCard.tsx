'use client'

import VoteButton from './VoteButton'

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

interface CaptionCardProps {
  caption: Caption
  userId?: string
}

export default function CaptionCard({ caption, userId }: CaptionCardProps) {
  const imageUrl = caption.images?.url

  return (
    <div className="group">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-slate-600/50 transition-all duration-300">
        {/* Image */}
        {imageUrl && (
          <div className="relative w-full aspect-video bg-slate-800">
            <img 
              src={imageUrl} 
              alt="Caption image" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Caption Content */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg font-[family-name:var(--font-space-grotesk)] shadow-md">
                C
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-base text-white font-[family-name:var(--font-space-grotesk)]">
                  Caption
                </span>
              </div>
            </div>
          </div>

          {/* Caption Text */}
          <div className="mb-4">
            <p className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
              {caption.content}
            </p>
          </div>

          {/* Vote Buttons */}
          {userId && (
            <div className="pt-3 border-t border-slate-700/50">
              <VoteButton captionId={caption.id} userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
