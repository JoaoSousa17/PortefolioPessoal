"use client"

// portefolio/components/admin/SheetsCalendarBot.tsx
// Drop this component below <AirbnbCalendarBot /> in app/admin/page.tsx

import { useState, useEffect, Fragment } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  Sheet, Plus, Trash2, Edit, CheckCircle2, XCircle, Clock,
  RefreshCw, Save, X, Power, PowerOff, ChevronDown, ChevronUp,
  AlertCircle, Copy, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SheetsBot = {
  id: string
  name: string
  spreadsheet_id: string
  sheet_names: string[]
  year: number
  public_token: string
  is_active: boolean
  event_count: number
  last_run_at: string | null
  last_status: "success" | "error" | "never" | null
  last_error: string | null
  created_at: string
}

const EMPTY_FORM = {
  name: "",
  spreadsheet_input: "",
  sheet_names: "",
  year: new Date().getFullYear().toString(),
}

function extractSpreadsheetId(input: string): string | null {
  const urlMatch = input.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (urlMatch) return urlMatch[1]
  if (/^[a-zA-Z0-9-_]{20,}$/.test(input.trim())) return input.trim()
  return null
}

function generateToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "")
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

function StatusBadge({ status }: { status: SheetsBot["last_status"] }) {
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

export function SheetsCalendarBot() {
  const [bots, setBots]             = useState<SheetsBot[]>([])
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
      .from("sheets_calendar_bots")
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

  const openEdit = (bot: SheetsBot) => {
    setForm({
      name: bot.name,
      spreadsheet_input: bot.spreadsheet_id,
      sheet_names: bot.sheet_names.join("\n"),
      year: bot.year.toString(),
    })
    setEditingId(bot.id)
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditingId(null) }

  const handleSave = async () => {
    const sheetNames = form.sheet_names.split("\n").map(s => s.trim()).filter(Boolean)
    const year = parseInt(form.year, 10)

    if (!form.name.trim() || !form.spreadsheet_input.trim() || sheetNames.length === 0 || !year) {
      flash("err", "Preenche todos os campos obrigatórios.")
      return
    }
    const spreadsheetId = extractSpreadsheetId(form.spreadsheet_input.trim())
    if (!spreadsheetId) {
      flash("err", "Não foi possível encontrar o ID da folha (cola o URL completo ou só o ID).")
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase.from("sheets_calendar_bots").update({
          name: form.name.trim(),
          spreadsheet_id: spreadsheetId,
          sheet_names: sheetNames,
          year,
          updated_at: new Date().toISOString(),
        }).eq("id", editingId)
        if (error) throw error
        flash("ok", "Bot atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("sheets_calendar_bots").insert({
          name: form.name.trim(),
          spreadsheet_id: spreadsheetId,
          sheet_names: sheetNames,
          year,
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
    const { error } = await supabase.from("sheets_calendar_bots").delete().eq("id", id)
    if (error) { flash("err", error.message); return }
    flash("ok", "Bot eliminado.")
    fetchBots()
  }

  const toggleActive = async (bot: SheetsBot) => {
    const { error } = await supabase
      .from("sheets_calendar_bots")
      .update({ is_active: !bot.is_active })
      .eq("id", bot.id)
    if (error) { flash("err", error.message); return }
    fetchBots()
  }

  const runAll = async () => {
    setRunning("all")
    try {
      await fetch("/api/cron/sheets-sync")
      await fetchBots()
      flash("ok", "Sincronização executada. Verifica o estado abaixo.")
    } catch {
      flash("err", "Erro ao sincronizar.")
    } finally {
      setRunning(null)
    }
  }

  const copyUrl = (bot: SheetsBot) => {
    const url = `${window.location.origin}/api/sheets-calendar/${bot.public_token}`
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg">
              <Sheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Sheets Calendar Sync</h2>
              <p className="text-slate-500 text-sm">
                Lê itinerários de folhas Google Sheets públicas e gera um calendário subscrevível (.ics)
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
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Itinerário
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
        <div className="mx-6 mt-4 p-5 bg-slate-50 border-2 border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">{editingId ? "Editar Itinerário" : "Novo Itinerário"}</h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Nome *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Viagem Agosto 2026"
                className="h-9 text-sm border-slate-300 focus:border-emerald-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Ano *</Label>
              <Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                placeholder="2026"
                className="h-9 text-sm border-slate-300 focus:border-emerald-500" />
              <p className="text-xs text-slate-400">Usado quando as células só têm hora (sem data).</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">URL ou ID da Google Sheet *</Label>
              <Input value={form.spreadsheet_input} onChange={e => setForm(p => ({ ...p, spreadsheet_input: e.target.value }))}
                placeholder="https://docs.google.com/spreadsheets/d/1e0hUOh.../edit"
                className="h-9 text-sm border-slate-300 focus:border-emerald-500" />
              <p className="text-xs text-slate-400">A folha tem de estar partilhada como &quot;Qualquer pessoa com o link pode ver&quot;.</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">Nomes das folhas (uma por linha) *</Label>
              <Textarea value={form.sheet_names} onChange={e => setForm(p => ({ ...p, sheet_names: e.target.value }))}
                placeholder={"DAY 11 - August 3\nDAY 12 - August 4\nDAY 13 - August 5"}
                rows={5}
                className="text-sm border-slate-300 focus:border-emerald-500 font-mono" />
              <p className="text-xs text-slate-400">Nome exato de cada separador (tab) a ler.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={closeForm}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0">
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
            <Sheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum itinerário configurado ainda.</p>
            <Button size="sm" onClick={openAdd} className="mt-4 bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-1.5" />Adicionar itinerário
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Folhas</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Eventos</th>
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
                        <span className="text-slate-700 text-xs font-semibold">{bot.sheet_names?.length ?? 0}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-700 text-xs font-semibold">{bot.event_count ?? 0}</span>
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
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
