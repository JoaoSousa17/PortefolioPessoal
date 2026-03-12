"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, Save, Loader2, Rocket, ExternalLink, Github,
  CheckCircle2, AlertCircle, Image as ImageIcon, Star, Archive,
  Trash2, RefreshCw, Languages, Sparkles
} from "lucide-react"
import { supabase, type Project } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import { SkillsPicker } from "@/components/ui/skills-picker"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectTranslation = {
  title?: string
  description?: string
  long_description?: string
}

type ProjectData = {
  thumbnail_url: string | null
  main_url: string | null
  github_url: string | null
  status: 'active' | 'archived'
  featured: boolean
  skillIds: string[]
  translations: Record<string, ProjectTranslation>
}

const LOCALES = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
]

const TRANSLATABLE_FIELDS: (keyof ProjectTranslation)[] = [
  "title", "description", "long_description"
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProject() {
  const router    = useRouter()
  const params    = useParams()
  const projectId = params?.id as string

  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage,   setErrorMessage]   = useState('')
  const [activeLocale,   setActiveLocale]   = useState("en")

  const [projectData, setProjectData] = useState<ProjectData>({
    thumbnail_url: null, main_url: null, github_url: null,
    status: 'active', featured: false, skillIds: [],
    translations: { en: {}, pt: {} },
  })
  const [originalData, setOriginalData] = useState<ProjectData | null>(null)

  // ─── Translation helpers ─────────────────────────────────────────────────

  const getT = (field: keyof ProjectTranslation): string =>
    projectData.translations?.[activeLocale]?.[field] ?? ""

  const setT = (field: keyof ProjectTranslation, value: string) =>
    setProjectData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLocale]: { ...(prev.translations?.[activeLocale] ?? {}), [field]: value },
      },
    }))

  const fillCount = (lc: string): number => {
    const tr = projectData.translations?.[lc] ?? {}
    return TRANSLATABLE_FIELDS.filter(f => tr[f]?.trim()).length
  }

  const heroTitle = () =>
    projectData.translations?.en?.title ||
    projectData.translations?.pt?.title ||
    'Carregando...'

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''), 5000) }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    if (projectId) fetchProject()
  }, [router, projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)

      // Fetch project
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Projeto não encontrado')

      // Fetch associated skills
      const { data: skillRows } = await supabase
        .from('project_skills')
        .select('skill_id')
        .eq('project_id', projectId)

      // Build translations — seed EN from top-level columns if translations JSONB is empty/missing
      const translations: Record<string, any> = {
        en: {},
        pt: {},
        ...(data.translations ?? {}),
      }
      if (!translations.en) translations.en = {}
      if (!translations.pt) translations.pt = {}

      // Seed EN fields from top-level columns as fallback (handles old data without translations)
      if (!translations.en.title            && data.title)            translations.en.title            = data.title
      if (!translations.en.description      && data.description)      translations.en.description      = data.description
      if (!translations.en.long_description && data.long_description) translations.en.long_description = data.long_description

      const formatted: ProjectData = {
        thumbnail_url: data.thumbnail_url  ?? null,
        main_url:      data.main_url       ?? null,
        github_url:    data.github_url     ?? null,
        status:        data.status         || 'active',
        featured:      data.featured       ?? false,
        skillIds:      (skillRows || []).map((r: any) => r.skill_id),
        translations,
      }

      setProjectData(formatted)
      setOriginalData(JSON.parse(JSON.stringify(formatted))) // deep clone to avoid reference sharing
    } catch (err) {
      console.error('fetchProject error:', err)
      showError('Erro ao carregar projeto')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      setUploadingImage(true)
      const ts = Date.now(), rnd = Math.random().toString(36).substring(2, 8), ext = file.name.split('.').pop()
      setProjectData(prev => ({ ...prev, thumbnail_url: `/projects/project_${ts}_${rnd}.${ext}` }))
      showSuccess('Imagem atualizada com sucesso!')
    } catch {
      showError('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleInputChange = (field: keyof Omit<ProjectData, 'translations' | 'skillIds'>, value: string | boolean) =>
    setProjectData(prev => ({
      ...prev,
      [field]: field === 'featured' || field === 'status' ? value : (value || null),
    }))

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const enTitle = projectData.translations?.en?.title?.trim()
    if (!enTitle) { showError('O título em Inglês é obrigatório'); return }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('projects')
        .update({
          title:            enTitle,
          description:      projectData.translations?.en?.description?.trim() || null,
          long_description: projectData.translations?.en?.long_description?.trim() || null,
          thumbnail_url:    projectData.thumbnail_url,
          main_url:         projectData.main_url,
          github_url:       projectData.github_url,
          status:           projectData.status,
          featured:         projectData.featured,
          translations:     projectData.translations,
        })
        .eq('id', projectId)
      if (error) throw error

      // Replace junction rows
      await supabase.from('project_skills').delete().eq('project_id', projectId)
      if (projectData.skillIds.length > 0) {
        await supabase.from('project_skills').insert(
          projectData.skillIds.map(sid => ({ project_id: projectId, skill_id: sid }))
        )
      }

      showSuccess('Projeto atualizado com sucesso!')
      setOriginalData(JSON.parse(JSON.stringify(projectData))) // deep clone
    } catch {
      showError('Erro ao atualizar projeto. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalData) { setProjectData(JSON.parse(JSON.stringify(originalData))); showSuccess('Alterações revertidas!') }
  }

  const handleDelete = async () => {
    if (!confirm('Tens a certeza que queres eliminar este projeto? Esta ação não pode ser revertida.')) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
      if (error) throw error
      router.push('/admin/projectManagement')
    } catch {
      showError('Erro ao eliminar projeto')
    }
  }

  const hasChanges = originalData && JSON.stringify(projectData) !== JSON.stringify(originalData)

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar projeto...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-red-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin/projectManagement">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar aos Projetos
              </Link>
            </Button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Editar Projeto</h1>
                  <p className="text-xl text-white/90 mt-2">{heroTitle()}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className={`text-sm px-4 py-2 border-0 ${projectData.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                  {projectData.status === 'active' ? 'Ativo' : 'Arquivado'}
                </Badge>
                {projectData.featured && (
                  <Badge className="text-sm px-4 py-2 bg-yellow-500 text-white border-0">
                    <Star className="w-4 h-4 mr-1" />Destaque
                  </Badge>
                )}
                {projectData.skillIds.length > 0 && (
                  <Badge className="text-sm px-4 py-2 bg-purple-500 text-white border-0">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {projectData.skillIds.length} skill{projectData.skillIds.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-5xl">

            {/* Messages */}
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
            {hasChanges && (
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-500 rounded-xl p-4 flex items-center justify-between animate-in fade-in shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-6 h-6 text-white" /></div>
                  <p className="font-semibold text-amber-900 text-lg">Tens alterações não guardadas</p>
                </div>
                <Button onClick={handleReset} variant="outline" size="sm" className="border-2 border-amber-600 text-amber-900 hover:bg-amber-100 font-semibold">
                  <RefreshCw className="w-4 h-4 mr-2" />Reverter
                </Button>
              </div>
            )}

            <div className="space-y-6">

              {/* Language selector */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Languages className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-slate-800 text-lg">Idioma de edição</span>
                    <span className="text-sm text-slate-500">— os campos de texto são guardados por idioma</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {LOCALES.map(l => {
                      const count    = fillCount(l.code)
                      const isActive = activeLocale === l.code
                      return (
                        <button key={l.code} onClick={() => setActiveLocale(l.code)}
                          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-semibold transition-all ${
                            isActive ? 'bg-red-600 text-white border-red-600 shadow-lg scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-red-400 hover:shadow'
                          }`}>
                          <span className="text-xl">{l.flag}</span>
                          <span>{l.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/25 text-white' : count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}>{count}/{TRANSLATABLE_FIELDS.length}</span>
                        </button>
                      )
                    })}
                  </div>
                  {activeLocale !== "en" && (
                    <p className="mt-3 text-sm text-slate-500">
                      A editar tradução em <strong>{LOCALES.find(l => l.code === activeLocale)?.label}</strong>.
                      Campos vazios usam o conteúdo em Inglês como fallback.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Basic info */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                <CardHeader className="bg-gradient-to-br from-red-50 to-red-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Rocket className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-red-900 mb-2">Informação do Projeto</CardTitle>
                      <CardDescription className="text-red-700 text-base">Título, descrições e imagem</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      Título {activeLocale === "en" && <span className="text-red-500">*</span>}
                      <LocaleBadge locale={activeLocale} />
                    </Label>
                    <Input value={getT("title")} onChange={e => setT("title", e.target.value)}
                      placeholder={activeLocale === "en" ? "Nome do projeto" : "Nome do projeto (PT)"}
                      className="h-12 border-2 border-slate-300 focus:border-red-600 rounded-lg" />
                    <FallbackHint locale={activeLocale} baseValue={projectData.translations?.en?.title} />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      Descrição Curta <LocaleBadge locale={activeLocale} />
                    </Label>
                    <Textarea value={getT("description")} onChange={e => setT("description", e.target.value)}
                      placeholder="Breve descrição..." rows={3}
                      className="border-2 border-slate-300 focus:border-red-600 rounded-lg resize-none" />
                    <FallbackHint locale={activeLocale} baseValue={projectData.translations?.en?.description} />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      Descrição Longa <LocaleBadge locale={activeLocale} />
                    </Label>
                    <Textarea value={getT("long_description")} onChange={e => setT("long_description", e.target.value)}
                      placeholder="Descrição detalhada..." rows={6}
                      className="border-2 border-slate-300 focus:border-red-600 rounded-lg resize-none" />
                  </div>

                  {projectData.thumbnail_url && (
                    <div className="space-y-3">
                      <Label className="text-slate-900 font-semibold text-base">
                        Imagem Atual <span className="ml-2 text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <div className="relative w-full max-w-md">
                        <img src={projectData.thumbnail_url} alt={heroTitle()}
                          className="w-full h-48 object-cover rounded-lg border-2 border-slate-300" />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 text-slate-900 border border-slate-300">
                            <ImageIcon className="w-3 h-3 mr-1" />Atual
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-red-600" />
                      {projectData.thumbnail_url ? 'Alterar Imagem' : 'Adicionar Imagem'}
                      <span className="text-xs text-slate-400 font-normal">(global)</span>
                    </Label>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage}
                      className="h-12 border-2 border-slate-300 focus:border-red-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                    {uploadingImage && (
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />A fazer upload...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-purple-900 mb-2">Skills</CardTitle>
                      <CardDescription className="text-purple-700 text-base">
                        Tecnologias e competências utilizadas neste projeto
                        <span className="ml-2 text-xs font-normal">(global)</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <SkillsPicker
                    selectedIds={projectData.skillIds}
                    onChange={ids => setProjectData(prev => ({ ...prev, skillIds: ids }))}
                    accentColor="red"
                    label="Skills utilizadas no projeto"
                  />
                </CardContent>
              </Card>

              {/* Links */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <ExternalLink className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">Links e URLs</CardTitle>
                      <CardDescription className="text-blue-700 text-base">Demo e repositório do projeto</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      URL Demo <span className="text-xs text-slate-400 font-normal">(global)</span>
                    </Label>
                    <Input value={projectData.main_url || ''} onChange={e => handleInputChange('main_url', e.target.value)}
                      placeholder="https://..." className="h-12 border-2 border-slate-300 focus:border-blue-600 rounded-lg" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <Github className="w-4 h-4 text-blue-600" />
                      URL GitHub <span className="text-xs text-slate-400 font-normal">(global)</span>
                    </Label>
                    <Input value={projectData.github_url || ''} onChange={e => handleInputChange('github_url', e.target.value)}
                      placeholder="https://github.com/..." className="h-12 border-2 border-slate-300 focus:border-blue-600 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Configurações</CardTitle>
                      <CardDescription className="text-slate-700 text-base">Status e visibilidade do projeto</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                    <input type="checkbox" id="featured" checked={projectData.featured}
                      onChange={e => handleInputChange('featured', e.target.checked)}
                      className="w-6 h-6 text-yellow-600 border-2 border-yellow-400 rounded" />
                    <Label htmlFor="featured" className="text-slate-900 font-semibold text-base flex items-center gap-2 cursor-pointer flex-1">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Projeto em Destaque
                      <span className="text-sm text-slate-600 font-normal ml-auto">Aparecerá em destaque no portfólio</span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-300 rounded-xl">
                    <input type="checkbox" id="archived" checked={projectData.status === 'archived'}
                      onChange={e => handleInputChange('status', e.target.checked ? 'archived' : 'active')}
                      className="w-6 h-6 text-slate-600 border-2 border-slate-400 rounded" />
                    <Label htmlFor="archived" className="text-slate-900 font-semibold text-base flex items-center gap-2 cursor-pointer flex-1">
                      <Archive className="w-5 h-5 text-slate-600" />
                      Arquivado
                      <span className="text-sm text-slate-600 font-normal ml-auto">Projeto não será exibido publicamente</span>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <Button variant="outline" onClick={handleDelete}
                  className="h-14 px-8 text-base font-semibold border-2 border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 group">
                  <Trash2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Eliminar Projeto
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => router.push('/admin/projectManagement')} className="h-14 px-8 text-base font-semibold border-2">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving || uploadingImage || !hasChanges}
                    className="h-14 px-8 text-base font-bold bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving
                      ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A guardar...</>
                      : <><Save className="w-5 h-5 mr-2" />Guardar Alterações</>}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LocaleBadge({ locale }: { locale: string }) {
  return locale === "en"
    ? <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
    : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
}

function FallbackHint({ locale, baseValue }: { locale: string; baseValue?: string }) {
  if (locale === "en" || !baseValue) return null
  return <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{baseValue}</span></p>
}
