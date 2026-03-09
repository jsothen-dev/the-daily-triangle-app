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


// Category 20238 = English "News", 12554 = Portuguese "Notícias" (separate categories)
const EN_CATEGORY_ID = 20238
const PT_CATEGORY_ID = 12554

async function fetchGracieMagPosts(categoryId: number): Promise<WPPost[]> {
  const response = await fetch(
    `https://www.graciemag.com/wp-json/wp/v2/posts?categories=${categoryId}&per_page=20&_embed`,
    { next: { revalidate: 1800 } }
  )
  if (!response.ok) {
    console.error(`Gracie Mag API returned status ${response.status}`)
    return []
  }
  return response.json()
}

function mapPost(post: WPPost): Article {
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
  const rawExcerpt = stripHtml(post.excerpt.rendered)
  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null
  return {
    id: `graciemag-${post.id}`,
    title: stripHtml(post.title.rendered),
    excerpt: rawExcerpt.slice(0, 200) + (rawExcerpt.length > 200 ? '…' : ''),
    url: post.link,
    imageUrl,
    publishedAt: new Date(post.date),
    source: 'graciemag',
    category,
  }
}

export async function fetchGracieMag(): Promise<Article[]> {
  try {
    const posts = await fetchGracieMagPosts(EN_CATEGORY_ID)
    return posts.map(mapPost)
  } catch (error) {
    console.error('Error fetching Gracie Mag API:', error)
    return []
  }
}

export async function fetchGracieMagPt(): Promise<Article[]> {
  try {
    const posts = await fetchGracieMagPosts(PT_CATEGORY_ID)
    return posts.map(mapPost)
  } catch (error) {
    console.error('Error fetching Gracie Mag PT API:', error)
    return []
  }
}
