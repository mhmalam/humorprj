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
    <div className="space-y-8 text-[13px] text-[var(--text-dim)]">
      <div>
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
          <span className="text-[var(--accent)]">{'//'}</span> captions
        </div>
        <h1 className="mt-2 text-[24px] font-medium text-white">
          <span className="text-[var(--accent)] font-normal">$ </span>
          <span className="font-medium">captions</span>
        </h1>
        <p className="mt-2 text-[12px] text-[var(--text-dim)]">
          Reading from <code className="text-[var(--accent)]">captions</code>. This console intentionally does not edit
          caption rows.
        </p>
      </div>

      <section className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] overflow-auto">
        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="text-[12px] text-[var(--text-primary)]">latest captions</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {error ? 'error loading' : `showing ${captionRows.length} row(s)`}
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
                  content
                </th>
                <th className="px-4 py-2 text-left text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  image
                </th>
              </tr>
            </thead>
            <tbody>
              {captionRows.map((c) => {
                const imageId = c.image_id
                const url = imageId ? imageUrlById.get(imageId) : null
                return (
                  <tr
                    key={safeStr(c.id)}
                    className="border-b border-[#111111] align-top hover:bg-[#0f0f0f] transition-colors"
                  >
                    <td className="px-4 py-2 text-[12px] text-[var(--text-primary)] whitespace-nowrap">
                      {safeStr(c.id)}
                    </td>
                    <td className="px-4 py-2 text-[13px] text-[var(--text-primary)] leading-relaxed min-w-[420px]">
                      {safeStr(c.content)}
                    </td>
                    <td className="px-4 py-2">
                      {url ? (
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={safeStr(url)}
                            alt=""
                            className="h-10 w-10 rounded-[4px] object-cover border border-[var(--border)]"
                            loading="lazy"
                          />
                          <a
                            href={safeStr(url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[var(--accent)]"
                          >
                            open ↗
                          </a>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[var(--text-muted)]">—</div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {captionRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-[var(--text-muted)]" colSpan={3}>
                    no captions yet.
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

