import { createServiceClient } from '@/lib/supabase-service'

type Row = Record<string, unknown> & { id?: string | null }

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

export default async function AdminHumorFlavorsPage() {
  const service = createServiceClient()
  const { data, error } = await service
    .from('humor_flavors')
    .select('*')
    .order('id', { ascending: true })
    .limit(200)

  const rows = (data ?? []) as Row[]
  let columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r ?? {}))))

  // Prefer to show the flavor "identifier" (name/title/label) with its slug adjacent.
  // The table columns are discovered dynamically from row keys, so we re-order for readability.
  if (columns.includes('slug')) {
    const preferredNameKeys = ['name', 'title', 'label']
    const nameKey =
      columns.find((c) => preferredNameKeys.includes(c)) ?? columns.find((c) => c !== 'id')

    if (nameKey && nameKey !== 'slug') {
      columns = columns.filter((c) => c !== 'slug')
      const idx = columns.indexOf(nameKey)
      columns.splice(Math.max(0, idx + 1), 0, 'slug')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]" />
          HUMOR FLAVORS
        </div>
        <h1 className="mt-4 text-3xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
          Humor flavors (read-only)
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Reading from <code className="text-white/85">humor_flavors</code>. This view lets you quickly audit all
          configured humor flavors.
        </p>
      </div>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl overflow-hidden shadow-[0_24px_90px_-60px_rgba(0,0,0,0.8)]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white/85">Flavors</div>
          <div className="text-xs text-white/55">
            {error ? 'Error loading' : `Showing ${rows.length} row(s)`}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm text-red-200">Failed to load: {error.message}</div>
        ) : (
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
                        {safeStr(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-white/60" colSpan={columns.length || 1}>
                      No humor_flavors rows found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

