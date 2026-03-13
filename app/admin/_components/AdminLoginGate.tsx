'use client'

import { createClient } from '@/lib/supabase-client'
import { useState } from 'react'

export default function AdminLoginGate() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error logging in:', error.message)
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text-primary)] px-4">
        <div className="w-full max-w-[480px] border border-[#1e1e1e] bg-[#0a0a0a] rounded-[4px] px-12 py-12">
          <div className="font-mono text-[11px] font-normal text-[#1f3a2a]">
            {'// '}humor-admin
          </div>
          <div className="mt-2 font-mono text-[28px] font-normal">
            <span className="text-[#3ddc84]">$ </span>
            <span className="text-white font-medium">authenticate</span>
            <span className="auth-cursor text-[#3ddc84]"> _</span>
          </div>

          <div className="mt-4 h-px w-full bg-[var(--border)]" />

          <p className="mt-4 font-mono text-[12px] leading-[1.6] text-[#4a4a4a]">
            Secure console for reviewing data, managing models, and tuning the humor engine. Access is restricted to
            superadmin accounts.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!isLoading) void handleGoogleLogin()
            }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-transparent border border-[#3ddc84] px-5 py-[10px] text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[#3ddc84] hover:bg-[#1a3a28] transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Authenticating…' : 'Sign in with Google'}</span>
            </button>
          </form>

          <div className="mt-6 border border-[#141414] border-l-[2px] border-l-[#1f3a2a] bg-[#0d0d0d] pl-3 pr-3 py-3 font-mono text-[11px] leading-[1.6] text-[#333333]">
            Access is granted to users flagged as{' '}
            <code className="text-[#3ddc84] text-[10px]">profiles.is_superadmin = true</code>. All actions run with a
            service-role client and should be treated as production-impacting.
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes auth-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .auth-cursor {
          animation: auth-blink 1.2s step-end infinite;
        }
      `}</style>
    </>
  )
}

