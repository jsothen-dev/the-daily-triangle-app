export type ArticleSource = 'bjjee' | 'flograppling' | 'jitsmagazine' | 'graciemag'

export type Article = {
  id: string
  title: string
  excerpt: string
  url: string
  imageUrl: string | null
  publishedAt: Date
  source: ArticleSource
  category: string | null
}
