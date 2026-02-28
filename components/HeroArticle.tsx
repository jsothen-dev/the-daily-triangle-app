import type { Article } from '@/types/article'
import SourceBadge from './SourceBadge'
import { formatTimeAgo } from '@/lib/utils'
import ArticleImage from './ArticleImage'

function buildArticleUrl(article: Article): string {
  const params = new URLSearchParams({
    url: article.url,
    source: article.source,
    title: article.title,
    excerpt: article.excerpt,
  })
  if (article.imageUrl) params.set('imageUrl', article.imageUrl)
  if (article.category) params.set('category', article.category)
  params.set('date', article.publishedAt.toISOString())
  return `/article?${params.toString()}`
}

export default function HeroArticle({ article }: { article: Article }) {
  return (
    <a
      href={buildArticleUrl(article)}
      className="group block relative w-full aspect-[21/9] min-h-[320px] overflow-hidden rounded-xl bg-gray-900"
    >
      {/* Background image */}
      {article.imageUrl ? (
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallback={<div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black" />}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black" />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="flex items-center gap-3 mb-3">
          <SourceBadge source={article.source} />
          {article.category && (
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
              {article.category}
            </span>
          )}
          <span className="text-gray-400 text-xs">{formatTimeAgo(article.publishedAt)}</span>
        </div>

        <h1 className="text-white text-2xl md:text-4xl font-black leading-tight mb-3 max-w-4xl group-hover:text-blue-200 transition-colors">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-gray-300 text-sm md:text-base max-w-2xl line-clamp-2">
            {article.excerpt}
          </p>
        )}

        <div className="mt-4 inline-flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:text-blue-300">
          Read full story
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </a>
  )
}
