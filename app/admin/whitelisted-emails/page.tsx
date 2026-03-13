import { createServiceClient } from '@/lib/supabase-service'
import { createRow, updateRow, deleteRow } from '@/app/admin/_actions/generic-crud'

type Row = Record<string, unknown> & { id?: string | null }

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

export default async function AdminWhitelistedEmailsPage() {
  const service = createServiceClient()
  const { data, error } = await service
    .from('whitelist_email_addresses')
    .select('*')
    .order('id', { ascending: true })
    .limit(200)

  const rows = (data ?? []) as Row[]

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]" />
          WHITELISTED EMAILS
        </div>
        <h1 className="mt-4 text-3xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
          Whitelisted email addresses (CRUD)
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Backed by <code className="text-white/85">whitelist_email_addresses</code>. Use this to explicitly allow
          individual email addresses.
        </p>
      </div>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 shadow-[0_24px_90px_-60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
              Add email
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Paste a JSON object; it will be inserted into{' '}
              <code className="text-white/85">whitelist_email_addresses</code>.
            </p>
          </div>
          <div className="text-xs text-white/45">
            Tip: keep emails lowercase; combine with allowed domains for coarse + fine control.
          </div>
        </div>
        <form action={createRow} className="mt-5 space-y-3">
          <input type="hidden" name="table" value="whitelist_email_addresses" />
          <input type="hidden" name="revalidatePath" value="/admin/whitelisted-emails" />
          <label className="block text-xs font-semibold tracking-widest text-white/55 mb-2">
            PAYLOAD (JSON)
          </label>
          <textarea
            name="payload"
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3.5 text-xs text-white font-mono placeholder:text-white/35 outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition"
            placeholder='{"email":"user@example.edu"}'
          />
          <button className="rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:brightness-105 shadow-[0_18px_45px_-28px_rgba(99,102,241,0.95)]">
            Whitelist email
          </button>
        </form>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl overflow-hidden shadow-[0_24px_90px_-60px_rgba(0,0,0,0.8)]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white/85">Existing emails</div>
          <div className="text-xs text-white/55">
            {error ? 'Error loading' : `Showing ${rows.length} row(s)`}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm text-red-200">Failed to load: {error.message}</div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.map((r) => (
              <div key={safeStr(r.id) || JSON.stringify(r)} className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs text-white/55 truncate">
                    id: <span className="text-white/80">{safeStr(r.id)}</span>
                  </div>
                  <form action={deleteRow}>
                    <input type="hidden" name="table" value="whitelist_email_addresses" />
                    <input type="hidden" name="id" value={safeStr(r.id)} />
                    <input type="hidden" name="revalidatePath" value="/admin/whitelisted-emails" />
                    <button className="rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/15 px-3.5 py-2 text-xs font-semibold text-red-100 transition">
                      Delete
                    </button>
                  </form>
                </div>
                <form action={updateRow} className="space-y-2">
                  <input type="hidden" name="table" value="whitelist_email_addresses" />
                  <input type="hidden" name="id" value={safeStr(r.id)} />
                  <input type="hidden" name="revalidatePath" value="/admin/whitelisted-emails" />
                  <textarea
                    name="payload"
                    rows={4}
                    defaultValue={JSON.stringify(r, null, 2)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-xs text-white font-mono outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition"
                  />
                  <div className="flex items-center justify-end">
                    <button className="rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 px-3.5 py-2 text-xs font-semibold text-white transition">
                      Save changes
                    </button>
                  </div>
                </form>
              </div>
            ))}
            {rows.length === 0 ? (
              <div className="p-6 text-sm text-white/60">No whitelist_email_addresses rows found.</div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}

