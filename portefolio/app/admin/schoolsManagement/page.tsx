"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Loader2, 
  GraduationCap, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Image as ImageIcon,
  BookOpen,
  Lightbulb,
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

const TRANSLATABLE_FIELDS = ["name", "description", "learnings"] as const
type TranslatableField = typeof TRANSLATABLE_FIELDS[number]

// ─── Types ────────────────────────────────────────────────────────────────────

type SchoolTranslation = {
  name?: string
  description?: string
  learnings?: string
}

type School = {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  learnings: string | null
  order: number
  created_at: string
  translations?: Record<string, SchoolTranslation> | null
}

type EditingSchool = {
  id: string
  logo_url: string
  website: string
  order: number
  translations: Record<string, SchoolTranslation>
}

type NewSchool = {
  logo_url: string
  website: string
  translations: Record<string, SchoolTranslation>
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function LocaleBadge({ locale }: { locale: string }) {
  if (locale === "en")
    return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
  return <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
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
        <Languages className="w-4 h-4 text-indigo-600" />
        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
        <span className="text-xs text-slate-500 ml-1">— nome, descrição e aprendizagens variam por idioma</span>
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
                  ? "bg-indigo-600 text-white border-indigo-600 shadow"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? "bg-white/25 text-white" : count > 0 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
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
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400"
            }`}
          >
            <span>{l.flag}</span>
            <span className={`px-1 rounded-full text-xs font-bold ${
              isActive ? "bg-white/25 text-white" : count > 0 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
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

export default function SchoolsManagement() {
  const router = useRouter()
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [schools,      setSchools]      = useState<School[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage,   setErrorMessage]   = useState('')

  // ── List inline editing ──
  const [editingId,       setEditingId]       = useState<string | null>(null)
  const [editingData,     setEditingData]     = useState<EditingSchool | null>(null)
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null)
  const [editingLocale,   setEditingLocale]   = useState("en")

  // ── New school form ──
  const [activeLocale, setActiveLocale] = useState("en")
  const [newSchool, setNewSchool] = useState<NewSchool>({
    logo_url: '',
    website: '',
    translations: { en: {}, pt: {} },
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // ─── Translation helpers — new school ────────────────────────────────────

  const getT = (f: TranslatableField): string =>
    newSchool.translations?.[activeLocale]?.[f] ?? ""

  const setT = (f: TranslatableField, v: string) =>
    setNewSchool(p => ({
      ...p,
      translations: {
        ...p.translations,
        [activeLocale]: { ...(p.translations?.[activeLocale] ?? {}), [f]: v },
      },
    }))

  const fillCount = (lc: string): number =>
    TRANSLATABLE_FIELDS.filter(f => newSchool.translations?.[lc]?.[f]?.trim()).length

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

  const schoolDisplayName = (s: School): string =>
    s.translations?.en?.name || s.translations?.pt?.name || s.name || 'Sem nome'

  const schoolDisplayDesc = (s: School): string =>
    s.translations?.en?.description || s.translations?.pt?.description || s.description || ''

  const schoolDisplayLearnings = (s: School): string =>
    s.translations?.en?.learnings || s.translations?.pt?.learnings || s.learnings || ''

  // ─── Auth + fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('order', { ascending: true })
      if (error) throw error
      setSchools(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''),   5000) }

  // ─── Logo upload ──────────────────────────────────────────────────────────

  const buildLogoPath = (file: File) => {
    const ts = Date.now(), rnd = Math.random().toString(36).substring(2, 8), ext = file.name.split('.').pop()
    return `/logo_skills/school_logo_${ts}_${rnd}.${ext}`
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setLogoFile(file)
    setNewSchool(p => ({ ...p, logo_url: buildLogoPath(file) }))
    showSuccess('Logo selecionado com sucesso!')
  }

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !editingData) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setEditingLogoFile(file)
    setEditingData({ ...editingData, logo_url: buildLogoPath(file) })
    showSuccess('Logo selecionado com sucesso!')
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const handleAddSchool = async () => {
    const enName = newSchool.translations?.en?.name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const maxOrder = schools.length > 0 ? Math.max(...schools.map(s => s.order)) : 0
      const { error } = await supabase.from('schools').insert([{
        name:         enName,
        logo_url:     newSchool.logo_url || null,
        website:      newSchool.website || null,
        description:  newSchool.translations?.en?.description?.trim() || null,
        learnings:    newSchool.translations?.en?.learnings?.trim() || null,
        order:        maxOrder + 1,
        translations: newSchool.translations,
      }])
      if (error) throw error
      showSuccess('Escola adicionada com sucesso!')
      setNewSchool({ logo_url: '', website: '', translations: { en: {}, pt: {} } })
      setLogoFile(null); setActiveLocale("en")
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao adicionar escola. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (school: School) => {
    const translations: Record<string, SchoolTranslation> = { en: {}, pt: {}, ...(school.translations ?? {}) }
    if (!translations.en.name        && school.name)        translations.en.name        = school.name
    if (!translations.en.description && school.description) translations.en.description = school.description
    if (!translations.en.learnings   && school.learnings)   translations.en.learnings   = school.learnings
    setEditingId(school.id)
    setEditingData({ id: school.id, logo_url: school.logo_url || '', website: school.website || '', order: school.order, translations })
    setEditingLocale("en")
  }

  const cancelEditing = () => { setEditingId(null); setEditingData(null); setEditingLogoFile(null); setEditingLocale("en") }

  const saveEdit = async () => {
    if (!editingData) return
    const enName = editingData.translations?.en?.name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('schools').update({
        name:         enName,
        logo_url:     editingData.logo_url || null,
        website:      editingData.website || null,
        description:  editingData.translations?.en?.description?.trim() || null,
        learnings:    editingData.translations?.en?.learnings?.trim() || null,
        translations: editingData.translations,
      }).eq('id', editingData.id)
      if (error) throw error
      showSuccess('Escola atualizada com sucesso!')
      cancelEditing()
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao atualizar escola. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta escola?')) return
    try {
      const { error } = await supabase.from('schools').delete().eq('id', id)
      if (error) throw error
      showSuccess('Escola eliminada com sucesso!')
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao eliminar escola')
    }
  }

  const moveSchool = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === schools.length - 1)) return
    const newIndex  = direction === 'up' ? index - 1 : index + 1
    const reordered = [...schools]
    const [moved]   = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    try {
      for (const [idx, s] of reordered.entries()) {
        await supabase.from('schools').update({ order: idx + 1 }).eq('id', s.id)
      }
      showSuccess('Ordem atualizada!')
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao atualizar ordem')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar escolas...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-indigo-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Gestão de Escolas</h1>
                <p className="text-xl text-white/90 mt-2">
                  {schools.length} instituiç{schools.length !== 1 ? 'ões' : 'ão'}
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
                  SCHOOLS LIST
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Instituições Existentes</CardTitle>
                      <CardDescription className="text-slate-700 text-base">Edita inline, reordena ou elimina escolas</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {schools.length === 0 ? (
                    <div className="p-12 text-center">
                      <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Nenhuma escola adicionada ainda.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {schools.map((school, index) => (
                        <div key={school.id} className="hover:bg-slate-50 transition-colors"
                          style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                          {editingId === school.id && editingData ? (
                            // ── EDITING MODE ──
                            <div className="p-6 space-y-6">

                              {/* Locale selector */}
                              <InlineLocaleSelector
                                active={editingLocale}
                                onChange={setEditingLocale}
                                fillCount={editFillCount}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Logo — global */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                                    Logo <span className="text-xs text-slate-400 font-normal">(global)</span>
                                  </Label>
                                  <Input type="file" accept="image/*" onChange={handleEditLogoUpload} disabled={uploadingLogo}
                                    className="h-10 border-2 border-indigo-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                                  {editingData.logo_url && (
                                    <img src={editingData.logo_url} alt="Logo"
                                      className="w-16 h-16 object-contain rounded border-2 border-indigo-300"
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
                                    value={getEditT("name")}
                                    onChange={e => setEditT("name", e.target.value)}
                                    className="h-10 border-2 border-indigo-600 rounded-lg font-semibold"
                                    placeholder={editingLocale === "en" ? "Nome (EN)" : "Nome (PT)"}
                                    autoFocus={editingLocale === "en"}
                                  />
                                  {editingLocale !== "en" && editingData.translations?.en?.name && (
                                    <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{editingData.translations.en.name}</span></p>
                                  )}
                                </div>

                                {/* Website — global */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                                    Website <span className="text-xs text-slate-400 font-normal">(global)</span>
                                  </Label>
                                  <Input
                                    value={editingData.website}
                                    onChange={e => setEditingData({ ...editingData, website: e.target.value })}
                                    placeholder="https://..."
                                    className="h-10 border-2 border-indigo-600 rounded-lg"
                                  />
                                </div>

                                {/* Description — translatable */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    Descrição <LocaleBadge locale={editingLocale} />
                                  </Label>
                                  <Textarea
                                    value={getEditT("description")}
                                    onChange={e => setEditT("description", e.target.value)}
                                    rows={3}
                                    placeholder={editingLocale === "en" ? "Sobre a instituição (EN)..." : "Sobre a instituição (PT)..."}
                                    className="border-2 border-indigo-600 rounded-lg resize-none"
                                  />
                                  {editingLocale !== "en" && editingData.translations?.en?.description && (
                                    <p className="text-xs text-slate-400 line-clamp-1">🇬🇧 Base: <span className="italic">{editingData.translations.en.description}</span></p>
                                  )}
                                </div>

                                {/* Learnings — translatable */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                                    Aprendizagens <LocaleBadge locale={editingLocale} />
                                  </Label>
                                  <Textarea
                                    value={getEditT("learnings")}
                                    onChange={e => setEditT("learnings", e.target.value)}
                                    rows={3}
                                    placeholder={editingLocale === "en" ? "O que aprendeste (EN)..." : "O que aprendeste (PT)..."}
                                    className="border-2 border-indigo-600 rounded-lg resize-none"
                                  />
                                  {editingLocale !== "en" && editingData.translations?.en?.learnings && (
                                    <p className="text-xs text-slate-400 line-clamp-1">🇬🇧 Base: <span className="italic">{editingData.translations.en.learnings}</span></p>
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
                                {/* Logo */}
                                <div className="flex-shrink-0">
                                  {school.logo_url ? (
                                    <img src={school.logo_url} alt={schoolDisplayName(school)}
                                      className="w-16 h-16 object-contain rounded border-2 border-slate-300"
                                      onError={e => { e.currentTarget.style.display = 'none' }} />
                                  ) : (
                                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center border-2 border-slate-300">
                                      <GraduationCap className="w-8 h-8 text-slate-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                  <h3 className="text-xl font-bold text-slate-900 mb-2">{schoolDisplayName(school)}</h3>
                                  {school.website && (
                                    <a href={school.website} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-3">
                                      <ExternalLink className="w-3 h-3" />Website
                                    </a>
                                  )}
                                  {schoolDisplayDesc(school) && (
                                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                      <span className="font-semibold text-slate-700">Sobre:</span> {schoolDisplayDesc(school)}
                                    </p>
                                  )}
                                  {schoolDisplayLearnings(school) && (
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                      <span className="font-semibold text-slate-700">Aprendizagens:</span> {schoolDisplayLearnings(school)}
                                    </p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex flex-col gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => moveSchool(index, 'up')} disabled={index === 0}
                                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 p-0">
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => moveSchool(index, 'down')} disabled={index === schools.length - 1}
                                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 p-0">
                                      <ArrowDown className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => startEditing(school)}
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(school.id)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
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
                  ADD NEW SCHOOL FORM
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600" />
                <CardHeader className="bg-gradient-to-br from-indigo-50 to-indigo-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-indigo-900 mb-2">Nova Escola</CardTitle>
                      <CardDescription className="text-indigo-700 text-base">Adiciona uma nova instituição à timeline</CardDescription>
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
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Nome da Instituição {activeLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Input
                        value={getT("name")}
                        onChange={e => setT("name", e.target.value)}
                        placeholder={activeLocale === "en" ? "Ex: Universidade do Porto" : "Nome em PT..."}
                        className="h-11 border-2 border-slate-300 focus:border-indigo-600 rounded-lg"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newSchool.translations?.en?.name} />
                    </div>

                    {/* Logo — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        Logo <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo}
                        className="h-11 border-2 border-slate-300 focus:border-indigo-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                      {newSchool.logo_url && (
                        <div className="flex items-center gap-2">
                          <img src={newSchool.logo_url} alt="Logo preview"
                            className="w-12 h-12 object-contain rounded border-2 border-indigo-300"
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                          <span className="text-xs text-indigo-700 font-medium">{newSchool.logo_url.split('/').pop()}</span>
                        </div>
                      )}
                    </div>

                    {/* Website — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                        Website <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input
                        value={newSchool.website}
                        onChange={e => setNewSchool(p => ({ ...p, website: e.target.value }))}
                        placeholder="https://..."
                        className="h-11 border-2 border-slate-300 focus:border-indigo-600 rounded-lg"
                      />
                    </div>

                    {/* Description — translatable */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        Descrição <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Textarea
                        value={getT("description")}
                        onChange={e => setT("description", e.target.value)}
                        placeholder={activeLocale === "en" ? "Sobre a instituição..." : "Sobre a instituição em PT..."}
                        rows={3}
                        className="border-2 border-slate-300 focus:border-indigo-600 rounded-lg resize-none"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newSchool.translations?.en?.description} />
                    </div>

                    {/* Learnings — translatable */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                        Aprendizagens <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Textarea
                        value={getT("learnings")}
                        onChange={e => setT("learnings", e.target.value)}
                        placeholder={activeLocale === "en" ? "O que aprendeste nesta instituição..." : "Aprendizagens em PT..."}
                        rows={3}
                        className="border-2 border-slate-300 focus:border-indigo-600 rounded-lg resize-none"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newSchool.translations?.en?.learnings} />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button onClick={handleAddSchool} disabled={saving || uploadingLogo}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      {saving ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                      ) : (
                        <><Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />Adicionar Escola</>
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