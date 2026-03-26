import AdminLoginGate from '@/app/admin/_components/AdminLoginGate'
import AdminNav from '@/app/admin/_components/AdminNav'
import AdminSignOutButton from '@/app/admin/_components/AdminSignOutButton'
import { getAdminViewer } from '@/lib/admin-auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gate = await getAdminViewer()

  if (!gate.ok) {
    if (gate.reason === 'not_logged_in') {
      return <AdminLoginGate />
    }

    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.25),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-slate-950" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_30px_120px_-60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
                    <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(244,63,94,0.18)]" />
                    ACCESS DENIED
                  </div>
                  <h1 className="mt-4 text-3xl md:text-4xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
                    You’re signed in, but not authorized.
                  </h1>
                  <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed max-w-2xl">
                    Your account doesn’t have access to this area. If you need access, contact an administrator.
                  </p>
                </div>
                <AdminSignOutButton />
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="px-8 py-5 text-xs text-white/50 flex items-center justify-between gap-3">
              <span>For safety, admin access is restricted in staging.</span>
              <span className="text-white/35">The Humor Project</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="humor-admin-shell min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-mono">
      <div className="flex min-h-screen">
        <aside className="w-[220px] border-r border-[var(--border)] bg-[var(--bg)] flex flex-col">
          <div className="pt-6 pb-3 border-b border-b-[#111111]">
            <div className="px-4">
              <div className="text-[10px] text-[#1f3a2a]">{'//'} humor-admin</div>
              <div className="mt-1 text-[13px] text-[var(--accent)] font-medium">$ console</div>
            </div>
            <div className="mt-3 px-4 text-[11px] text-[var(--text-primary)] flex flex-col gap-1">
              <div className="truncate">{gate.viewer.email ?? gate.viewer.userId}</div>
              <div>
                <AdminSignOutButton />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pt-3">
            <AdminNav />
          </div>
        </aside>

        <main className="flex-1 flex justify-center overflow-auto">
          <div className="w-full max-w-[1200px] px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

