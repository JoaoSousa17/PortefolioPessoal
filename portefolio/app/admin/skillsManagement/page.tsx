"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Loader2, 
  Code2, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Palette,
  Tag,
  Languages,
  FolderOpen
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

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillTranslation    = { name?: string }
type CategoryTranslation = { name?: string }

type SkillCategory = {
  id: string
  name: string
  translations?: Record<string, CategoryTranslation> | null
}

type Skill = {
  id: string
  category_id: string
  name: string
  color: string | null
  icon: string | null
  translations?: Record<string, SkillTranslation> | null
}

type SkillWithCategory = Skill & { category_name: string }

type EditingSkill = {
  id: string
  color: string
  icon: string
  translations: Record<string, SkillTranslation>
}

type EditingCategory = {
  id: string
  translations: Record<string, CategoryTranslation>
}

type NewSkill = {
  category_id: string
  color: string
  icon: string
  translations: Record<string, SkillTranslation>
}

type NewCategory = {
  translations: Record<string, CategoryTranslation>
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function LocaleBadge({ locale }: { locale: string }) {
  if (locale === "en")
    return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
  return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
}

function FallbackHint({ locale, baseValue }: { locale: string; baseValue?: string }) {
  if (locale === "en" || !baseValue) return null
  return (
    <p className="text-xs text-slate-400 truncate">
      🇬🇧 Base: <span className="italic">{baseValue}</span>
    </p>
  )
}

// ─── Locale selector sub-component (reused in both forms) ─────────────────────

function LocaleSelector({
  active,
  onChange,
  fillCount,
  accentColor = "emerald",
  note,
}: {
  active: string
  onChange: (lc: string) => void
  fillCount: (lc: string) => number
  accentColor?: "emerald" | "blue"
  note?: string
}) {
  const accent = accentColor === "blue" ? {
    active:   "bg-blue-600 text-white border-blue-600 shadow",
    inactive: "bg-white text-slate-700 border-slate-200 hover:border-blue-400",
    badge:    "bg-blue-100 text-blue-700",
    icon:     "text-blue-600",
  } : {
    active:   "bg-emerald-600 text-white border-emerald-600 shadow",
    inactive: "bg-white text-slate-700 border-slate-200 hover:border-emerald-400",
    badge:    "bg-emerald-100 text-emerald-700",
    icon:     "text-emerald-600",
  }

  return (
    <div className="mb-6 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Languages className={`w-4 h-4 ${accent.icon}`} />
        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
        {note && <span className="text-xs text-slate-500 ml-1">— {note}</span>}
      </div>
      <div className="flex gap-2">
        {LOCALES.map(l => {
          const count   = fillCount(l.code)
          const isActive = active === l.code
          return (
            <button
              key={l.code}
              onClick={() => onChange(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${isActive ? accent.active : accent.inactive}`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/25 text-white" : count > 0 ? accent.badge : "bg-slate-100 text-slate-400"}`}>
                {count}/1
              </span>
            </button>
          )
        })}
      </div>
      {active !== "en" && (
        <p className="text-xs text-slate-500 mt-2">
          Campos vazios usam o nome em Inglês como fallback.
        </p>
      )}
    </div>
  )
}

// ─── Inline locale mini-selector (inside table rows) ─────────────────────────

function InlineLocaleSelector({
  active,
  onChange,
  fillCount,
  accentColor = "emerald",
}: {
  active: string
  onChange: (lc: string) => void
  fillCount: (lc: string) => number
  accentColor?: "emerald" | "blue"
}) {
  const accent = accentColor === "blue"
    ? { active: "bg-blue-600 text-white border-blue-600", badge: "bg-blue-100 text-blue-700", hover: "hover:border-blue-400" }
    : { active: "bg-emerald-600 text-white border-emerald-600", badge: "bg-emerald-100 text-emerald-700", hover: "hover:border-emerald-400" }

  return (
    <div className="flex gap-1.5">
      {LOCALES.map(l => {
        const count   = fillCount(l.code)
        const isActive = active === l.code
        return (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className={`flex items-center gap-1 px-2 py-1 rounded border font-semibold text-xs transition-all ${isActive ? accent.active : `bg-white text-slate-600 border-slate-200 ${accent.hover}`}`}
          >
            <span>{l.flag}</span>
            <span className={`px-1 rounded-full text-xs font-bold ${isActive ? "bg-white/25 text-white" : count > 0 ? accent.badge : "bg-slate-100 text-slate-400"}`}>
              {count}/1
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SkillsManagement() {
  const router = useRouter()
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [categories,    setCategories]    = useState<SkillCategory[]>([])
  const [skills,        setSkills]        = useState<SkillWithCategory[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage,   setErrorMessage]   = useState('')

  // ── Skill list inline editing ──
  const [editingId,       setEditingId]       = useState<string | null>(null)
  const [editingData,     setEditingData]     = useState<EditingSkill | null>(null)
  const [editingIconFile, setEditingIconFile] = useState<File | null>(null)
  const [editingLocale,   setEditingLocale]   = useState("en")

  // ── New skill form ──
  const [activeSkillLocale, setActiveSkillLocale] = useState("en")
  const [newSkill, setNewSkill] = useState<NewSkill>({
    category_id: '',
    color: '#3B82F6',
    icon: '',
    translations: { en: {}, pt: {} },
  })
  const [iconFile, setIconFile] = useState<File | null>(null)

  // ── Category list inline editing ──
  const [editingCategoryId,     setEditingCategoryId]     = useState<string | null>(null)
  const [editingCategoryData,   setEditingCategoryData]   = useState<EditingCategory | null>(null)
  const [editingCategoryLocale, setEditingCategoryLocale] = useState("en")

  // ── New category form ──
  const [activeCategoryLocale, setActiveCategoryLocale] = useState("en")
  const [newCategory, setNewCategory] = useState<NewCategory>({
    translations: { en: {}, pt: {} },
  })

  // ─── Translation helpers ──────────────────────────────────────────────────

  // New skill
  const getSkillT = (f: keyof SkillTranslation) => newSkill.translations?.[activeSkillLocale]?.[f] ?? ""
  const setSkillT = (f: keyof SkillTranslation, v: string) =>
    setNewSkill(p => ({ ...p, translations: { ...p.translations, [activeSkillLocale]: { ...(p.translations?.[activeSkillLocale] ?? {}), [f]: v } } }))
  const skillFillCount = (lc: string) => newSkill.translations?.[lc]?.name?.trim() ? 1 : 0

  // Editing skill row
  const getEditSkillT = (f: keyof SkillTranslation) => editingData?.translations?.[editingLocale]?.[f] ?? ""
  const setEditSkillT = (f: keyof SkillTranslation, v: string) => {
    if (!editingData) return
    setEditingData({ ...editingData, translations: { ...editingData.translations, [editingLocale]: { ...(editingData.translations?.[editingLocale] ?? {}), [f]: v } } })
  }
  const editSkillFillCount = (lc: string) => editingData?.translations?.[lc]?.name?.trim() ? 1 : 0

  // New category
  const getCategoryT = (f: keyof CategoryTranslation) => newCategory.translations?.[activeCategoryLocale]?.[f] ?? ""
  const setCategoryT = (f: keyof CategoryTranslation, v: string) =>
    setNewCategory(p => ({ ...p, translations: { ...p.translations, [activeCategoryLocale]: { ...(p.translations?.[activeCategoryLocale] ?? {}), [f]: v } } }))
  const categoryFillCount = (lc: string) => newCategory.translations?.[lc]?.name?.trim() ? 1 : 0

  // Editing category row
  const getEditCategoryT = (f: keyof CategoryTranslation) => editingCategoryData?.translations?.[editingCategoryLocale]?.[f] ?? ""
  const setEditCategoryT = (f: keyof CategoryTranslation, v: string) => {
    if (!editingCategoryData) return
    setEditingCategoryData({ ...editingCategoryData, translations: { ...editingCategoryData.translations, [editingCategoryLocale]: { ...(editingCategoryData.translations?.[editingCategoryLocale] ?? {}), [f]: v } } })
  }
  const editCategoryFillCount = (lc: string) => editingCategoryData?.translations?.[lc]?.name?.trim() ? 1 : 0

  // ─── Display helpers ──────────────────────────────────────────────────────

  const skillDisplayName    = (s: SkillWithCategory) => s.translations?.en?.name || s.translations?.pt?.name || s.name || 'Sem nome'
  const categoryDisplayName = (c: SkillCategory)     => c.translations?.en?.name || c.translations?.pt?.name || c.name || 'Sem nome'

  // ─── Auth + fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: catsData, error: catsError } = await supabase
        .from('skill_categories')
        .select('id, name, translations')
        .order('name', { ascending: true })
      if (catsError) throw catsError

      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('id, category_id, name, color, icon, skill_categories(name)')
        .order('name', { ascending: true })
      if (skillsError) throw skillsError

      // Fetch translations separately (avoids Supabase join+jsonb issue)
      const { data: translationsData } = await supabase
        .from('skills')
        .select('id, translations')
      const translationsMap: Record<string, Record<string, SkillTranslation>> = {}
      if (translationsData) {
        for (const row of translationsData) {
          if (row.translations) translationsMap[row.id] = row.translations
        }
      }

      setCategories((catsData || []).map(c => ({ id: c.id, name: c.name, translations: c.translations ?? null })))
      setSkills((skillsData || []).map(s => ({
        id: s.id, category_id: s.category_id, name: s.name, color: s.color, icon: s.icon,
        translations: translationsMap[s.id] ?? null,
        category_name: (s.skill_categories as any)?.name || 'Sem categoria',
      })))
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''),   5000) }

  // ─── Icon upload handlers ─────────────────────────────────────────────────

  const buildIconPath = (file: File) => {
    const ts  = Date.now()
    const rnd = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop()
    return `/logo_skills/skill_${ts}_${rnd}.${ext}`
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setIconFile(file)
    setNewSkill(p => ({ ...p, icon: buildIconPath(file) }))
    showSuccess('Ícone selecionado!')
  }

  const handleEditIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingData) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setEditingIconFile(file)
    setEditingData({ ...editingData, icon: buildIconPath(file) })
    showSuccess('Ícone selecionado!')
  }

  // ─── Skill CRUD ───────────────────────────────────────────────────────────

  const handleAddSkill = async () => {
    const enName = newSkill.translations?.en?.name?.trim()
    if (!enName)              { showError('O nome em Inglês é obrigatório'); return }
    if (!newSkill.category_id) { showError('A categoria é obrigatória');     return }
    try {
      setSaving(true)
      const { error } = await supabase.from('skills').insert([{
        name: enName,
        category_id: newSkill.category_id,
        color: newSkill.color || null,
        icon:  newSkill.icon  || null,
        translations: newSkill.translations,
      }])
      if (error) throw error
      showSuccess('Skill adicionada com sucesso!')
      setNewSkill({ category_id: '', color: '#3B82F6', icon: '', translations: { en: {}, pt: {} } })
      setIconFile(null)
      setActiveSkillLocale("en")
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao adicionar skill. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (skill: SkillWithCategory) => {
    const translations: Record<string, SkillTranslation> = { en: {}, pt: {}, ...(skill.translations ?? {}) }
    if (!translations.en.name && skill.name) translations.en.name = skill.name
    setEditingId(skill.id)
    setEditingData({ id: skill.id, color: skill.color || '#3B82F6', icon: skill.icon || '', translations })
    setEditingLocale("en")
  }

  const cancelEditing = () => { setEditingId(null); setEditingData(null); setEditingIconFile(null); setEditingLocale("en") }

  const saveEdit = async () => {
    if (!editingData) return
    const enName = editingData.translations?.en?.name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('skills').update({
        name: enName,
        color: editingData.color || null,
        icon:  editingData.icon  || null,
        translations: editingData.translations,
      }).eq('id', editingData.id)
      if (error) throw error
      showSuccess('Skill atualizada com sucesso!')
      cancelEditing()
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao atualizar skill. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta skill?')) return
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id)
      if (error) throw error
      showSuccess('Skill eliminada com sucesso!')
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao eliminar skill')
    }
  }

  // ─── Category CRUD ────────────────────────────────────────────────────────

  const handleAddCategory = async () => {
    const enName = newCategory.translations?.en?.name?.trim()
    if (!enName) { showError('O nome da categoria em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('skill_categories').insert([{
        name: enName,
        translations: newCategory.translations,
      }])
      if (error) throw error
      showSuccess('Categoria adicionada com sucesso!')
      setNewCategory({ translations: { en: {}, pt: {} } })
      setActiveCategoryLocale("en")
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao adicionar categoria. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const startEditingCategory = (cat: SkillCategory) => {
    const translations: Record<string, CategoryTranslation> = { en: {}, pt: {}, ...(cat.translations ?? {}) }
    if (!translations.en.name && cat.name) translations.en.name = cat.name
    setEditingCategoryId(cat.id)
    setEditingCategoryData({ id: cat.id, translations })
    setEditingCategoryLocale("en")
  }

  const cancelEditingCategory = () => { setEditingCategoryId(null); setEditingCategoryData(null); setEditingCategoryLocale("en") }

  const saveEditCategory = async () => {
    if (!editingCategoryData) return
    const enName = editingCategoryData.translations?.en?.name?.trim()
    if (!enName) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('skill_categories').update({
        name: enName,
        translations: editingCategoryData.translations,
      }).eq('id', editingCategoryData.id)
      if (error) throw error
      showSuccess('Categoria atualizada com sucesso!')
      cancelEditingCategory()
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao atualizar categoria. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta categoria? As skills associadas ficarão sem categoria.')) return
    try {
      const { error } = await supabase.from('skill_categories').delete().eq('id', id)
      if (error) throw error
      showSuccess('Categoria eliminada com sucesso!')
      fetchData()
    } catch (error) {
      console.error(error)
      showError('Erro ao eliminar categoria')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar skills...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-emerald-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-xl">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Gestão de Skills</h1>
                <p className="text-xl text-white/90 mt-2">
                  {skills.length} skill{skills.length !== 1 ? 's' : ''} • {categories.length} categoria{categories.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-7xl">

            {/* Feedback messages */}
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
                  SKILLS LIST
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Code2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Skills Existentes</CardTitle>
                      <CardDescription className="text-slate-700 text-base">Edita inline ou elimina skills</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {skills.length === 0 ? (
                    <div className="p-12 text-center">
                      <Code2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Nenhuma skill adicionada ainda.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Skill</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Categoria</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Cor</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Ícone</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {skills.map((skill, index) => (
                            <tr key={skill.id} className="hover:bg-slate-50 transition-colors"
                              style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                              {editingId === skill.id && editingData ? (
                                // ── EDITING MODE ──
                                <>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2 min-w-[220px]">
                                      <InlineLocaleSelector
                                        active={editingLocale}
                                        onChange={setEditingLocale}
                                        fillCount={editSkillFillCount}
                                        accentColor="emerald"
                                      />
                                      <Input
                                        value={getEditSkillT("name")}
                                        onChange={e => setEditSkillT("name", e.target.value)}
                                        className="h-10 border-2 border-emerald-600 rounded-lg font-semibold"
                                        placeholder={editingLocale === "en" ? "Nome (EN)" : "Nome (PT)"}
                                        autoFocus={editingLocale === "en"}
                                      />
                                      {editingLocale !== "en" && editingData.translations?.en?.name && (
                                        <p className="text-xs text-slate-400 truncate">
                                          🇬🇧 Base: <span className="italic">{editingData.translations.en.name}</span>
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">{skill.category_name}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2 items-center">
                                      <Input type="color" value={editingData.color}
                                        onChange={e => setEditingData({ ...editingData, color: e.target.value })}
                                        className="h-10 w-16 border-2 border-emerald-600 rounded-lg cursor-pointer" />
                                      <Input type="text" value={editingData.color}
                                        onChange={e => setEditingData({ ...editingData, color: e.target.value })}
                                        className="h-10 w-28 border-2 border-emerald-600 rounded-lg font-mono text-sm" />
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2">
                                      <Input type="file" accept="image/*" onChange={handleEditIconUpload} disabled={uploadingIcon}
                                        className="h-10 border-2 border-emerald-600 rounded-lg text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                      {editingData.icon && (
                                        <div className="flex items-center gap-2">
                                          <img src={editingData.icon} alt="Icon" className="w-6 h-6 object-contain rounded"
                                            onError={e => { e.currentTarget.style.display = 'none' }} />
                                          <span className="text-xs text-slate-600 font-mono">{editingData.icon}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
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
                                    <Badge className="text-sm px-3 py-1 font-semibold"
                                      style={{ backgroundColor: (skill.color || '#3B82F6') + '20', color: skill.color || '#3B82F6', borderColor: (skill.color || '#3B82F6') + '40', borderWidth: '2px' }}>
                                      {skillDisplayName(skill)}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 font-medium">{skill.category_name}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded border-2 border-slate-300"
                                        style={{ backgroundColor: skill.color || '#3B82F6' }} />
                                      <span className="text-sm font-mono text-slate-600">{skill.color || '-'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {skill.icon ? (
                                      <div className="flex items-center gap-2">
                                        <img src={skill.icon} alt={skillDisplayName(skill)}
                                          className="w-8 h-8 object-contain rounded border border-slate-300"
                                          onError={e => { e.currentTarget.style.display = 'none' }} />
                                        <span className="text-xs text-slate-500 font-mono">{skill.icon.split('/').pop()}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => startEditing(skill)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDelete(skill.id)}
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
                  ADD NEW SKILL FORM
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />
                <CardHeader className="bg-gradient-to-br from-emerald-50 to-emerald-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-emerald-900 mb-2">Nova Skill</CardTitle>
                      <CardDescription className="text-emerald-700 text-base">Adiciona uma nova competência</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">

                  <LocaleSelector
                    active={activeSkillLocale}
                    onChange={setActiveSkillLocale}
                    fillCount={skillFillCount}
                    accentColor="emerald"
                    note="só o nome varia por idioma"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Name — translatable */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Nome {activeSkillLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={activeSkillLocale} />
                      </Label>
                      <Input
                        value={getSkillT("name")}
                        onChange={e => setSkillT("name", e.target.value)}
                        placeholder={activeSkillLocale === "en" ? "React, Python, SQL..." : "Nome em PT..."}
                        className="h-11 border-2 border-slate-300 focus:border-emerald-600 rounded-lg"
                      />
                      <FallbackHint locale={activeSkillLocale} baseValue={newSkill.translations?.en?.name} />
                    </div>

                    {/* Category — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Categoria * <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <select
                        value={newSkill.category_id}
                        onChange={e => setNewSkill(p => ({ ...p, category_id: e.target.value }))}
                        className="w-full h-11 border-2 border-slate-300 focus:border-emerald-600 rounded-lg px-3 text-sm bg-white"
                      >
                        <option value="">Seleciona uma categoria</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{categoryDisplayName(cat)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Palette className="w-4 h-4 text-emerald-600" />
                        Cor <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input type="color" value={newSkill.color}
                          onChange={e => setNewSkill(p => ({ ...p, color: e.target.value }))}
                          className="h-11 w-20 border-2 border-slate-300 focus:border-emerald-600 rounded-lg cursor-pointer" />
                        <Input type="text" value={newSkill.color} placeholder="#3B82F6"
                          onChange={e => setNewSkill(p => ({ ...p, color: e.target.value }))}
                          className="h-11 flex-1 border-2 border-slate-300 focus:border-emerald-600 rounded-lg font-mono text-sm" />
                      </div>
                    </div>

                    {/* Icon — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        Ícone <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="file" accept="image/*" onChange={handleIconUpload} disabled={uploadingIcon}
                        className="h-11 border-2 border-slate-300 focus:border-emerald-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                      {newSkill.icon && (
                        <div className="flex items-center gap-2">
                          <img src={newSkill.icon} alt="preview" className="w-8 h-8 object-contain rounded border-2 border-emerald-300"
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                          <span className="text-xs text-emerald-700 font-medium">{newSkill.icon}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview + button */}
                  <div className="flex items-center justify-between gap-6 mt-6 pt-6 border-t-2 border-slate-200">
                    {(newSkill.translations?.en?.name || newSkill.translations?.pt?.name) && (
                      <div className="flex items-center gap-4">
                        <Label className="text-slate-900 font-semibold text-sm">Preview:</Label>
                        <Badge className="text-base px-4 py-2"
                          style={{ backgroundColor: newSkill.color + '20', color: newSkill.color, borderColor: newSkill.color + '40', borderWidth: '2px' }}>
                          {newSkill.translations?.en?.name || newSkill.translations?.pt?.name}
                        </Badge>
                      </div>
                    )}
                    <Button onClick={handleAddSkill} disabled={saving}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group ml-auto">
                      {saving ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                      ) : (
                        <><Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />Adicionar Skill</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ══════════════════════════════════════════════════════════
                  CATEGORIES LIST
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <FolderOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">Categorias Existentes</CardTitle>
                      <CardDescription className="text-blue-700 text-base">Edita inline ou elimina categorias</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {categories.length === 0 ? (
                    <div className="p-12 text-center">
                      <FolderOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Nenhuma categoria adicionada ainda.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Nome</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Skills</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {categories.map((cat, index) => (
                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors"
                              style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                              {editingCategoryId === cat.id && editingCategoryData ? (
                                // ── EDITING MODE ──
                                <>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2 min-w-[220px]">
                                      <InlineLocaleSelector
                                        active={editingCategoryLocale}
                                        onChange={setEditingCategoryLocale}
                                        fillCount={editCategoryFillCount}
                                        accentColor="blue"
                                      />
                                      <Input
                                        value={getEditCategoryT("name")}
                                        onChange={e => setEditCategoryT("name", e.target.value)}
                                        className="h-10 border-2 border-blue-600 rounded-lg font-semibold"
                                        placeholder={editingCategoryLocale === "en" ? "Nome (EN)" : "Nome (PT)"}
                                        autoFocus={editingCategoryLocale === "en"}
                                      />
                                      {editingCategoryLocale !== "en" && editingCategoryData.translations?.en?.name && (
                                        <p className="text-xs text-slate-400 truncate">
                                          🇬🇧 Base: <span className="italic">{editingCategoryData.translations.en.name}</span>
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500">
                                      {skills.filter(s => s.category_id === cat.id).length} skill{skills.filter(s => s.category_id === cat.id).length !== 1 ? 's' : ''}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={saveEditCategory} disabled={saving}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={cancelEditingCategory}
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
                                    <p className="font-bold text-slate-900">{categoryDisplayName(cat)}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-500">
                                      {skills.filter(s => s.category_id === cat.id).length} skill{skills.filter(s => s.category_id === cat.id).length !== 1 ? 's' : ''}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => startEditingCategory(cat)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}
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
                  ADD NEW CATEGORY FORM
              ══════════════════════════════════════════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">Nova Categoria</CardTitle>
                      <CardDescription className="text-blue-700 text-base">Adiciona uma nova categoria de skills</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">

                  <LocaleSelector
                    active={activeCategoryLocale}
                    onChange={setActiveCategoryLocale}
                    fillCount={categoryFillCount}
                    accentColor="blue"
                    note="só o nome varia por idioma"
                  />

                  <div className="flex items-end gap-6">
                    <div className="space-y-2 flex-1 max-w-sm">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Nome {activeCategoryLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={activeCategoryLocale} />
                      </Label>
                      <Input
                        value={getCategoryT("name")}
                        onChange={e => setCategoryT("name", e.target.value)}
                        placeholder={activeCategoryLocale === "en" ? "Frontend, Backend, DevOps..." : "Nome em PT..."}
                        className="h-11 border-2 border-slate-300 focus:border-blue-600 rounded-lg"
                      />
                      <FallbackHint locale={activeCategoryLocale} baseValue={newCategory.translations?.en?.name} />
                    </div>

                    <Button onClick={handleAddCategory} disabled={saving}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group mb-0.5">
                      {saving ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                      ) : (
                        <><Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />Adicionar Categoria</>
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
