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
    <div className="min-h-screen relative overflow-hidden text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.28),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.20),transparent_55%)]" />
      <div className="absolute inset-0 bg-slate-950" />

      <div className="relative w-full max-w-[980px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_40px_140px_-70px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]" />
                SECURE SIGN-IN
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-space-grotesk)]">
                Admin Console
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                View stats, manage images, and audit data — protected behind Google OAuth and a superadmin gate.
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="group w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 p-[1px] shadow-[0_18px_45px_-28px_rgba(99,102,241,0.95)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="rounded-2xl bg-slate-950/60 hover:bg-slate-950/50 transition px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white/90" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M21.35 11.1h-9.18v2.98h5.3c-.22 1.41-1.62 4.14-5.3 4.14-3.19 0-5.79-2.64-5.79-5.9 0-3.26 2.6-5.9 5.79-5.9 1.82 0 3.04.78 3.74 1.46l2.55-2.47C16.5 4.4 14.5 3.3 12.17 3.3 7.63 3.3 3.95 7.04 3.95 11.32c0 4.28 3.68 8.02 8.22 8.02 4.75 0 7.9-3.36 7.9-8.1 0-.54-.06-.95-.13-1.34Z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-white">
                          {isLoading ? 'Redirecting…' : 'Continue with Google'}
                        </div>
                        <div className="text-xs text-white/60">
                          You’ll be routed back to <span className="text-white/75">/auth/callback</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-white/70 group-hover:text-white/80 transition">
                      Enter →
                    </div>
                  </div>
                </button>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs font-semibold tracking-widest text-white/55">
                    ACCESS POLICY
                  </div>
                  <div className="mt-2 text-sm text-white/75 leading-relaxed">
                    Only authorized superadmins can access the console.
                  </div>
                </div>
              </div>

              <div className="mt-8 text-xs text-white/45">
                The Humor Project • Admin surface is intentionally locked down.
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
            <div className="p-8 md:p-10 h-full flex flex-col">
              <div className="text-xs font-semibold tracking-widest text-white/55">
                WHAT YOU’LL SEE INSIDE
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { title: 'Stats dashboard', desc: 'Quick counts + recent activity feed.' },
                  { title: 'Profiles', desc: 'Read-only audit view of users.' },
                  { title: 'Images', desc: 'Create/update/delete image records.' },
                  { title: 'Captions', desc: 'Read-only caption browser with image previews.' },
                ].map((x) => (
                  <div key={x.title} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <div className="text-sm font-bold text-white/90">{x.title}</div>
                    <div className="mt-1 text-sm text-white/65">{x.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

