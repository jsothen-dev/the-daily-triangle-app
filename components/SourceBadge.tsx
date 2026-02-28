import type { ArticleSource } from '@/types/article'

const SOURCE_LABELS: Record<ArticleSource, string> = {
  bjjee: 'BJJEE',
  flograppling: 'FloGrappling',
  jitsmagazine: 'Jits Magazine',
  graciemag: 'Gracie Mag',
}

const SOURCE_STYLES: Record<ArticleSource, string> = {
  bjjee: 'bg-blue-600 text-white',
  flograppling: 'bg-blue-900 text-blue-200',
  jitsmagazine: 'bg-emerald-700 text-emerald-100',
  graciemag: 'bg-red-800 text-red-100',
}

export default function SourceBadge({ source }: { source: ArticleSource }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${SOURCE_STYLES[source]}`}
    >
      {SOURCE_LABELS[source]}
    </span>
  )
}
