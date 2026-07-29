// portefolio/app/api/cron/sheets-sync/route.ts
// Called by Vercel Cron once a day (and on-demand from the admin dashboard).
// For each active Sheets Calendar Sync bot, reads its configured tabs from
// the public Google Sheets CSV export and regenerates the cached .ics feed
// the iPhone subscribes to (see /api/sheets-calendar/[token]).

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { fetchSheetEvents, buildIcsForEvents, type SheetEvent } from "@/lib/sheets-calendar"

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
    .from("sheets_calendar_bots")
    .select("*")
    .eq("is_active", true)

  if (error) {
    console.error("[sheets-sync] Failed to fetch bots:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results: { id: string; name: string; status: string; events?: number; error?: string }[] = []

  for (const bot of bots ?? []) {
    try {
      const sheetNames: string[] = Array.isArray(bot.sheet_names) ? bot.sheet_names : []
      const allEvents: SheetEvent[] = []
      for (const sheetName of sheetNames) {
        const events = await fetchSheetEvents(bot.spreadsheet_id, sheetName, bot.year)
        allEvents.push(...events)
      }

      const ics = buildIcsForEvents(bot.name, allEvents)

      await supabase
        .from("sheets_calendar_bots")
        .update({
          cached_ics: ics,
          event_count: allEvents.length,
          last_run_at: new Date().toISOString(),
          last_status: "success",
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bot.id)

      results.push({ id: bot.id, name: bot.name, status: "success", events: allEvents.length })
    } catch (err: any) {
      const msg = err?.message ?? "Unknown error"

      await supabase
        .from("sheets_calendar_bots")
        .update({
          last_run_at: new Date().toISOString(),
          last_status: "error",
          last_error: msg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bot.id)

      results.push({ id: bot.id, name: bot.name, status: "error", error: msg })
      console.error(`[sheets-sync] Bot "${bot.name}" failed:`, msg)
    }
  }

  console.log("[sheets-sync] Run complete:", results)
  return NextResponse.json({ ran: results.length, results })
}
