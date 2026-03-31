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
  ArrowLeft, Loader2, Award, Plus, Edit, Trash2,
  CheckCircle2, AlertCircle, X, Check, GraduationCap,
  Calendar, Star, Image as ImageIcon, Languages
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import { SkillsPicker } from "@/components/ui/skills-picker"
import Link from "next/link"

const LOCALES = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
]

const TRANSLATABLE_FIELDS = ["title", "description"] as const
type TranslatableField = typeof TRANSLATABLE_FIELDS[number]

type CourseTranslation = {
  title?: string
  description?: string
}

type Course = {
  id: string
  title: string
  college_name: string
  description: string | null
  importance: 'high' | 'medium' | 'low' | null
  certificate_url: string | null
  college_logo: string | null
  featured: boolean
  completion_date: string | null
  created_at: string
  translations?: Record<string, CourseTranslation> | null
  skillIds: string[]
}

type EditingCourse = {
  id: string
  college_name: string
  importance: 'high' | 'medium' | 'low' | null
  certificate_url: string
  college_logo: string
  featured: boolean
  completion_date: string
  translations: Record<string, CourseTranslation>
  skillIds: string[]
}

type NewCourse = {
  college_name: string
  importance: 'high' | 'medium' | 'low'
  certificate_url: string
  college_logo: string
  featured: boolean
  completion_date: string
  skillIds: string[]
  translations: Record<string, CourseTranslation>
}

function LocaleBadge({ locale }: { locale: string }) {
  return locale === "en"
    ? <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
    : <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
}

function FallbackHint({ locale, baseValue }: { locale: string; baseValue?: string }) {
  if (locale === "en" || !baseValue) return null
  return <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{baseValue}</span></p>
}

function LocaleSelector({ active, onChange, fillCount }: { active: string; onChange: (lc: string) => void; fillCount: (lc: string) => number }) {
  return (
    <div className="mb-6 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-4 h-4 text-orange-600" />
        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
        <span className="text-xs text-slate-500 ml-1">— título e descrição variam por idioma</span>
      </div>
      <div className="flex gap-2">
        {LOCALES.map(l => {
          const count = fillCount(l.code), isActive = active === l.code
          return (
            <button key={l.code} onClick={() => onChange(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                isActive ? 'bg-orange-600 text-white border-orange-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400'
              }`}>
              <span>{l.flag}</span><span>{l.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/25 text-white' : count > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'
              }`}>{count}/{TRANSLATABLE_FIELDS.length}</span>
            </button>
          )
        })}
      </div>
      {active !== "en" && <p className="text-xs text-slate-500 mt-2">Campos vazios usam os valores em Inglês como fallback.</p>}
    </div>
  )
}

