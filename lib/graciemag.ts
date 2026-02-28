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


// Category 20238 = News. Fetch extra to account for Portuguese articles being filtered out.
const NEWS_CATEGORY_ID = 20238

// Portuguese category names (assigned by editors to Portuguese-language posts)
const PORTUGUESE_CATEGORIES = new Set(['Notícias', 'noticias'])

// Portuguese words/phrases highly unlikely to appear in English BJJ article titles.
// Trailing spaces on some keywords prevent substring matches with English words
// (e.g. "celebra " avoids matching "celebrates").
const PORTUGUESE_TITLE_KEYWORDS = [
  'treinar', 'defesa pessoal', 'estreia', 'celebra ', 'chegada',
  'comenta', 'apresenta', 'choro', 'grande mestre', ' ao ',
  'segundo ', 'de ensinar', 'de treinar', 'faixa-preta',
]

function isPortuguese(post: WPPost): boolean {
  // 1. Editor-assigned Portuguese category
  const categoryNames = post._embedded?.['wp:term']?.[0]?.map((c) => c.name) ?? []
  if (categoryNames.some((name) => PORTUGUESE_CATEGORIES.has(name))) return true

  const title = stripHtml(post.title.rendered)
  const excerpt = stripHtml(post.excerpt.rendered)

  // 2. Diacritics in the title are a near-certain signal (English titles from this
  //    site never have them, even for Brazilian author names)
  if (/[ãõâêôçáéúàí]/.test(title)) return true

  // 3. ã or õ anywhere in the excerpt (exclusively Portuguese characters)
  if (/[ãõ]/.test(excerpt)) return true

  // 4. Distinctive Portuguese words in the title
  const titleLower = title.toLowerCase()
  if (PORTUGUESE_TITLE_KEYWORDS.some((kw) => titleLower.includes(kw))) return true

  return false
}

export async function fetchGracieMag(): Promise<Article[]> {
  try {
    const response = await fetch(
      `https://www.graciemag.com/wp-json/wp/v2/posts?categories=${NEWS_CATEGORY_ID}&per_page=40&_embed`,
      { next: { revalidate: 1800 } }
    )

    if (!response.ok) {
      console.error(`Gracie Mag API returned status ${response.status}`)
      return []
    }

    const posts: WPPost[] = await response.json()

    return posts
      .filter((post) => !isPortuguese(post))
      .slice(0, 20)
      .map((post) => {
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
      })
  } catch (error) {
    console.error('Error fetching Gracie Mag API:', error)
    return []
  }
}
