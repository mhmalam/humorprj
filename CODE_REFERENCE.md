# Complete Code Reference - Caption Voting Feature

This document contains all the code changes made to implement the caption voting feature.

---

## 📄 NEW FILE: `app/actions/voteActions.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function submitVote(captionId: string, voteType: 'upvote' | 'downvote') {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { 
      success: false, 
      error: 'You must be logged in to vote' 
    }
  }

  const { data, error } = await supabase
    .from('caption_votes')
    .insert({
      caption_id: captionId,
      user_id: user.id,
      vote_type: voteType
    })
    .select()

  if (error) {
    console.error('Error submitting vote:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }

  revalidatePath('/')
  
  return { 
    success: true, 
    data 
  }
}
```

---

## 📄 NEW FILE: `app/components/VoteButton.tsx`

```typescript
'use client'

import { useState, useTransition } from 'react'
import { submitVote } from '@/app/actions/voteActions'

interface VoteButtonProps {
  captionId: string
  userId: string
}

export default function VoteButton({ captionId, userId }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [voteStatus, setVoteStatus] = useState<{
    voted: boolean
    voteType?: 'upvote' | 'downvote'
    message?: string
  }>({ voted: false })

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!userId) {
      setVoteStatus({ 
        voted: false, 
        message: 'Please log in to vote' 
      })
      return
    }

    startTransition(async () => {
      const result = await submitVote(captionId, voteType)
      
      if (result.success) {
        setVoteStatus({ 
          voted: true, 
          voteType,
          message: `${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}!` 
        })
      } else {
        setVoteStatus({ 
          voted: false, 
          message: result.error || 'Failed to submit vote' 
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('upvote')}
        disabled={isPending || voteStatus.voted}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${
          voteStatus.voteType === 'upvote'
            ? 'bg-green-600 text-white'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-green-400'
        } disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/50`}
        aria-label="Upvote caption"
      >
        <svg 
          className="w-4 h-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        <span className="text-xs font-semibold">
          {isPending ? '...' : 'Up'}
        </span>
      </button>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isPending || voteStatus.voted}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${
          voteStatus.voteType === 'downvote'
            ? 'bg-red-600 text-white'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-red-400'
        } disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/50`}
        aria-label="Downvote caption"
      >
        <svg 
          className="w-4 h-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" 
            clipRule="evenodd" 
          />
        </svg>
        <span className="text-xs font-semibold">
          {isPending ? '...' : 'Down'}
        </span>
      </button>

      {voteStatus.message && (
        <span className={`text-xs font-medium ${
          voteStatus.voted ? 'text-green-400' : 'text-red-400'
        }`}>
          {voteStatus.message}
        </span>
      )}
    </div>
  )
}
```

---

## 📝 MODIFIED: `app/page.tsx`

### Changes Made:
1. Added `Caption` interface
2. Updated `Post` interface to include `captions` array
3. Modified database query to fetch captions with posts
4. Pass `userId` to `PostCard` component

### Key Code Additions:

```typescript
// NEW: Caption interface
interface Caption {
  id: string
  post_id: string
  caption_text: string
  [key: string]: any
}

// UPDATED: Post interface now includes captions
interface Post {
  id: string
  created_at?: string
  post_time?: string
  like_count?: number
  captions?: Caption[]  // ← NEW
  [key: string]: any
}

// UPDATED: Database query now fetches captions
const { data: posts, error } = await supabase
  .from('sidechat_posts')
  .select(`
    *,
    captions (*)  // ← NEW: Nested query for captions
  `)

// UPDATED: Pass userId to PostCard
posts.map((post: Post) => (
  <PostCard key={post.id} post={post} userId={user.id} />  // ← NEW: userId prop
))
```

---

## 📝 MODIFIED: `app/components/PostCard.tsx`

### Changes Made:
1. Added `Caption` interface
2. Updated `PostCardProps` to accept `userId`
3. Added captions display section with voting UI
4. Imported `VoteButton` component

### Key Code Additions:

```typescript
// NEW: Import VoteButton
import VoteButton from './VoteButton'

// NEW: Caption interface
interface Caption {
  id: string
  post_id: string
  caption_text: string
  [key: string]: any
}

// UPDATED: Post interface includes captions
interface Post {
  id: string
  created_at?: string
  post_time?: string
  like_count?: number
  captions?: Caption[]  // ← NEW
  [key: string]: any
}

// UPDATED: PostCardProps includes userId
interface PostCardProps {
  post: Post
  userId?: string  // ← NEW
}

// UPDATED: Function signature includes userId
export default function PostCard({ post, userId }: PostCardProps) {

// NEW: Captions display section (added after like_count section)
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
```

---

## 🗄️ DATABASE: SQL for `caption_votes` Table

Run this in your Supabase SQL Editor:

```sql
-- Create the caption_votes table
CREATE TABLE caption_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caption_id UUID NOT NULL REFERENCES captions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(caption_id, user_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_caption_votes_caption_id ON caption_votes(caption_id);
CREATE INDEX idx_caption_votes_user_id ON caption_votes(user_id);
```

---

## 🎯 Summary of Changes

### Files Created (2):
- `app/actions/voteActions.ts` - Server action for vote submissions
- `app/components/VoteButton.tsx` - Client component for voting UI

### Files Modified (2):
- `app/page.tsx` - Fetch captions, pass userId to PostCard
- `app/components/PostCard.tsx` - Display captions with voting UI

### Database Changes (1):
- Created `caption_votes` table with proper constraints and indexes

### Total Lines of Code Added: ~200 lines

---

## ✅ Testing Steps

1. Create the `caption_votes` table in Supabase
2. Run `npm run dev`
3. Log in to the app
4. Navigate to a post with captions
5. Click upvote or downvote
6. Verify vote is saved in database
7. Confirm UI updates with success message

---

## 🔒 Security Features

✅ Server-side authentication check
✅ Database-level unique constraint
✅ Foreign key constraints
✅ Client-side validation
✅ Proper error handling

---

End of Code Reference
```

