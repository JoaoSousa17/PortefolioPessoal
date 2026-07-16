// Best-effort scraper for a public Airbnb listing's availability calendar.
//
// There is no official public API for this (the real iCal export needs the
// host's account), so this reads the same JSON payload the listing page
// embeds for its own booking widget. Airbnb changes this markup from time to
// time — if the bot starts failing, open the listing in a browser, view the
// page source, and check that a `<script type="application/json">` blob
// still contains day objects shaped like { calendarDate/date, available }.

const DATE_KEYS = ["calendarDate", "date", "day"]
const AVAILABLE_KEYS = ["available", "availableForCheckin", "availableForCheckout", "bookable"]
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function extractRoomId(listingUrl: string): string | null {
  const match = listingUrl.match(/\/rooms\/(\d+)/)
  return match ? match[1] : null
}

function walkForCalendarDays(node: unknown, out: Map<string, boolean>, depth = 0) {
  if (depth > 40 || node === null || typeof node !== "object") return

  if (Array.isArray(node)) {
    for (const item of node) walkForCalendarDays(item, out, depth + 1)
    return
  }

  const obj = node as Record<string, unknown>

  let date: string | null = null
  for (const key of DATE_KEYS) {
    const val = obj[key]
    if (typeof val === "string" && DATE_RE.test(val)) { date = val; break }
  }

  if (date) {
    for (const key of AVAILABLE_KEYS) {
      if (typeof obj[key] === "boolean") {
        // Only the first match wins per date so later, less-specific
        // objects in the payload don't overwrite a confirmed value.
        if (!out.has(date)) out.set(date, obj[key] as boolean)
        break
      }
    }
  }

  for (const key in obj) walkForCalendarDays(obj[key], out, depth + 1)
}

function extractJsonBlobs(html: string): unknown[] {
  const blobs: unknown[] = []
  const scriptRe = /<script[^>]+type="application\/json"[^>]*>([\s\S]*?)<\/script>/g
  let match: RegExpExecArray | null
  while ((match = scriptRe.exec(html)) !== null) {
    try {
      blobs.push(JSON.parse(match[1]))
    } catch {
      // Not valid standalone JSON (or truncated) — skip it.
    }
  }
  return blobs
}

export async function fetchBlockedDates(roomId: string): Promise<string[]> {
  const url = `https://www.airbnb.com/rooms/${roomId}`
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    // Airbnb's PDP is heavy — give it real time to arrive.
    signal: AbortSignal.timeout(20000),
  })

  if (!res.ok) {
    throw new Error(`Airbnb devolveu HTTP ${res.status} ao carregar o anúncio`)
  }

  const html = await res.text()
  const blobs = extractJsonBlobs(html)
  if (blobs.length === 0) {
    throw new Error("Não foi possível encontrar dados estruturados na página do anúncio (o Airbnb pode ter mudado o layout)")
  }

  const days = new Map<string, boolean>()
  for (const blob of blobs) walkForCalendarDays(blob, days)

  if (days.size === 0) {
    throw new Error("Dados encontrados na página, mas nenhum calendário de disponibilidade (o Airbnb pode ter mudado a estrutura)")
  }

  const blocked = [...days.entries()]
    .filter(([, available]) => available === false)
    .map(([date]) => date)
    .sort()

  return blocked
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
