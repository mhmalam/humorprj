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
      <div className="space-y-4 text-[13px] text-[var(--text-dim)]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
          <span className="text-[var(--accent)]">{'//'}</span> profiles
          </div>
          <h1 className="mt-2 text-[24px] font-medium text-white">
            <span className="text-[var(--accent)] font-normal">$ </span>
            <span className="font-medium">users</span>
          </h1>
        </div>
        <div className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5 text-[13px] text-red-300">
          Failed to load profiles: {error.message}
        </div>
      </div>
    )
  }

  const rows = (profiles ?? []) as Array<Record<string, unknown>>
  const columns = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r ?? {})))
  ).slice(0, 8)

  return (
    <div className="space-y-8 text-[13px] text-[var(--text-dim)]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
          <span className="text-[var(--accent)]">{'//'}</span> profiles
        </div>
        <h1 className="mt-2 text-[24px] font-medium text-white">
          <span className="text-[var(--accent)] font-normal">$ </span>
          <span className="font-medium">users</span>
        </h1>
        <p className="mt-2 text-[12px] text-[var(--text-dim)]">
          Read-only view of <code className="text-[var(--accent)]">profiles</code>. Admin access is still enforced by{' '}
          <code className="text-[var(--accent)]">profiles.is_superadmin</code>.
        </p>
      </div>

      <div className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] overflow-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="text-[12px] text-[var(--text-primary)]">profiles</div>
          <div className="text-[11px] text-[var(--text-muted)]">showing {rows.length} row(s)</div>
        </div>

        <table className="min-w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map((c) => (
                <th
                  key={c}
                  className="px-4 py-2 text-left text-[10px] font-normal uppercase tracking-[0.12em] text-[var(--text-muted)]"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={(typeof r.id === 'string' && r.id) || JSON.stringify(r)}
                className="border-b border-[#111111] hover:bg-[#0f0f0f] transition-colors"
              >
                {columns.map((c) => (
                  <td key={c} className="px-4 py-2 text-[13px] text-[var(--text-primary)] whitespace-nowrap">
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
                <td className="px-4 py-6 text-[var(--text-muted)]" colSpan={columns.length || 1}>
                  no profiles found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

