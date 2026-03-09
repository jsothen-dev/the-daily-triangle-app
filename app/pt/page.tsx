import { aggregatePtArticles } from '@/lib/aggregator-pt'
import HeroArticle from '@/components/HeroArticle'
import ArticleGrid from '@/components/ArticleGrid'

export const revalidate = 1800

export default async function PtHomePage() {
  const articles = await aggregatePtArticles()

  const heroArticle = articles[0] ?? null
  const gridArticles = articles.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {heroArticle && (
        <section className="mb-10">
          <HeroArticle article={heroArticle} />
        </section>
      )}

      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-white text-xl font-black uppercase tracking-wider">Últimas Notícias</h2>
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-sm">{gridArticles.length} artigos</span>
      </div>

      <ArticleGrid articles={gridArticles} />
    </div>
  )
}
