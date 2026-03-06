import { createServiceClient } from '@/lib/supabase-service'

type CaptionRow = Record<string, unknown> & {
  id?: string | null
  content?: string | null
  image_id?: string | null
}

type ImageRow = { id: string; url: string | null }

function safeStr(v: unknown) {
  if (v == null) return '—'
  return String(v)
}

export default async function AdminCaptionsPage() {
  const service = createServiceClient()
  const { data: captions, error } = await service
    .from('captions')
    .select('*')
    .order('id', { ascending: false })
    .limit(200)

  const captionRows = (captions ?? []) as CaptionRow[]

  const imageIds = Array.from(
    new Set(captionRows.map((c) => c.image_id).filter((v): v is string => typeof v === 'string'))
  )

  const { data: images } = imageIds.length
    ? await service.from('images').select('id, url').in('id', imageIds)
    : { data: [] as ImageRow[] }

  const imageUrlById = new Map(((images ?? []) as ImageRow[]).map((i) => [i.id, i.url]))

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]" />
          CAPTIONS
        </div>
        <h1 className="mt-4 text-3xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
          Captions (read-only)
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Reading from <code className="text-white/85">captions</code>. This console intentionally does not edit captions.
        </p>
      </div>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.06] backdrop-blur-xl overflow-hidden shadow-[0_24px_90px_-60px_rgba(0,0,0,0.8)]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white/85">Latest captions</div>
          <div className="text-xs text-white/55">
            {error ? 'Error loading' : `Showing ${captionRows.length} row(s)`}
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
                  <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">content</th>
                  <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">image</th>
                </tr>
              </thead>
              <tbody>
                {captionRows.map((c) => {
                  const imageId = c.image_id
                  const url = imageId ? imageUrlById.get(imageId) : null
                  return (
                    <tr key={safeStr(c.id)} className="border-t border-white/10 align-top hover:bg-white/[0.04] transition">
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">{safeStr(c.id)}</td>
                      <td className="px-4 py-3 text-white/90 min-w-[520px] leading-relaxed">{safeStr(c.content)}</td>
                      <td className="px-4 py-3">
                        {url ? (
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={safeStr(url)}
                              alt=""
                              className="h-12 w-12 rounded-xl object-cover border border-white/10"
                              loading="lazy"
                            />
                            <a
                              href={safeStr(url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                            >
                              open
                            </a>
                          </div>
                        ) : (
                          <div className="text-xs text-white/35">—</div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {captionRows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-white/60" colSpan={3}>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                        <div className="text-sm font-semibold text-white/80">No captions yet</div>
                        <div className="mt-1 text-sm text-white/60">
                          When captions are added, they’ll appear here with image previews.
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

