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
  Heart, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Award,
  BookOpen,
  Building,
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

const TRANSLATABLE_FIELDS = ["title", "_description"] as const
type TranslatableField = typeof TRANSLATABLE_FIELDS[number]

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialTranslation = { title?: string; _description?: string }

type SocialProject = {
  id: string
  title: string
  date: string | null
  image_url: string | null
  _description: string | null
  institution_name: string | null
  instituition_logo: string | null
  institution_link: string | null
  certificate_url: string | null
  is_public: boolean
  is_voluntariado: boolean
  translations?: Record<string, SocialTranslation> | null
}

type EditingProject = {
  id: string
  date: string
  image_url: string
  institution_name: string
  instituition_logo: string
  institution_link: string
  certificate_url: string
  is_public: boolean
  translations: Record<string, SocialTranslation>
}

type NewVolunteer = {
  date: string
  image_url: string
  institution_name: string
  instituition_logo: string
  institution_link: string
  certificate_url: string
  is_public: boolean
  translations: Record<string, SocialTranslation>
}

type BookData = {
  is_public: boolean
  translations: Record<string, SocialTranslation>
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LocaleBadge({ locale, accent = "rose" }: { locale: string; accent?: string }) {
  if (locale === "en")
    return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
  if (accent === "purple")
    return <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
  return <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
}

function FallbackHint({ locale, baseValue }: { locale: string; baseValue?: string }) {
  if (locale === "en" || !baseValue) return null
  return <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{baseValue}</span></p>
}

// Accent colour token → hardcoded Tailwind class maps (avoids JIT purge issues)
const accentCls = {
  rose:   { activeBg: "bg-rose-600",   activeBorder: "border-rose-600",   hoverBorder: "hover:border-rose-400",   pillActive: "bg-rose-700",   pillFill: "bg-rose-100 text-rose-700" },
  purple: { activeBg: "bg-purple-600", activeBorder: "border-purple-600", hoverBorder: "hover:border-purple-400", pillActive: "bg-purple-700", pillFill: "bg-purple-100 text-purple-700" },
} as const
type AccentKey = keyof typeof accentCls

function LocaleSelector({
  active, onChange, fillCount, accent = "rose",
}: { active: string; onChange: (lc: string) => void; fillCount: (lc: string) => number; accent?: AccentKey }) {
  const c = accentCls[accent]
  return (
    <div className="mb-5 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Languages className={`w-4 h-4 ${accent === "purple" ? "text-purple-600" : "text-rose-600"}`} />
        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
        <span className="text-xs text-slate-500 ml-1">— título e descrição variam por idioma</span>
      </div>
      <div className="flex gap-2">
        {LOCALES.map(l => {
          const count = fillCount(l.code); const isActive = active === l.code
          return (
            <button key={l.code} onClick={() => onChange(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                isActive
                  ? `${c.activeBg} text-white ${c.activeBorder} shadow`
                  : `bg-white text-slate-700 border-slate-200 ${c.hoverBorder}`
              }`}>
              <span>{l.flag}</span>
              <span>{l.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? `${c.pillActive} text-white` : count > 0 ? c.pillFill : "bg-slate-100 text-slate-400"
              }`}>
                {count}/{TRANSLATABLE_FIELDS.length}
              </span>
            </button>
          )
        })}
      </div>
      {active !== "en" && <p className="text-xs text-slate-500 mt-2">Campos vazios usam os valores em Inglês como fallback.</p>}
    </div>
  )
}

function InlineLocaleSelector({ active, onChange, fillCount, accent = "rose" }: {
  active: string; onChange: (lc: string) => void; fillCount: (lc: string) => number; accent?: AccentKey
}) {
  const c = accentCls[accent]
  return (
    <div className="flex gap-1.5 mb-3">
      {LOCALES.map(l => {
        const count = fillCount(l.code); const isActive = active === l.code
        return (
          <button key={l.code} onClick={() => onChange(l.code)}
            className={`flex items-center gap-1 px-2 py-1 rounded border font-semibold text-xs transition-all ${
              isActive
                ? `${c.activeBg} text-white ${c.activeBorder}`
                : `bg-white text-slate-600 border-slate-200 ${c.hoverBorder}`
            }`}>
            <span>{l.flag}</span>
            <span className={`px-1 rounded-full text-xs font-bold ${
              isActive ? `${c.pillActive} text-white` : count > 0 ? c.pillFill : "bg-slate-100 text-slate-400"
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

export default function SocialProjectsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)

  const [volunteers, setVolunteers] = useState<SocialProject[]>([])
  const [bookProject, setBookProject] = useState<SocialProject | null>(null)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // ── Volunteer inline editing ──
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingProject | null>(null)
  const [editingLocale, setEditingLocale] = useState("en")
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null)
  const [editingCertFile, setEditingCertFile] = useState<File | null>(null)

  // ── New volunteer form ──
  const [volLocale, setVolLocale] = useState("en")
  const [newVolunteer, setNewVolunteer] = useState<NewVolunteer>({
    date: '', image_url: '', institution_name: '', instituition_logo: '',
    institution_link: '', certificate_url: '', is_public: true,
    translations: { en: {}, pt: {} },
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)

  // ── Book project ──
  const [editingBook, setEditingBook] = useState(false)
  const [bookLocale, setBookLocale] = useState("en")
  const [bookData, setBookData] = useState<BookData>({ is_public: true, translations: { en: {}, pt: {} } })

  // ─── Translation helpers — new volunteer ─────────────────────────────────

  const getVolT  = (f: TranslatableField) => newVolunteer.translations?.[volLocale]?.[f] ?? ""
  const setVolT  = (f: TranslatableField, v: string) =>
    setNewVolunteer(p => ({ ...p, translations: { ...p.translations, [volLocale]: { ...(p.translations?.[volLocale] ?? {}), [f]: v } } }))
  const volFill  = (lc: string) => TRANSLATABLE_FIELDS.filter(f => newVolunteer.translations?.[lc]?.[f]?.trim()).length

  // ─── Translation helpers — editing volunteer ─────────────────────────────

  const getEditT = (f: TranslatableField) => editingData?.translations?.[editingLocale]?.[f] ?? ""
  const setEditT = (f: TranslatableField, v: string) => {
    if (!editingData) return
    setEditingData({ ...editingData, translations: { ...editingData.translations, [editingLocale]: { ...(editingData.translations?.[editingLocale] ?? {}), [f]: v } } })
  }
  const editFill = (lc: string) => TRANSLATABLE_FIELDS.filter(f => editingData?.translations?.[lc]?.[f]?.trim()).length

  // ─── Translation helpers — book project ──────────────────────────────────

  const getBookT = (f: TranslatableField) => bookData.translations?.[bookLocale]?.[f] ?? ""
  const setBookT = (f: TranslatableField, v: string) =>
    setBookData(p => ({ ...p, translations: { ...p.translations, [bookLocale]: { ...(p.translations?.[bookLocale] ?? {}), [f]: v } } }))
  const bookFill = (lc: string) => TRANSLATABLE_FIELDS.filter(f => bookData.translations?.[lc]?.[f]?.trim()).length

  // ─── Display helpers ──────────────────────────────────────────────────────

  const displayTitle = (p: SocialProject) => p.translations?.en?.title || p.translations?.pt?.title || p.title || ''
  const displayDesc  = (p: SocialProject) => p.translations?.en?._description || p.translations?.pt?._description || p._description || ''

  // ─── Auth + fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: volData, error: volError } = await supabase
        .from('social_projects').select('*').eq('is_voluntariado', true).order('date', { ascending: false })
      if (volError) throw volError
      setVolunteers(volData || [])

      const { data: bkData, error: bkError } = await supabase
        .from('social_projects').select('*').eq('is_voluntariado', false).single()
      if (bkError && bkError.code !== 'PGRST116') throw bkError
      setBookProject(bkData || null)
      if (bkData) {
        const trans: Record<string, SocialTranslation> = { en: {}, pt: {}, ...(bkData.translations ?? {}) }
        if (!trans.en.title        && bkData.title)        trans.en.title        = bkData.title
        if (!trans.en._description && bkData._description) trans.en._description = bkData._description
        setBookData({ is_public: bkData.is_public, translations: trans })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''),   5000) }

  // ─── File path builders ───────────────────────────────────────────────────

  const buildPath = (prefix: string, dir: string, file: File) => {
    const ts = Date.now(), rnd = Math.random().toString(36).substring(2, 8), ext = file.name.split('.').pop()
    return `/${dir}/${prefix}_${ts}_${rnd}.${ext}`
  }

  // ─── Image uploads ────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    const path = buildPath('social', 'logo_skills', file)
    if (isEdit && editingData) { setEditingImageFile(file); setEditingData({ ...editingData, image_url: path }) }
    else { setImageFile(file); setNewVolunteer(p => ({ ...p, image_url: path })) }
    showSuccess('Imagem selecionada!')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    const path = buildPath('institution', 'logo_skills', file)
    if (isEdit && editingData) { setEditingLogoFile(file); setEditingData({ ...editingData, instituition_logo: path }) }
    else { setLogoFile(file); setNewVolunteer(p => ({ ...p, instituition_logo: path })) }
    showSuccess('Logo selecionado!')
  }

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]; if (!file) return
    const valid = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!valid.includes(file.type)) { showError('Por favor seleciona um PDF ou imagem'); return }
    const path = buildPath('cert_social', 'certificates', file)
    if (isEdit && editingData) { setEditingCertFile(file); setEditingData({ ...editingData, certificate_url: path }) }
    else { setCertFile(file); setNewVolunteer(p => ({ ...p, certificate_url: path })) }
    showSuccess('Certificado selecionado!')
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const handleAddVolunteer = async () => {
    const enTitle = newVolunteer.translations?.en?.title?.trim()
    if (!enTitle) { showError('O título em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('social_projects').insert([{
        title: enTitle,
        date: newVolunteer.date || null,
        image_url: newVolunteer.image_url || null,
        _description: newVolunteer.translations?.en?._description?.trim() || null,
        institution_name: newVolunteer.institution_name || null,
        instituition_logo: newVolunteer.instituition_logo || null,
        institution_link: newVolunteer.institution_link || null,
        certificate_url: newVolunteer.certificate_url || null,
        is_public: newVolunteer.is_public,
        is_voluntariado: true,
        translations: newVolunteer.translations,
      }])
      if (error) throw error
      showSuccess('Voluntariado adicionado com sucesso!')
      setNewVolunteer({ date: '', image_url: '', institution_name: '', instituition_logo: '', institution_link: '', certificate_url: '', is_public: true, translations: { en: {}, pt: {} } })
      setImageFile(null); setLogoFile(null); setCertFile(null); setVolLocale("en")
      fetchData()
    } catch (error) { console.error(error); showError('Erro ao adicionar voluntariado') }
    finally { setSaving(false) }
  }

  const startEditing = (project: SocialProject) => {
    const translations: Record<string, SocialTranslation> = { en: {}, pt: {}, ...(project.translations ?? {}) }
    if (!translations.en.title        && project.title)        translations.en.title        = project.title
    if (!translations.en._description && project._description) translations.en._description = project._description
    setEditingId(project.id)
    setEditingData({
      id: project.id,
      date: project.date || '', image_url: project.image_url || '',
      institution_name: project.institution_name || '', instituition_logo: project.instituition_logo || '',
      institution_link: project.institution_link || '', certificate_url: project.certificate_url || '',
      is_public: project.is_public, translations,
    })
    setEditingLocale("en")
  }

  const cancelEditing = () => { setEditingId(null); setEditingData(null); setEditingImageFile(null); setEditingLogoFile(null); setEditingCertFile(null); setEditingLocale("en") }

  const saveEdit = async () => {
    if (!editingData) return
    const enTitle = editingData.translations?.en?.title?.trim()
    if (!enTitle) { showError('O título em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('social_projects').update({
        title: enTitle,
        date: editingData.date || null,
        image_url: editingData.image_url || null,
        _description: editingData.translations?.en?._description?.trim() || null,
        institution_name: editingData.institution_name || null,
        instituition_logo: editingData.instituition_logo || null,
        institution_link: editingData.institution_link || null,
        certificate_url: editingData.certificate_url || null,
        is_public: editingData.is_public,
        translations: editingData.translations,
      }).eq('id', editingData.id)
      if (error) throw error
      showSuccess('Voluntariado atualizado com sucesso!')
      cancelEditing(); fetchData()
    } catch (error) { console.error(error); showError('Erro ao atualizar voluntariado') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este voluntariado?')) return
    try {
      const { error } = await supabase.from('social_projects').delete().eq('id', id)
      if (error) throw error
      showSuccess('Voluntariado eliminado com sucesso!')
      fetchData()
    } catch (error) { console.error(error); showError('Erro ao eliminar voluntariado') }
  }

  const saveBookProject = async () => {
    const enTitle = bookData.translations?.en?.title?.trim()
    if (!enTitle) { showError('O título em Inglês é obrigatório'); return }
    try {
      setSaving(true)
      const payload = {
        title: enTitle,
        _description: bookData.translations?.en?._description?.trim() || null,
        is_public: bookData.is_public,
        translations: bookData.translations,
      }
      if (bookProject) {
        const { error } = await supabase.from('social_projects').update(payload).eq('id', bookProject.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('social_projects').insert([{ ...payload, is_voluntariado: false }])
        if (error) throw error
      }
      showSuccess('Projeto do livro atualizado com sucesso!')
      setEditingBook(false); fetchData()
    } catch (error) { console.error(error); showError('Erro ao guardar projeto') }
    finally { setSaving(false) }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-rose-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar projetos sociais...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-rose-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-rose-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin"><ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />Voltar ao Dashboard</Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Projetos Sociais</h1>
                <p className="text-xl text-white/90 mt-2">{volunteers.length} voluntariado{volunteers.length !== 1 ? 's' : ''} • 1 projeto</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-7xl">

            {/* Feedback */}
            {successMessage && (
              <div className="mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-6 h-6 text-white" /></div>
                <p className="font-semibold text-emerald-900 text-lg">{successMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-6 h-6 text-white" /></div>
                <p className="font-semibold text-red-900 text-lg">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-8">

              {/* ══════════════════════ VOLUNTEERS TABLE ══════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Voluntariados</CardTitle>
                      <CardDescription className="text-slate-700 text-base">Experiências de voluntariado</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {volunteers.length === 0 ? (
                    <div className="p-12 text-center">
                      <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Nenhum voluntariado adicionado ainda.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Título</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Instituição</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Data</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Público</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {volunteers.map((volunteer, index) => (
                            <tr key={volunteer.id} className="hover:bg-slate-50 transition-colors"
                              style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                              {editingId === volunteer.id && editingData ? (
                                <td className="px-6 py-4" colSpan={5}>
                                  {/* ── EDITING MODE ── */}
                                  <InlineLocaleSelector active={editingLocale} onChange={setEditingLocale} fillCount={editFill} accent="rose" />
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                      {/* Title — translatable */}
                                      <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold flex items-center gap-2">
                                          Título {editingLocale === "en" && <span className="text-red-500">*</span>}
                                          <LocaleBadge locale={editingLocale} accent="rose" />
                                        </Label>
                                        <Input value={getEditT("title")} onChange={e => setEditT("title", e.target.value)}
                                          className="h-9 border-2 border-rose-600" autoFocus
                                          placeholder={editingLocale === "en" ? "Título (EN)" : "Título (PT)"} />
                                        {editingLocale !== "en" && editingData.translations?.en?.title && (
                                          <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{editingData.translations.en.title}</span></p>
                                        )}
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Data <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input type="date" value={editingData.date} onChange={e => setEditingData({ ...editingData, date: e.target.value })} className="h-9 border-2 border-rose-600" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Instituição <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input value={editingData.institution_name} onChange={e => setEditingData({ ...editingData, institution_name: e.target.value })} className="h-9 border-2 border-rose-600" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Link Instituição <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input value={editingData.institution_link} onChange={e => setEditingData({ ...editingData, institution_link: e.target.value })} placeholder="https://..." className="h-9 border-2 border-rose-600" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Imagem <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, true)} className="h-9 text-xs file:mr-2 file:py-1 file:px-2 file:text-xs" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Logo Instituição <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input type="file" accept="image/*" onChange={e => handleLogoUpload(e, true)} className="h-9 text-xs file:mr-2 file:py-1 file:px-2 file:text-xs" />
                                      </div>
                                      <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold">Certificado <span className="text-slate-400 font-normal">(global)</span></Label>
                                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => handleCertUpload(e, true)} className="h-9 text-xs file:mr-2 file:py-1 file:px-2 file:text-xs" />
                                      </div>

                                      {/* Description — translatable */}
                                      <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold flex items-center gap-2">
                                          Descrição <LocaleBadge locale={editingLocale} accent="rose" />
                                        </Label>
                                        <Textarea value={getEditT("_description")} onChange={e => setEditT("_description", e.target.value)}
                                          rows={3} className="border-2 border-rose-600 text-sm resize-none"
                                          placeholder={editingLocale === "en" ? "Descrição (EN)..." : "Descrição (PT)..."} />
                                        {editingLocale !== "en" && editingData.translations?.en?._description && (
                                          <p className="text-xs text-slate-400 line-clamp-1">🇬🇧 Base: <span className="italic">{editingData.translations.en._description}</span></p>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <input type="checkbox" id={`edit-public-${volunteer.id}`} checked={editingData.is_public}
                                          onChange={e => setEditingData({ ...editingData, is_public: e.target.checked })} className="w-4 h-4" />
                                        <Label htmlFor={`edit-public-${volunteer.id}`} className="text-xs font-semibold cursor-pointer">
                                          Visível publicamente <span className="text-slate-400 font-normal">(global)</span>
                                        </Label>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2 border-t">
                                      <Button size="sm" onClick={saveEdit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700"><Check className="w-4 h-4" /></Button>
                                      <Button size="sm" variant="outline" onClick={cancelEditing}><X className="w-4 h-4" /></Button>
                                    </div>
                                  </div>
                                </td>
                              ) : (
                                // ── VIEW MODE ──
                                <>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{displayTitle(volunteer)}</div>
                                    {displayDesc(volunteer) && <p className="text-xs text-slate-600 line-clamp-2 mt-1">{displayDesc(volunteer)}</p>}
                                  </td>
                                  <td className="px-6 py-4">
                                    {volunteer.institution_name && (
                                      <div>
                                        <div className="font-medium text-slate-700">{volunteer.institution_name}</div>
                                        {volunteer.institution_link && (
                                          <a href={volunteer.institution_link} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-600 hover:underline flex items-center gap-1 mt-1">
                                            <ExternalLink className="w-3 h-3" />Website
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4"><div className="text-sm text-slate-600">{formatDate(volunteer.date)}</div></td>
                                  <td className="px-6 py-4 text-center">
                                    {volunteer.is_public
                                      ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Sim</Badge>
                                      : <Badge variant="outline" className="text-slate-600">Não</Badge>}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => startEditing(volunteer)} className="text-blue-600 hover:bg-blue-50"><Edit className="w-4 h-4" /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDelete(volunteer.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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

              {/* ══════════════════════ ADD VOLUNTEER ══════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600" />
                <CardHeader className="bg-gradient-to-br from-rose-50 to-rose-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-rose-900 mb-2">Novo Voluntariado</CardTitle>
                      <CardDescription className="text-rose-700 text-base">Adiciona uma nova experiência de voluntariado</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">

                  <LocaleSelector active={volLocale} onChange={setVolLocale} fillCount={volFill} accent="rose" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Title — translatable */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        Título {volLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={volLocale} accent="rose" />
                      </Label>
                      <Input value={getVolT("title")} onChange={e => setVolT("title", e.target.value)}
                        placeholder={volLocale === "en" ? "Ex: EIA Volunteer" : "Ex: Voluntário EIA"}
                        className="h-11 border-2 border-slate-300 focus:border-rose-600" />
                      <FallbackHint locale={volLocale} baseValue={newVolunteer.translations?.en?.title} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-600" />Data <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="date" value={newVolunteer.date} onChange={e => setNewVolunteer(p => ({ ...p, date: e.target.value }))} className="h-11 border-2 border-slate-300 focus:border-rose-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Building className="w-4 h-4 text-rose-600" />Instituição <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input value={newVolunteer.institution_name} onChange={e => setNewVolunteer(p => ({ ...p, institution_name: e.target.value }))} placeholder="Nome da organização" className="h-11 border-2 border-slate-300 focus:border-rose-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-rose-600" />Link Instituição <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input value={newVolunteer.institution_link} onChange={e => setNewVolunteer(p => ({ ...p, institution_link: e.target.value }))} placeholder="https://..." className="h-11 border-2 border-slate-300 focus:border-rose-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-rose-600" />Imagem <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, false)} disabled={uploadingImage} className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-rose-50 file:text-rose-700" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Logo Instituição <span className="text-xs text-slate-400 font-normal">(global)</span></Label>
                      <Input type="file" accept="image/*" onChange={e => handleLogoUpload(e, false)} disabled={uploadingLogo} className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-rose-50 file:text-rose-700" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Award className="w-4 h-4 text-rose-600" />Certificado (PDF ou Imagem) <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => handleCertUpload(e, false)} disabled={uploadingCertificate} className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-rose-50 file:text-rose-700" />
                    </div>

                    {/* Description — translatable */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        Descrição
                        <LocaleBadge locale={volLocale} accent="rose" />
                      </Label>
                      <Textarea value={getVolT("_description")} onChange={e => setVolT("_description", e.target.value)}
                        placeholder={volLocale === "en" ? "Descreve a experiência de voluntariado..." : "Descrição em PT..."}
                        rows={4} className="border-2 border-slate-300 focus:border-rose-600 resize-none" />
                      <FallbackHint locale={volLocale} baseValue={newVolunteer.translations?.en?._description} />
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2">
                      <input type="checkbox" id="public" checked={newVolunteer.is_public} onChange={e => setNewVolunteer(p => ({ ...p, is_public: e.target.checked }))} className="w-5 h-5" />
                      <Label htmlFor="public" className="text-sm font-semibold cursor-pointer">
                        Visível publicamente <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button onClick={handleAddVolunteer} disabled={saving || uploadingImage || uploadingLogo || uploadingCertificate}
                      className="h-12 px-8 text-base font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                             : <><Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />Adicionar Voluntariado</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ══════════════════════ BOOK PROJECT ══════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100 pt-8 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-purple-900 mb-2">Projeto do Livro</CardTitle>
                        <CardDescription className="text-purple-700 text-base">Projeto social de matriz educativa e cultural</CardDescription>
                      </div>
                    </div>
                    {!editingBook && bookProject && (
                      <Button variant="ghost" onClick={() => setEditingBook(true)} className="text-purple-900 hover:bg-purple-200">
                        <Edit className="w-4 h-4 mr-2" />Editar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  {editingBook ? (
                    <div className="space-y-6">
                      <LocaleSelector active={bookLocale} onChange={setBookLocale} fillCount={bookFill} accent="purple" />

                      {/* Title — translatable */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          Título {bookLocale === "en" && <span className="text-red-500">*</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-normal ${bookLocale === "en" ? "bg-slate-100 text-slate-500" : "bg-purple-100 text-purple-700"}`}>
                            {bookLocale === "en" ? "EN base" : "PT tradução"}
                          </span>
                        </Label>
                        <Input value={getBookT("title")} onChange={e => setBookT("title", e.target.value)}
                          className="h-11 border-2 border-purple-600" autoFocus
                          placeholder={bookLocale === "en" ? "Título (EN)" : "Título (PT)"} />
                        {bookLocale !== "en" && bookData.translations?.en?.title && (
                          <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{bookData.translations.en.title}</span></p>
                        )}
                      </div>

                      {/* Description — translatable */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          Descrição
                          <span className={`text-xs px-2 py-0.5 rounded-full font-normal ${bookLocale === "en" ? "bg-slate-100 text-slate-500" : "bg-purple-100 text-purple-700"}`}>
                            {bookLocale === "en" ? "EN base" : "PT tradução"}
                          </span>
                        </Label>
                        <Textarea value={getBookT("_description")} onChange={e => setBookT("_description", e.target.value)}
                          rows={6} placeholder={bookLocale === "en" ? "Descrição detalhada do projeto..." : "Descrição em PT..."}
                          className="border-2 border-purple-600 resize-none" />
                        {bookLocale !== "en" && bookData.translations?.en?._description && (
                          <p className="text-xs text-slate-400 line-clamp-1">🇬🇧 Base: <span className="italic">{bookData.translations.en._description}</span></p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="book-public" checked={bookData.is_public} onChange={e => setBookData({ ...bookData, is_public: e.target.checked })} className="w-5 h-5" />
                        <Label htmlFor="book-public" className="text-sm font-semibold cursor-pointer">
                          Visível publicamente <span className="text-xs text-slate-400 font-normal">(global)</span>
                        </Label>
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t-2 border-slate-200">
                        <Button onClick={saveBookProject} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                          <Check className="w-4 h-4 mr-2" />Guardar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingBook(false)}>
                          <X className="w-4 h-4 mr-2" />Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : bookProject ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{displayTitle(bookProject)}</h3>
                        <Badge className={bookProject.is_public ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600'}>
                          {bookProject.is_public ? 'Público' : 'Privado'}
                        </Badge>
                      </div>
                      {displayDesc(bookProject) && (
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{displayDesc(bookProject)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 mb-4">Nenhum projeto configurado.</p>
                      <Button onClick={() => setEditingBook(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />Criar Projeto
                      </Button>
                    </div>
                  )}
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