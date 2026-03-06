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
    <div className="space-y-10">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_30px_120px_-70px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="p-7 md:p-9">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.15)]" />
                DASHBOARD
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
                Interesting stats
              </h1>
              <p className="mt-2 text-sm md:text-base text-white/70">
                A quick, high-signal snapshot of what’s happening in your database.
              </p>
            </div>
            <div className="text-xs text-white/45">
              Live from Supabase • service-role server queries
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="relative rounded-2xl border border-white/10 bg-slate-950/35 p-5 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%)]" />
                <div className="relative">
                  <div className="text-xs font-semibold tracking-widest text-white/55">
                    {s.label.toUpperCase()}
                  </div>
                  <div className="mt-2 text-4xl font-bold tracking-tight">{s.value}</div>
                  {s.hint ? (
                    <div className="mt-2 text-xs text-white/45 leading-relaxed">{s.hint}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/35 p-5">
              <div className="text-xs font-semibold tracking-widest text-white/55">
                CAPTION STYLE (RECENT)
              </div>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-white/80">
                  Average caption length:{' '}
                  <span className="font-semibold text-white">{formatInt(avgCaptionLen)}</span>{' '}
                  chars
                </div>
                <div className="text-xs text-white/45">
                  Computed from last {formatInt(recent.length)} captions
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
                  style={{
                    width: `${Math.min(100, Math.max(8, Math.round(((avgCaptionLen ?? 0) / 140) * 100)))}%`,
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-white/45">
                (Purely visual) Longer captions fill the bar more.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
              <div className="text-xs font-semibold tracking-widest text-white/55">
                RECENT FEED
              </div>
              <div className="mt-3 text-sm text-white/80 leading-relaxed">
                You have <span className="font-semibold text-white">{formatInt(recent.length)}</span> recent captions loaded.
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">
                  Tip: use the Images page to keep your caption feed “visual”.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="px-7 md:px-9 py-5 text-xs text-white/50 flex items-center justify-between gap-3">
          <span>Admin-only surface</span>
          <span className="text-white/35">The Humor Project</span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
            Latest captions
          </h2>
          <p className="text-xs text-white/55">A “what just changed” feed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recent.map((c) => {
            const imgUrl = c.image_id ? imageUrlById.get(c.image_id) : null
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 hover:bg-white/[0.08] transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-white/45 truncate">{c.id}</div>
                    <div className="mt-3 text-sm text-white/90 leading-relaxed">
                      {c.content ?? <span className="text-white/45">—</span>}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {imgUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover border border-white/10"
                          loading="lazy"
                        />
                        <a
                          className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          open image
                        </a>
                      </>
                    ) : (
                      <div className="text-xs text-white/35">no image</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-sm text-white/70">
              No recent captions yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

