export type MediaItem = {
  id: string
  title: string
  thumbnailUrl: string | null
  publishedAt: Date
  url: string
  channelName: string
  type: 'video' | 'podcast'
}

const YOUTUBE_CHANNELS = [
  { id: 'UCTSmtpFVLcZGS7G599_vCow', name: 'Chewjitsu Podcast' },
  { id: 'UCJlx0zzA6LloWQtpTjD3VeA', name: 'Grappling Rewind' },
  { id: 'UCJYTZaCTcsQ_Hzj1R5SH5lg', name: 'MMA JiuJitsu' },
]

const PODCAST_FEEDS = [
  { url: 'https://www.insidepositionpodcast.com/feed', name: 'Inside Position' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCharCode(parseInt(c, 16)))
}

function extractTag(xml: string, tag: string): string | null {
  // Escape special regex chars in tag name (handles e.g. "yt:videoId")
  const t = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, 'i'))
  if (!m) return null
  const inner = m[1].trim()
  // Strip CDATA wrapper if present
  const cdata = inner.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/)
  return decodeXmlEntities(cdata ? cdata[1].trim() : inner)
}

function extractAttr(xml: string, tag: string, attr: string): string | null {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i'))
  return m ? m[1] : null
}

// ─── YouTube RSS ──────────────────────────────────────────────────────────────

async function fetchYouTubeChannel(channelId: string, channelName: string): Promise<MediaItem[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      console.error('YOUTUBE_API_KEY is not set')
      return []
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}&order=date&type=video&part=snippet&maxResults=10&key=${apiKey}`,
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) return []

    const data = await res.json()

    return (data.items ?? []).map((item: { id: { videoId: string }, snippet: { title: string, publishedAt: string, thumbnails: { high?: { url: string }, default?: { url: string } } } }) => {
      const videoId = item.id.videoId
      const snippet = item.snippet

      return {
        id: `yt-${channelId}-${videoId}`,
        title: decodeXmlEntities(snippet.title),
        thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url ?? null,
        publishedAt: new Date(snippet.publishedAt),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channelName,
        type: 'video' as const,
      }
    })
  } catch {
    console.error(`Error fetching YouTube channel ${channelName}`)
    return []
  }
}

// ─── Podcast RSS ──────────────────────────────────────────────────────────────

async function fetchPodcast(feedUrl: string, channelName: string): Promise<MediaItem[]> {
  try {
    const res = await fetch(feedUrl, { next: { revalidate: 1800 } })
    if (!res.ok) return []

    const xml = await res.text()
    const items = xml.split('<item>').slice(1)

    return items.slice(0, 10).map((item, i) => {
      const title = extractTag(item, 'title') ?? 'Untitled'
      const pubDate = extractTag(item, 'pubDate') ?? ''
      const link = extractTag(item, 'link') ?? extractAttr(item, 'enclosure', 'url') ?? feedUrl
      const artwork = extractAttr(item, 'itunes:image', 'href')

      return {
        id: `podcast-${channelName}-${i}`,
        title,
        thumbnailUrl: artwork ?? null,
        publishedAt: pubDate ? new Date(pubDate) : new Date(0),
        url: link,
        channelName,
        type: 'podcast',
      }
    })
  } catch {
    console.error(`Error fetching podcast ${channelName}`)
    return []
  }
}

// ─── Aggregator ───────────────────────────────────────────────────────────────

export async function fetchAllMedia(): Promise<MediaItem[]> {
  const results = await Promise.all([
    ...YOUTUBE_CHANNELS.map((ch) => fetchYouTubeChannel(ch.id, ch.name)),
    ...PODCAST_FEEDS.map((f) => fetchPodcast(f.url, f.name)),
  ])

  return results
    .flat()
    .filter((item) => item.publishedAt.getTime() > 0)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}
