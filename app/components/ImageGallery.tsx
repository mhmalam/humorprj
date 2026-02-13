'use client'

import React, { useEffect, useState } from 'react'

interface ImageData {
  url: string
}

interface ImageGalleryProps {
  images: ImageData[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [visibleRows, setVisibleRows] = useState(4)
  const [allImages, setAllImages] = useState<ImageData[]>([])
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [previousRows, setPreviousRows] = useState(4)
  const baseImagesRef = React.useRef<ImageData[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (images.length === 0 || !mounted) return

    // Store base images
    baseImagesRef.current = images
    
    // Pre-generate enough images (500 images = 100 rows max)
    const extended: ImageData[] = []
    
    for (let i = 0; i < 500; i++) {
      extended.push(images[i % images.length])
    }
    
    setAllImages(extended)
  }, [images, mounted])

  useEffect(() => {
    if (!mounted) return

    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId) return
      
      rafId = requestAnimationFrame(() => {
        const currentScroll = window.scrollY
        const viewportHeight = window.innerHeight
        
        // Calculate visible viewport area (top to bottom of screen)
        const visibleTop = currentScroll
        const visibleBottom = currentScroll + viewportHeight
        
        // Each row is roughly 150px
        const estimatedRowHeight = 150
        const neededRows = Math.ceil(visibleBottom / estimatedRowHeight) + 8 // +8 buffer
        
        // Clamp between minimum and maximum
        const newRows = Math.min(Math.max(neededRows, 10), 100)
        
        setPreviousRows(visibleRows)
        setVisibleRows(newRows)
        rafId = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [mounted, visibleRows])

  if (!mounted || allImages.length === 0) return null

  // Only show images for visible rows (5 images per row)
  const visibleImages = allImages.slice(0, visibleRows * 5)

  // Calculate grid dimensions to always cover the screen
  // At -8deg rotation, we need extra width/height
  const coverageMultiplier = 1.5 // 50% extra to handle rotation
  const gridHeight = visibleRows * 120 // rough row height

  return (
    <div 
      className="fixed pointer-events-none opacity-90"
      style={{ 
        top: '50%',
        left: '50%',
        width: `${100 * coverageMultiplier}vw`,
        maxHeight: '200vh',
        transform: `translate(-50%, -50%) rotate(-8deg)`,
        transformOrigin: 'center center',
        overflow: 'hidden'
      }}
    >
      <div 
        className="grid grid-cols-5 gap-2"
        style={{ 
          gridAutoRows: 'minmax(0, 1fr)',
          willChange: 'auto'
        }}
      >
        {visibleImages.map((img, i) => {
          const rowIndex = Math.floor(i / 5)
          const isNewImage = rowIndex >= previousRows - 2 // Start fade earlier
          
          return (
            <div 
              key={`gallery-${i}`}
              className="aspect-video rounded-lg overflow-hidden bg-slate-800/50 border border-slate-700/30"
              style={{
                opacity: isNewImage ? 0 : 1,
                animationName: isNewImage ? 'fadeIn' : 'none',
                animationDuration: isNewImage ? '1.5s' : '0s',
                animationTimingFunction: isNewImage ? 'ease-out' : 'linear',
                animationFillMode: isNewImage ? 'forwards' : 'none',
                transform: 'translateZ(0)', // GPU acceleration
                backfaceVisibility: 'hidden' as const
              }}
            >
              <img 
                src={img.url} 
                alt="" 
                className="w-full h-full object-cover opacity-80"
                loading="eager"
                decoding="async"
                style={{ transform: 'translateZ(0)' }}
              />
            </div>
          )
        })}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
