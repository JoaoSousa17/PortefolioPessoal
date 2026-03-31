// app/api/analytics/route.ts
import { NextResponse } from "next/server"
import { fetchAnalyticsData } from "@/lib/analytics"

// Simple in-memory cache so we don't hammer the GA4 API on every page visit
let cache: { data: any; ts: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000  // 5 minutes

export async function GET() {
  try {
    const now = Date.now()
    if (cache && now - cache.ts < CACHE_TTL_MS) {
      return NextResponse.json({ data: cache.data, cached: true })
    }

    const data = await fetchAnalyticsData(30)
    cache = { data, ts: now }
    return NextResponse.json({ data, cached: false })
  } catch (err: any) {
    console.error("Analytics API error:", err)
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}