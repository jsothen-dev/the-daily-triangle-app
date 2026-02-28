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


// Category 40 = BJJ News (excludes MMA News)
const BJJ_NEWS_CATEGORY_ID = 40

export async function fetchJitsMagazine(): Promise<Article[]> {
  try {
    const response = await fetch(
      `https://jitsmagazine.com/wp-json/wp/v2/posts?categories=${BJJ_NEWS_CATEGORY_ID}&per_page=20&_embed`,
      { next: { revalidate: 1800 } }
    )

    if (!response.ok) {
      console.error(`Jits Magazine API returned status ${response.status}`)
      return []
    }

    const posts: WPPost[] = await response.json()

    return posts.map((post) => {
      const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
      const rawExcerpt = stripHtml(post.excerpt.rendered)
      const category = post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null

      return {
        id: `jitsmagazine-${post.id}`,
        title: stripHtml(post.title.rendered),
        excerpt: rawExcerpt.slice(0, 200) + (rawExcerpt.length > 200 ? '…' : ''),
        url: post.link,
        imageUrl,
        publishedAt: new Date(post.date),
        source: 'jitsmagazine',
        category,
      }
    })
  } catch (error) {
    console.error('Error fetching Jits Magazine API:', error)
    return []
  }
}
