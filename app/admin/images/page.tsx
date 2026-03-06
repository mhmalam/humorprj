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
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]" />
          IMAGES
        </div>
        <h1 className="mt-4 text-3xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
          Images (CRUD)
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Create, edit, and delete rows in <code className="text-white/85">images</code>.
        </p>
      </div>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 shadow-[0_24px_90px_-60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
              Add image
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Paste a URL and create a new <code className="text-white/85">images</code> row.
            </p>
          </div>
          <div className="text-xs text-white/45">
            Tip: use stable CDN URLs for better previews
          </div>
        </div>
        <form action={createImage} className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold tracking-widest text-white/55 mb-2">
              IMAGE URL
            </label>
            <input
              name="url"
              placeholder="https://…"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition"
            />
          </div>
          <button className="rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-6 py-4 text-sm font-bold text-slate-950 transition hover:brightness-105 shadow-[0_18px_45px_-28px_rgba(99,102,241,0.95)]">
            Create
          </button>
        </form>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl overflow-hidden shadow-[0_24px_90px_-60px_rgba(0,0,0,0.8)]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white/85">Existing images</div>
          <div className="text-xs text-white/55">
            {error ? 'Error loading' : `Showing ${(images ?? []).length} row(s)`}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm text-red-200">Failed to load: {error.message}</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950/40 text-white/70 sticky top-0 backdrop-blur">
                <tr>
                  <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">id</th>
                  <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">url</th>
                  <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">preview</th>
                  <th className="text-right font-semibold px-4 py-3 whitespace-nowrap">actions</th>
                </tr>
              </thead>
              <tbody>
                {((images ?? []) as Array<Record<string, unknown>>).map((img) => (
                  <tr key={safeStr(img.id)} className="border-t border-white/10 hover:bg-white/[0.04] transition">
                    <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                      {safeStr(img.id)}
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateImage} className="flex items-center gap-2 min-w-[520px]">
                        <input type="hidden" name="id" value={safeStr(img.id)} />
                        <input
                          name="url"
                          defaultValue={safeStr(img.url)}
                          className="flex-1 rounded-xl border border-white/10 bg-slate-950/35 px-3.5 py-2.5 text-xs text-white/90 outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10 transition"
                        />
                        <button className="rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white transition">
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      {img.url ? (
                        // Use regular <img> so we don't need to whitelist remote domains here.
                        // Admin view is for humans, not perf-critical rendering.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={safeStr(img.url)}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover border border-white/10"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-xs text-white/35">—</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteImage}>
                        <input type="hidden" name="id" value={safeStr(img.id)} />
                        <button className="rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/15 px-3.5 py-2.5 text-xs font-semibold text-red-100 transition">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {(images ?? []).length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-white/60" colSpan={4}>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                        <div className="text-sm font-semibold text-white/80">No images yet</div>
                        <div className="mt-1 text-sm text-white/60">
                          Create the first image above to start building the dataset.
                        </div>
                      </div>
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

