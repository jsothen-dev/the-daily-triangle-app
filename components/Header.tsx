'use client'

import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'News', href: '/' },
  { label: 'Media', href: '/media' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white font-black text-sm shrink-0">
              △
            </div>
            <div>
              <span className="block text-white font-black text-xl tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                The Daily Triangle
              </span>
              <span className="block text-gray-400 text-xs leading-tight">
                The most relevant BJJ content in one place
              </span>
            </div>
          </a>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                    active
                      ? 'text-white bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
