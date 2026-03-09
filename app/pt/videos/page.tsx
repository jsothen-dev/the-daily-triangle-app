import { fetchAllPtMedia } from '@/lib/media-pt'
import { type MediaItem } from '@/lib/media'
import { formatTimeAgo } from '@/lib/utils'
import ArticleImage from '@/components/ArticleImage'

export const revalidate = 1800

function ChannelBadge({ name }: { name: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide bg-gray-700 text-gray-100">
      {name}
    </span>
  )
}

function ThumbnailFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
      <svg className="w-10 h-10 text-red-700" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
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
            fallback={<ThumbnailFallback />}
          />
        ) : (
          <ThumbnailFallback />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 mb-3">
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

export default async function PtVideosPage() {
  const items = await fetchAllPtMedia()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-white text-xl font-black uppercase tracking-wider">Vídeos</h2>
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-sm">{items.length} vídeos</span>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Nenhum vídeo disponível no momento.</p>
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
