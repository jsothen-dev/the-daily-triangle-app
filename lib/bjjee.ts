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


export async function fetchBJJEE(): Promise<Article[]> {
  try {
    const response = await fetch(
      'https://www.bjjee.com/wp-json/wp/v2/posts?_embed&per_page=20',
      { next: { revalidate: 1800 } }
    )

    if (!response.ok) {
      console.error(`BJJEE API returned status ${response.status}`)
      return []
    }

    const posts: WPPost[] = await response.json()

    return posts.map((post) => {
      const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
      const rawExcerpt = stripHtml(post.excerpt.rendered)
      const category = post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null

      return {
        id: `bjjee-${post.id}`,
        title: stripHtml(post.title.rendered),
        excerpt: rawExcerpt.slice(0, 200) + (rawExcerpt.length > 200 ? '…' : ''),
        url: post.link,
        imageUrl,
        publishedAt: new Date(post.date),
        source: 'bjjee',
        category,
      }
    })
  } catch (error) {
    console.error('Error fetching BJJEE API:', error)
    return []
  }
}
