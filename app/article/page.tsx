import { fetchWordPressArticle, fetchFloGrapplingArticle, type FullArticle } from '@/lib/article-reader'
import type { ArticleSource } from '@/types/article'
import SourceBadge from '@/components/SourceBadge'
import { formatTimeAgo } from '@/lib/utils'

const SOURCE_LABELS: Record<string, string> = {
  bjjee: 'BJJEE',
  flograppling: 'FloGrappling',
  jitsmagazine: 'Jits Magazine',
  graciemag: 'Gracie Mag',
}

const WP_SOURCES = new Set(['bjjee', 'jitsmagazine', 'graciemag'])

interface ArticlePageProps {
  searchParams: Promise<{
    url?: string
    source?: string
    title?: string
    imageUrl?: string
    excerpt?: string
    category?: string
    date?: string
  }>
}

export default async function ArticlePage({ searchParams }: ArticlePageProps) {
  const params = await searchParams
  const { url, source, title, imageUrl, excerpt, category, date } = params

  if (!url || !source) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Article not found.</p>
        <a href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
          ← All Stories
        </a>
      </div>
    )
  }

  // Build fallback metadata from URL params (passed by article cards)
  const fallbackArticle: FullArticle = {
    title: title ?? '',
    imageUrl: imageUrl ?? null,
    publishedAt: date ? new Date(date) : new Date(),
    content: null,
    source,
    url,
    category: category ?? null,
    excerpt: excerpt ?? '',
  }

  let article: FullArticle = fallbackArticle

  if (WP_SOURCES.has(source)) {
    const fetched = await fetchWordPressArticle(source, url)
    if (fetched) article = fetched
  } else if (source === 'flograppling') {
    const fetched = await fetchFloGrapplingArticle(url)
    if (fetched) article = fetched
  }

  const sourceLabel = SOURCE_LABELS[source] ?? source

  return (
    <div className="min-h-screen">
      {/* Back navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          All Stories
        </a>
      </div>

      {/* Hero image */}
      {article.imageUrl && (
        <div className="w-full max-w-4xl mx-auto px-4 mt-4">
          <div className="relative w-full aspect-[16/7] overflow-hidden rounded-xl bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article content */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <SourceBadge source={source as ArticleSource} />
          {article.category && (
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
              {article.category}
            </span>
          )}
          <span className="text-gray-500 text-xs">{formatTimeAgo(article.publishedAt)}</span>
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl md:text-4xl font-black leading-tight mb-6">
          {article.title}
        </h1>

        {/* Content */}
        {article.content ? (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          /* Fallback: content unavailable */
          <div>
            {article.excerpt && (
              <p className="text-gray-300 text-base leading-relaxed mb-8">{article.excerpt}</p>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Read Full Article on {sourceLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}

        {/* Footer attribution */}
        <div className="mt-12 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Originally published on{' '}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {sourceLabel}
            </a>
          </p>
        </div>
      </article>
    </div>
  )
}
