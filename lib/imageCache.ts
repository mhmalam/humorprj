import { supabase } from './supabase'

interface ImageData {
  url: string
}

let cachedImages: ImageData[] | null = null
let lastFetch: number = 0
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export async function getCachedImages(): Promise<ImageData[]> {
  const now = Date.now()
  
  // Return cached images if available and not expired
  if (cachedImages && (now - lastFetch) < CACHE_DURATION) {
    return cachedImages
  }

  // Fetch fresh images - 20 for non-repeating gallery
  const { data: images } = await supabase
    .from('images')
    .select('url')
    .limit(20)

  if (images && images.length > 0) {
    cachedImages = images
    lastFetch = now
    return images
  }

  return cachedImages || []
}
