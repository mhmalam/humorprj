import { createServiceClient } from '@/lib/supabase-service'
import { createRow, updateRow, deleteRow } from '@/app/admin/_actions/generic-crud'

type Row = Record<string, unknown> & { id?: string | null }

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

export default async function AdminTermsPage() {
  const service = createServiceClient()
  const { data, error } = await service
    .from('terms')
    .select('*')
    .order('id', { ascending: true })
    .limit(200)

  const rows = (data ?? []) as Row[]

  return (
    <div className="space-y-8 text-[13px] text-[var(--text-dim)]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
          <span className="text-[var(--accent)]">//</span> terms
        </div>
        <h1 className="mt-2 text-[24px] font-medium text-white">
          <span className="text-[var(--accent)] font-normal">$ </span>
          <span className="font-medium">terms</span>
        </h1>
        <p className="mt-2 text-[12px] text-[var(--text-dim)]">
          Backed by <code className="text-[var(--accent)]">terms</code>. Use JSON payloads to manage glossary or
          configuration terms.
        </p>
      </div>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">add term</div>
            <p className="mt-1 text-[12px] text-[var(--text-dim)]">
              Paste a JSON object; it will be inserted into <code className="text-[var(--accent)]">terms</code>.
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Tip: use <code className="text-[var(--accent)]">term_types</code> for categorization.
          </div>
        </div>
        <form action={createRow} className="mt-4 space-y-3">
          <input type="hidden" name="table" value="terms" />
          <input type="hidden" name="revalidatePath" value="/admin/terms" />
          <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
            payload (json)
          </label>
          <textarea
            name="payload"
            rows={4}
            className="w-full border border-[var(--border)] bg-[#0a0a0a] px-4 py-3 text-[12px] text-[var(--text-primary)] font-mono placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(61,220,132,0.08)]"
            placeholder='{"key":"humor_score","value":"0.8","term_type_id":"..."}'
          />
          <button className="inline-flex items-center gap-2 border border-[var(--accent)] bg-transparent px-[14px] py-[6px] text-[11px] font-mono font-semibold tracking-[0.16em] uppercase text-[var(--accent)] hover:bg-[var(--accent-dim)]">
            create term
          </button>
        </form>
      </section>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] overflow-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="text-[12px] text-[var(--text-primary)]">existing terms</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {error ? 'error loading' : `showing ${rows.length} row(s)`}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-[13px] text-red-300">Failed to load: {error.message}</div>
        ) : (
          <div className="divide-y divide-[#111111]">
            {rows.map((r) => (
              <div key={safeStr(r.id) || JSON.stringify(r)} className="p-5 space-y-3 hover:bg-[#0f0f0f]">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] text-[var(--text-muted)] truncate">
                    id: <span className="text-[var(--text-primary)]">{safeStr(r.id)}</span>
                  </div>
                  <form action={deleteRow}>
                    <input type="hidden" name="table" value="terms" />
                    <input type="hidden" name="id" value={safeStr(r.id)} />
                    <input type="hidden" name="revalidatePath" value="/admin/terms" />
                    <button className="border border-red-500/60 bg-transparent px-3 py-2 text-[11px] text-red-300 hover:bg-red-500/10">
                      delete
                    </button>
                  </form>
                </div>
                <form action={updateRow} className="space-y-2">
                  <input type="hidden" name="table" value="terms" />
                  <input type="hidden" name="id" value={safeStr(r.id)} />
                  <input type="hidden" name="revalidatePath" value="/admin/terms" />
                  <textarea
                    name="payload"
                    rows={6}
                    defaultValue={JSON.stringify(r, null, 2)}
                    className="w-full border border-[var(--border)] bg-[#0a0a0a] px-4 py-3 text-[12px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(61,220,132,0.08)]"
                  />
                  <div className="flex items-center justify-end">
                    <button className="border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] text-[var(--text-primary)] hover:bg-[#111111]">
                      save changes
                    </button>
                  </div>
                </form>
              </div>
            ))}
            {rows.length === 0 ? (
              <div className="p-6 text-[13px] text-[var(--text-muted)]">no terms rows found.</div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}

