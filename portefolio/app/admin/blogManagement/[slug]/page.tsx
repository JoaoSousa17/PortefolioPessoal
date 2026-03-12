"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Save, Loader2, BookOpen, CheckCircle2, AlertCircle,
  Eye, EyeOff, Trash2, RefreshCw, Calendar, Plus, Languages, Tag, X, Edit
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type TagRecord = {
  id: string
  color: string
  translations: Record<string, any>
}

type BlogTranslation = {
  title?: string
  excerpt?: string
  _content?: string
}

type PostData = {
  slug: string
  published: boolean
  published_at: string | null
  tagIds: string[]
  translations: Record<string, BlogTranslation>
}

// ─── Locales ──────────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
]

const TRANSLATABLE_FIELDS: (keyof BlogTranslation)[] = ["title", "excerpt", "_content"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTagName(tag: TagRecord, lang: string): string {
  return tag.translations?.[lang]?.name || tag.translations?.en?.name || ''
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#1e293b' : '#ffffff'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const router    = useRouter()
  const { slug }  = use(params)

  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [successMsg, setSuccess]      = useState('')
  const [errorMsg, setError]          = useState('')
  const [actualPostId, setPostId]     = useState('')
  const [allTags, setAllTags]         = useState<TagRecord[]>([])
  const [activeLocale, setLocale]     = useState("en")

  const [postData, setPostData] = useState<PostData>({
    slug: '', published: false, published_at: null,
    tagIds: [], translations: { en: {}, pt: {} },
  })
  const [originalData, setOriginal] = useState<PostData | null>(null)

  // Tag panel state
  const [showTagPanel, setShowTagPanel]   = useState(false)
  const [tagLocale, setTagLocale]         = useState("en")
  const [newTagColor, setNewTagColor]     = useState("#64748b")
  const [newTagNames, setNewTagNames]     = useState<Record<string, string>>({ en: '', pt: '' })
  const [savingTag, setSavingTag]         = useState(false)
  const [editingTag, setEditingTag]       = useState<TagRecord | null>(null)

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  const showError   = (msg: string) => { setError(msg);   setTimeout(() => setError(''), 5000) }

  // ─── Translation helpers ─────────────────────────────────────────────────

  const getT = (field: keyof BlogTranslation) =>
    postData.translations?.[activeLocale]?.[field] ?? ""

  const setT = (field: keyof BlogTranslation, value: string) =>
    setPostData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLocale]: { ...(prev.translations?.[activeLocale] ?? {}), [field]: value },
      },
    }))

  const fillCount = (lc: string) => {
    const tr = postData.translations?.[lc] ?? {}
    return TRANSLATABLE_FIELDS.filter(f => tr[f]?.trim()).length
  }

  const heroTitle = () =>
    postData.translations?.en?.title || postData.translations?.pt?.title || 'Carregando...'

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchAll()
  }, [router, slug])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchPost(), fetchTags()])
    setLoading(false)
  }

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('id')
    setAllTags(data || [])
  }

  const fetchPost = async () => {
    try {
      const { data: raw, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error

      // Fetch assigned tag IDs
      const { data: jd } = await supabase
        .from('blog_post_tags')
        .select('tag_id')
        .eq('post_id', raw.id)

      const tagIds = (jd || []).map((j: any) => j.tag_id)

      const translations = raw.translations ?? {}
      if (!translations.en) translations.en = {}
      if (!translations.pt) translations.pt = {}

      const formatted: PostData = {
        slug: raw.slug || '',
        published: raw.published || false,
        published_at: raw.published_at,
        tagIds,
        translations,
      }

      setPostId(raw.id)
      setPostData(formatted)
      setOriginal(formatted)
    } catch (err: any) {
      showError(`Erro ao carregar artigo: ${err?.message ?? 'Erro desconhecido'}`)
    }
  }

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!postData.translations?.en?.title?.trim()) { showError('O título em Inglês é obrigatório'); return }
    if (!postData.slug.trim()) { showError('O slug é obrigatório'); return }

    try {
      setSaving(true)

      let publishedAt = postData.published_at
      if (postData.published && !originalData?.published) publishedAt = new Date().toISOString()
      else if (!postData.published) publishedAt = null

      const { error: postErr } = await supabase
        .from('blog_posts')
        .update({ slug: postData.slug, published: postData.published, published_at: publishedAt, translations: postData.translations })
        .eq('id', actualPostId)

      if (postErr) throw postErr

      // Replace junction rows
      await supabase.from('blog_post_tags').delete().eq('post_id', actualPostId)
      if (postData.tagIds.length > 0) {
        const { error: tagErr } = await supabase
          .from('blog_post_tags')
          .insert(postData.tagIds.map(tid => ({ post_id: actualPostId, tag_id: tid })))
        if (tagErr) throw tagErr
      }

      showSuccess('Artigo atualizado com sucesso!')
      const updated = { ...postData, published_at: publishedAt }
      setPostData(updated)
      setOriginal(updated)
    } catch (err: any) {
      showError('Erro ao atualizar artigo. Verifica se o slug já existe.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalData) { setPostData(originalData); showSuccess('Alterações revertidas!') }
  }

  const handleDelete = async () => {
    if (!confirm('Tens a certeza que queres eliminar este artigo? Esta ação não pode ser revertida.')) return
    try {
      await supabase.from('blog_post_tags').delete().eq('post_id', actualPostId)
      const { error } = await supabase.from('blog_posts').delete().eq('id', actualPostId)
      if (error) throw error
      router.push('/admin/blogManagement')
    } catch {
      showError('Erro ao eliminar artigo')
    }
  }

  // ─── Tag CRUD (inline panel) ──────────────────────────────────────────────

  const startNewTag = () => {
    setEditingTag(null)
    setNewTagColor('#64748b')
    setNewTagNames({ en: '', pt: '' })
    setTagLocale('en')
    setShowTagPanel(true)
  }

  const startEditTag = (tag: TagRecord) => {
    setEditingTag(tag)
    setNewTagColor(tag.color)
    setNewTagNames({ en: tag.translations?.en?.name || '', pt: tag.translations?.pt?.name || '' })
    setTagLocale('en')
    setShowTagPanel(true)
  }

  const handleSaveTag = async () => {
    if (!newTagNames.en.trim()) { showError('O nome em Inglês é obrigatório'); return }
    try {
      setSavingTag(true)
      const translations = {
        en: { name: newTagNames.en.trim() },
        pt: { name: newTagNames.pt.trim() || newTagNames.en.trim() },
      }
      if (editingTag) {
        const { error } = await supabase.from('tags').update({ color: newTagColor, translations }).eq('id', editingTag.id)
        if (error) throw error
        showSuccess('Tag atualizada!')
      } else {
        const { error } = await supabase.from('tags').insert([{ color: newTagColor, translations }])
        if (error) throw error
        showSuccess('Tag criada!')
      }
      setShowTagPanel(false)
      setEditingTag(null)
      await fetchTags()
    } catch { showError('Erro ao guardar tag') }
    finally { setSavingTag(false) }
  }

  const handleDeleteTag = async (tag: TagRecord) => {
    if (!confirm(`Eliminar a tag "${getTagName(tag, 'en')}"?`)) return
    try {
      await supabase.from('blog_post_tags').delete().eq('tag_id', tag.id)
      await supabase.from('tags').delete().eq('id', tag.id)
      showSuccess('Tag eliminada!')
      // Remove from current post if selected
      setPostData(prev => ({ ...prev, tagIds: prev.tagIds.filter(id => id !== tag.id) }))
      setOriginal(prev => prev ? { ...prev, tagIds: prev.tagIds.filter(id => id !== tag.id) } : prev)
      await fetchTags()
    } catch { showError('Erro ao eliminar tag') }
  }

  const toggleTag = (tagId: string) =>
    setPostData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }))

  const hasChanges = originalData && JSON.stringify(postData) !== JSON.stringify(originalData)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não publicado'
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-700 animate-spin" />
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-purple-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin/blogManagement">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Blog
              </Link>
            </Button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Editar Artigo</h1>
                  <p className="text-xl text-white/90 mt-2">{heroTitle()}</p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Badge className={`text-sm px-4 py-2 ${postData.published ? 'bg-emerald-500 text-white border-0' : 'bg-slate-500 text-white border-0'}`}>
                  {postData.published ? <><Eye className="w-4 h-4 mr-1" />Publicado</> : <><EyeOff className="w-4 h-4 mr-1" />Rascunho</>}
                </Badge>
                <Button onClick={startNewTag} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-sm">
                  <Tag className="w-4 h-4 mr-2" /> Gerir Tags
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-5xl">

            {/* Messages */}
            {successMsg && (
              <div className="mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in shadow-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-emerald-900 text-lg">{successMsg}</p>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in shadow-lg">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-red-900 text-lg">{errorMsg}</p>
              </div>
            )}
            {hasChanges && (
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-500 rounded-xl p-4 flex items-center justify-between animate-in fade-in shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-amber-900 text-lg">Tens alterações não guardadas</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="border-2 border-amber-600 text-amber-900 hover:bg-amber-100 font-semibold">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reverter
                </Button>
              </div>
            )}

            <div className="space-y-6">

              {/* ── Tag management panel ── */}
              {showTagPanel && (
                <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top">
                  <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
                  <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                          <Tag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-purple-900">
                            {editingTag ? 'Editar Tag' : 'Nova Tag'}
                          </CardTitle>
                          <CardDescription className="text-purple-700">Tags reutilizáveis com nome bilingue e cor</CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setShowTagPanel(false); setEditingTag(null) }}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                      {/* Form */}
                      <div className="space-y-5">
                        <div className="flex gap-2">
                          {[{ code: "en", flag: "🇬🇧" }, { code: "pt", flag: "🇵🇹" }].map(l => (
                            <button
                              key={l.code}
                              onClick={() => setTagLocale(l.code)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all flex-1 justify-center ${
                                tagLocale === l.code ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
                              }`}
                            >
                              {l.flag} {l.code.toUpperCase()}
                              {newTagNames[l.code]?.trim() && (
                                <span className={`w-2 h-2 rounded-full ${tagLocale === l.code ? 'bg-white/60' : 'bg-emerald-400'}`} />
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <Label className="font-semibold text-sm">
                            Nome {tagLocale === 'en' && <span className="text-red-500">*</span>}
                            <span className="text-xs text-slate-400 ml-1">({tagLocale === 'en' ? 'EN base' : 'PT tradução'})</span>
                          </Label>
                          <Input
                            value={newTagNames[tagLocale] || ''}
                            onChange={e => setNewTagNames(prev => ({ ...prev, [tagLocale]: e.target.value }))}
                            placeholder={tagLocale === 'en' ? 'Tag name' : 'Nome da tag (PT)'}
                            className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                          />
                          {tagLocale === 'pt' && newTagNames.en && (
                            <p className="text-xs text-slate-400">🇬🇧 Base: <span className="italic">{newTagNames.en}</span></p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="font-semibold text-sm">Cor</Label>
                          <div className="flex items-center gap-3">
                            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-12 h-12 rounded-lg border-2 border-slate-300 cursor-pointer" />
                            <Input value={newTagColor} onChange={e => setNewTagColor(e.target.value)} placeholder="#64748b" className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg font-mono" />
                            <div className="w-12 h-12 rounded-lg border-2 border-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: newTagColor, color: getTextColor(newTagColor) }}>
                              Aa
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleSaveTag}
                          disabled={savingTag || !newTagNames.en.trim()}
                          className="w-full h-11 font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          {savingTag ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {editingTag ? 'Atualizar Tag' : 'Criar Tag'}
                        </Button>
                      </div>

                      {/* Existing tags */}
                      <div>
                        <p className="font-bold text-slate-800 text-sm mb-3">Tags existentes ({allTags.length})</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {allTags.map(tag => (
                            <div key={tag.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded-full flex-shrink-0 border border-slate-200" style={{ backgroundColor: tag.color }} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 text-sm truncate">{getTagName(tag, 'en')}</p>
                                  {tag.translations?.pt?.name && (
                                    <p className="text-xs text-slate-400 truncate">{tag.translations.pt.name}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="sm" onClick={() => startEditTag(tag)} className="text-blue-600 hover:bg-blue-50 h-7 w-7 p-0">
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteTag(tag)} className="text-red-500 hover:bg-red-50 h-7 w-7 p-0">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Language selector */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Languages className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-slate-800 text-lg">Idioma de edição</span>
                    <span className="text-sm text-slate-500">— os campos de texto são guardados por idioma</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {LOCALES.map(l => {
                      const count    = fillCount(l.code)
                      const isActive = activeLocale === l.code
                      return (
                        <button
                          key={l.code}
                          onClick={() => setLocale(l.code)}
                          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-semibold transition-all ${
                            isActive ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400 hover:shadow'
                          }`}
                        >
                          <span className="text-xl">{l.flag}</span>
                          <span>{l.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white/25 text-white' : count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {count}/{TRANSLATABLE_FIELDS.length}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {activeLocale !== "en" && (
                    <p className="mt-3 text-sm text-slate-500">
                      A editar tradução em <strong>{LOCALES.find(l => l.code === activeLocale)?.label}</strong>. Campos vazios vão mostrar o conteúdo em Inglês como fallback.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Basic info */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-purple-900 mb-2">Informação do Artigo</CardTitle>
                      <CardDescription className="text-purple-700 text-base">Título, slug e resumo</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      Título {activeLocale === "en" && <span className="text-red-500">*</span>}
                      <LocaleBadge locale={activeLocale} />
                    </Label>
                    <Input
                      value={getT("title")}
                      onChange={e => setT("title", e.target.value)}
                      placeholder={activeLocale === "en" ? "Título do artigo" : "Título (PT)"}
                      className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                    />
                    <FallbackHint locale={activeLocale} baseValue={postData.translations?.en?.title} />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      Slug * <span className="text-xs text-slate-400 font-normal">(global)</span>
                    </Label>
                    <Input
                      value={postData.slug}
                      onChange={e => setPostData(p => ({ ...p, slug: e.target.value }))}
                      placeholder="url-do-artigo"
                      className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg font-mono text-sm"
                    />
                    <p className="text-sm text-slate-600">URL: <span className="font-mono text-purple-700">/blog/{postData.slug}</span></p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      Resumo <LocaleBadge locale={activeLocale} />
                    </Label>
                    <Textarea
                      value={getT("excerpt")}
                      onChange={e => setT("excerpt", e.target.value)}
                      placeholder="Breve resumo do artigo..."
                      rows={3}
                      className="border-2 border-slate-300 focus:border-purple-600 rounded-lg resize-none"
                    />
                    <FallbackHint locale={activeLocale} baseValue={postData.translations?.en?.excerpt} />
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">Conteúdo</CardTitle>
                      <CardDescription className="text-blue-700 text-base">Corpo completo do artigo (Markdown)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="space-y-3">
                    <Label className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      Conteúdo <LocaleBadge locale={activeLocale} />
                    </Label>
                    <Textarea
                      value={getT("_content")}
                      onChange={e => setT("_content", e.target.value)}
                      placeholder="Escreve o conteúdo completo do artigo aqui..."
                      rows={20}
                      className="border-2 border-slate-300 focus:border-blue-600 rounded-lg resize-none font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
                <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Tag className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-orange-900 mb-2">Tags</CardTitle>
                      <CardDescription className="text-orange-700 text-base">
                        Tags reutilizáveis — seleciona as que se aplicam
                        <span className="ml-2 text-xs text-orange-500">(global — não variam por idioma)</span>
                      </CardDescription>
                    </div>
                    <button onClick={startNewTag} className="text-sm text-orange-700 hover:text-orange-900 font-semibold flex items-center gap-1 border-2 border-orange-300 hover:border-orange-500 rounded-lg px-3 py-1.5 transition-all">
                      <Plus className="w-4 h-4" /> Nova tag
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  {allTags.length === 0 ? (
                    <p className="text-slate-400 italic">Nenhuma tag disponível. Cria uma clicando em "Nova tag".</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => {
                        const selected = postData.tagIds.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className="px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 border-2 flex items-center gap-1.5"
                            style={{
                              backgroundColor: selected ? tag.color : 'white',
                              borderColor: tag.color,
                              color: selected ? getTextColor(tag.color) : tag.color,
                            }}
                          >
                            {getTagName(tag, 'en')}
                            {tag.translations?.pt?.name && tag.translations.pt.name !== tag.translations.en?.name && (
                              <span className="opacity-70 text-xs">/ {getTagName(tag, 'pt')}</span>
                            )}
                            {selected && <span className="ml-1">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {postData.tagIds.length > 0 && (
                    <p className="text-sm text-slate-500 mt-4">{postData.tagIds.length} tag{postData.tagIds.length !== 1 ? 's' : ''} selecionada{postData.tagIds.length !== 1 ? 's' : ''}</p>
                  )}
                </CardContent>
              </Card>

              {/* Publication */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />
                <CardHeader className="bg-gradient-to-br from-emerald-50 to-emerald-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-emerald-900 mb-2">Publicação</CardTitle>
                      <CardDescription className="text-emerald-700 text-base">Configurações de visibilidade</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                    <input
                      type="checkbox"
                      id="published"
                      checked={postData.published}
                      onChange={e => setPostData(p => ({ ...p, published: e.target.checked }))}
                      className="w-6 h-6 text-emerald-600 border-2 border-emerald-400 rounded"
                    />
                    <Label htmlFor="published" className="text-slate-900 font-semibold text-base flex items-center gap-2 cursor-pointer flex-1">
                      {postData.published
                        ? <><Eye className="w-5 h-5 text-emerald-600" />Artigo Publicado</>
                        : <><EyeOff className="w-5 h-5 text-slate-600" />Artigo em Rascunho</>}
                      <span className="text-sm text-slate-600 font-normal ml-auto">
                        {postData.published ? 'Visível publicamente' : 'Apenas visível para admin'}
                      </span>
                    </Label>
                  </div>
                  {postData.published_at && (
                    <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center gap-2 text-slate-700">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Data de publicação:</span>
                      <span>{formatDate(postData.published_at)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="h-14 px-8 text-base font-semibold border-2 border-red-500 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5 mr-2" /> Eliminar Artigo
                </Button>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => router.push('/admin/blogManagement')} className="h-14 px-8 text-base font-semibold border-2">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="h-14 px-8 text-base font-bold bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white shadow-xl disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    {saving ? 'A guardar...' : 'Guardar Alterações'}
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
