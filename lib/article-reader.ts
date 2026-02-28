import { stripHtml } from './utils'

export type FullArticle = {
  title: string
  imageUrl: string | null
  publishedAt: Date
  content: string | null // null = no full content available
  source: string
  url: string
  category: string | null
  excerpt: string
}

type WPFullPost = {
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>
    'wp:term'?: Array<Array<{ name: string }>>
  }
}

type FloFullPost = {
  id: number
  title: string
  content: string | null
  asset_url: string | null
  publish_start_date: string
  shareable_link: string
  seo_description: string | null
  categories: Array<{ name: string }>
}


const WP_BASES: Record<string, string> = {
  bjjee: 'https://www.bjjee.com',
  jitsmagazine: 'https://jitsmagazine.com',
  graciemag: 'https://www.graciemag.com',
}

export async function fetchWordPressArticle(source: string, url: string): Promise<FullArticle | null> {
  const base = WP_BASES[source]
  if (!base) return null

  try {
    const slug = url.split('/').filter(Boolean).pop()
    if (!slug) return null

    const response = await fetch(
      `${base}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      console.error(`${source} article API returned status ${response.status}`)
      return null
    }

    const posts: WPFullPost[] = await response.json()
    if (!posts.length) return null

    const post = posts[0]
    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
    const rawExcerpt = stripHtml(post.excerpt.rendered)
    const category = post._embedded?.['wp:term']?.[0]?.[0]?.name ?? null

    return {
      title: stripHtml(post.title.rendered),
      imageUrl,
      publishedAt: new Date(post.date),
      content: post.content.rendered,
      source,
      url: post.link,
      category,
      excerpt: rawExcerpt.slice(0, 200) + (rawExcerpt.length > 200 ? '…' : ''),
    }
  } catch (error) {
    console.error(`Error fetching ${source} article:`, error)
    return null
  }
}

export async function fetchFloGrapplingArticle(url: string): Promise<FullArticle | null> {
  try {
    // URL format: https://www.flograppling.com/articles/15519769-article-slug
    const segment = url.split('/').filter(Boolean).pop() ?? ''
    const id = segment.split('-')[0]
    if (!id || isNaN(Number(id))) return null

    const response = await fetch(
      `https://api.flosports.tv/api/articles/${id}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      console.error(`FloGrappling article API returned status ${response.status}`)
      return null
    }

    const json: { data: FloFullPost } = await response.json()
    const post = json.data
    const excerpt = post.seo_description ?? ''
    const category =
      post.categories.find(
        (c) => !['FloSports', 'Brazilian Jiu-Jitsu', 'Grappling', 'Portuguese'].includes(c.name)
      )?.name ?? null

    return {
      title: post.title,
      imageUrl: post.asset_url ?? null,
      publishedAt: new Date(post.publish_start_date),
      content: post.content ?? null,
      source: 'flograppling',
      url: post.shareable_link,
      category,
      excerpt: excerpt.slice(0, 200) + (excerpt.length > 200 ? '…' : ''),
    }
  } catch (error) {
    console.error('Error fetching FloGrappling article:', error)
    return null
  }
}
