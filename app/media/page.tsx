import { fetchAllMedia, type MediaItem } from '@/lib/media'
import { formatTimeAgo } from '@/lib/utils'
import ArticleImage from '@/components/ArticleImage'

export const revalidate = 1800

const CHANNEL_STYLES: Record<string, string> = {
  'Chewjitsu Podcast': 'bg-orange-700 text-orange-100',
  'Grappling Rewind':  'bg-purple-700 text-purple-100',
  'MMA JiuJitsu':      'bg-red-700 text-red-100',
  'Inside Position':   'bg-teal-700 text-teal-100',
}

function ChannelBadge({ name }: { name: string }) {
  const style = CHANNEL_STYLES[name] ?? 'bg-gray-700 text-gray-100'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${style}`}>
      {name}
    </span>
  )
}


function MediaCard({ item }: { item: MediaItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-600 hover:scale-[1.02] transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-800">
        {item.thumbnailUrl ? (
          <ArticleImage
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallback={<ThumbnailFallback type={item.type} />}
          />
        ) : (
          <ThumbnailFallback type={item.type} />
        )}

        {/* Play / mic overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          {item.type === 'video' ? (
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zm-1 13V8l6 4-6 4z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <ChannelBadge name={item.channelName} />
        </div>

        <h2 className="text-white font-bold text-sm leading-snug line-clamp-3 group-hover:text-blue-200 transition-colors flex-1">
          {item.title}
        </h2>

        <p className="text-gray-500 text-xs mt-3">{formatTimeAgo(item.publishedAt)}</p>
      </div>
    </a>
  )
}

function ThumbnailFallback({ type }: { type: MediaItem['type'] }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
      {type === 'video' ? (
        <svg className="w-10 h-10 text-red-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      ) : (
        <svg className="w-10 h-10 text-teal-700" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zm-1 13V8l6 4-6 4z" />
        </svg>
      )}
    </div>
  )
}

export default async function MediaPage() {
  const items = await fetchAllMedia()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-white text-xl font-black uppercase tracking-wider">Media</h2>
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-sm">{items.length} items</span>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No media available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
