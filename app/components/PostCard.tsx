'use client'

import { useState, useEffect } from 'react'
import VoteButton from './VoteButton'

interface Caption {
  id: string
  post_id: string
  caption_text: string
  [key: string]: any
}

interface Post {
  id: string
  created_at?: string
  post_time?: string
  like_count?: number
  captions?: Caption[]
  [key: string]: any
}

interface PostCardProps {
  post: Post
  userId?: string
}

function getRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`
  return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`
}

export default function PostCard({ post, userId }: PostCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the main content field
  const contentKeys = ['content', 'text', 'message', 'body', 'post', 'description']
  const mainContentKey = Object.keys(post).find(key => 
    contentKeys.includes(key.toLowerCase())
  )
  const mainContent = mainContentKey ? post[mainContentKey] : null

  // Get remaining fields to display
  const excludedFields = [
    'id', 
    mainContentKey, 
    'created_at',
    'updated_at',
    'user_id',
    'author',
    'username',
    'post_time',
    'like_count',
    'created_time',
    'post_date',
    'timestamp',
    'date',
    'time',
    'created_datetime_utc',
    'post_datetime_utc',
    'created datetime utc',
    'post datetime utc'
  ].filter(Boolean)
  
  const otherFields = Object.entries(post).filter(([key]) => 
    !excludedFields.includes(key) && 
    !key.toLowerCase().includes('time') &&
    !key.toLowerCase().includes('date') &&
    !key.toLowerCase().includes('utc') &&
    !key.toLowerCase().includes('datetime')
  )

  // Get timestamp
  const timeField = post.post_time || 
                   post.created_at || 
                   post.post_datetime_utc || 
                   post['post datetime utc'] ||
                   post.created_datetime_utc ||
                   post['created datetime utc']

  return (
    <div className="group">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-slate-600/50 transition-all duration-300">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg font-[family-name:var(--font-space-grotesk)] shadow-md">
              C
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-base text-white font-[family-name:var(--font-space-grotesk)]">
                Columbia
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 text-sm">
                {mounted && timeField ? getRelativeTime(timeField) : 'just now'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {mainContent && (
            <div className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
              {typeof mainContent === 'string' ? mainContent : JSON.stringify(mainContent)}
            </div>
          )}

          {otherFields.length > 0 && otherFields.some(([_, value]) => value !== null && value !== undefined) && (
            <div className="space-y-2 pt-2 border-t border-slate-700/50">
              {otherFields.map(([key, value]) => {
                if (value === null || value === undefined) return null
                
                return (
                  <div key={key} className="text-sm">
                    <span className="font-semibold text-slate-400">
                      {key.replace(/_/g, ' ')}: 
                    </span>
                    {' '}
                    <span className="text-slate-300">
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {post.like_count !== undefined && post.like_count !== null && (
            <div className="flex items-center gap-1.5 text-slate-400 mt-3 pt-3 border-t border-slate-700/50">
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">{post.like_count}</span>
            </div>
          )}

          {post.captions && post.captions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                Captions ({post.captions.length})
              </h4>
              <div className="space-y-3">
                {post.captions.map((caption: Caption) => (
                  <div 
                    key={caption.id} 
                    className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/40"
                  >
                    <p className="text-sm text-slate-200 mb-2">
                      {caption.caption_text}
                    </p>
                    {userId && (
                      <VoteButton captionId={caption.id} userId={userId} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
