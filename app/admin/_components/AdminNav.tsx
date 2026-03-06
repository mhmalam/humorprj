import Link from 'next/link'

const links: Array<{ href: string; label: string }> = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/images', label: 'Images' },
  { href: '/admin/captions', label: 'Captions' },
]

export default function AdminNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white/90 transition overflow-hidden"
        >
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]" />
          <span className="relative">{l.label}</span>
        </Link>
      ))}
    </nav>
  )
}

