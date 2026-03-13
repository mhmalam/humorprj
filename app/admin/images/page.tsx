import { createServiceClient } from '@/lib/supabase-service'
import { createImage, deleteImage, updateImage } from '@/app/admin/images/actions'

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

export default async function AdminImagesPage() {
  const service = createServiceClient()
  const { data: images, error } = await service
    .from('images')
    .select('*')
    .order('id', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-8 text-[13px] text-[var(--text-dim)]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
          <span className="text-[var(--accent)]">//</span> images
        </div>
        <h1 className="mt-2 text-[24px] font-medium text-white">
          <span className="text-[var(--accent)] font-normal">$ </span>
          <span className="font-medium">images</span>
        </h1>
        <p className="mt-2 text-[12px] text-[var(--text-dim)]">
          Create, edit, and delete rows in <code className="text-[var(--accent)]">images</code>.
        </p>
      </div>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">add image</div>
            <p className="mt-1 text-[12px] text-[var(--text-dim)]">
              Paste a URL and create a new <code className="text-[var(--accent)]">images</code> row.
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Tip: use stable CDN URLs for better previews.
          </div>
        </div>
        <form action={createImage} className="mt-4 flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
              image url
            </label>
            <input
              name="url"
              placeholder="https://…"
              className="w-full border border-[var(--border)] bg-[#0a0a0a] px-4 py-2.5 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(61,220,132,0.08)]"
            />
          </div>
          <button className="border border-[var(--accent)] bg-transparent px-4 py-[6px] text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--accent)] hover:bg-[var(--accent-dim)]">
            create image
          </button>
        </form>
      </section>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] overflow-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="text-[12px] text-[var(--text-primary)]">existing images</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {error ? 'error loading' : `showing ${(images ?? []).length} row(s)`}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-[13px] text-red-300">Failed to load: {error.message}</div>
        ) : (
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  id
                </th>
                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  url
                </th>
                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  preview
                </th>
                <th className="px-4 py-2 text-right text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  actions
                </th>
              </tr>
            </thead>
            <tbody>
              {((images ?? []) as Array<Record<string, unknown>>).map((img) => (
                <tr
                  key={safeStr(img.id)}
                  className="border-b border-[#111111] hover:bg-[#0f0f0f] transition-colors"
                >
                  <td className="px-4 py-2 text-[13px] text-[var(--text-primary)] whitespace-nowrap">
                    {safeStr(img.id)}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <form action={updateImage} className="flex items-center gap-2 min-w-[320px]">
                      <input type="hidden" name="id" value={safeStr(img.id)} />
                      <input
                        name="url"
                        defaultValue={safeStr(img.url)}
                        className="flex-1 border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 text-[12px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(61,220,132,0.08)]"
                      />
                      <button className="border border-[var(--border)] bg-transparent px-3 py-2 text-[11px] text-[var(--text-primary)] hover:bg-[#111111]">
                        save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2">
                    {img.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={safeStr(img.url)}
                        alt=""
                        className="h-10 w-10 rounded-[4px] object-cover border border-[var(--border)]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-[11px] text-[var(--text-muted)]">—</div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <form action={deleteImage}>
                      <input type="hidden" name="id" value={safeStr(img.id)} />
                      <button className="border border-red-500/60 bg-transparent px-3 py-2 text-[11px] text-red-300 hover:bg-red-500/10">
                        delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(images ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-[var(--text-muted)]" colSpan={4}>
                    no images yet. create the first image above to start building the dataset.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

