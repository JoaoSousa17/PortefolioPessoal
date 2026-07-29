// Reads itinerary rows from public Google Sheets tabs (via the gviz CSV
// export, no Apps Script / API key needed) and turns them into an .ics feed.
//
// Fixed column layout (row 1 = header, data starts row 2):
//   B (index 1) = start date/time
//   C (index 2) = end date/time
//   E (index 4) = event name (SUMMARY)
//   F (index 5) = notes / people (DESCRIPTION)
//
// Each sheet tab is expected to carry a specific day in its name (e.g.
// "DAY 11 - August 3"). If a start/end cell only contains a time (no date —
// common when a spreadsheet has one tab per day), the date is taken from
// that sheet's name combined with the bot's configured year.

const COL_START = 1
const COL_END = 2
const COL_SUMMARY = 4
const COL_DESCRIPTION = 5

const MONTH_NAMES: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

export type SheetEvent = {
  uid: string
  summary: string
  description: string
  start: DateParts
  end: DateParts
}

type DateParts = { year: number; month: number; day: number; hour: number; minute: number; second: number }

export function extractSpreadsheetId(input: string): string | null {
  const urlMatch = input.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (urlMatch) return urlMatch[1]
  if (/^[a-zA-Z0-9-_]{20,}$/.test(input.trim())) return input.trim()
  return null
}

// Minimal RFC 4180 CSV parser: handles quoted fields, embedded commas,
// escaped quotes ("") and quoted newlines - which Google's gviz CSV uses.
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field); field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field); field = ""
      rows.push(row); row = []
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }

  return rows.filter(r => r.some(cell => cell.trim() !== ""))
}

function extractDayFromSheetName(sheetName: string): { month: number; day: number } | null {
  const match = sheetName.match(/([A-Za-z]+)\s+(\d{1,2})\s*$/)
  if (!match) return null
  const month = MONTH_NAMES[match[1].toLowerCase()]
  if (!month) return null
  const day = parseInt(match[2], 10)
  if (day < 1 || day > 31) return null
  return { month, day }
}

// Accepts either a full date+time string ("8/3/2026 14:00:00", ISO, etc.)
// or a time-only string ("14:00", "14:00:00", "2:00 PM"), in which case it
// falls back to the day parsed from the sheet's tab name + the bot's year.
function parseCellDateTime(raw: string, fallbackDay: { month: number; day: number } | null, year: number): DateParts | null {
  const value = raw.trim()
  if (!value) return null

  const timeOnly = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/)
  if (timeOnly && fallbackDay) {
    let hour = parseInt(timeOnly[1], 10)
    const minute = parseInt(timeOnly[2], 10)
    const second = timeOnly[3] ? parseInt(timeOnly[3], 10) : 0
    const meridiem = timeOnly[4]?.toLowerCase()
    if (meridiem === "pm" && hour < 12) hour += 12
    if (meridiem === "am" && hour === 12) hour = 0
    return { year, month: fallbackDay.month, day: fallbackDay.day, hour, minute, second }
  }

  const parsed = new Date(value)
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1971) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
      hour: parsed.getHours(),
      minute: parsed.getMinutes(),
      second: parsed.getSeconds(),
    }
  }

  return null
}

export async function fetchSheetEvents(spreadsheetId: string, sheetName: string, year: number): Promise<SheetEvent[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })

  if (!res.ok) {
    throw new Error(`Google Sheets devolveu HTTP ${res.status} para a folha "${sheetName}" (confirma que está partilhada como "Qualquer pessoa com o link pode ver")`)
  }

  const text = await res.text()
  if (text.trim().startsWith("<")) {
    throw new Error(`A folha "${sheetName}" não devolveu CSV (provavelmente não está publicamente acessível)`)
  }

  const rows = parseCsv(text).slice(1) // skip header row
  const fallbackDay = extractDayFromSheetName(sheetName)

  const events: SheetEvent[] = []
  rows.forEach((row, i) => {
    const summary = (row[COL_SUMMARY] ?? "").trim()
    const description = (row[COL_DESCRIPTION] ?? "").trim()
    const rawStart = row[COL_START] ?? ""
    const rawEnd = row[COL_END] ?? ""
    if (!summary || !rawStart.trim() || !rawEnd.trim()) return

    const start = parseCellDateTime(rawStart, fallbackDay, year)
    const end = parseCellDateTime(rawEnd, fallbackDay, year)
    if (!start || !end) return

    events.push({
      uid: `sheet-${spreadsheetId}-${sheetName}-${i}`.replace(/[^a-zA-Z0-9-]/g, "_"),
      summary,
      description,
      start,
      end,
    })
  })

  return events
}

function pad(n: number, len = 2): string {
  return n.toString().padStart(len, "0")
}

function formatFloatingDateTime(d: DateParts): string {
  return `${d.year}${pad(d.month)}${pad(d.day)}T${pad(d.hour)}${pad(d.minute)}${pad(d.second)}`
}

export function buildIcsForEvents(calendarName: string, events: SheetEvent[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PortefolioPessoal//Sheets Calendar Sync//PT",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT4H",
    "X-PUBLISHED-TTL:PT4H",
  ]

  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  for (const ev of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.uid}@portefoliopessoal`,
      `DTSTAMP:${stamp}`,
      // Floating (no timezone) local time — these are wall-clock itinerary
      // times, not tied to a specific timezone/offset.
      `DTSTART:${formatFloatingDateTime(ev.start)}`,
      `DTEND:${formatFloatingDateTime(ev.end)}`,
      `SUMMARY:${escapeIcsText(ev.summary)}`,
      ...(ev.description ? [`DESCRIPTION:${escapeIcsText(ev.description)}`] : []),
      "STATUS:CONFIRMED",
      "END:VEVENT",
    )
  }

  lines.push("END:VCALENDAR")
  return lines.join("\r\n")
}

function escapeIcsText(text: string): string {
  return text.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n")
}
