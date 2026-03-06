import { createServiceClient } from '@/lib/supabase-service'

export default async function AdminUsersPage() {
  const service = createServiceClient()
  const { data: profiles, error } = await service
    .from('profiles')
    .select('*')
    .order('id', { ascending: true })
    .limit(200)

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-400/25 bg-red-500/10 backdrop-blur-xl p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-300/20 bg-red-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-red-100/80">
          <span className="h-2 w-2 rounded-full bg-rose-300" />
          ERROR
        </div>
        <h1 className="mt-4 text-2xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
          Users / profiles
        </h1>
        <p className="mt-2 text-sm text-white/80 leading-relaxed">
          Failed to load profiles: {error.message}
        </p>
      </div>
    )
  }

  const rows = (profiles ?? []) as Array<Record<string, unknown>>
  const columns = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r ?? {})))
  ).slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]" />
          PROFILES
        </div>
        <h1 className="mt-4 text-3xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
          Users / profiles (read-only)
        </h1>
        <p className="mt-2 text-sm text-white/70">
          This page reads from <code className="text-white/85">profiles</code>. Admin access is still enforced
          by <code className="text-white/85">profiles.is_superadmin</code>.
        </p>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl overflow-hidden shadow-[0_24px_90px_-60px_rgba(0,0,0,0.8)]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white/85">Profiles</div>
          <div className="text-xs text-white/55">Showing {rows.length} row(s)</div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/40 text-white/70 sticky top-0 backdrop-blur">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={(typeof r.id === 'string' && r.id) || JSON.stringify(r)}
                  className="border-t border-white/10 hover:bg-white/[0.04] transition"
                >
                  {columns.map((c) => (
                    <td key={c} className="px-4 py-3 text-white/85 whitespace-nowrap">
                      {typeof r?.[c] === 'boolean'
                        ? (r[c] as boolean)
                          ? 'true'
                          : 'false'
                        : r?.[c] == null
                          ? '—'
                          : String(r[c]).slice(0, 120)}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-white/60" colSpan={columns.length || 1}>
                    No profiles found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

