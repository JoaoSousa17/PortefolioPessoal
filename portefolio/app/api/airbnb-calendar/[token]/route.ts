// portefolio/app/api/airbnb-calendar/[token]/route.ts
// Public endpoint the iPhone's "Add Subscribed Calendar" feature polls.
// No login is possible here (that's the whole premise of this bot), so the
// unguessable per-bot token stands in as the access control instead of auth.

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: bot, error } = await supabase
    .from("airbnb_calendar_bots")
    .select("cached_ics, is_active")
    .eq("public_token", token)
    .single()

  if (error || !bot || !bot.is_active || !bot.cached_ics) {
    return new NextResponse("Calendar not found", { status: 404 })
  }

  return new NextResponse(bot.cached_ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="airbnb-calendar.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  })
}
