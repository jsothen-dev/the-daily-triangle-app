import type { Article } from '@/types/article'
import { fetchBJJEE } from './bjjee'
import { fetchFloGrappling } from './flograppling'
import { fetchJitsMagazine } from './jitsmagazine'
import { fetchGracieMag } from './graciemag'
import { fetchVFComunicaEn } from './vfcomunica'

export async function aggregateArticles(): Promise<Article[]> {
  const [bjjeeArticles, floArticles, jitsArticles, gracieArticles, vfArticles] = await Promise.all([
    fetchBJJEE(),
    fetchFloGrappling(),
    fetchJitsMagazine(),
    fetchGracieMag(),
    fetchVFComunicaEn(),
  ])

  const all = [...bjjeeArticles, ...floArticles, ...jitsArticles, ...gracieArticles, ...vfArticles]

  // Sort by publishedAt descending (newest first)
  all.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  return all
}
