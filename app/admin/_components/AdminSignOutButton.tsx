'use client'

import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminSignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.refresh()
    setIsLoading(false)
  }

  return (
    <button
      onClick={signOut}
      disabled={isLoading}
      className="rounded-xl border border-white/12 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/85 hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_12px_30px_-20px_rgba(0,0,0,0.8)]"
    >
      {isLoading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}

