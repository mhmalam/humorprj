import { createClient as createAuthedServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-service'

export type AdminViewer = {
  userId: string
  email: string | null
  profile: Record<string, unknown> | null
}

type ProfileRow = Record<string, unknown> & { is_superadmin?: boolean | null }

export async function getAdminViewer(): Promise<
  | { ok: true; viewer: AdminViewer }
  | { ok: false; reason: 'not_logged_in' | 'not_superadmin' }
> {
  const supabaseAuth = await createAuthedServerClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return { ok: false, reason: 'not_logged_in' }
  }

  const service = createServiceClient()
  const { data: profile, error } = await service
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load profile for admin gate: ${error.message}`)
  }

  const typedProfile = (profile ?? null) as ProfileRow | null
  const isSuperadmin = typedProfile?.is_superadmin === true
  if (!isSuperadmin) {
    return { ok: false, reason: 'not_superadmin' }
  }

  return {
    ok: true,
    viewer: {
      userId: user.id,
      email: user.email ?? null,
      profile: typedProfile,
    },
  }
}

