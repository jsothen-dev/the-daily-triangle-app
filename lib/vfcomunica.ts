import type { Article } from '@/types/article'
import { stripHtml } from './utils'

type WPPost = {
  id: number
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>
    'wp:term'?: Array<Array<{ name: string }>>
  }
}

async function fetchVFComunicaByLang(lang: string): Promise<Article[]> {
  const response = await fetch(
    `https://vfcomunica.com/wp-json/wp/v2/posts?per_page=20&lang=${lang}&_embed`,
    { next: { revalidate: 1800 } }
  )
  if (!response.ok) {
    console.error(`VF Comunica API returned status ${response.status}`)
    return []
  }
  const posts: WPPost[] = await response.json()
  return posts.map((post) => {
    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
    const rawExcerpt = stripHtml(post.excerpt.rendered)
    const category = post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null
    return {
      id: `vfcomunica-${post.id}`,
      title: stripHtml(post.title.rendered),
      excerpt: rawExcerpt.slice(0, 200) + (rawExcerpt.length > 200 ? '…' : ''),
      url: post.link,
      imageUrl,
      publishedAt: new Date(post.date),
      source: 'vfcomunica',
      category,
    }
  })
}

export async function fetchVFComunica(): Promise<Article[]> {
  try {
    return await fetchVFComunicaByLang('pt')
  } catch (error) {
    console.error('Error fetching VF Comunica PT API:', error)
    return []
  }
}

export async function fetchVFComunicaEn(): Promise<Article[]> {
  try {
    return await fetchVFComunicaByLang('en')
  } catch (error) {
    console.error('Error fetching VF Comunica EN API:', error)
    return []
  }
}
