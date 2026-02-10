'use client'

interface ImageData {
  url: string
}

interface ImageGalleryProps {
  images: ImageData[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null

  // Use all 20 images without duplication
  const galleryImages = images.slice(0, 20)

  return (
    <div className="fixed top-1/2 left-[55%] w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] pointer-events-none opacity-90">
      <div className="grid grid-cols-5 grid-rows-4 gap-2">
        {galleryImages.map((img, i) => (
          <div 
            key={`gallery-${i}`}
            className="aspect-video rounded-lg overflow-hidden bg-slate-800/50 border border-slate-700/30"
          >
            <img 
              src={img.url} 
              alt="" 
              className="w-full h-full object-cover opacity-80"
              loading={i < 8 ? "eager" : "lazy"}
              fetchPriority={i < 4 ? "high" : "auto"}
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
