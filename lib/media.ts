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
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        next: { revalidate: 1800 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    )
    if (!res.ok) return []

    const xml = await res.text()
    const entries = xml.split('<entry>').slice(1)

    return entries.slice(0, 10).map((entry, i) => {
      const videoId = extractTag(entry, 'yt:videoId') ?? ''
      const title = extractTag(entry, 'title') ?? 'Untitled'
      const published = extractTag(entry, 'published') ?? ''

      return {
        id: `yt-${channelId}-${videoId || i}`,
        title,
        thumbnailUrl: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
        publishedAt: published ? new Date(published) : new Date(0),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channelName,
        type: 'video',
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
