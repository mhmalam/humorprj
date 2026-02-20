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
