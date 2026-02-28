'use client'

import { usePathname } from 'next/navigation'

const NEWS_SOURCES = [
  { label: 'BJJEE.com', href: 'https://www.bjjee.com' },
  { label: 'FloGrappling.com', href: 'https://www.flograppling.com/articles' },
  { label: 'JitsMagazine.com', href: 'https://jitsmagazine.com/category/bjj-news/' },
  { label: 'GracieMag.com', href: 'https://www.graciemag.com' },
]

const MEDIA_SOURCES = [
  { label: 'Chewjitsu Podcast', href: 'https://www.youtube.com/@ChewjitsuPodcast' },
  { label: 'Grappling Rewind', href: 'https://www.youtube.com/c/GrapplingRewind' },
  { label: 'MMA JiuJitsu', href: 'https://www.youtube.com/@mmajiujitsu' },
  { label: 'Inside Position Podcast', href: 'https://www.insidepositionpodcast.com' },
]

export default function Footer() {
  const pathname = usePathname()
  const year = new Date().getFullYear()
  const sources = pathname.startsWith('/media') ? MEDIA_SOURCES : NEWS_SOURCES

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center text-white font-black text-xs">
                △
              </div>
              <span className="text-white font-black text-lg">The Daily Triangle</span>
            </div>
            <p className="text-gray-400 text-sm">The most relevant BJJ content in one place</p>
          </div>

          {/* Source links */}
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">
              Content Sources
            </p>
            {sources.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                {label} →
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-gray-600 text-xs">
          © {year} The Daily Triangle. All article content belongs to respective sources.
        </div>
      </div>
    </footer>
  )
}
