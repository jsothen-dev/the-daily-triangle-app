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

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={buildArticleUrl(article)}
      className="group flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-600 hover:scale-[1.02] transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-800">
        {article.imageUrl ? (
          <ArticleImage
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallback={
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
                <span className="text-4xl text-blue-700 font-black select-none">△</span>
              </div>
            }
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
            <span className="text-4xl text-blue-700 font-black select-none">△</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <SourceBadge source={article.source} />
          {article.category && (
            <span className="text-blue-400 text-xs font-medium uppercase tracking-wide">
              {article.category}
            </span>
          )}
        </div>

        <h2 className="text-white font-bold text-sm leading-snug line-clamp-3 group-hover:text-blue-200 transition-colors flex-1">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="text-gray-400 text-xs mt-2 line-clamp-2">{article.excerpt}</p>
        )}

        <p className="text-gray-500 text-xs mt-3">{formatTimeAgo(article.publishedAt)}</p>
      </div>
    </a>
  )
}
