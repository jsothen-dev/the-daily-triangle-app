import type { Article } from '@/types/article'

const FLOGRAPPLING_SITE_ID = 8
const FLOSPORTS_API = 'https://api.flosports.tv/api/articles'

type FloArticle = {
  id: number
  title: string
  seo_description: string | null
  shareable_link: string
  asset_url: string | null
  publish_start_date: string
  categories: Array<{ name: string }>
}

type FloApiResponse = {
  data: FloArticle[]
}

async function fetchFloArticles(): Promise<FloArticle[]> {
  const response = await fetch(
    `${FLOSPORTS_API}?site_id=${FLOGRAPPLING_SITE_ID}&limit=40`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 1800 },
    }
  )
  if (!response.ok) {
    console.error(`FloGrappling API returned status ${response.status}`)
    return []
  }
  const json: FloApiResponse = await response.json()
  return json.data
}

function mapFloArticle(post: FloArticle, excludeCategories: string[]): Article {
  const category =
    post.categories.find((c) => !excludeCategories.includes(c.name))?.name ?? null
  const excerpt = post.seo_description ?? ''
  return {
    id: `flograppling-${post.id}`,
    title: post.title,
    excerpt: excerpt.slice(0, 200) + (excerpt.length > 200 ? '…' : ''),
    url: post.shareable_link,
    imageUrl: post.asset_url ?? null,
    publishedAt: new Date(post.publish_start_date),
    source: 'flograppling',
    category,
  }
}

const EN_EXCLUDE = ['FloSports', 'Brazilian Jiu-Jitsu', 'Grappling']
const PT_EXCLUDE = ['FloSports', 'Brazilian Jiu-Jitsu', 'Grappling', 'Portuguese']

export async function fetchFloGrappling(): Promise<Article[]> {
  try {
    const posts = await fetchFloArticles()
    return posts
      .filter((post) => !post.categories.some((c) => c.name === 'Portuguese'))
      .slice(0, 20)
      .map((post) => mapFloArticle(post, EN_EXCLUDE))
  } catch (error) {
    console.error('Error fetching FloGrappling API:', error)
    return []
  }
}

export async function fetchFloGrapplingPt(): Promise<Article[]> {
  try {
    const posts = await fetchFloArticles()
    return posts
      .filter((post) => post.categories.some((c) => c.name === 'Portuguese'))
      .slice(0, 20)
      .map((post) => mapFloArticle(post, PT_EXCLUDE))
  } catch (error) {
    console.error('Error fetching FloGrappling PT API:', error)
    return []
  }
}
