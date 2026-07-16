"use client"

// portefolio/components/admin/AirbnbCalendarBot.tsx
// Drop this component below <KeepAliveBots /> in app/admin/page.tsx

import { useState, useEffect, Fragment } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  CalendarClock, Plus, Trash2, Edit, CheckCircle2, XCircle, Clock,
  RefreshCw, Save, X, Power, PowerOff, ChevronDown, ChevronUp,
  AlertCircle, Copy, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type AirbnbBot = {
  id: string
  name: string
  listing_url: string
  room_id: string
  public_token: string
  event_title: string
  is_active: boolean
  blocked_dates: string[] | null
  last_run_at: string | null
  last_status: "success" | "error" | "never" | null
  last_error: string | null
  created_at: string
}

const EMPTY_FORM = {
  name: "",
  listing_url: "",
  event_title: "Casa Ocupada",
}

function extractRoomId(url: string): string | null {
  const match = url.match(/\/rooms\/(\d+)/)
  return match ? match[1] : null
}

function generateToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "")
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

function StatusBadge({ status }: { status: AirbnbBot["last_status"] }) {
  if (!status || status === "never")
    return <span className="flex items-center gap-1 text-xs text-slate-400 font-medium"><Clock className="w-3 h-3" />Nunca correu</span>
  if (status === "success")
    return <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle2 className="w-3 h-3" />OK</span>
  return <span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><XCircle className="w-3 h-3" />Erro</span>
}

function formatDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export function AirbnbCalendarBot() {
  const [bots, setBots]             = useState<AirbnbBot[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [running, setRunning]       = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [msg, setMsg]               = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [expandedError, setExpandedError] = useState<string | null>(null)
  const [copiedId, setCopiedId]     = useState<string | null>(null)

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  useEffect(() => { fetchBots() }, [])

  const fetchBots = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("airbnb_calendar_bots")
      .select("*")
      .order("created_at", { ascending: false })
    setBots(data ?? [])
    setLoading(false)
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (bot: AirbnbBot) => {
    setForm({
      name: bot.name,
      listing_url: bot.listing_url,
      event_title: bot.event_title,
    })
    setEditingId(bot.id)
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditingId(null) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.listing_url.trim()) {
      flash("err", "Preenche todos os campos obrigatórios.")
      return
    }
    const roomId = extractRoomId(form.listing_url.trim())
    if (!roomId) {
      flash("err", "Não foi possível encontrar o ID do anúncio no URL (formato esperado: .../rooms/12345678).")
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase.from("airbnb_calendar_bots").update({
          name: form.name.trim(),
          listing_url: form.listing_url.trim(),
          room_id: roomId,
          event_title: form.event_title.trim() || "Casa Ocupada",
          updated_at: new Date().toISOString(),
        }).eq("id", editingId)
        if (error) throw error
        flash("ok", "Bot atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("airbnb_calendar_bots").insert({
          name: form.name.trim(),
          listing_url: form.listing_url.trim(),
          room_id: roomId,
          event_title: form.event_title.trim() || "Casa Ocupada",
          public_token: generateToken(),
          last_status: "never",
        })
        if (error) throw error
        flash("ok", "Bot criado! Corre-o uma vez para gerar o calendário.")
      }
      closeForm()
      fetchBots()
    } catch (e: any) {
      flash("err", e.message ?? "Erro ao guardar bot.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar o bot "${name}"?`)) return
    const { error } = await supabase.from("airbnb_calendar_bots").delete().eq("id", id)
    if (error) { flash("err", error.message); return }
    flash("ok", "Bot eliminado.")
    fetchBots()
  }

  const toggleActive = async (bot: AirbnbBot) => {
    const { error } = await supabase
      .from("airbnb_calendar_bots")
      .update({ is_active: !bot.is_active })
      .eq("id", bot.id)
    if (error) { flash("err", error.message); return }
    fetchBots()
  }

  const runAll = async () => {
    setRunning("all")
    try {
      await fetch("/api/cron/airbnb-sync")
      await fetchBots()
      flash("ok", "Sincronização executada. Verifica o estado abaixo.")
    } catch {
      flash("err", "Erro ao sincronizar.")
    } finally {
      setRunning(null)
    }
  }

  const copyUrl = (bot: AirbnbBot) => {
    const url = `${window.location.origin}/api/airbnb-calendar/${bot.public_token}`
    navigator.clipboard.writeText(url)
    setCopiedId(bot.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Airbnb Calendar Sync</h2>
              <p className="text-slate-500 text-sm">
                Lê as noites ocupadas do anúncio público e gera um calendário subscrevível (.ics)
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runAll}
              variant="outline"
              size="sm"
              disabled={running !== null}
              className="border-slate-300 text-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${running ? "animate-spin" : ""}`} />
              Sincronizar agora
            </Button>
            <Button
              onClick={openAdd}
              size="sm"
              className="bg-gradient-to-r from-rose-600 to-rose-700 text-white border-0 shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Alojamento
            </Button>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`mx-6 mt-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in ${
          msg.type === "ok"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="mx-6 mt-4 p-5 bg-slate-50 border-2 border-rose-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">{editingId ? "Editar Alojamento" : "Novo Alojamento"}</h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Nome *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Apartamento Lisboa"
                className="h-9 text-sm border-slate-300 focus:border-rose-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Título do evento</Label>
              <Input value={form.event_title} onChange={e => setForm(p => ({ ...p, event_title: e.target.value }))}
                placeholder="Casa Ocupada"
                className="h-9 text-sm border-slate-300 focus:border-rose-500" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">URL do anúncio Airbnb *</Label>
              <Input value={form.listing_url} onChange={e => setForm(p => ({ ...p, listing_url: e.target.value }))}
                placeholder="https://www.airbnb.pt/rooms/24624490"
                className="h-9 text-sm border-slate-300 focus:border-rose-500" />
              <p className="text-xs text-slate-400">O link público do anúncio (não precisa de login).</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={closeForm}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="bg-gradient-to-r from-rose-600 to-rose-700 text-white border-0">
              {saving ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />A guardar...</>
                       : <><Save className="w-3.5 h-3.5 mr-1.5" />Guardar</>}
            </Button>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-12">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum alojamento configurado ainda.</p>
            <Button size="sm" onClick={openAdd} className="mt-4 bg-rose-600 text-white">
              <Plus className="w-4 h-4 mr-1.5" />Adicionar alojamento
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Room ID</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Noites ocupadas</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Última sync</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ativo</th>
                  <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bots.map(bot => (
                  <Fragment key={bot.id}>
                    <tr className={`hover:bg-slate-50 transition-colors ${!bot.is_active ? "opacity-50" : ""}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            bot.last_status === "success" ? "bg-emerald-400" :
                            bot.last_status === "error"   ? "bg-red-400" : "bg-slate-300"
                          }`} />
                          <span className="font-semibold text-slate-900">{bot.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                          {bot.room_id}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-700 text-xs font-semibold">{bot.blocked_dates?.length ?? 0}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-slate-500">{formatDate(bot.last_run_at)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <StatusBadge status={bot.last_status} />
                          {bot.last_status === "error" && bot.last_error && (
                            <button
                              onClick={() => setExpandedError(expandedError === bot.id ? null : bot.id)}
                              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 mt-0.5"
                            >
                              {expandedError === bot.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              Ver erro
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button onClick={() => toggleActive(bot)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            bot.is_active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}>
                          {bot.is_active ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => copyUrl(bot)}
                            title="Copiar URL de subscrição"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                            {copiedId === bot.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => openEdit(bot)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(bot.id, bot.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedError === bot.id && bot.last_error && (
                      <tr>
                        <td colSpan={7} className="px-3 pb-3">
                          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-700 font-mono">
                            {bot.last_error}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-8 pb-4 text-xs text-slate-400 space-y-1">
        <p>
          Cron configurado para correr diariamente via Vercel Cron. Certifica-te que{" "}
          <code className="bg-slate-100 px-1 rounded">CRON_SECRET</code> está definido no Vercel.
        </p>
        <p>
          No iPhone: Definições → Calendário → Contas → Adicionar conta → Outra → Adicionar calendário assinado,
          e cola o URL copiado com o botão <Copy className="w-3 h-3 inline -mt-0.5" /> acima.
        </p>
      </div>
    </div>
  )
}
