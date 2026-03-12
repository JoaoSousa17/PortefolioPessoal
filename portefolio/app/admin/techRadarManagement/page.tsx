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
  Radar, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
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

const TRANSLATABLE_FIELDS = ["_name", "notes"] as const
type TranslatableField = typeof TRANSLATABLE_FIELDS[number]

// ─── Types ────────────────────────────────────────────────────────────────────

type TechTranslation = {
  _name?: string
  notes?: string
}

type TechRadarItem = {
  id: string
  _name: string
  image_url: string | null
  category: 'learn' | 'using' | 'explore' | null
  notes: string | null
  urll: string | null
  is_valid: boolean
  translations?: Record<string, TechTranslation> | null
}

type EditingTechRadar = {
  id: string
  image_url: string
  category: 'learn' | 'using' | 'explore' | null
  urll: string
  translations: Record<string, TechTranslation>
}

type NewItem = {
  image_url: string
  category: 'learn' | 'using' | 'explore'
  urll: string
  translations: Record<string, TechTranslation>
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function LocaleBadge({ locale }: { locale: string }) {
  if (locale === "en")
    return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
  return <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
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
  total,
}: {
  active: string
  onChange: (lc: string) => void
  fillCount: (lc: string) => number
  total: number
}) {
  return (
    <div className="mb-6 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-4 h-4 text-cyan-600" />
        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
        <span className="text-xs text-slate-500 ml-1">— nome e notas variam por idioma</span>
      </div>
      <div className="flex gap-2">
        {LOCALES.map(l => {
          const count = fillCount(l.code)
          const isActive = active === l.code
          return (
            <button
              key={l.code}
              onClick={() => onChange(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                isActive
                  ? "bg-cyan-600 text-white border-cyan-600 shadow"
                  : "bg-white text-slate-700 border-slate-200 hover:border-cyan-400"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? "bg-white/25 text-white" : count > 0 ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-400"
              }`}>
                {count}/{total}
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
  total,
}: {
  active: string
  onChange: (lc: string) => void
  fillCount: (lc: string) => number
  total: number
}) {
  return (
    <div className="flex gap-1.5">
      {LOCALES.map(l => {
        const count = fillCount(l.code)
        const isActive = active === l.code
        return (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className={`flex items-center gap-1 px-2 py-1 rounded border font-semibold text-xs transition-all ${
              isActive
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-cyan-400"
            }`}
          >
            <span>{l.flag}</span>
            <span className={`px-1 rounded-full text-xs font-bold ${
              isActive ? "bg-white/25 text-white" : count > 0 ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-400"
            }`}>
              {count}/{total}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TechRadarManagement() {
  const router = useRouter()
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [techItems,      setTechItems]      = useState<TechRadarItem[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage,   setErrorMessage]   = useState('')

  // ── List inline editing ──
  const [editingId,        setEditingId]        = useState<string | null>(null)
  const [editingData,      setEditingData]      = useState<EditingTechRadar | null>(null)
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)
  const [editingLocale,    setEditingLocale]    = useState("en")

  // ── New item form ──
  const [activeLocale, setActiveLocale] = useState("en")
  const [newItem, setNewItem] = useState<NewItem>({
    image_url: '',
    category: 'learn',
    urll: '',
    translations: { en: {}, pt: {} },
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const categories = [
    { value: 'learn',   label: 'Learning',   color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'using',   label: 'Using',      color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'explore', label: 'Exploring',  color: 'bg-red-100 text-red-800 border-red-300' },
  ]

  // ─── Translation helpers — new item ──────────────────────────────────────

  const getT = (f: TranslatableField): string =>
    newItem.translations?.[activeLocale]?.[f] ?? ""

  const setT = (f: TranslatableField, v: string) =>
    setNewItem(p => ({
      ...p,
      translations: {
        ...p.translations,
        [activeLocale]: { ...(p.translations?.[activeLocale] ?? {}), [f]: v },
      },
    }))

  const fillCount = (lc: string): number =>
    TRANSLATABLE_FIELDS.filter(f => newItem.translations?.[lc]?.[f]?.trim()).length

  // ─── Translation helpers — editing row ───────────────────────────────────

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

  const itemDisplayName = (item: TechRadarItem): string =>
    item.translations?.en?._name ||
    item.translations?.pt?._name ||
    item._name ||
    'Sem nome'

  // ─── Auth + fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tech_radar')
        .select('*')
        .order('_name', { ascending: true })
      if (error) throw error
      setTechItems(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''),   5000) }

  // ─── Image upload handlers ────────────────────────────────────────────────

  const buildImagePath = (file: File) => {
    const ts  = Date.now()
    const rnd = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop()
    return `/logo_skills/tech_${ts}_${rnd}.${ext}`
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setImageFile(file)
    setNewItem(p => ({ ...p, image_url: buildImagePath(file) }))
    showSuccess('Imagem selecionada com sucesso!')
  }

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingData) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setEditingImageFile(file)
    setEditingData({ ...editingData, image_url: buildImagePath(file) })
    showSuccess('Imagem selecionada com sucesso!')
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const handleAddItem = async () => {
    const enName = newItem.translations?.en?._name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('tech_radar').insert([{
        _name:      enName,
        image_url:  newItem.image_url || null,
        category:   newItem.category,
        notes:      newItem.translations?.en?.notes?.trim() || null,
        urll:       newItem.urll || null,
        is_valid:   true,
        translations: newItem.translations,
      }])
      if (error) throw error
      showSuccess('Tecnologia adicionada com sucesso!')
      setNewItem({ image_url: '', category: 'learn', urll: '', translations: { en: {}, pt: {} } })
      setImageFile(null)
      setActiveLocale("en")
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao adicionar tecnologia. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (item: TechRadarItem) => {
    const translations: Record<string, TechTranslation> = { en: {}, pt: {}, ...(item.translations ?? {}) }
    if (!translations.en._name && item._name) translations.en._name = item._name
    if (!translations.en.notes && item.notes) translations.en.notes = item.notes
    setEditingId(item.id)
    setEditingData({
      id: item.id,
      image_url: item.image_url || '',
      category:  item.category,
      urll:      item.urll || '',
      translations,
    })
    setEditingLocale("en")
  }

  const cancelEditing = () => { setEditingId(null); setEditingData(null); setEditingImageFile(null); setEditingLocale("en") }

  const saveEdit = async () => {
    if (!editingData) return
    const enName = editingData.translations?.en?._name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('tech_radar').update({
        _name:        enName,
        image_url:    editingData.image_url || null,
        category:     editingData.category,
        notes:        editingData.translations?.en?.notes?.trim() || null,
        urll:         editingData.urll || null,
        translations: editingData.translations,
      }).eq('id', editingData.id)
      if (error) throw error
      showSuccess('Tecnologia atualizada com sucesso!')
      cancelEditing()
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao atualizar tecnologia. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const toggleValidity = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('tech_radar').update({ is_valid: !current }).eq('id', id)
      if (error) throw error
      showSuccess(`Tecnologia ${!current ? 'ativada' : 'desativada'} com sucesso!`)
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao alterar estado')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta tecnologia?')) return
    try {
      const { error } = await supabase.from('tech_radar').delete().eq('id', id)
      if (error) throw error
      showSuccess('Tecnologia eliminada com sucesso!')
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao eliminar tecnologia')
    }
  }

  const getCategoryBadge = (cat: 'learn' | 'using' | 'explore' | null) =>
    categories.find(c => c.value === cat) || { label: '-', color: 'bg-slate-100 text-slate-600' }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar Tech Radar...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-cyan-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-xl">
                <Radar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Gestão do Tech Radar</h1>
                <p className="text-xl text-white/90 mt-2">
                  {techItems.length} tecnologia{techItems.length !== 1 ? 's' : ''} • {techItems.filter(t => t.is_valid).length} ativa{techItems.filter(t => t.is_valid).length !== 1 ? 's' : ''}
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
                  TECH RADAR LIST
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Radar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Tecnologias Existentes</CardTitle>
                      <CardDescription className="text-slate-700 text-base">Edita inline ou elimina tecnologias</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {techItems.length === 0 ? (
                    <div className="p-12 text-center">
                      <Radar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Nenhuma tecnologia adicionada ainda.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Imagem</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Nome</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Categoria</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Notas</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">URL</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Ativa</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {techItems.map((item, index) => (
                            <tr key={item.id}
                              className={`hover:bg-slate-50 transition-colors ${!item.is_valid ? 'opacity-50' : ''}`}
                              style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                              {editingId === item.id && editingData ? (
                                // ── EDITING MODE ──
                                <>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2">
                                      <Input type="file" accept="image/*" onChange={handleEditImageUpload} disabled={uploadingImage}
                                        className="h-10 border-2 border-cyan-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700" />
                                      {editingData.image_url && (
                                        <img src={editingData.image_url} alt="Preview"
                                          className="w-12 h-12 object-contain rounded border-2 border-cyan-300"
                                          onError={e => { e.currentTarget.style.display = 'none' }} />
                                      )}
                                    </div>
                                  </td>
                                  {/* Name + Notes — translatable, with locale mini-selector */}
                                  <td className="px-6 py-4" colSpan={2}>
                                    <div className="space-y-3 min-w-[320px]">
                                      <InlineLocaleSelector
                                        active={editingLocale}
                                        onChange={setEditingLocale}
                                        fillCount={editFillCount}
                                        total={TRANSLATABLE_FIELDS.length}
                                      />
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                          Nome <LocaleBadge locale={editingLocale} />
                                        </Label>
                                        <Input
                                          value={getEditT("_name")}
                                          onChange={e => setEditT("_name", e.target.value)}
                                          className="h-10 border-2 border-cyan-600 rounded-lg font-semibold"
                                          placeholder={editingLocale === "en" ? "Nome (EN)" : "Nome (PT)"}
                                          autoFocus={editingLocale === "en"}
                                        />
                                        {editingLocale !== "en" && editingData.translations?.en?._name && (
                                          <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{editingData.translations.en._name}</span></p>
                                        )}
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                          Categoria <span className="text-xs text-slate-400 font-normal">(global)</span>
                                        </Label>
                                        <select
                                          value={editingData.category || ''}
                                          onChange={e => setEditingData({ ...editingData, category: e.target.value as any })}
                                          className="w-full h-10 border-2 border-cyan-600 rounded-lg px-2 text-sm bg-white"
                                        >
                                          {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1 min-w-[200px]">
                                      <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                        Notas <LocaleBadge locale={editingLocale} />
                                      </Label>
                                      <Textarea
                                        value={getEditT("notes")}
                                        onChange={e => setEditT("notes", e.target.value)}
                                        rows={3}
                                        className="border-2 border-cyan-600 rounded-lg text-sm resize-none"
                                        placeholder={editingLocale === "en" ? "Notas (EN)" : "Notas (PT)"}
                                      />
                                      {editingLocale !== "en" && editingData.translations?.en?.notes && (
                                        <p className="text-xs text-slate-400 line-clamp-1">🇬🇧 Base: <span className="italic">{editingData.translations.en.notes}</span></p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1 min-w-[160px]">
                                      <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                        URL <span className="text-xs text-slate-400 font-normal">(global)</span>
                                      </Label>
                                      <Input
                                        value={editingData.urll}
                                        onChange={e => setEditingData({ ...editingData, urll: e.target.value })}
                                        placeholder="https://..."
                                        className="h-10 border-2 border-cyan-600 rounded-lg text-sm"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-6 py-4"></td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={saveEdit} disabled={saving}
                                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50">
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={cancelEditing}
                                        className="text-slate-600 hover:text-slate-800 hover:bg-slate-100">
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                // ── VIEW MODE ──
                                <>
                                  <td className="px-6 py-4">
                                    {item.image_url ? (
                                      <img src={item.image_url} alt={itemDisplayName(item)}
                                        className="w-12 h-12 object-contain rounded border border-slate-300"
                                        onError={e => { e.currentTarget.style.display = 'none' }} />
                                    ) : (
                                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="font-semibold text-slate-900">{itemDisplayName(item)}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`${getCategoryBadge(item.category).color} border font-semibold`}>
                                      {getCategoryBadge(item.category).label}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 line-clamp-2">
                                      {item.translations?.en?.notes || item.notes || '-'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {item.urll ? (
                                      <a href={item.urll} target="_blank" rel="noopener noreferrer"
                                        className="text-cyan-600 hover:text-cyan-800 text-sm flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" />Link
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 text-sm">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <Button variant="ghost" size="sm" onClick={() => toggleValidity(item.id, item.is_valid)}
                                      className={item.is_valid ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}>
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => startEditing(item)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ══════════════════════════════════════════════════════════
                  ADD NEW ITEM FORM
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600" />
                <CardHeader className="bg-gradient-to-br from-cyan-50 to-cyan-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-cyan-900 mb-2">Nova Tecnologia</CardTitle>
                      <CardDescription className="text-cyan-700 text-base">Adiciona uma nova tecnologia ao radar</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">

                  <LocaleSelector
                    active={activeLocale}
                    onChange={setActiveLocale}
                    fillCount={fillCount}
                    total={TRANSLATABLE_FIELDS.length}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Name — translatable */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Nome {activeLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Input
                        value={getT("_name")}
                        onChange={e => setT("_name", e.target.value)}
                        placeholder={activeLocale === "en" ? "React, Docker, AWS..." : "Nome em PT..."}
                        className="h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newItem.translations?.en?._name} />
                    </div>

                    {/* Category — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Categoria * <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <select
                        value={newItem.category}
                        onChange={e => setNewItem(p => ({ ...p, category: e.target.value as any }))}
                        className="w-full h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg px-3 text-sm bg-white"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* URL — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-cyan-600" />
                        URL <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input
                        value={newItem.urll}
                        onChange={e => setNewItem(p => ({ ...p, urll: e.target.value }))}
                        placeholder="https://..."
                        className="h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg"
                      />
                    </div>

                    {/* Image — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-cyan-600" />
                        Imagem <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage}
                        className="h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100" />
                      {newItem.image_url && (
                        <div className="flex items-center gap-2">
                          <img src={newItem.image_url} alt="Preview"
                            className="w-8 h-8 object-contain rounded border-2 border-cyan-300"
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                          <span className="text-xs text-cyan-700 font-medium">{newItem.image_url.split('/').pop()}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes — translatable */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-600" />
                        Notas <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Textarea
                        value={getT("notes")}
                        onChange={e => setT("notes", e.target.value)}
                        placeholder={activeLocale === "en" ? "Notas ou descrição sobre a tecnologia..." : "Notas em PT..."}
                        rows={3}
                        className="border-2 border-slate-300 focus:border-cyan-600 rounded-lg resize-none"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newItem.translations?.en?.notes} />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button onClick={handleAddItem} disabled={saving || uploadingImage}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-cyan-700 to-cyan-800 hover:from-cyan-800 hover:to-cyan-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      {saving ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                      ) : (
                        <><Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />Adicionar Tecnologia</>
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
