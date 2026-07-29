"use client"

// portefolio/components/admin/TripCalendarBot.tsx
// Drop this component below <AirbnbCalendarBot /> in app/admin/page.tsx
//
// Unlike the other bots this one is fully hardcoded (spreadsheet, sheets,
// token, expiry all live in lib/trip-calendar*.ts) — no database, no CRUD.
// This card just surfaces the subscription link so it doesn't have to be
// dug out of the code every time.

import { useState } from "react"
import { CalendarClock, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TRIP_CALENDAR_TOKEN, TRIP_CALENDAR_EXPIRES_ON } from "@/lib/trip-calendar-config"

const PATH = `/api/trip-calendar/${TRIP_CALENDAR_TOKEN}`

export function TripCalendarBot() {
  const [copied, setCopied] = useState(false)
  // Safe to read window here: the parent admin page only mounts this
  // component client-side after its own `mounted` gate, so this never
  // renders during SSR.
  const [origin] = useState(() => window.location.origin)
  const isExpired = new Date().toISOString().slice(0, 10) >= TRIP_CALENDAR_EXPIRES_ON

  const copyUrl = () => {
    navigator.clipboard.writeText(`${origin}${PATH}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Trip Calendar Sync</h2>
              <p className="text-slate-500 text-sm">
                Itinerário da viagem (Google Sheets) — sem base de dados, gerado ao vivo em cada pedido
              </p>
            </div>
          </div>
          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isExpired
              ? "bg-slate-100 text-slate-500 border-slate-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isExpired ? "bg-slate-400" : "bg-emerald-500 animate-pulse"}`} />
            {isExpired ? "Expirado" : "Ativo"}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-1.5">URL de subscrição (iPhone)</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 truncate">
              {origin}{PATH}
            </code>
            <Button
              onClick={copyUrl}
              size="sm"
              variant="outline"
              className="border-slate-300 text-slate-700 flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
            <Button asChild size="sm" variant="outline" className="border-slate-300 text-slate-700 flex-shrink-0">
              <a href={PATH} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Testar
              </a>
            </Button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Ativo até {new Date(TRIP_CALENDAR_EXPIRES_ON).toLocaleDateString("pt-PT")} — a partir dessa data devolve um calendário vazio automaticamente.
          No iPhone: Definições → Calendário → Contas → Adicionar conta → Outra → Adicionar calendário assinado, cola o link acima.
        </p>
      </div>
    </div>
  )
}
