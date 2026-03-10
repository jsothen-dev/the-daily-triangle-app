import { type MediaItem } from './media'

const PT_PLAYLIST_IDS = [
  'PLYY_176MZdPytoago-O5uFzpQXHYXup6l',
]

const VIKTOR_DORIA_HANDLE = 'viktordoria2064'
const CONNECT_CAST_HANDLE = 'PodcastConnectCast'
const VF_COMUNICA_YT_HANDLE = 'VFComunica'

type YTPlaylistItem = {
  snippet: {
    title: string
    publishedAt: string
    thumbnails: { high?: { url: string }; default?: { url: string } }
    resourceId: { videoId: string }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPrivate(item: YTPlaylistItem): boolean {
  return item.snippet.title === 'Private video'
}

function parseDurationSeconds(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return parseInt(m[1] ?? '0') * 3600 + parseInt(m[2] ?? '0') * 60 + parseInt(m[3] ?? '0')
}

function mapItems(raw: YTPlaylistItem[], playlistId: string, channelName: string): MediaItem[] {
  return raw.filter((item) => !isPrivate(item)).map((item) => {
    const snippet = item.snippet
    const videoId = snippet.resourceId.videoId
    return {
      id: `yt-${playlistId}-${videoId}`,
      title: snippet.title,
      thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url ?? null,
      publishedAt: new Date(snippet.publishedAt),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      channelName,
      type: 'video' as const,
    }
  })
}

// Removes Shorts by checking #shorts in the title, then confirms via duration (≤ 180s).
// YouTube allows Shorts up to 3 minutes, so the title hashtag is the most reliable signal.
async function stripShorts(items: MediaItem[], apiKey: string): Promise<MediaItem[]> {
  // Fast pass: drop anything tagged #shorts in the title
  const candidates = items.filter(
    (item) => !item.title.toLowerCase().includes('#shorts')
  )

  if (candidates.length === 0) return []

  const ids = candidates
    .map((item) => new URL(item.url).searchParams.get('v'))
    .filter(Boolean)
    .join(',')

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  )
  if (!res.ok) return candidates // fallback: keep title-filtered set if API fails

  const data = await res.json()
  const durations: Record<string, number> = {}
  for (const v of data.items ?? []) {
    durations[v.id] = parseDurationSeconds(v.contentDetails.duration)
  }

  return candidates.filter((item) => {
    const vid = new URL(item.url).searchParams.get('v') ?? ''
    return (durations[vid] ?? 999) > 180
  })
}

// Fetches the newest items from a manually-ordered playlist by paginating to the end.
// The YouTube API has no reverse-order option, so we must walk all pages.
async function fetchPlaylistItemsLatest(playlistId: string, channelName: string, apiKey: string, limit = 10): Promise<MediaItem[]> {
  let all: YTPlaylistItem[] = []
  let pageToken: string | undefined

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) break
    const data = await res.json()
    all = all.concat(data.items ?? [])
    pageToken = data.nextPageToken
  } while (pageToken)

  // Newest items are at the end of the playlist
  return mapItems(all.slice(-limit), playlistId, channelName)
}

// For uploads playlists (channels), YouTube orders newest-first — just take the first page.
async function fetchPlaylistItemsFirst(playlistId: string, channelName: string, apiKey: string, limit = 10): Promise<MediaItem[]> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${limit}&playlistId=${playlistId}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return mapItems(data.items ?? [], playlistId, channelName)
}

async function fetchPlaylistWithName(playlistId: string, apiKey: string): Promise<MediaItem[]> {
  const pRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  )
  const pData = await pRes.json()
  const name: string = pData.items?.[0]?.snippet?.title ?? 'YouTube'
  return fetchPlaylistItemsLatest(playlistId, name, apiKey)
}

async function fetchChannelByHandle(
  handle: string,
  apiKey: string,
  nameOverride?: string,
  excludeShorts = false,
): Promise<MediaItem[]> {
  const cRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&forHandle=${handle}&key=${apiKey}`,
    { next: { revalidate: 1800 } }
  )
  if (!cRes.ok) return []
  const cData = await cRes.json()
  const channel = cData.items?.[0]
  if (!channel) return []

  const channelName: string = nameOverride ?? channel.snippet.title
  const uploadsId: string = channel.contentDetails.relatedPlaylists.uploads

  // Fetch extra to have enough after Shorts are filtered out
  const fetchLimit = excludeShorts ? 25 : 10
  let items = await fetchPlaylistItemsFirst(uploadsId, channelName, apiKey, fetchLimit)

  if (excludeShorts) {
    items = (await stripShorts(items, apiKey)).slice(0, 10)
  }

  return items
}

// ─── Aggregator ───────────────────────────────────────────────────────────────

export async function fetchAllPtMedia(): Promise<MediaItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY is not set')
    return []
  }

  try {
    const results = await Promise.all([
      ...PT_PLAYLIST_IDS.map((id) => fetchPlaylistWithName(id, apiKey)),
      fetchChannelByHandle(VIKTOR_DORIA_HANDLE, apiKey),
      fetchChannelByHandle(CONNECT_CAST_HANDLE, apiKey, 'Connect Cast', true),
      fetchChannelByHandle(VF_COMUNICA_YT_HANDLE, apiKey, 'VF Comunica', true),
    ])

    return results
      .flat()
      .filter((item) => item.publishedAt.getTime() > 0)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  } catch (error) {
    console.error('Error fetching PT media:', error)
    return []
  }
}
