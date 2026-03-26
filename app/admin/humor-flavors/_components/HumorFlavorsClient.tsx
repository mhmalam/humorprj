'use client'

import { createFlavor, deleteFlavor, updateFlavor } from '@/app/admin/humor-flavors/actions'

type Flavor = {
  id: string
  slug: string
  description: string | null
}

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

export default function HumorFlavorsClient({ flavors }: { flavors: Flavor[] }) {
  return (
    <div className="space-y-8 text-[13px] text-[var(--text-dim)]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
          <span className="text-[var(--accent)]">{'//'}</span> humor flavors
        </div>
        <h1 className="mt-2 text-[24px] font-medium text-white">
          <span className="text-[var(--accent)] font-normal">$ </span>
          <span className="font-medium">humor-flavors</span>
        </h1>
        <p className="mt-2 text-[12px] text-[var(--text-dim)]">
          Backed by <code className="text-[var(--accent)]">humor_flavors</code>. Manage flavors by{' '}
          <code className="text-[var(--accent)]">slug</code>.
        </p>
      </div>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">add flavor</div>
            <p className="mt-1 text-[12px] text-[var(--text-dim)]">Create a new flavor with a unique slug.</p>
          </div>
        </div>

        <form action={createFlavor} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">slug</label>
            <input
              name="slug"
              required
              placeholder="co-lum-bia"
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              description (optional)
            </label>
            <input
              name="description"
              placeholder="Short description"
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-end">
            <button className="border border-[var(--accent)] bg-transparent px-[14px] py-[8px] text-[11px] font-mono font-semibold tracking-[0.16em] uppercase text-[var(--accent)] hover:bg-[var(--accent-dim)]">
              create flavor
            </button>
          </div>
        </form>
      </section>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] overflow-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="text-[12px] text-[var(--text-primary)]">flavors</div>
          <div className="text-[11px] text-[var(--text-muted)]">showing {flavors.length} row(s)</div>
        </div>

        <div className="divide-y divide-[#111111]">
          {flavors.map((f) => (
            <div key={f.id} className="p-5 space-y-3 hover:bg-[#0f0f0f]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  id: <span className="text-[var(--text-primary)]">{safeStr(f.id)}</span>
                </div>
                <form action={deleteFlavor}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="border border-red-500/60 bg-transparent px-3 py-2 text-[11px] text-red-300 hover:bg-red-500/10">
                    delete
                  </button>
                </form>
              </div>

              <form action={updateFlavor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="hidden" name="id" value={f.id} />
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                    slug
                  </label>
                  <input
                    name="slug"
                    required
                    defaultValue={f.slug}
                    className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
                    description (optional)
                  </label>
                  <input
                    name="description"
                    defaultValue={f.description ?? ''}
                    className="w-full border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-end">
                  <button className="border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] text-[var(--text-primary)] hover:bg-[#111111]">
                    save changes
                  </button>
                </div>
              </form>
            </div>
          ))}

          {flavors.length === 0 ? (
            <div className="p-6 text-[13px] text-[var(--text-muted)]">no humor_flavors rows found.</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

