import { aggregateArticles } from '@/lib/aggregator'
import HeroArticle from '@/components/HeroArticle'
import ArticleGrid from '@/components/ArticleGrid'

export const revalidate = 1800 // ISR: revalidate every 30 minutes

export default async function HomePage() {
  const articles = await aggregateArticles()

  const heroArticle = articles[0] ?? null
  const gridArticles = articles.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      {heroArticle && (
        <section className="mb-10">
          <HeroArticle article={heroArticle} />
        </section>
      )}

      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-white text-xl font-black uppercase tracking-wider">Latest News</h2>
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-sm">{gridArticles.length} articles</span>
      </div>

      {/* Article grid */}
      <ArticleGrid articles={gridArticles} />

    </div>
  )
}
