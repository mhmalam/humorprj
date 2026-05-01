import { createServiceClient } from '@/lib/supabase-service'
import { createRowFromFields, updateRowFromFields, deleteRow } from '@/app/admin/_actions/generic-crud'

type Row = Record<string, unknown> & { id?: string | null }

function safeStr(v: unknown) {
  if (v == null) return ''
  return String(v)
}

const SYSTEM_FIELDS = new Set([
  'id',
  'created_datetime_utc',
  'modified_datetime_utc',
  'created_by_user_id',
  'modified_by_user_id',
])

const INPUT_CLS =
  'w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(61,220,132,0.08)]'

const TEXTAREA_CLS =
  'w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(61,220,132,0.08)]'

function FieldInput({ name, value }: { name: string; value: unknown }) {
  const strVal =
    value == null ? '' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
  const isLong = typeof value === 'string' && value.length > 80
  const isObj = typeof value === 'object' && value !== null

  if (isLong || isObj) {
    return (
      <textarea name={name} rows={isObj ? 3 : 2} defaultValue={strVal} className={TEXTAREA_CLS} />
    )
  }
  return <input type="text" name={name} defaultValue={strVal} className={INPUT_CLS} />
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
          <span className="text-[var(--accent)]">{'//'}</span> terms
        </div>
        <h1 className="mt-2 text-[24px] font-medium text-white">
          <span className="text-[var(--accent)] font-normal">$ </span>
          <span className="font-medium">terms</span>
        </h1>
        <p className="mt-2 text-[12px] text-[var(--text-dim)]">
          Backed by <code className="text-[var(--accent)]">terms</code>. Manage glossary or configuration terms.
        </p>
      </div>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">add term</div>
        <p className="mt-1 text-[12px] text-[var(--text-dim)] mb-4">
          Fill in the fields below to create a new row in <code className="text-[var(--accent)]">terms</code>.
        </p>
        <form action={createRowFromFields} className="space-y-4">
          <input type="hidden" name="table" value="terms" />
          <input type="hidden" name="revalidatePath" value="/admin/terms" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                key <span className="text-red-400">*</span>
              </label>
              <input name="key" type="text" required placeholder="e.g. humor_score" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                value <span className="text-red-400">*</span>
              </label>
              <input name="value" type="text" required placeholder="e.g. 0.8" className={INPUT_CLS} />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                term_type_id <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <input name="term_type_id" type="text" placeholder="UUID of term type" className={INPUT_CLS} />
            </div>
          </div>
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
            {rows.map((r) => {
              const editFields = Object.entries(r).filter(([k]) => !SYSTEM_FIELDS.has(k))
              return (
                <div key={safeStr(r.id)} className="p-5 space-y-3 hover:bg-[#0f0f0f]">
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
                  <form action={updateRowFromFields} className="space-y-3">
                    <input type="hidden" name="table" value="terms" />
                    <input type="hidden" name="id" value={safeStr(r.id)} />
                    <input type="hidden" name="revalidatePath" value="/admin/terms" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {editFields.map(([key, val]) => (
                        <div key={key} className={key.includes('prompt') || key.includes('description') ? 'md:col-span-2' : ''}>
                          <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <FieldInput name={key} value={val} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end">
                      <button className="border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] text-[var(--text-primary)] hover:bg-[#111111]">
                        save changes
                      </button>
                    </div>
                  </form>
                </div>
              )
            })}
            {rows.length === 0 ? (
              <div className="p-6 text-[13px] text-[var(--text-muted)]">no terms rows found.</div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}
