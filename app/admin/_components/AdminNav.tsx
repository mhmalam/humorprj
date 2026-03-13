/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  shortcut?: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', shortcut: 'g d' }],
  },
  {
    label: 'People & content',
    items: [
      { href: '/admin/users', label: 'Profiles', shortcut: 'g u' },
      { href: '/admin/images', label: 'Images', shortcut: 'g i' },
      { href: '/admin/captions', label: 'Captions', shortcut: 'g c' },
      { href: '/admin/caption-requests', label: 'Caption requests', shortcut: 'g r' },
      { href: '/admin/caption-examples', label: 'Caption examples', shortcut: 'g e' },
    ],
  },
  {
    label: 'Humor engine',
    items: [
      { href: '/admin/humor-flavors', label: 'Flavors', shortcut: 'g f' },
      { href: '/admin/humor-flavor-steps', label: 'Flavor steps', shortcut: 'g s' },
      { href: '/admin/humor-mix', label: 'Flavor mix', shortcut: 'g m' },
      { href: '/admin/terms', label: 'Terms', shortcut: 'g t' },
    ],
  },
  {
    label: 'LLM stack',
    items: [
      { href: '/admin/llm-models', label: 'Models', shortcut: 'g l' },
      { href: '/admin/llm-providers', label: 'Providers', shortcut: 'g p' },
      { href: '/admin/llm-prompt-chains', label: 'Prompt chains', shortcut: 'g n' },
      { href: '/admin/llm-responses', label: 'Responses', shortcut: 'g x' },
    ],
  },
  {
    label: 'Access control',
    items: [
      { href: '/admin/allowed-signup-domains', label: 'Allowed domains', shortcut: 'g a' },
      { href: '/admin/whitelisted-emails', label: 'Whitelisted emails', shortcut: 'g w' },
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <nav className="font-mono text-[13px] text-[var(--text-primary)]">
      {groups.map((group) => (
        <div key={group.label} className="mb-3">
          <div className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-[0.15em] text-[#1f3a2a]">
            {group.label}
          </div>
          <ul>
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex h-9 items-center justify-between pr-4 border-l-2 ${
                      active
                        ? 'border-l-[var(--accent)] bg-[var(--accent-dim)] text-white font-medium'
                        : 'border-l-transparent text-[var(--text-primary)] hover:bg-[#111111] hover:text-white font-normal'
                    }`}
                  >
                    <span className="flex items-center gap-1 pl-4">
                      {active && (
                        <span className="terminal-cursor text-[var(--accent)]" aria-hidden="true">
                          ▸
                        </span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.shortcut ? (
                      <span className="text-[10px] text-[var(--text-dim)] group-hover:text-[var(--text-primary)]">
                        {item.shortcut}
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

