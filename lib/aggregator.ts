import type { Article } from '@/types/article'
import { fetchBJJEE } from './bjjee'
import { fetchFloGrappling } from './flograppling'
import { fetchJitsMagazine } from './jitsmagazine'
import { fetchGracieMag } from './graciemag'

export async function aggregateArticles(): Promise<Article[]> {
  const [bjjeeArticles, floArticles, jitsArticles, gracieArticles] = await Promise.all([
    fetchBJJEE(),
    fetchFloGrappling(),
    fetchJitsMagazine(),
    fetchGracieMag(),
  ])

  const all = [...bjjeeArticles, ...floArticles, ...jitsArticles, ...gracieArticles]

  // Sort by publishedAt descending (newest first)
  all.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  return all
}
