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
      className="border-none bg-transparent p-0 text-[11px] font-mono text-[var(--text-primary)] hover:text-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? 'signing out…' : 'sign out'}
    </button>
  )
}

