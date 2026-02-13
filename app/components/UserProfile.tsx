'use client'

import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

interface UserProfileProps {
  user: User
}

export default function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.refresh()
  }

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.profile-menu') && !target.closest('.profile-button')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup Menu - Appears above button */}
      {isOpen && (
        <div 
          className="profile-menu absolute bottom-20 right-0 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-2xl"
          style={{
            animationName: 'slideUp',
            animationDuration: '0.2s',
            animationTimingFunction: 'ease-out'
          }}
        >
          {/* Content */}
          <div className="space-y-5">
            {/* Header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2 font-[family-name:var(--font-space-grotesk)]">
                Signed in as
              </p>
              <h2 className="text-lg font-bold text-white mb-1 font-[family-name:var(--font-space-grotesk)]">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-slate-400 truncate">
                {user.email}
              </p>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-[family-name:var(--font-space-grotesk)]"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>

        </div>
      )}

      {/* Profile Button - Transforms to X when open */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="profile-button w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_20px_45px_-20px_rgba(59,130,246,0.75)] hover:-translate-y-0.5 hover:brightness-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            style={{ 
              animationName: 'rotateIn',
              animationDuration: '0.2s',
              animationTimingFunction: 'ease-out'
            }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg 
            className="w-7 h-7 text-white" 
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ 
              animationName: 'rotateIn',
              animationDuration: '0.2s',
              animationTimingFunction: 'ease-out'
            }}
          >
            <path 
              fillRule="evenodd" 
              d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" 
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-90deg) scale(0.8);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
