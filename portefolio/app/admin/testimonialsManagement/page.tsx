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
  MessageSquareQuote, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  User,
  Briefcase,
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

const TRANSLATABLE_FIELDS = ["content", "role"] as const
type TranslatableField = typeof TRANSLATABLE_FIELDS[number]

// ─── Types ────────────────────────────────────────────────────────────────────

type TestimonialTranslation = { content?: string; role?: string }

type Testimonial = {
  id: string
  author_name: string
  role: string
  image_url: string | null
  content: string
  order: number
  visible: boolean
  translations?: Record<string, TestimonialTranslation> | null
}

type EditingTestimonial = {
  id: string
  author_name: string
  image_url: string
  visible: boolean
  translations: Record<string, TestimonialTranslation>
}

type NewTestimonial = {
  author_name: string
  image_url: string
  visible: boolean
  translations: Record<string, TestimonialTranslation>
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LocaleBadge({ locale }: { locale: string }) {
  if (locale === "en")
    return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">EN base</span>
  return <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-normal">PT tradução</span>
}

function FallbackHint({ locale, baseValue }: { locale: string; baseValue?: string }) {
  if (locale === "en" || !baseValue) return null
  return <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{baseValue}</span></p>
}

function LocaleSelector({ active, onChange, fillCount }: {
  active: string; onChange: (lc: string) => void; fillCount: (lc: string) => number
}) {
  return (
    <div className="mb-6 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="w-4 h-4 text-teal-600" />
        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
        <span className="text-xs text-slate-500 ml-1">— conteúdo e cargo variam por idioma</span>
      </div>
      <div className="flex gap-2">
        {LOCALES.map(l => {
          const count = fillCount(l.code); const isActive = active === l.code
          return (
            <button key={l.code} onClick={() => onChange(l.code)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                isActive ? "bg-teal-600 text-white border-teal-600 shadow" : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
              }`}>
              <span>{l.flag}</span><span>{l.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/25 text-white" : count > 0 ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-400"}`}>
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

function InlineLocaleSelector({ active, onChange, fillCount }: {
  active: string; onChange: (lc: string) => void; fillCount: (lc: string) => number
}) {
  return (
    <div className="flex gap-1.5 mb-4">
      {LOCALES.map(l => {
        const count = fillCount(l.code); const isActive = active === l.code
        return (
          <button key={l.code} onClick={() => onChange(l.code)}
            className={`flex items-center gap-1 px-2 py-1 rounded border font-semibold text-xs transition-all ${
              isActive ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"
            }`}>
            <span>{l.flag}</span>
            <span className={`px-1 rounded-full text-xs font-bold ${isActive ? "bg-white/25 text-white" : count > 0 ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-400"}`}>
              {count}/{TRANSLATABLE_FIELDS.length}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TestimonialsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // ── List inline editing ──
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingTestimonial | null>(null)
  const [editingLocale, setEditingLocale] = useState("en")
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)

  // ── New form ──
  const [activeLocale, setActiveLocale] = useState("en")
  const [newTestimonial, setNewTestimonial] = useState<NewTestimonial>({
    author_name: '', image_url: '', visible: true,
    translations: { en: {}, pt: {} },
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  // ─── Translation helpers — new ────────────────────────────────────────────

  const getT  = (f: TranslatableField) => newTestimonial.translations?.[activeLocale]?.[f] ?? ""
  const setT  = (f: TranslatableField, v: string) =>
    setNewTestimonial(p => ({ ...p, translations: { ...p.translations, [activeLocale]: { ...(p.translations?.[activeLocale] ?? {}), [f]: v } } }))
  const fillCount = (lc: string) => TRANSLATABLE_FIELDS.filter(f => newTestimonial.translations?.[lc]?.[f]?.trim()).length

  // ─── Translation helpers — editing ───────────────────────────────────────

  const getEditT = (f: TranslatableField) => editingData?.translations?.[editingLocale]?.[f] ?? ""
  const setEditT = (f: TranslatableField, v: string) => {
    if (!editingData) return
    setEditingData({ ...editingData, translations: { ...editingData.translations, [editingLocale]: { ...(editingData.translations?.[editingLocale] ?? {}), [f]: v } } })
  }
  const editFillCount = (lc: string) => TRANSLATABLE_FIELDS.filter(f => editingData?.translations?.[lc]?.[f]?.trim()).length

  // ─── Display helpers ──────────────────────────────────────────────────────

  const displayContent = (t: Testimonial) => t.translations?.en?.content || t.translations?.pt?.content || t.content || ''
  const displayRole    = (t: Testimonial) => t.translations?.en?.role    || t.translations?.pt?.role    || t.role    || ''

  // ─── Auth + fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('testimonials').select('*').order('order', { ascending: true })
      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error(error); showError('Erro ao carregar dados')
    } finally { setLoading(false) }
  }

  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError   = (msg: string) => { setErrorMessage(msg);   setTimeout(() => setErrorMessage(''),   5000) }

  // ─── Image upload ─────────────────────────────────────────────────────────

  const buildImagePath = (file: File) => {
    const ts = Date.now(), rnd = Math.random().toString(36).substring(2, 8), ext = file.name.split('.').pop()
    return `/images/testimonial_${ts}_${rnd}.${ext}`
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setImageFile(file)
    setNewTestimonial(p => ({ ...p, image_url: buildImagePath(file) }))
    showSuccess('Imagem selecionada com sucesso!')
  }

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !editingData) return
    if (!file.type.startsWith('image/')) { showError('Por favor seleciona uma imagem válida'); return }
    setEditingImageFile(file)
    setEditingData({ ...editingData, image_url: buildImagePath(file) })
    showSuccess('Imagem selecionada com sucesso!')
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const handleAddTestimonial = async () => {
    const enContent = newTestimonial.translations?.en?.content?.trim()
    if (!newTestimonial.author_name.trim() || !enContent) {
      showError('Nome e conteúdo em Inglês são obrigatórios'); return
    }
    try {
      setSaving(true)
      const maxOrder = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.order)) : 0
      const { error } = await supabase.from('testimonials').insert([{
        author_name: newTestimonial.author_name,
        role:        newTestimonial.translations?.en?.role?.trim() || null,
        image_url:   newTestimonial.image_url || null,
        content:     enContent,
        order:       maxOrder + 1,
        visible:     newTestimonial.visible,
        translations: newTestimonial.translations,
      }])
      if (error) throw error
      showSuccess('Testemunho adicionado com sucesso!')
      setNewTestimonial({ author_name: '', image_url: '', visible: true, translations: { en: {}, pt: {} } })
      setImageFile(null); setActiveLocale("en")
      fetchData()
    } catch (error) { console.error(error); showError('Erro ao adicionar testemunho') }
    finally { setSaving(false) }
  }

  const startEditing = (testimonial: Testimonial) => {
    const translations: Record<string, TestimonialTranslation> = { en: {}, pt: {}, ...(testimonial.translations ?? {}) }
    if (!translations.en.content && testimonial.content) translations.en.content = testimonial.content
    if (!translations.en.role    && testimonial.role)    translations.en.role    = testimonial.role
    setEditingId(testimonial.id)
    setEditingData({ id: testimonial.id, author_name: testimonial.author_name, image_url: testimonial.image_url || '', visible: testimonial.visible, translations })
    setEditingLocale("en")
  }

  const cancelEditing = () => { setEditingId(null); setEditingData(null); setEditingImageFile(null); setEditingLocale("en") }

  const saveEdit = async () => {
    if (!editingData) return
    const enContent = editingData.translations?.en?.content?.trim()
    if (!editingData.author_name.trim() || !enContent) { showError('Nome e conteúdo em Inglês são obrigatórios'); return }
    try {
      setSaving(true)
      const { error } = await supabase.from('testimonials').update({
        author_name:  editingData.author_name,
        role:         editingData.translations?.en?.role?.trim() || null,
        image_url:    editingData.image_url || null,
        content:      enContent,
        visible:      editingData.visible,
        translations: editingData.translations,
      }).eq('id', editingData.id)
      if (error) throw error
      showSuccess('Testemunho atualizado com sucesso!')
      cancelEditing(); fetchData()
    } catch (error) { console.error(error); showError('Erro ao atualizar testemunho') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este testemunho?')) return
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
      if (error) throw error
      showSuccess('Testemunho eliminado com sucesso!')
      fetchData()
    } catch (error) { console.error(error); showError('Erro ao eliminar testemunho') }
  }

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('testimonials').update({ visible: !current }).eq('id', id)
      if (error) throw error
      showSuccess(`Testemunho ${!current ? 'visível' : 'ocultado'}!`)
      fetchData()
    } catch (error) { console.error(error); showError('Erro ao alterar visibilidade') }
  }

  const moveTestimonial = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === testimonials.length - 1)) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const reordered = [...testimonials]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    try {
      for (const [idx, t] of reordered.entries()) {
        await supabase.from('testimonials').update({ order: idx + 1 }).eq('id', t.id)
      }
      showSuccess('Ordem atualizada!')
      fetchData()
    } catch (error) { console.error(error); showError('Erro ao atualizar ordem') }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar testemunhos...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-teal-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-teal-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>
          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin"><ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />Voltar ao Dashboard</Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-xl">
                <MessageSquareQuote className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Gestão de Testemunhos</h1>
                <p className="text-xl text-white/90 mt-2">
                  {testimonials.length} testemunho{testimonials.length !== 1 ? 's' : ''} • {testimonials.filter(t => t.visible).length} visíve{testimonials.filter(t => t.visible).length !== 1 ? 'is' : 'l'}
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

              {/* ══════════════════════ TESTIMONIALS LIST ══════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <MessageSquareQuote className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Testemunhos Existentes</CardTitle>
                      <CardDescription className="text-slate-700 text-base">Reordena, edita ou elimina testemunhos</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {testimonials.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageSquareQuote className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">Nenhum testemunho adicionado ainda.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {testimonials.map((testimonial, index) => (
                        <div key={testimonial.id}
                          className={`hover:bg-slate-50 transition-colors ${!testimonial.visible ? 'opacity-60' : ''}`}
                          style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>

                          {editingId === testimonial.id && editingData ? (
                            // ── EDITING MODE ──
                            <div className="p-6 space-y-6">

                              <InlineLocaleSelector active={editingLocale} onChange={setEditingLocale} fillCount={editFillCount} />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Author name — global */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <User className="w-4 h-4 text-teal-600" />
                                    Nome do Autor * <span className="text-xs text-slate-400 font-normal">(global)</span>
                                  </Label>
                                  <Input value={editingData.author_name} onChange={e => setEditingData({ ...editingData, author_name: e.target.value })}
                                    className="h-10 border-2 border-teal-600 rounded-lg font-semibold" autoFocus />
                                </div>

                                {/* Role — translatable */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-teal-600" />
                                    Cargo/Função <LocaleBadge locale={editingLocale} />
                                  </Label>
                                  <Input value={getEditT("role")} onChange={e => setEditT("role", e.target.value)}
                                    className="h-10 border-2 border-teal-600 rounded-lg"
                                    placeholder={editingLocale === "en" ? "Software Engineer..." : "Engenheiro de Software..."} />
                                  {editingLocale !== "en" && editingData.translations?.en?.role && (
                                    <p className="text-xs text-slate-400 truncate">🇬🇧 Base: <span className="italic">{editingData.translations.en.role}</span></p>
                                  )}
                                </div>

                                {/* Image — global */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    Imagem <span className="text-xs text-slate-400 font-normal">(global)</span>
                                  </Label>
                                  <Input type="file" accept="image/*" onChange={handleEditImageUpload} disabled={uploadingImage}
                                    className="h-10 border-2 border-teal-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700" />
                                  {editingData.image_url && (
                                    <div className="flex items-center gap-3">
                                      <img src={editingData.image_url} alt="Preview"
                                        className="w-16 h-16 rounded-full object-cover border-2 border-teal-300"
                                        onError={e => { e.currentTarget.style.display = 'none' }} />
                                      <span className="text-xs text-teal-700 font-medium">{editingData.image_url.split('/').pop()}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Content — translatable */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    Conteúdo do Testemunho {editingLocale === "en" && <span className="text-red-500">*</span>}
                                    <LocaleBadge locale={editingLocale} />
                                  </Label>
                                  <Textarea value={getEditT("content")} onChange={e => setEditT("content", e.target.value)}
                                    rows={4} className="border-2 border-teal-600 rounded-lg resize-none"
                                    placeholder={editingLocale === "en" ? "Conteúdo (EN)..." : "Conteúdo (PT)..."} />
                                  {editingLocale !== "en" && editingData.translations?.en?.content && (
                                    <p className="text-xs text-slate-400 line-clamp-1">🇬🇧 Base: <span className="italic">{editingData.translations.en.content}</span></p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <input type="checkbox" id={`edit-visible-${testimonial.id}`} checked={editingData.visible}
                                    onChange={e => setEditingData({ ...editingData, visible: e.target.checked })} className="w-5 h-5 text-teal-600" />
                                  <Label htmlFor={`edit-visible-${testimonial.id}`} className="text-slate-900 font-semibold text-sm cursor-pointer">
                                    Visível no site <span className="text-xs text-slate-400 font-normal">(global)</span>
                                  </Label>
                                </div>
                              </div>

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
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  {testimonial.image_url ? (
                                    <img src={testimonial.image_url} alt={testimonial.author_name}
                                      className="w-16 h-16 rounded-full object-cover border-2 border-teal-300" />
                                  ) : (
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center border-2 border-teal-300">
                                      <User className="w-8 h-8 text-teal-600" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                  <div className="mb-3">
                                    <h3 className="text-lg font-bold text-slate-900">{testimonial.author_name}</h3>
                                    {displayRole(testimonial) && (
                                      <p className="text-sm text-slate-600 font-medium">{displayRole(testimonial)}</p>
                                    )}
                                  </div>
                                  <p className="text-slate-700 leading-relaxed italic">"{displayContent(testimonial)}"</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Button variant="ghost" size="sm" onClick={() => toggleVisibility(testimonial.id, testimonial.visible)}
                                    className={testimonial.visible ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}>
                                    {testimonial.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>
                                  <div className="flex flex-col gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => moveTestimonial(index, 'up')} disabled={index === 0}
                                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 p-0">
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => moveTestimonial(index, 'down')} disabled={index === testimonials.length - 1}
                                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 p-0">
                                      <ArrowDown className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => startEditing(testimonial)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(testimonial.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
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

              {/* ══════════════════════ ADD TESTIMONIAL FORM ══════════════════════ */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600" />
                <CardHeader className="bg-gradient-to-br from-teal-50 to-teal-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-teal-900 mb-2">Novo Testemunho</CardTitle>
                      <CardDescription className="text-teal-700 text-base">Adiciona um novo testemunho ao portfólio</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">

                  <LocaleSelector active={activeLocale} onChange={setActiveLocale} fillCount={fillCount} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Author name — global */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" />
                        Nome do Autor * <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input value={newTestimonial.author_name} onChange={e => setNewTestimonial(p => ({ ...p, author_name: e.target.value }))}
                        placeholder="Ex: Pedro Almeida"
                        className="h-11 border-2 border-slate-300 focus:border-teal-600 rounded-lg" />
                    </div>

                    {/* Role — translatable */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-teal-600" />
                        Cargo/Função <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Input value={getT("role")} onChange={e => setT("role", e.target.value)}
                        placeholder={activeLocale === "en" ? "Software Engineer" : "Engenheiro de Software"}
                        className="h-11 border-2 border-slate-300 focus:border-teal-600 rounded-lg" />
                      <FallbackHint locale={activeLocale} baseValue={newTestimonial.translations?.en?.role} />
                    </div>

                    {/* Image — global */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" />
                        Imagem do Autor <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage}
                        className="h-11 border-2 border-slate-300 focus:border-teal-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                      {newTestimonial.image_url && (
                        <div className="flex items-center gap-3 p-3 bg-teal-50 border-2 border-teal-200 rounded-lg">
                          <img src={newTestimonial.image_url} alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-teal-300"
                            onError={e => { e.currentTarget.style.display = 'none' }} />
                          <span className="text-sm text-teal-700 font-medium">{newTestimonial.image_url.split('/').pop()}</span>
                        </div>
                      )}
                    </div>

                    {/* Content — translatable */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Conteúdo do Testemunho {activeLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Textarea value={getT("content")} onChange={e => setT("content", e.target.value)}
                        placeholder={activeLocale === "en" ? "O testemunho em Inglês..." : "O testemunho em Português..."}
                        rows={4} className="border-2 border-slate-300 focus:border-teal-600 rounded-lg resize-none" />
                      <FallbackHint locale={activeLocale} baseValue={newTestimonial.translations?.en?.content} />
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2">
                      <input type="checkbox" id="visible" checked={newTestimonial.visible}
                        onChange={e => setNewTestimonial(p => ({ ...p, visible: e.target.checked }))} className="w-5 h-5 text-teal-600" />
                      <Label htmlFor="visible" className="text-slate-900 font-semibold text-sm cursor-pointer">
                        Visível no site <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button onClick={handleAddTestimonial} disabled={saving || uploadingImage}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                      {saving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A adicionar...</>
                              : <><Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />Adicionar Testemunho</>}
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