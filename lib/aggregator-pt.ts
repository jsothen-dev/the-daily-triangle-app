import type { Article } from '@/types/article'
import { fetchFloGrapplingPt } from './flograppling'
import { fetchGracieMagPt } from './graciemag'
import { fetchVFComunica } from './vfcomunica'

export async function aggregatePtArticles(): Promise<Article[]> {
  const [floArticles, gracieArticles, vfArticles] = await Promise.all([
    fetchFloGrapplingPt(),
    fetchGracieMagPt(),
    fetchVFComunica(),
  ])

  const all = [...floArticles, ...gracieArticles, ...vfArticles]
  all.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  return all
}
