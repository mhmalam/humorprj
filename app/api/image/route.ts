import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://images.almostcrackd.ai',
  'http://images.almostcrackd.ai',
]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const isAllowed = ALLOWED_ORIGINS.some(
    origin => parsedUrl.origin === origin || parsedUrl.href.startsWith(origin + '/')
  )
  
  if (!isAllowed) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(parsedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
      },
      cache: 'force-cache',
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (err) {
    console.error('Image proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
  }
}
