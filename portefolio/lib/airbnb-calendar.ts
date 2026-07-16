// Reads a public Airbnb listing's availability calendar via the same
// internal GraphQL endpoint the listing page calls when you open the
// "check availability" date picker (PdpAvailabilityCalendar). It's
// unauthenticated (no cookies/login involved) but unofficial, so it depends
// on two values Airbnb can rotate when they redeploy their frontend:
//   - X-Airbnb-API-Key: a public client identifier (not a secret credential)
//   - the persisted-query sha256 hash in the request URL
//
// If the bot starts failing with a "PersistedQueryNotFound"-style error,
// both values need refreshing. To get new ones: open the listing in Chrome,
// DevTools → Network → XHR/Fetch, open the availability calendar popup,
// find the "PdpAvailabilityCalendar" request, and copy the hash from its URL
// and the X-Airbnb-API-Key header from its request headers.
const AIRBNB_API_KEY = process.env.AIRBNB_API_KEY || "d306zoyjsyarp7ifhu67rjxn52tv0t20"
const PERSISTED_QUERY_HASH = process.env.AIRBNB_PERSISTED_QUERY_HASH || "be60714ead0a30db42ce6471ddad6a8f3855df0ed400b79282dd0bb8cecdf201"

export function extractRoomId(listingUrl: string): string | null {
  const match = listingUrl.match(/\/rooms\/(\d+)/)
  return match ? match[1] : null
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function fetchBlockedDates(roomId: string, listingUrl: string): Promise<string[]> {
  let host = "www.airbnb.com"
  try { host = new URL(listingUrl).host } catch { /* fall back to .com */ }

  const now = new Date()
  const variables = {
    request: {
      count: 12,
      listingId: roomId,
      month: now.getUTCMonth() + 1,
      year: now.getUTCFullYear(),
      returnPropertyLevelCalendarIfApplicable: false,
    },
  }
  const extensions = { persistedQuery: { version: 1, sha256Hash: PERSISTED_QUERY_HASH } }

  const url = new URL(`https://${host}/api/v3/PdpAvailabilityCalendar/${PERSISTED_QUERY_HASH}`)
  url.searchParams.set("operationName", "PdpAvailabilityCalendar")
  url.searchParams.set("locale", "pt-PT")
  url.searchParams.set("currency", "EUR")
  url.searchParams.set("variables", JSON.stringify(variables))
  url.searchParams.set("extensions", JSON.stringify(extensions))

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Accept": "*/*",
      "Referer": listingUrl,
      "X-Airbnb-API-Key": AIRBNB_API_KEY,
      "X-CSRF-Without-Token": "1",
    },
    signal: AbortSignal.timeout(20000),
  })

  if (!res.ok) {
    throw new Error(`Airbnb devolveu HTTP ${res.status} ao consultar o calendário`)
  }

  const json = await res.json()

  if (json?.errors?.length) {
    const msg = json.errors[0]?.message ?? "erro desconhecido"
    throw new Error(`Airbnb API: ${msg} (o hash da query ou a API key podem ter expirado — captura um novo pedido de rede)`)
  }

  const months = json?.data?.merlin?.pdpAvailabilityCalendar?.calendarMonths
  if (!Array.isArray(months)) {
    throw new Error("Resposta inesperada da API do Airbnb (a estrutura pode ter mudado)")
  }

  const today = todayIso()
  const blocked: string[] = []
  for (const month of months) {
    for (const day of month?.days ?? []) {
      if (day?.available === false && typeof day.calendarDate === "string" && day.calendarDate >= today) {
        blocked.push(day.calendarDate)
      }
    }
  }

  return blocked.sort()
}

export function buildIcsForBlockedDates(calendarName: string, eventTitle: string, blockedDates: string[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PortefolioPessoal//Airbnb Calendar Sync//PT",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT4H",
    "X-PUBLISHED-TTL:PT4H",
  ]

  const stamp = toIcsDateTime(new Date())

  for (const date of blockedDates) {
    const [y, m, d] = date.split("-")
    const start = `${y}${m}${d}T000000`
    const end = `${y}${m}${d}T001500`
    lines.push(
      "BEGIN:VEVENT",
      // Deterministic UID so re-syncing updates the same event instead of duplicating it.
      `UID:airbnb-busy-${date}@portefoliopessoal`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(eventTitle)}`,
      "DESCRIPTION:Reserva registada no Airbnb",
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    )
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n")
}

function toIcsDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}
