// portefolio/app/api/cron/airbnb-sync/route.ts
// Called by Vercel Cron once a day (and on-demand from the admin dashboard).
// For each active Airbnb Calendar Sync bot, scrapes the public listing page
// for blocked nights and regenerates the cached .ics feed the iPhone
// subscribes to (see /api/airbnb-calendar/[token]).

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { fetchBlockedDates, buildIcsForBlockedDates } from "@/lib/airbnb-calendar"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: bots, error } = await supabase
    .from("airbnb_calendar_bots")
    .select("*")
    .eq("is_active", true)

  if (error) {
    console.error("[airbnb-sync] Failed to fetch bots:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: { id: string; name: string; status: string; nights?: number; error?: string }[] = []

  for (const bot of bots ?? []) {
    try {
      const blockedDates = await fetchBlockedDates(bot.room_id)
      const ics = buildIcsForBlockedDates(`Airbnb - ${bot.name}`, bot.event_title || "Casa Ocupada", blockedDates)

      await supabase
        .from("airbnb_calendar_bots")
        .update({
          cached_ics: ics,
          blocked_dates: blockedDates,
          last_run_at: new Date().toISOString(),
          last_status: "success",
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bot.id)

      results.push({ id: bot.id, name: bot.name, status: "success", nights: blockedDates.length })
    } catch (err: any) {
      const msg = err?.message ?? "Unknown error"

      await supabase
        .from("airbnb_calendar_bots")
        .update({
          last_run_at: new Date().toISOString(),
          last_status: "error",
          last_error: msg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bot.id)

      results.push({ id: bot.id, name: bot.name, status: "error", error: msg })
      console.error(`[airbnb-sync] Bot "${bot.name}" failed:`, msg)
    }
  }

  console.log("[airbnb-sync] Run complete:", results)
  return NextResponse.json({ ran: results.length, results })
}
