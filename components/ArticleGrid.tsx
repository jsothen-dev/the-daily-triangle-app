import type { Article } from '@/types/article'
import ArticleCard from './ArticleCard'

export default function ArticleGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-5xl mb-4">△</div>
        <p className="text-lg font-medium">No articles found</p>
        <p className="text-sm mt-1">Check back soon for the latest BJJ news</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
