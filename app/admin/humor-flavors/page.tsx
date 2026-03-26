import { createServiceClient } from '@/lib/supabase-service'
import HumorFlavorsClient from '@/app/admin/humor-flavors/_components/HumorFlavorsClient'

type FlavorRow = { id: string; slug: string; description: string | null }

export default async function AdminHumorFlavorsPage() {
  const service = createServiceClient()
  const { data, error } = await service
    .from('humor_flavors')
    .select('id, slug, description')
    .order('id', { ascending: true })
    .limit(500)

  return (
    <>
      {error ? (
        <div className="p-6 text-[13px] text-red-300">Failed to load: {error.message}</div>
      ) : (
        <HumorFlavorsClient flavors={(data ?? []) as FlavorRow[]} />
      )}
    </>
  )
}

