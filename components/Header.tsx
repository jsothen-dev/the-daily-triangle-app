'use client'

import { usePathname } from 'next/navigation'

function USFlag() {
  return (
    <svg viewBox="0 0 20 14" className="w-6 h-4 rounded-sm" aria-hidden="true">
      <rect width="20" height="14" fill="#B22234" />
      <rect y="1.08" width="20" height="1.08" fill="#fff" />
      <rect y="3.23" width="20" height="1.08" fill="#fff" />
      <rect y="5.38" width="20" height="1.08" fill="#fff" />
      <rect y="7.54" width="20" height="1.08" fill="#fff" />
      <rect y="9.69" width="20" height="1.08" fill="#fff" />
      <rect y="11.85" width="20" height="1.08" fill="#fff" />
      <rect width="8" height="7.54" fill="#3C3B6E" />
    </svg>
  )
}

function BRFlag() {
  return (
    <svg viewBox="0 0 20 14" className="w-6 h-4 rounded-sm" aria-hidden="true">
      <rect width="20" height="14" fill="#009C3B" />
      <polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#FFDF00" />
      <circle cx="10" cy="7" r="3.2" fill="#002776" />
      <path d="M 6.9 5.8 A 3.2 3.2 0 0 1 13.1 5.8" stroke="#fff" strokeWidth="0.6" fill="none" />
    </svg>
  )
}

const EN_NAV = [
  { label: 'News', href: '/' },
  { label: 'Media', href: '/media' },
]

const PT_NAV = [
  { label: 'Notícias', href: '/pt' },
  { label: 'Vídeos', href: '/pt/videos' },
]

export default function Header() {
  const pathname = usePathname()
  const isPt = pathname.startsWith('/pt')
  const navLinks = isPt ? PT_NAV : EN_NAV

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href={isPt ? '/pt' : '/'} className="flex items-center gap-3 group min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white font-black text-sm shrink-0">
              △
            </div>
            <div className="min-w-0">
              <span className="block text-white font-black text-xl tracking-tight leading-tight group-hover:text-blue-400 transition-colors whitespace-nowrap">
                The Daily Triangle
              </span>
              <span className="hidden sm:block text-gray-400 text-xs leading-tight">
                {isPt ? 'O melhor do BJJ em um só lugar' : 'The most relevant BJJ content in one place'}
              </span>
            </div>
          </a>

          {/* Right side: Nav + Language switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <nav className="flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = link.href === '/pt'
                  ? pathname === '/pt'
                  : link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href)
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${
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

            {/* Language switcher */}
            <div className="flex items-center gap-1 border-l border-gray-700 pl-2">
              <a
                href="/"
                title="English"
                className={`p-1.5 rounded transition-all ${
                  !isPt ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
              >
                <USFlag />
              </a>
              <a
                href="/pt"
                title="Português"
                className={`p-1.5 rounded transition-all ${
                  isPt ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-40 hover:opacity-100'
                }`}
              >
                <BRFlag />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
