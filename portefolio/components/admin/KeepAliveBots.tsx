"use client"

// portefolio/components/admin/KeepAliveBots.tsx
// Drop this component below <AnalyticsDashboard /> in app/admin/page.tsx

import { useState, useEffect, Fragment } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  Bot, Plus, Trash2, Edit, CheckCircle2, XCircle, Clock,
  RefreshCw, Save, X, Power, PowerOff, ChevronDown, ChevronUp,
  AlertCircle, Eye, EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Use service role on server calls — here we use anon for display,
// the cron API route uses service role to actually run bots.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Bot = {
  id: string
  name: string
  project_url: string
  anon_key: string
  table_name: string
  column_name: string
  is_active: boolean
  last_run_at: string | null
  last_status: "success" | "error" | "never" | null
  last_error: string | null
  created_at: string
}

const EMPTY_FORM = {
  name: "",
  project_url: "",
  anon_key: "",
  table_name: "",
  column_name: "id",
}

function StatusBadge({ status }: { status: Bot["last_status"] }) {
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

export function KeepAliveBots() {
  const [bots, setBots]             = useState<Bot[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [running, setRunning]       = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [showKey, setShowKey]       = useState(false)
  const [msg, setMsg]               = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [expandedError, setExpandedError] = useState<string | null>(null)

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  useEffect(() => { fetchBots() }, [])

  const fetchBots = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("keepalive_bots")
      .select("*")
      .order("created_at", { ascending: false })
    setBots(data ?? [])
    setLoading(false)
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowKey(false)
    setShowForm(true)
  }

  const openEdit = (bot: Bot) => {
    setForm({
      name: bot.name,
      project_url: bot.project_url,
      anon_key: bot.anon_key,
      table_name: bot.table_name,
      column_name: bot.column_name,
    })
    setEditingId(bot.id)
    setShowKey(false)
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditingId(null) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.project_url.trim() || !form.anon_key.trim() || !form.table_name.trim()) {
      flash("err", "Preenche todos os campos obrigatórios.")
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase.from("keepalive_bots").update({
          name: form.name.trim(),
          project_url: form.project_url.trim(),
          anon_key: form.anon_key.trim(),
          table_name: form.table_name.trim(),
          column_name: form.column_name.trim() || "id",
        }).eq("id", editingId)
        if (error) throw error
        flash("ok", "Bot atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("keepalive_bots").insert({
          name: form.name.trim(),
          project_url: form.project_url.trim(),
          anon_key: form.anon_key.trim(),
          table_name: form.table_name.trim(),
          column_name: form.column_name.trim() || "id",
          last_status: "never",
        })
        if (error) throw error
        flash("ok", "Bot criado com sucesso!")
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
    const { error } = await supabase.from("keepalive_bots").delete().eq("id", id)
    if (error) { flash("err", error.message); return }
    flash("ok", "Bot eliminado.")
    fetchBots()
  }

  const toggleActive = async (bot: Bot) => {
    const { error } = await supabase
      .from("keepalive_bots")
      .update({ is_active: !bot.is_active })
      .eq("id", bot.id)
    if (error) { flash("err", error.message); return }
    fetchBots()
  }

  const runNow = async (bot: Bot) => {
    setRunning(bot.id)
    try {
      const res = await fetch("/api/cron/keepalive", {
        headers: process.env.NEXT_PUBLIC_CRON_SECRET
          ? { authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` }
          : {},
      })
      // The cron runs ALL bots — just refresh after
      await fetchBots()
      flash("ok", `Bots executados. Verifica o estado abaixo.`)
    } catch (e: any) {
      flash("err", "Erro ao executar bots.")
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Keepalive Bots</h2>
              <p className="text-slate-500 text-sm">
                Correm às 00:01 todos os dias para manter os projetos Supabase ativos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => { setRunning("all"); fetch("/api/cron/keepalive").then(() => { fetchBots(); setRunning(null); flash("ok", "Bots executados!") }).catch(() => { setRunning(null); flash("err", "Erro ao executar.") }) }}
              variant="outline"
              size="sm"
              disabled={running !== null}
              className="border-slate-300 text-slate-700"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${running ? "animate-spin" : ""}`} />
              Correr agora
            </Button>
            <Button
              onClick={openAdd}
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-violet-700 text-white border-0 shadow-md"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo Bot
            </Button>
          </div>
        </div>
      </div>

      {/* Flash message */}
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

      {/* Add / Edit form */}
      {showForm && (
        <div className="mx-6 mt-4 p-5 bg-slate-50 border-2 border-violet-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">{editingId ? "Editar Bot" : "Novo Bot"}</h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Nome *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Portfolio Keepalive"
                className="h-9 text-sm border-slate-300 focus:border-violet-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">URL do Projeto Supabase *</Label>
              <Input value={form.project_url} onChange={e => setForm(p => ({ ...p, project_url: e.target.value }))}
                placeholder="https://xxx.supabase.co"
                className="h-9 text-sm border-slate-300 focus:border-violet-500" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-700">Anon Key *</Label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={form.anon_key}
                  onChange={e => setForm(p => ({ ...p, anon_key: e.target.value }))}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="h-9 text-sm border-slate-300 focus:border-violet-500 pr-10 font-mono"
                />
                <button onClick={() => setShowKey(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">Encontras em Supabase → Project Settings → API → anon public key</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Tabela *</Label>
              <Input value={form.table_name} onChange={e => setForm(p => ({ ...p, table_name: e.target.value }))}
                placeholder="Ex: profiles"
                className="h-9 text-sm border-slate-300 focus:border-violet-500" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Coluna</Label>
              <Input value={form.column_name} onChange={e => setForm(p => ({ ...p, column_name: e.target.value }))}
                placeholder="id"
                className="h-9 text-sm border-slate-300 focus:border-violet-500" />
              <p className="text-xs text-slate-400">Qualquer coluna existente (padrão: id)</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={closeForm}>Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="bg-gradient-to-r from-violet-600 to-violet-700 text-white border-0">
              {saving ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />A guardar...</>
                       : <><Save className="w-3.5 h-3.5 mr-1.5" />Guardar</>}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-6 sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum bot configurado ainda.</p>
            <Button size="sm" onClick={openAdd} className="mt-4 bg-violet-600 text-white">
              <Plus className="w-4 h-4 mr-1.5" />Criar primeiro bot
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Projeto</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tabela / Coluna</th>
                  <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Último run</th>
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
                        <span className="text-slate-500 text-xs font-mono truncate max-w-[160px] block">
                          {bot.project_url.replace("https://", "").replace(".supabase.co", "")}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                          {bot.table_name}.{bot.column_name}
                        </span>
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
                    {/* Error expandable row */}
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
      <div className="px-6 sm:px-8 pb-4 text-xs text-slate-400">
        Cron configurado para correr às <strong>00:01</strong> todos os dias via Vercel Cron.
        Certifica-te que <code className="bg-slate-100 px-1 rounded">CRON_SECRET</code> está definido no Vercel.
      </div>
    </div>
  )
}
