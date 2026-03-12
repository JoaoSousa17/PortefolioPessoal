"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Loader2, 
  Languages as LanguagesIcon,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Flag,
  Languages
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

// ─── Locales ──────────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
]

const TRANSLATABLE_FIELDS = ["_name", "info"] as const
type TranslatableField = typeof TRANSLATABLE_FIELDS[number]

// ─── Types ────────────────────────────────────────────────────────────────────

type LangTranslation = {
  _name?: string
  info?: string
}

type Language = {
  id: string
  _name: string
  flag_url: string | null
  _level: number | null
  info: string | null
  translations?: Record<string, LangTranslation> | null
}

type EditingLanguage = {
  id: string
  flag_url: string
  _level: number
  translations: Record<string, LangTranslation>
}

type NewLanguage = {
  flag_url: string
  _level: number
  translations: Record<string, LangTranslation>
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function LocaleBadge({ locale }: { locale: string }) {
  if (locale === "en")
    return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
  return <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
}

function FallbackHint({ locale, baseValue }: { locale: string; baseValue?: string }) {
  if (locale === "en" || !baseValue) return null
  return (
    <p className="text-xs text-slate-400 truncate">
      🇬🇧 Base: <span className="italic">{baseValue}</span>
    </p>
  )
}

function LocaleSelector({
  active,
  onChange,
  fillCount,
}: {
  active: string
  onChange: (lc: string) => void
  fillCount: (lc: string) => number
}) {
  return (
    <div className="mb-6 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-4 h-4 text-pink-600" />
        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
        <span className="text-xs text-slate-500 ml-1">— nome e info variam por idioma</span>
      </div>
      <div className="flex gap-2">
        {LOCALES.map(l => {
          const count   = fillCount(l.code)
          const isActive = active === l.code
          return (
            <button
              key={l.code}
              onClick={() => onChange(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                isActive
                  ? "bg-pink-600 text-white border-pink-600 shadow"
                  : "bg-white text-slate-700 border-slate-200 hover:border-pink-400"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? "bg-white/25 text-white" : count > 0 ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-400"
              }`}>
                {count}/{TRANSLATABLE_FIELDS.length}
              </span>
            </button>
          )
        })}
      </div>
      {active !== "en" && (
        <p className="text-xs text-slate-500 mt-2">
          Campos vazios usam os valores em Inglês como fallback.
        </p>
      )}
    </div>
  )
}

function InlineLocaleSelector({
  active,
  onChange,
  fillCount,
}: {
  active: string
  onChange: (lc: string) => void
  fillCount: (lc: string) => number
}) {
  return (
    <div className="flex gap-1.5">
      {LOCALES.map(l => {
        const count   = fillCount(l.code)
        const isActive = active === l.code
        return (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className={`flex items-center gap-1 px-2 py-1 rounded border font-semibold text-xs transition-all ${
              isActive
                ? "bg-pink-600 text-white border-pink-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-pink-400"
            }`}
          >
            <span>{l.flag}</span>
            <span className={`px-1 rounded-full text-xs font-bold ${
              isActive ? "bg-white/25 text-white" : count > 0 ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-400"
            }`}>
              {count}/{TRANSLATABLE_FIELDS.length}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LanguagesManagement() {
  const router = useRouter()
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [uploadingFlag, setUploadingFlag] = useState(false)
  const [languages,    setLanguages]    = useState<Language[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage,   setErrorMessage]   = useState('')

  // ── List inline editing ──
  const [editingId,       setEditingId]       = useState<string | null>(null)
  const [editingData,     setEditingData]     = useState<EditingLanguage | null>(null)
  const [editingFlagFile, setEditingFlagFile] = useState<File | null>(null)
  const [editingLocale,   setEditingLocale]   = useState("en")

  // ── New language form ──
  const [activeLocale, setActiveLocale] = useState("en")
  const [newLanguage, setNewLanguage] = useState<NewLanguage>({
    flag_url: '',
    _level: 3,
    translations: { en: {}, pt: {} },
  })
  const [flagFile, setFlagFile] = useState<File | null>(null)

  const levelLabels = [
    { value: 0, label: 'Iniciante',     color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 1, label: 'Básico',        color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { value: 2, label: 'Intermediário', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 3, label: 'Avançado',      color: 'bg-lime-100 text-lime-800 border-lime-300' },
    { value: 4, label: 'Fluente',       color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 5, label: 'Nativo',        color: 'bg-blue-100 text-blue-800 border-blue-300' },
  ]

  // ─── Translation helpers — new language ──────────────────────────────────

  const getT = (f: TranslatableField): string =>
    newLanguage.translations?.[activeLocale]?.[f] ?? ""

  const setT = (f: TranslatableField, v: string) =>
    setNewLanguage(p => ({
      ...p,
      translations: {
        ...p.translations,
        [activeLocale]: { ...(p.translations?.[activeLocale] ?? {}), [f]: v },
      },
    }))

  const fillCount = (lc: string): number =>
    TRANSLATABLE_FIELDS.filter(f => newLanguage.translations?.[lc]?.[f]?.trim()).length

  // ─── Translation helpers — editing ───────────────────────────────────────

  const getEditT = (f: TranslatableField): string =>
    editingData?.translations?.[editingLocale]?.[f] ?? ""

  const setEditT = (f: TranslatableField, v: string) => {
    if (!editingData) return
    setEditingData({
      ...editingData,
      translations: {
        ...editingData.translations,
        [editingLocale]: { ...(editingData.translations?.[editingLocale] ?? {}), [f]: v },
      },
    })
  }

  const editFillCount = (lc: string): number =>
    TRANSLATABLE_FIELDS.filter(f => editingData?.translations?.[lc]?.[f]?.trim()).length

  // ─── Display helpers ──────────────────────────────────────────────────────

  const langDisplayName = (l: Language): string =>
    l.translations?.en?._name || l.translations?.pt?._name || l._name || 'Sem nome'

  const langDisplayInfo = (l: Language): string =>
    l.translations?.en?.info || l.translations?.pt?.info || l.info || ''

  // ─── Auth + fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('_level', { ascending: false, nullsFirst: false })
      if (error) throw error
      setLanguages(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''),   5000) }

  // ─── Flag upload ──────────────────────────────────────────────────────────

  const buildFlagPath = (file: File) => {
    const ts = Date.now(), rnd = Math.random().toString(36).substring(2, 8), ext = file.name.split('.').pop()
    return `/logo_skills/flag_${ts}_${rnd}.${ext}`
  }

  const handleFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setFlagFile(file)
    setNewLanguage(p => ({ ...p, flag_url: buildFlagPath(file) }))
    showSuccess('Bandeira selecionada com sucesso!')
  }

  const handleEditFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !editingData) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setEditingFlagFile(file)
    setEditingData({ ...editingData, flag_url: buildFlagPath(file) })
    showSuccess('Bandeira selecionada com sucesso!')
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const handleAddLanguage = async () => {
    const enName = newLanguage.translations?.en?._name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('languages').insert([{
        _name:        enName,
        flag_url:     newLanguage.flag_url || null,
        _level:       newLanguage._level,
        info:         newLanguage.translations?.en?.info?.trim() || null,
        translations: newLanguage.translations,
      }])
      if (error) throw error
      showSuccess('Idioma adicionado com sucesso!')
      setNewLanguage({ flag_url: '', _level: 3, translations: { en: {}, pt: {} } })
      setFlagFile(null); setActiveLocale("en")
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao adicionar idioma. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (language: Language) => {
    const translations: Record<string, LangTranslation> = { en: {}, pt: {}, ...(language.translations ?? {}) }
    if (!translations.en._name && language._name) translations.en._name = language._name
    if (!translations.en.info  && language.info)  translations.en.info  = language.info
    setEditingId(language.id)
    setEditingData({ id: language.id, flag_url: language.flag_url || '', _level: language._level ?? 3, translations })
    setEditingLocale("en")
  }

  const cancelEditing = () => { setEditingId(null); setEditingData(null); setEditingFlagFile(null); setEditingLocale("en") }

  const saveEdit = async () => {
    if (!editingData) return
    const enName = editingData.translations?.en?._name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('languages').update({
        _name:        enName,
        flag_url:     editingData.flag_url || null,
        _level:       editingData._level,
        info:         editingData.translations?.en?.info?.trim() || null,
        translations: editingData.translations,
      }).eq('id', editingData.id)
      if (error) throw error
      showSuccess('Idioma atualizado com sucesso!')
      cancelEditing()
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao atualizar idioma. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este idioma?')) return
    try {
      const { error } = await supabase.from('languages').delete().eq('id', id)
      if (error) throw error
      showSuccess('Idioma eliminado com sucesso!')
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao eliminar idioma')
    }
  }

  const getLevelBadge = (level: number | null) => {
    if (level === null) return levelLabels[3]
    return levelLabels[Math.min(Math.max(Math.round(level), 0), 5)] || levelLabels[3]
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar idiomas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-pink-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center shadow-xl">
                <LanguagesIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Gestão de Idiomas</h1>
                <p className="text-xl text-white/90 mt-2">
                  {languages.length} idioma{languages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-7xl">

            {/* Feedback */}
            {successMessage && (
              <div className="mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-emerald-900 text-lg">{successMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-red-900 text-lg">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-8">

              {/* ══════════════════════════════════════════════════════════
                  LANGUAGES LIST
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <LanguagesIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Idiomas Existentes</CardTitle>
                      <CardDescription className="text-slate-700 text-base">Edita inline ou elimina idiomas</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {languages.length === 0 ? (
                    <div className="p-12 text-center">
                      <LanguagesIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Nenhum idioma adicionado ainda.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {languages.map((language, index) => (
                        <div key={language.id} className="hover:bg-slate-50 transition-colors"
                          style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                          {editingId === language.id && editingData ? (
                            // ── EDITING MODE ──
                            <div className="p-6 space-y-6">

                              {/* Locale selector */}
                              <InlineLocaleSelector
                                active={editingLocale}
                                onChange={setEditingLocale}
                                fillCount={editFillCount}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Flag — global */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <Flag className="w-4 h-4 text-pink-600" />
                                    Bandeira <span className="text-xs text-slate-400 font-normal">(global)</span>
                                  </Label>
                                  <Input type="file" accept="image/*" onChange={handleEditFlagUpload} disabled={uploadingFlag}
                                    className="h-10 border-2 border-pink-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700" />
                                  {editingData.flag_url && (
                                    <img src={editingData.flag_url} alt="Flag"
                                      className="w-16 h-12 object-cover rounded border-2 border-pink-300"
                                      onError={e => { e.currentTarget.style.display = 'none' }} />
                                  )}
                                </div>

                                {/* Name — translatable */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    Nome {editingLocale === "en" && <span className="text-red-500">*</span>}
                                    <LocaleBadge locale={editingLocale} />
                                  </Label>
                                  <Input
                                    value={getEditT("_name")}
                                    onChange={e => setEditT("_name", e.target.value)}
                                    className="h-10 border-2 border-pink-600 rounded-lg font-semibold"
                                    placeholder={editingLocale === "en" ? "English, French..." : "Inglês, Francês..."}
                                    autoFocus={editingLocale === "en"}
                                  />
                                  {editingLocale !== "en" && editingData.translations?.en?._name && (
                                    <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{editingData.translations.en._name}</span></p>
                                  )}
                                </div>

                                {/* Level slider — global */}
                                <div className="space-y-3 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    Nível de Proficiência: {editingData._level.toFixed(1)} — {getLevelBadge(editingData._level).label}
                                    <span className="text-xs text-slate-400 font-normal">(global)</span>
                                  </Label>
                                  <input type="range" min="0" max="5" step="0.5"
                                    value={editingData._level}
                                    onChange={e => setEditingData({ ...editingData, _level: parseFloat(e.target.value) })}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600" />
                                  <div className="flex justify-between text-xs text-slate-600">
                                    {levelLabels.map(l => <span key={l.value} className="font-medium">{l.label}</span>)}
                                  </div>
                                </div>

                                {/* Info — translatable */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    Informação Adicional <LocaleBadge locale={editingLocale} />
                                  </Label>
                                  <Textarea
                                    value={getEditT("info")}
                                    onChange={e => setEditT("info", e.target.value)}
                                    rows={3}
                                    placeholder={editingLocale === "en" ? "Certificações, contexto de aprendizagem (EN)..." : "Certificações, contexto de aprendizagem (PT)..."}
                                    className="border-2 border-pink-600 rounded-lg resize-none"
                                  />
                                  {editingLocale !== "en" && editingData.translations?.en?.info && (
                                    <p className="text-xs text-slate-400 line-clamp-1">🇬🇧 Base: <span className="italic">{editingData.translations.en.info}</span></p>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-slate-200">
                                <Button variant="ghost" size="sm" onClick={saveEdit} disabled={saving}
                                  className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50">
                                  <Check className="w-4 h-4 mr-2" />Guardar
                                </Button>
                                <Button variant="ghost" size="sm" onClick={cancelEditing}
                                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100">
                                  <X className="w-4 h-4 mr-2" />Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // ── VIEW MODE ──
                            <div className="p-6">
                              <div className="flex items-start gap-6">
                                {/* Flag */}
                                <div className="flex-shrink-0">
                                  {language.flag_url ? (
                                    <img src={language.flag_url} alt={langDisplayName(language)}
                                      className="w-20 h-14 object-cover rounded border-2 border-slate-300 shadow-sm"
                                      onError={e => { e.currentTarget.style.display = 'none' }} />
                                  ) : (
                                    <div className="w-20 h-14 bg-slate-100 rounded flex items-center justify-center border-2 border-slate-300">
                                      <Flag className="w-8 h-8 text-slate-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{langDisplayName(language)}</h3>
                                      <Badge className={`${getLevelBadge(language._level).color} border font-semibold`}>
                                        Nível {language._level?.toFixed(1) ?? '3.0'} — {getLevelBadge(language._level).label}
                                      </Badge>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Button variant="ghost" size="sm" onClick={() => startEditing(language)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDelete(language.id)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  {langDisplayInfo(language) && (
                                    <p className="text-sm text-slate-600 leading-relaxed">{langDisplayInfo(language)}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ══════════════════════════════════════════════════════════
                  ADD NEW LANGUAGE FORM
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600" />
                <CardHeader className="bg-gradient-to-br from-pink-50 to-pink-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-pink-900 mb-2">Novo Idioma</CardTitle>
                      <CardDescription className="text-pink-700 text-base">Adiciona um novo idioma ao portfólio</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">

                  <LocaleSelector
                    active={activeLocale}
                    onChange={setActiveLocale}
                    fillCount={fillCount}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Name — translatable */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Nome do Idioma {activeLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Input
                        value={getT("_name")}
                        onChange={e => setT("_name", e.target.value)}
                        placeholder={activeLocale === "en" ? "Ex: English, French, Spanish" : "Ex: Inglês, Francês, Espanhol"}
                        className="h-11 border-2 border-slate-300 focus:border-pink-600 rounded-lg"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newLanguage.translations?.en?._name} />
                    </div>

                    {/* Flag — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Flag className="w-4 h-4 text-pink-600" />
                        Bandeira <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="file" accept="image/*" onChange={handleFlagUpload} disabled={uploadingFlag}
                        className="h-11 border-2 border-slate-300 focus:border-pink-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                      {newLanguage.flag_url && (
                        <div className="flex items-center gap-2">
                          <img src={newLanguage.flag_url} alt="Flag preview"
                            className="w-16 h-12 object-cover rounded border-2 border-pink-300"
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                          <span className="text-xs text-pink-700 font-medium">{newLanguage.flag_url.split('/').pop()}</span>
                        </div>
                      )}
                    </div>

                    {/* Level slider — global */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Nível de Proficiência: {newLanguage._level.toFixed(1)} — {getLevelBadge(newLanguage._level).label}
                        <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <input type="range" min="0" max="5" step="0.5"
                        value={newLanguage._level}
                        onChange={e => setNewLanguage(p => ({ ...p, _level: parseFloat(e.target.value) }))}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600" />
                      <div className="flex justify-between text-xs text-slate-600">
                        {levelLabels.map(l => <span key={l.value} className="font-medium">{l.label}</span>)}
                      </div>
                    </div>

                    {/* Info — translatable */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Informação Adicional <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Textarea
                        value={getT("info")}
                        onChange={e => setT("info", e.target.value)}
                        placeholder={activeLocale === "en" ? "Certifications, learning context..." : "Certificações, contexto de aprendizagem..."}
                        rows={3}
                        className="border-2 border-slate-300 focus:border-pink-600 rounded-lg resize-none"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newLanguage.translations?.en?.info} />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button onClick={handleAddLanguage} disabled={saving || uploadingFlag}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-pink-700 to-pink-800 hover:from-pink-800 hover:to-pink-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      {saving ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                      ) : (
                        <><Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />Adicionar Idioma</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}