// portefolio/app/api/trip-calendar/[token]/route.ts
// Public endpoint the iPhone's "Add Subscribed Calendar" feature polls.
// Fetches the 5 day-tabs live from Google Sheets on every request (no DB,
// no cron) and builds the .ics on the fly. The token is a fixed shared
// secret (not per-user, not DB-backed) — just enough that the URL isn't
// guessable, since the itinerary has names/notes in it. Shared with the
// admin display card via lib/trip-calendar-config so they can't drift.

import { NextResponse } from "next/server"
import { buildTripCalendarIcs } from "@/lib/trip-calendar"
import { TRIP_CALENDAR_TOKEN } from "@/lib/trip-calendar-config"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (token !== TRIP_CALENDAR_TOKEN) {
    return new NextResponse("Not found", { status: 404 })
  }

  try {
    const ics = await buildTripCalendarIcs()
    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="viagem-itinerario.ics"',
        "Cache-Control": "public, max-age=1800",
      },
    })
  } catch (err: any) {
    console.error("[trip-calendar] Failed to build ICS:", err?.message)
    return new NextResponse(`Erro ao gerar calendário: ${err?.message ?? "erro desconhecido"}`, { status: 500 })
  }
}
