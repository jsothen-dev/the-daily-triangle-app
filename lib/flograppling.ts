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

export async function fetchFloGrappling(): Promise<Article[]> {
  try {
    const response = await fetch(
      `${FLOSPORTS_API}?site_id=${FLOGRAPPLING_SITE_ID}&limit=20`,
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
      .filter((post) => !post.categories.some((c) => c.name === 'Portuguese'))
      .slice(0, 20)
      .map((post) => {
        const category =
          post.categories.find(
            (c) => !['FloSports', 'Brazilian Jiu-Jitsu', 'Grappling'].includes(c.name)
          )?.name ?? null

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
      })
  } catch (error) {
    console.error('Error fetching FloGrappling API:', error)
    return []
  }
}
