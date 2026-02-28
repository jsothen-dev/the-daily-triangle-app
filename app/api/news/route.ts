import { NextResponse } from 'next/server'
import { aggregateArticles } from '@/lib/aggregator'

export const revalidate = 1800 // 30 minutes

export async function GET() {
  try {
    const articles = await aggregateArticles()
    // Serialize dates as ISO strings for JSON transport
    const serialized = articles.map((a) => ({
      ...a,
      publishedAt: a.publishedAt.toISOString(),
    }))
    return NextResponse.json(serialized)
  } catch (error) {
    console.error('API /news error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
