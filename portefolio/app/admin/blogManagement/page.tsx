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
  ArrowLeft, Loader2, BookOpen, Plus, Edit, Trash2,
  CheckCircle2, AlertCircle, Calendar, Eye, EyeOff, Languages, Tag, X
} from "lucide-react"
import { supabase, type BlogPost } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type TagRecord = {
  id: string
  color: string
  translations: Record<string, any>   // { en: { name }, pt: { name } }
}

type BlogTranslation = {
  title?: string
  excerpt?: string
  _content?: string
}

type NewBlogPost = {
  slug: string
  published: boolean
  published_at: string | null
  tagIds: string[]
  translations: Record<string, BlogTranslation>
}

type BlogPostWithTags = BlogPost & {
  tags: TagRecord[]
  translations?: Record<string, BlogTranslation> | null
}

// ─── Locales ──────────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", label: "English",   flag: "🇬🇧" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
]

const TRANSLATABLE_FIELDS: (keyof BlogTranslation)[] = ["title", "excerpt", "_content"]

const TAG_LOCALES = [
  { code: "en", flag: "🇬🇧" },
  { code: "pt", flag: "🇵🇹" },
]

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

export default function BlogManagement() {
  const router = useRouter()

  // ── Global state ──────────────────────────────────────────────────────────
  const [loading, setSaving_]       = useState(true)
  const setLoading                  = setSaving_
  const [saving, setSaving]         = useState(false)
  const [posts, setPosts]           = useState<BlogPostWithTags[]>([])
  const [allTags, setAllTags]       = useState<TagRecord[]>([])
  const [successMsg, setSuccess]    = useState('')
  const [errorMsg, setError]        = useState('')

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  const showError   = (msg: string) => { setError(msg);   setTimeout(() => setError(''), 5000) }

  // ── New post form ─────────────────────────────────────────────────────────
  const [activeLocale, setActiveLocale] = useState("en")
  const [newPost, setNewPost] = useState<NewBlogPost>({
    slug: '', published: false, published_at: null,
    tagIds: [], translations: { en: {}, pt: {} },
  })

  // ── Tag management panel ──────────────────────────────────────────────────
  const [showTagPanel, setShowTagPanel] = useState(false)
  const [tagLocale, setTagLocale]       = useState("en")
  const [newTagColor, setNewTagColor]   = useState("#64748b")
  const [newTagNames, setNewTagNames]   = useState<Record<string, string>>({ en: '', pt: '' })
  const [savingTag, setSavingTag]       = useState(false)
  const [editingTag, setEditingTag]     = useState<TagRecord | null>(null)

  // ─── Translation helpers ─────────────────────────────────────────────────

  const getT = (field: keyof BlogTranslation) =>
    newPost.translations?.[activeLocale]?.[field] ?? ""

  const setT = (field: keyof BlogTranslation, value: string) =>
    setNewPost(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [activeLocale]: { ...(prev.translations?.[activeLocale] ?? {}), [field]: value },
      },
    }))

  const fillCount = (lc: string) => {
    const tr = newPost.translations?.[lc] ?? {}
    return TRANSLATABLE_FIELDS.filter(f => tr[f]?.trim()).length
  }

  const postTitle = (p: BlogPostWithTags) =>
    p.translations?.en?.title || p.translations?.pt?.title || 'Sem título'

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) { router.push('/auth'); return }
    fetchAll()
  }, [router])

  const fetchAll = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchPosts(), fetchTags()])
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    const { data, error } = await supabase.from('tags').select('*').order('id')
    if (error) { console.error(error); return }
    setAllTags(data || [])
  }

  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })

    if (error) { showError('Erro ao carregar artigos'); return }

    const postsWithTags = await Promise.all(
      (postsData || []).map(async (post) => {
        const { data: jd } = await supabase
          .from('blog_post_tags')
          .select('tag_id, tags(id, color, translations)')
          .eq('post_id', post.id)

        const tags: TagRecord[] = (jd || []).map((j: any) => j.tags).filter(Boolean)
        return { ...post, tags }
      })
    )
    setPosts(postsWithTags)
  }

  // ─── Slug helpers ─────────────────────────────────────────────────────────

  const generateSlug = (title: string) =>
    title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleTitleChange = (value: string) => {
    setT("title", value)
    if (activeLocale === "en") {
      setNewPost(prev => ({
        ...prev,
        slug: generateSlug(value),
        translations: {
          ...prev.translations,
          en: { ...(prev.translations?.en ?? {}), title: value },
        },
      }))
    }
  }

  // ─── Add post ─────────────────────────────────────────────────────────────

  const handleAddPost = async () => {
    if (!newPost.translations?.en?.title?.trim()) { showError('O título em Inglês é obrigatório'); return }
    if (!newPost.slug.trim()) { showError('O slug é obrigatório'); return }

    try {
      setSaving(true)
      const publishedAt = newPost.published ? new Date().toISOString() : null

      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .insert([{ slug: newPost.slug, published: newPost.published, published_at: publishedAt, translations: newPost.translations }])
        .select().single()

      if (postError) throw postError

      if (newPost.tagIds.length > 0 && postData) {
        const { error: tagErr } = await supabase
          .from('blog_post_tags')
          .insert(newPost.tagIds.map(tid => ({ post_id: postData.id, tag_id: tid })))
        if (tagErr) throw tagErr
      }

      showSuccess('Artigo adicionado com sucesso!')
      setNewPost({ slug: '', published: false, published_at: null, tagIds: [], translations: { en: {}, pt: {} } })
      setActiveLocale("en")
      fetchPosts()
    } catch (err: any) {
      showError('Erro ao adicionar artigo. Verifica se o slug já existe.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete post ──────────────────────────────────────────────────────────

  const handleDeletePost = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este artigo?')) return
    try {
      await supabase.from('blog_post_tags').delete().eq('post_id', id)
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
      showSuccess('Artigo eliminado com sucesso!')
      fetchPosts()
    } catch {
      showError('Erro ao eliminar artigo')
    }
  }

  // ─── Tag CRUD ─────────────────────────────────────────────────────────────

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
    setNewTagNames({
      en: tag.translations?.en?.name || '',
      pt: tag.translations?.pt?.name || '',
    })
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
        const { error } = await supabase
          .from('tags')
          .update({ color: newTagColor, translations })
          .eq('id', editingTag.id)
        if (error) throw error
        showSuccess('Tag atualizada!')
      } else {
        const { error } = await supabase
          .from('tags')
          .insert([{ color: newTagColor, translations }])
        if (error) throw error
        showSuccess('Tag criada!')
      }

      setShowTagPanel(false)
      setEditingTag(null)
      await fetchTags()
      fetchPosts()
    } catch {
      showError('Erro ao guardar tag')
    } finally {
      setSavingTag(false)
    }
  }

  const handleDeleteTag = async (tag: TagRecord) => {
    if (!confirm(`Eliminar a tag "${getTagName(tag, 'en')}"? Será removida de todos os artigos.`)) return
    try {
      await supabase.from('blog_post_tags').delete().eq('tag_id', tag.id)
      const { error } = await supabase.from('tags').delete().eq('id', tag.id)
      if (error) throw error
      showSuccess('Tag eliminada!')
      await fetchTags()
      fetchPosts()
    } catch {
      showError('Erro ao eliminar tag')
    }
  }

  const toggleTagOnPost = (tagId: string) => {
    setNewPost(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-purple-700/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative container mx-auto px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Gestão do Blog</h1>
                  <p className="text-xl text-white/90 mt-2">
                    {posts.length} artigo{posts.length !== 1 ? 's' : ''} · {posts.filter(p => p.published).length} publicado{posts.filter(p => p.published).length !== 1 ? 's' : ''} · {allTags.length} tag{allTags.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <Button
                onClick={startNewTag}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold"
              >
                <Tag className="w-4 h-4 mr-2" />
                Gerir Tags
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-7xl">

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

            {/* ── Tag management panel ── */}
            {showTagPanel && (
              <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden mb-8 animate-in fade-in slide-in-from-top">
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
                        <CardDescription className="text-purple-700">
                          Tags reutilizáveis com nome bilingue e cor
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setShowTagPanel(false); setEditingTag(null) }}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left — form */}
                    <div className="space-y-5">
                      {/* Locale selector */}
                      <div className="flex gap-2">
                        {TAG_LOCALES.map(l => (
                          <button
                            key={l.code}
                            onClick={() => setTagLocale(l.code)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all flex-1 justify-center ${
                              tagLocale === l.code
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
                            }`}
                          >
                            {l.flag} {l.code.toUpperCase()}
                            {newTagNames[l.code]?.trim() && (
                              <span className={`w-2 h-2 rounded-full ${tagLocale === l.code ? 'bg-white/60' : 'bg-emerald-400'}`} />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Name */}
                      <div className="space-y-2">
                        <Label className="font-semibold text-sm flex items-center gap-2">
                          Nome {tagLocale === 'en' && <span className="text-red-500">*</span>}
                          <span className="text-xs text-slate-400">({tagLocale === 'en' ? 'EN base' : 'PT tradução'})</span>
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

                      {/* Color */}
                      <div className="space-y-2">
                        <Label className="font-semibold text-sm">Cor</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={newTagColor}
                            onChange={e => setNewTagColor(e.target.value)}
                            className="w-12 h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                          />
                          <Input
                            value={newTagColor}
                            onChange={e => setNewTagColor(e.target.value)}
                            placeholder="#64748b"
                            className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg font-mono"
                          />
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: newTagColor, color: getTextColor(newTagColor) }}
                          >
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

                    {/* Right — existing tags */}
                    <div>
                      <p className="font-bold text-slate-800 text-sm mb-3">Tags existentes ({allTags.length})</p>
                      {allTags.length === 0 ? (
                        <p className="text-slate-400 text-sm">Nenhuma tag criada ainda.</p>
                      ) : (
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── Left: New post form ── */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl sticky top-6">
                  <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                  <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Plus className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-purple-900 mb-2">Novo Artigo</CardTitle>
                        <CardDescription className="text-purple-700 text-base">Cria um novo post para o blog</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 bg-white space-y-5">

                    {/* Locale selector */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-purple-600" />
                        <span className="text-slate-900 font-semibold text-sm">Idioma de edição</span>
                      </div>
                      <div className="flex gap-2">
                        {LOCALES.map(l => {
                          const count    = fillCount(l.code)
                          const isActive = activeLocale === l.code
                          return (
                            <button
                              key={l.code}
                              onClick={() => setActiveLocale(l.code)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all flex-1 justify-center ${
                                isActive ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:border-purple-400'
                              }`}
                            >
                              <span>{l.flag}</span>
                              <span>{l.label}</span>
                              <span className={`px-1.5 py-0.5 rounded-full font-bold ${
                                isActive ? 'bg-white/25 text-white' : count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {count}/{TRANSLATABLE_FIELDS.length}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {activeLocale !== "en" && (
                        <p className="text-xs text-slate-500">Campos vazios usam o conteúdo em Inglês como fallback.</p>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Título {activeLocale === "en" && <span className="text-red-500">*</span>}
                        <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Input
                        value={getT("title")}
                        onChange={e => handleTitleChange(e.target.value)}
                        placeholder={activeLocale === "en" ? "Título do artigo" : "Título (PT)"}
                        className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newPost.translations?.en?.title} />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Slug * <span className="text-xs text-slate-400 font-normal">(global)</span>
                      </Label>
                      <Input
                        value={newPost.slug}
                        onChange={e => setNewPost(p => ({ ...p, slug: e.target.value }))}
                        placeholder="url-do-artigo"
                        className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg font-mono text-sm"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Resumo <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Textarea
                        value={getT("excerpt")}
                        onChange={e => setT("excerpt", e.target.value)}
                        placeholder="Breve resumo..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-purple-600 rounded-lg resize-none text-sm"
                      />
                      <FallbackHint locale={activeLocale} baseValue={newPost.translations?.en?.excerpt} />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        Conteúdo <LocaleBadge locale={activeLocale} />
                      </Label>
                      <Textarea
                        value={getT("_content")}
                        onChange={e => setT("_content", e.target.value)}
                        placeholder="Conteúdo em Markdown..."
                        rows={8}
                        className="border-2 border-slate-300 focus:border-purple-600 rounded-lg resize-none text-sm font-mono"
                      />
                    </div>

                    {/* Tags picker */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          <Tag className="w-4 h-4 text-purple-600" />
                          Tags <span className="text-xs text-slate-400 font-normal">(global)</span>
                        </Label>
                        <button
                          onClick={startNewTag}
                          className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Nova tag
                        </button>
                      </div>

                      {allTags.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nenhuma tag disponível. Cria uma primeiro.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {allTags.map(tag => {
                            const selected = newPost.tagIds.includes(tag.id)
                            return (
                              <button
                                key={tag.id}
                                onClick={() => toggleTagOnPost(tag.id)}
                                className="px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-105 border-2"
                                style={{
                                  backgroundColor: selected ? tag.color : 'white',
                                  borderColor: tag.color,
                                  color: selected ? getTextColor(tag.color) : tag.color,
                                }}
                              >
                                {getTagName(tag, 'en')}
                                {selected && ' ✓'}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Published */}
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                      <input
                        type="checkbox"
                        id="published"
                        checked={newPost.published}
                        onChange={e => setNewPost(p => ({ ...p, published: e.target.checked }))}
                        className="w-5 h-5 text-emerald-600 border-2 border-emerald-400 rounded"
                      />
                      <Label htmlFor="published" className="text-slate-900 font-semibold text-sm flex items-center gap-2 cursor-pointer">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        Publicar imediatamente
                      </Label>
                    </div>

                    {/* Submit */}
                    <Button
                      onClick={handleAddPost}
                      disabled={saving}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white shadow-lg"
                    >
                      {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                      {saving ? 'A adicionar...' : 'Adicionar Artigo'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* ── Right: Posts list ── */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                  <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold text-slate-900 mb-2">Artigos Existentes</CardTitle>
                        <CardDescription className="text-slate-700 text-base">Gere e edita os teus artigos</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 bg-white">
                    {posts.length === 0 ? (
                      <div className="p-12 text-center">
                        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-700 text-lg">Nenhum artigo adicionado ainda.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-100 border-b-2 border-slate-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Artigo</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Data</th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {posts.map((post, index) => (
                              <tr
                                key={post.id}
                                className="hover:bg-slate-50 transition-colors"
                                style={{ animation: 'fadeIn 0.3s ease-in', animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                              >
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-900 mb-1">{postTitle(post)}</p>
                                  <p className="text-sm text-slate-500 font-mono mb-2">/{post.slug}</p>
                                  {post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {post.tags.map(tag => (
                                        <span
                                          key={tag.id}
                                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                                          style={{
                                            backgroundColor: tag.color + '22',
                                            color: tag.color,
                                            border: `1.5px solid ${tag.color}`,
                                          }}
                                        >
                                          {getTagName(tag, 'en')}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className={`w-fit text-xs ${
                                    post.published
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-slate-100 text-slate-800 border-slate-300'
                                  }`}>
                                    {post.published
                                      ? <><Eye className="w-3 h-3 mr-1" />Publicado</>
                                      : <><EyeOff className="w-3 h-3 mr-1" />Rascunho</>}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(post.published_at)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" asChild>
                                      <Link href={`/admin/blogManagement/${post.slug}`}>
                                        <Edit className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:bg-red-50">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <style jsx>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
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

function Save({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}