function InlineLocaleSelector({ active, onChange, fillCount }: { active: string; onChange: (lc: string) => void; fillCount: (lc: string) => number }) {
  return (
    <div className="flex gap-1.5 mb-2">
      {LOCALES.map(l => {
        const count = fillCount(l.code), isActive = active === l.code
        return (
          <button key={l.code} onClick={() => onChange(l.code)}
            className={`flex items-center gap-1 px-2 py-1 rounded border font-semibold text-xs transition-all ${
              isActive ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-400'
            }`}>
            <span>{l.flag}</span>
            <span className={`px-1 rounded-full text-xs font-bold ${
              isActive ? 'bg-white/25 text-white' : count > 0 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'
            }`}>{count}/{TRANSLATABLE_FIELDS.length}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function CoursesManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingCourse | null>(null)
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null)
  const [editingCertificateFile, setEditingCertificateFile] = useState<File | null>(null)
  const [editingLocale, setEditingLocale] = useState("en")

  const [activeLocale, setActiveLocale] = useState("en")
  const [newCourse, setNewCourse] = useState<NewCourse>({
    college_name: '', importance: 'medium', certificate_url: '',
    college_logo: '', featured: false, completion_date: '',
    skillIds: [], translations: { en: {}, pt: {} },
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)

  const importanceLevels = [
    { value: 'high',   label: 'Alta Relevância',  color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'medium', label: 'Média Relevância', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'low',    label: 'Baixa Relevância', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  ]

  const getT = (f: TranslatableField): string => newCourse.translations?.[activeLocale]?.[f] ?? ""
  const setT = (f: TranslatableField, v: string) =>
    setNewCourse(p => ({ ...p, translations: { ...p.translations, [activeLocale]: { ...(p.translations?.[activeLocale] ?? {}), [f]: v } } }))
  const fillCount = (lc: string): number =>
    TRANSLATABLE_FIELDS.filter(f => newCourse.translations?.[lc]?.[f]?.trim()).length

  const getEditT = (f: TranslatableField): string => editingData?.translations?.[editingLocale]?.[f] ?? ""
  const setEditT = (f: TranslatableField, v: string) => {
    if (!editingData) return
    setEditingData({ ...editingData, translations: { ...editingData.translations, [editingLocale]: { ...(editingData.translations?.[editingLocale] ?? {}), [f]: v } } })
  }
  const editFillCount = (lc: string): number =>
    TRANSLATABLE_FIELDS.filter(f => editingData?.translations?.[lc]?.[f]?.trim()).length

  const courseTitle = (c: Course) => c.translations?.en?.title || c.translations?.pt?.title || c.title || 'Sem título'
  const courseDesc  = (c: Course) => c.translations?.en?.description || c.translations?.pt?.description || c.description || ''

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''), 5000) }

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses').select('*').order('completion_date', { ascending: false, nullsFirst: false })
      if (error) throw error
      const coursesWithSkills = await Promise.all(
        (data || []).map(async (course) => {
          const { data: jd } = await supabase.from('course_skills').select('skill_id').eq('course_id', course.id)
          return { ...course, skillIds: (jd || []).map((j: any) => j.skill_id) }
        })
      )
      setCourses(coursesWithSkills)
    } catch {
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const buildLogoPath = (file: File) => {
    const ts = Date.now(), rnd = Math.random().toString(36).substring(2, 8), ext = file.name.split('.').pop()
    return `/logo_skills/course_logo_${ts}_${rnd}.${ext}`
  }
  const buildCertPath = (file: File) => {
    const ts = Date.now(), rnd = Math.random().toString(36).substring(2, 8), ext = file.name.split('.').pop()
    return `/certificates/certificate_${ts}_${rnd}.${ext}`
  }
  const validCertTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { showError('Seleciona uma imagem válida'); return }
    setLogoFile(file); setNewCourse(p => ({ ...p, college_logo: buildLogoPath(file) })); showSuccess('Logo selecionado!')
  }
  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !editingData) return
    if (!file.type.startsWith('image/')) { showError('Seleciona uma imagem válida'); return }
    setEditingLogoFile(file); setEditingData({ ...editingData, college_logo: buildLogoPath(file) }); showSuccess('Logo selecionado!')
  }
  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!validCertTypes.includes(file.type)) { showError('Seleciona um PDF ou imagem válida'); return }
    setCertificateFile(file); setNewCourse(p => ({ ...p, certificate_url: buildCertPath(file) })); showSuccess('Certificado selecionado!')
  }
  const handleEditCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !editingData) return
    if (!validCertTypes.includes(file.type)) { showError('Seleciona um PDF ou imagem válida'); return }
    setEditingCertificateFile(file); setEditingData({ ...editingData, certificate_url: buildCertPath(file) }); showSuccess('Certificado selecionado!')
  }

  const saveSkills = async (courseId: string, skillIds: string[]) => {
    await supabase.from('course_skills').delete().eq('course_id', courseId)
    if (skillIds.length > 0)
      await supabase.from('course_skills').insert(skillIds.map(sid => ({ course_id: courseId, skill_id: sid })))
  }

  const handleAddCourse = async () => {
    const enTitle = newCourse.translations?.en?.title?.trim()
    if (!enTitle) { showError('O título em Inglês é obrigatório'); return }
    if (!newCourse.college_name.trim()) { showError('O nome da instituição é obrigatório'); return }
    try {
      setSaving(true)
      const { data: courseData, error } = await supabase.from('courses').insert([{
        title: enTitle, college_name: newCourse.college_name,
        description: newCourse.translations?.en?.description?.trim() || null,
        importance: newCourse.importance, certificate_url: newCourse.certificate_url || null,
        college_logo: newCourse.college_logo || null, featured: newCourse.featured,
        completion_date: newCourse.completion_date || null, translations: newCourse.translations,
      }]).select().single()
      if (error) throw error
      if (courseData) await saveSkills(courseData.id, newCourse.skillIds)
      showSuccess('Curso adicionado com sucesso!')
      setNewCourse({ college_name: '', importance: 'medium', certificate_url: '', college_logo: '', featured: false, completion_date: '', skillIds: [], translations: { en: {}, pt: {} } })
      setLogoFile(null); setCertificateFile(null); setActiveLocale("en")
      fetchData()
    } catch {
      showError('Erro ao adicionar curso. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (course: Course) => {
    const translations: Record<string, CourseTranslation> = { en: {}, pt: {}, ...(course.translations ?? {}) }
    if (!translations.en.title && course.title) translations.en.title = course.title
    if (!translations.en.description && course.description) translations.en.description = course.description
    setEditingId(course.id)
    setEditingData({
      id: course.id, college_name: course.college_name, importance: course.importance,
      certificate_url: course.certificate_url || '', college_logo: course.college_logo || '',
      featured: course.featured, completion_date: course.completion_date || '',
      translations, skillIds: course.skillIds,
    })
    setEditingLocale("en")
  }

  const cancelEditing = () => {
    setEditingId(null); setEditingData(null)
    setEditingLogoFile(null); setEditingCertificateFile(null); setEditingLocale("en")
  }

  const saveEdit = async () => {
    if (!editingData) return
    const enTitle = editingData.translations?.en?.title?.trim()
    if (!enTitle) { showError('O título em Inglês é obrigatório'); return }
    if (!editingData.college_name.trim()) { showError('O nome da instituição é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('courses').update({
        title: enTitle, college_name: editingData.college_name,
        description: editingData.translations?.en?.description?.trim() || null,
        importance: editingData.importance, certificate_url: editingData.certificate_url || null,
        college_logo: editingData.college_logo || null, featured: editingData.featured,
        completion_date: editingData.completion_date || null, translations: editingData.translations,
      }).eq('id', editingData.id)
      if (error) throw error
      await saveSkills(editingData.id, editingData.skillIds)
      showSuccess('Curso atualizado com sucesso!')
      cancelEditing(); fetchData()
    } catch {
      showError('Erro ao atualizar curso.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este curso?')) return
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
      showSuccess('Curso eliminado com sucesso!'); fetchData()
    } catch {
      showError('Erro ao eliminar curso')
    }
  }

  const getImportanceBadge = (importance: 'high' | 'medium' | 'low' | null) =>
    importanceLevels.find(l => l.value === importance) || { label: '-', color: 'bg-slate-100 text-slate-600' }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isCertificatePDF = (url: string | null) => url?.toLowerCase().endsWith('.pdf') ?? false

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {viewingCertificate && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingCertificate(null)}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b-2 border-slate-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Award className="w-7 h-7 text-orange-600" /> Certificado
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setViewingCertificate(null)}
                className="text-slate-600 hover:bg-slate-200 rounded-full w-10 h-10 p-0">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-88px)]">
              {isCertificatePDF(viewingCertificate)
                ? <iframe src={viewingCertificate} className="w-full h-[70vh] rounded-lg border-2 border-slate-300" title="Certificate PDF" />
                : <img src={viewingCertificate} alt="Certificate" className="w-full h-auto rounded-lg border-2 border-slate-300" />}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
        <TopBar />

        <main className="flex-grow">
          <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-orange-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-orange-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            </div>
            <div className="relative container mx-auto px-6">
              <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
                <Link href="/admin"><ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />Voltar ao Dashboard</Link>
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Gestão de Cursos</h1>
                  <p className="text-xl text-white/90 mt-2">
                    {courses.length} curso{courses.length !== 1 ? 's' : ''} · {courses.filter(c => c.featured).length} em destaque
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container mx-auto px-6 max-w-7xl">

              {successMessage && (
                <div className="mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-6 h-6 text-white" /></div>
                  <p className="font-semibold text-emerald-900 text-lg">{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-6 h-6 text-white" /></div>
                  <p className="font-semibold text-red-900 text-lg">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-8">

                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                  <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Cursos Existentes</CardTitle>
                        <CardDescription className="text-slate-700 text-base">Edita inline ou elimina cursos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 bg-white">
                    {courses.length === 0 ? (
                      <div className="p-12 text-center">
                        <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-700 text-lg">Nenhum curso adicionado ainda.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-100 border-b-2 border-slate-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Logo</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Curso</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Instituição</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Importância</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Skills</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Data</th>
                              <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Destaque</th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {courses.map((course, index) => (
                              <tr key={course.id} className="hover:bg-slate-50 transition-colors"
                                style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                                {editingId === course.id && editingData ? (
                                  <>
                                    {/* Logo — styled label instead of raw file input */}
                                    <td className="px-6 py-4 align-top">
                                      <div className="space-y-2">
                                        <label className="flex items-center gap-2 h-10 px-3 border-2 border-orange-600 rounded-lg bg-white cursor-pointer hover:bg-orange-50 transition-colors">
                                          <ImageIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                          <span className="text-xs text-orange-700 font-semibold truncate flex-1">
                                            {editingLogoFile ? editingLogoFile.name : 'Escolher logo...'}
                                          </span>
                                          <input type="file" accept="image/*" onChange={handleEditLogoUpload} disabled={uploadingLogo} className="hidden" />
                                        </label>
                                        {editingData.college_logo && (
                                          <img src={editingData.college_logo} alt="Logo" className="w-12 h-12 object-contain rounded border-2 border-orange-300"
                                            onError={e => { e.currentTarget.style.display = 'none' }} />
                                        )}
                                      </div>
                                    </td>

                                    {/* Title + Description */}
                                    <td className="px-6 py-4 align-top">
                                      <div className="space-y-2 min-w-[260px]">
                                        <InlineLocaleSelector active={editingLocale} onChange={setEditingLocale} fillCount={editFillCount} />
                                        <div className="space-y-1">
                                          <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                            Título <LocaleBadge locale={editingLocale} />
                                          </Label>
                                          <Input value={getEditT("title")} onChange={e => setEditT("title", e.target.value)}
                                            className="h-10 border-2 border-orange-600 rounded-lg font-semibold"
                                            placeholder={editingLocale === "en" ? "Título (EN)" : "Título (PT)"} autoFocus={editingLocale === "en"} />
                                          {editingLocale !== "en" && editingData.translations?.en?.title && (
                                            <p className="text-xs text-slate-400 truncate">🇬🇧 <span className="italic">{editingData.translations.en.title}</span></p>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                            Descrição <LocaleBadge locale={editingLocale} />
                                          </Label>
                                          <Textarea value={getEditT("description")} onChange={e => setEditT("description", e.target.value)}
                                            rows={2} className="border-2 border-orange-600 rounded-lg text-sm resize-none"
                                            placeholder={editingLocale === "en" ? "Descrição (EN)" : "Descrição (PT)"} />
                                        </div>
                                      </div>
                                    </td>

                                    {/* Institution + Certificate — styled label */}
                                    <td className="px-6 py-4 align-top">
                                      <div className="space-y-2 min-w-[180px]">
                                        <Label className="text-xs font-semibold text-slate-600">Instituição <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input value={editingData.college_name} onChange={e => setEditingData({ ...editingData, college_name: e.target.value })}
                                          className="h-10 border-2 border-orange-600 rounded-lg" placeholder="Nome da instituição" />
                                        <Label className="text-xs font-semibold text-slate-600 mt-2 block">Certificado <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <label className="flex items-center gap-2 h-10 px-3 border-2 border-orange-600 rounded-lg bg-white cursor-pointer hover:bg-orange-50 transition-colors">
                                          <Award className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                          <span className="text-xs text-orange-700 font-semibold truncate flex-1">
                                            {editingCertificateFile ? editingCertificateFile.name : 'Escolher certificado...'}
                                          </span>
                                          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleEditCertificateUpload} disabled={uploadingCertificate} className="hidden" />
                                        </label>
                                        {editingData.certificate_url && (
                                          <div className="flex items-center gap-1">
                                            <Award className="w-3 h-3 text-orange-600 flex-shrink-0" />
                                            <span className="text-xs text-orange-700 truncate">{editingData.certificate_url.split('/').pop()}</span>
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    {/* Importance */}
                                    <td className="px-6 py-4 align-top">
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-600">Importância <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <select value={editingData.importance || ''}
                                          onChange={e => setEditingData({ ...editingData, importance: e.target.value as any })}
                                          className="w-full h-10 border-2 border-orange-600 rounded-lg px-2 text-sm bg-white">
                                          {importanceLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                        </select>
                                      </div>
                                    </td>

                                    {/* Skills */}
                                    <td className="px-6 py-4 align-top">
                                      <div className="min-w-[220px]">
                                        <SkillsPicker
                                          selectedIds={editingData.skillIds}
                                          onChange={ids => setEditingData({ ...editingData, skillIds: ids })}
                                          accentColor="orange"
                                          label="Skills"
                                        />
                                      </div>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 align-top">
                                      <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-slate-600">Data <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input type="date" value={editingData.completion_date}
                                          onChange={e => setEditingData({ ...editingData, completion_date: e.target.value })}
                                          className="h-10 border-2 border-orange-600 rounded-lg text-sm" />
                                      </div>
                                    </td>

                                    {/* Featured */}
                                    <td className="px-6 py-4 align-top text-center">
                                      <input type="checkbox" checked={editingData.featured}
                                        onChange={e => setEditingData({ ...editingData, featured: e.target.checked })}
                                        className="w-5 h-5 text-orange-600 border-2 border-orange-400 rounded" />
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                      <div className="flex items-start justify-end gap-2 pt-1">
                                        <Button variant="ghost" size="sm" onClick={saveEdit} disabled={saving} className="text-emerald-600 hover:bg-emerald-50">
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={cancelEditing} className="text-slate-600 hover:bg-slate-100">
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-6 py-4">
                                      {course.college_logo ? (
                                        <img src={course.college_logo} alt={course.college_name}
                                          className="w-12 h-12 object-contain rounded border border-slate-300"
                                          onError={e => { e.currentTarget.style.display = 'none' }} />
                                      ) : (
                                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                          <GraduationCap className="w-6 h-6 text-slate-400" />
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="font-bold text-slate-900 mb-1">{courseTitle(course)}</p>
                                      {courseDesc(course) && <p className="text-sm text-slate-600 line-clamp-2">{courseDesc(course)}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="font-semibold text-slate-700 mb-1">{course.college_name}</p>
                                      {course.certificate_url && (
                                        <button onClick={() => setViewingCertificate(course.certificate_url)}
                                          className="text-orange-600 hover:text-orange-800 text-xs flex items-center gap-1 font-semibold hover:underline">
                                          <Award className="w-3 h-3" />Ver Certificado
                                        </button>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <Badge className={`${getImportanceBadge(course.importance).color} border font-semibold text-xs`}>
                                        {getImportanceBadge(course.importance).label}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                      {course.skillIds.length > 0 ? (
                                        <span className="text-xs text-slate-500 font-medium">
                                          {course.skillIds.length} skill{course.skillIds.length !== 1 ? 's' : ''}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-slate-300">—</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4" />{formatDate(course.completion_date)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      {course.featured && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto" />}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => startEditing(course)} className="text-blue-600 hover:bg-blue-50">
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="text-red-600 hover:bg-red-50">
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

                {/* Add new course form */}
                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                  <div className="h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
                  <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Plus className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-orange-900 mb-2">Novo Curso</CardTitle>
                        <CardDescription className="text-orange-700 text-base">Adiciona um novo curso ou certificação</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 bg-white">
                    <LocaleSelector active={activeLocale} onChange={setActiveLocale} fillCount={fillCount} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                      <div className="space-y-2 lg:col-span-2">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          Título do Curso {activeLocale === "en" && <span className="text-red-500">*</span>}
                          <LocaleBadge locale={activeLocale} />
                        </Label>
                        <Input value={getT("title")} onChange={e => setT("title", e.target.value)}
                          placeholder={activeLocale === "en" ? "Ex: Introduction to AI Agents" : "Título em PT..."}
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg" />
                        <FallbackHint locale={activeLocale} baseValue={newCourse.translations?.en?.title} />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          Importância <span className="text-xs text-slate-400 font-normal">(global)</span>
                        </Label>
                        <select value={newCourse.importance}
                          onChange={e => setNewCourse(p => ({ ...p, importance: e.target.value as any }))}
                          className="w-full h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg px-3 text-sm bg-white">
                          {importanceLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          Instituição * <span className="text-xs text-slate-400 font-normal">(global)</span>
                        </Label>
                        <Input value={newCourse.college_name}
                          onChange={e => setNewCourse(p => ({ ...p, college_name: e.target.value }))}
                          placeholder="Ex: DataCamp"
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          Data de Conclusão <span className="text-xs text-slate-400 font-normal">(global)</span>
                        </Label>
                        <Input type="date" value={newCourse.completion_date}
                          onChange={e => setNewCourse(p => ({ ...p, completion_date: e.target.value }))}
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg" />
                      </div>

                      <div className="space-y-2 flex items-end">
                        <div className="flex items-center gap-3 h-11">
                          <input type="checkbox" id="featured" checked={newCourse.featured}
                            onChange={e => setNewCourse(p => ({ ...p, featured: e.target.checked }))}
                            className="w-5 h-5 text-orange-600 border-2 border-slate-300 rounded" />
                          <Label htmlFor="featured" className="text-slate-900 font-semibold text-sm cursor-pointer flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            Em Destaque <span className="text-xs text-slate-400 font-normal">(global)</span>
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2 lg:col-span-2">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          <Award className="w-4 h-4 text-orange-600" />
                          Certificado (PDF ou Imagem) <span className="text-xs text-slate-400 font-normal">(global)</span>
                        </Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleCertificateUpload} disabled={uploadingCertificate}
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                        {newCourse.certificate_url && (
                          <div className="flex items-center gap-2 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                            <Award className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            <span className="text-sm text-orange-700 font-medium truncate">{newCourse.certificate_url.split('/').pop()}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-orange-600" />
                          Logo da Instituição <span className="text-xs text-slate-400 font-normal">(global)</span>
                        </Label>
                        <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo}
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                        {newCourse.college_logo && (
                          <div className="flex items-center gap-2">
                            <img src={newCourse.college_logo} alt="Logo preview" className="w-8 h-8 object-contain rounded border-2 border-orange-300"
                              onError={e => { e.currentTarget.style.display = 'none' }} />
                            <span className="text-xs text-orange-700 font-medium">{newCourse.college_logo.split('/').pop()}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 lg:col-span-3">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          Descrição <LocaleBadge locale={activeLocale} />
                        </Label>
                        <Textarea value={getT("description")} onChange={e => setT("description", e.target.value)}
                          placeholder={activeLocale === "en" ? "Descrição do curso..." : "Descrição em PT..."}
                          rows={3} className="border-2 border-slate-300 focus:border-orange-600 rounded-lg resize-none" />
                        <FallbackHint locale={activeLocale} baseValue={newCourse.translations?.en?.description} />
                      </div>

                      <div className="lg:col-span-3">
                        <SkillsPicker
                          selectedIds={newCourse.skillIds}
                          onChange={ids => setNewCourse(p => ({ ...p, skillIds: ids }))}
                          accentColor="orange"
                          label="Skills abordadas no curso"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                      <Button onClick={handleAddCourse} disabled={saving || uploadingLogo || uploadingCertificate}
                        className="h-12 px-8 text-base font-bold bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white shadow-lg">
                        {saving
                          ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                          : <><Plus className="w-5 h-5 mr-2" />Adicionar Curso</>}
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
          @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        `}</style>
      </div>
    </>
  )
}
