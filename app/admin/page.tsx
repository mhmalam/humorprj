import { createServiceClient } from '@/lib/supabase-service'

type Stat = { label: string; value: string; hint?: string }

type RecentCaptionRow = {
  id: string
  content: string | null
  image_id: string | null
}

type ImageRow = { id: string; url: string | null }

function formatInt(n: number | null | undefined) {
  if (typeof n !== 'number') return '—'
  return new Intl.NumberFormat('en-US').format(n)
}

export default async function AdminDashboardPage() {
  const service = createServiceClient()

  const [{ count: imageCount }, { count: captionCount }, { count: voteCount }] =
    await Promise.all([
      service.from('images').select('id', { count: 'exact', head: true }),
      service.from('captions').select('id', { count: 'exact', head: true }),
      service.from('caption_votes').select('id', { count: 'exact', head: true }),
    ])

  const stats: Stat[] = [
    { label: 'Images', value: formatInt(imageCount) },
    { label: 'Captions', value: formatInt(captionCount) },
    { label: 'Votes', value: formatInt(voteCount), hint: 'If this is blank, your table may be named differently.' },
  ]

  const { data: recentCaptions } = await service
    .from('captions')
    .select('id, content, image_id')
    .order('id', { ascending: false })
    .limit(12)

  const recent = (recentCaptions ?? []) as RecentCaptionRow[]

  const imageIds = Array.from(
    new Set(recent.map((c) => c.image_id).filter((v): v is string => typeof v === 'string'))
  )

  const { data: images } = imageIds.length
    ? await service.from('images').select('id, url').in('id', imageIds)
    : { data: [] as ImageRow[] }

  const imageUrlById = new Map(((images ?? []) as ImageRow[]).map((i) => [i.id, i.url]))

  const captionLengths = recent.map((c) => (typeof c.content === 'string' ? c.content.length : 0))
  const avgCaptionLen =
    captionLengths.length > 0
      ? Math.round(captionLengths.reduce((a, b) => a + b, 0) / captionLengths.length)
      : null

  return (
    <div className="space-y-10 text-[13px] text-[var(--text-dim)]">
      <section>
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
            <span className="text-[var(--accent)]">{'//'}</span> Overview
          </div>
          <h1 className="mt-2 text-[26px] font-medium text-white">
            <span className="text-[var(--accent)] font-normal">$ </span>
            <span className="font-medium">dashboard</span>
          </h1>
        </div>

        <div className="relative flex flex-wrap items-stretch border border-[var(--border)] border-l-2 border-l-[var(--accent)] bg-[var(--bg-surface)] rounded-[4px] overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="h-full w-full opacity-100" style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)',
            }} />
          </div>
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className="relative flex-1 min-w-[160px] px-5 py-4 flex flex-col gap-1"
              style={idx < stats.length - 1 ? { borderRight: '1px solid var(--border)' } : undefined}
            >
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#1f3a2a]">{s.label}</div>
              <div className="text-[36px] leading-none text-[var(--accent)] font-semibold tabular-nums">
                {s.value}
              </div>
              {s.hint ? (
                <div className="mt-1 text-[10px] text-[var(--text-muted)]">{s.hint}</div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-6">
          <div className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
              <span className="text-[var(--accent)]">{'//'}</span> Caption style (recent)
            </div>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[13px] text-[var(--text-dim)]">avg caption length</span>
                <span className="ml-2 text-[20px] text-[var(--text-primary)] tabular-nums">
                  {formatInt(avgCaptionLen)}
                </span>
                <span className="ml-1 text-[11px] text-[var(--text-muted)]">chars</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                computed over last {formatInt(recent.length)} captions
              </div>
            </div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[#1f3a2a]">
              <span className="text-[var(--accent)]">{'//'}</span> Recent feed
            </div>
            <p className="mt-2 text-[13px] text-[var(--text-dim)]">
              {formatInt(recent.length)} recent captions loaded from Supabase (service-role).
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[13px] font-medium text-[var(--text-primary)]">
            <span className="text-[var(--accent)]">{'//'}</span> latest captions
          </h2>
          <p className="text-[11px] text-[var(--text-muted)]">high-signal recent activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recent.map((c) => {
            const imgUrl = c.image_id ? imageUrlById.get(c.image_id) : null
            const idShort = c.id.length > 18 ? `${c.id.slice(0, 18)}…` : c.id
            return (
              <div
                key={c.id}
                className="group border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-4 hover:bg-[var(--bg-raised)] hover:border-[var(--border-accent)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] text-[var(--text-primary)] font-normal truncate">{idShort}</div>
                    <div className="mt-2 text-[13px] text-[#c4c4c4] font-normal leading-[1.5]">
                      {c.content ?? <span className="text-[var(--text-muted)]">—</span>}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {imgUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt=""
                          className="h-12 w-12 rounded-[4px] object-cover border border-[var(--border)]"
                          loading="lazy"
                        />
                        <a
                          className="text-[10px] text-[var(--accent)] opacity-40 group-hover:opacity-100"
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          open ↗
                        </a>
                      </>
                    ) : (
                      <div className="text-[11px] text-[var(--text-muted)]">no image</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {recent.length === 0 ? (
            <div className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-[4px] p-6 text-[13px] text-[var(--text-dim)]">
              no recent captions yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

