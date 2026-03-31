"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, ArrowRight, BookOpen, Calendar, Loader2,
  Search, X, Filter, ChevronDown, ChevronUp, Rocket,
} from "lucide-react"
import { supabase, type BlogPost } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

// ─── helpers ─────────────────────────────────────────────────────────────────

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
    || item.translations?.['en']?.[field]
    || item[field]
    || ''
}

function getTagName(tag: TagRecord, lang: string): string {
  return tag.translations?.[lang]?.name || tag.translations?.en?.name || ''
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#1e293b' : '#ffffff'
}

// ─── types ────────────────────────────────────────────────────────────────────

type TagRecord = {
  id: string
  color: string
  translations: Record<string, any>
}

type ProjectRecord = {
  id: string
  title: string
}

type BlogPostWithMeta = BlogPost & {
  tags: TagRecord[]
  relatedProjectIds: string[]
}

type SortMode = 'date'

// ─── page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const { t, language } = useTranslation()

  const [posts, setPosts]             = useState<BlogPostWithMeta[]>([])
  const [allTags, setAllTags]         = useState<TagRecord[]>([])
  const [allProjects, setAllProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading]         = useState(true)

  // controls
  const [search, setSearch]                       = useState('')
  const [selectedTagId, setSelectedTagId]         = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen]             = useState(false)

  useEffect(() => { fetchData() }, [])

  // ── fetch ─────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
      if (error) throw error

      const postsWithMeta: BlogPostWithMeta[] = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: tagJunction } = await supabase
            .from('blog_post_tags')
            .select('tag_id, tags(id, color, translations)')
            .eq('post_id', post.id)

          const tags: TagRecord[] = (tagJunction || [])
            .map((j: any) => j.tags as TagRecord | null)
            .filter((t): t is TagRecord => t !== null)

          const { data: projectJunction } = await supabase
            .from('project_blog_posts')
            .select('project_id')
            .eq('blog_post_slug', post.slug)

          const relatedProjectIds: string[] = (projectJunction || []).map((j: any) => j.project_id)

          return { ...post, tags, relatedProjectIds }
        })
      )

      setPosts(postsWithMeta)

      const tagMap = new Map<string, TagRecord>()
      postsWithMeta.forEach(p => p.tags.forEach(tag => tagMap.set(tag.id, tag)))
      setAllTags(Array.from(tagMap.values()))

      const linkedIds = new Set(postsWithMeta.flatMap(p => p.relatedProjectIds))
      if (linkedIds.size > 0) {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, title')
          .in('id', Array.from(linkedIds))
          .order('title', { ascending: true })
        setAllProjects(projectsData || [])
      }
    } catch (err) {
      console.error('Error fetching blog data:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── filtering + sorting ───────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...posts]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        getTranslated(p, 'title', language).toLowerCase().includes(q) ||
        getTranslated(p, 'excerpt', language).toLowerCase().includes(q)
      )
    }

    if (selectedTagId)     list = list.filter(p => p.tags.some(t => t.id === selectedTagId))
    if (selectedProjectId) list = list.filter(p => p.relatedProjectIds.includes(selectedProjectId))

    list.sort((a, b) => {
      if (!a.published_at) return 1
      if (!b.published_at) return -1
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })

    return list
  }, [posts, search, selectedTagId, selectedProjectId, language])

  const hasFilters   = search.trim() !== '' || selectedTagId !== null || selectedProjectId !== null
  const clearFilters = () => { setSearch(''); setSelectedTagId(null); setSelectedProjectId(null) }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">

        {/* ── Hero ── */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 sm:mb-8 group text-sm sm:text-base" asChild>
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t.blogPage.backHome}
              </Link>
            </Button>

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold drop-shadow-lg">{t.blogPage.title}</h1>
                <p className="text-base sm:text-xl text-white/90 mt-1 sm:mt-2">{t.blogPage.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{posts.length}</p>
                <p className="text-xs sm:text-sm text-white/80">{t.blogPage.stats.published}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{allTags.length}</p>
                <p className="text-xs sm:text-sm text-white/80">tags</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Floating filter card — same pattern as courses/projects ── */}
        <div className="container mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">

            {/* Row 1: search + sort + filter toggle */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={language === 'pt' ? 'Pesquisar por título ou excerto...' : 'Search by title or excerpt...'}
                  className="pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white focus:border-red-600 rounded-xl text-sm transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {/* Filters toggle */}
                {(allTags.length > 0 || allProjects.length > 0) && (
                  <button
                    onClick={() => setFiltersOpen(v => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      filtersOpen || selectedTagId || selectedProjectId
                        ? 'bg-red-700 text-white border-red-700 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-red-600 hover:text-red-700'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Filtros' : 'Filters'}</span>
                    {(selectedTagId || selectedProjectId) && <span className="w-2 h-2 rounded-full bg-white/80" />}
                    {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Collapsible filters panel */}
            {filtersOpen && (
              <div className="px-4 sm:px-5 pb-6 pt-1 border-t border-slate-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">

                <div className="flex items-center gap-3 flex-wrap pt-4">
                  {(selectedTagId || selectedProjectId) && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-700 font-semibold hover:text-red-800">
                      <X className="w-3 h-3" />
                      {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                    </button>
                  )}
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2.5">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedTagId(null)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedTagId === null
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {language === 'pt' ? 'Todas' : 'All'}
                      </button>
                      {allTags.map(tag => {
                        const name     = getTagName(tag, language)
                        const isActive = selectedTagId === tag.id
                        return (
                          <button
                            key={tag.id}
                            onClick={() => setSelectedTagId(isActive ? null : tag.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all hover:scale-105 active:scale-95"
                            style={{
                              backgroundColor: isActive ? tag.color              : tag.color + '18',
                              borderColor:     isActive ? '#dc2626'              : tag.color + '55',
                              color:           isActive ? getTextColor(tag.color): tag.color,
                              boxShadow:       isActive ? '0 0 0 3px #dc262630' : 'none',
                              fontWeight:      isActive ? 800                   : 600,
                            }}
                          >
                            {isActive && (
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getTextColor(tag.color) }} />
                            )}
                            {name}
                            {isActive && <X className="w-3 h-3" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Related projects */}
                {allProjects.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2.5">
                      {language === 'pt' ? 'Projeto relacionado' : 'Related project'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedProjectId(null)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedProjectId === null
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {language === 'pt' ? 'Todos' : 'All'}
                      </button>
                      {allProjects.map(project => {
                        const isActive = selectedProjectId === project.id
                        return (
                          <button
                            key={project.id}
                            onClick={() => setSelectedProjectId(isActive ? null : project.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all hover:scale-105 active:scale-95 ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <Rocket className="w-3 h-3" />
                            {project.title}
                            {isActive && <X className="w-3 h-3" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results count strip */}
            {!loading && (
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">
                  {filtered.length === posts.length
                    ? `${posts.length} posts`
                    : `${filtered.length} ${language === 'pt' ? 'de' : 'of'} ${posts.length} posts`
                  }
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-700 font-semibold hover:text-red-800">
                    <X className="w-3 h-3" />
                    {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Posts list ── */}
        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-700 text-lg font-semibold mb-1">
                  {language === 'pt' ? 'Nenhum post encontrado' : 'No posts found'}
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  {language === 'pt' ? 'Tenta ajustar os filtros' : 'Try adjusting the filters'}
                </p>
                <Button variant="outline" onClick={clearFilters} className="rounded-xl border-2 hover:border-red-700 hover:text-red-700">
                  {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                </Button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {filtered.map((post, index) => (
                  <Card
                    key={post.id}
                    className="group bg-white border-0 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-in fade-in slide-in-from-bottom"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="h-1.5 sm:h-2 bg-gradient-to-r from-red-700 to-red-800 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                    <CardHeader className="p-5 sm:p-8 md:p-10">
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                setFiltersOpen(true)
                                setSelectedTagId(tag.id === selectedTagId ? null : tag.id)
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{
                                backgroundColor: tag.color + '22',
                                color:           tag.color,
                                border:          `1.5px solid ${tag.color}`,
                              }}
                            >
                              {getTagName(tag, language)}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Date */}
                      {post.published_at && (
                        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs sm:text-sm font-medium">{formatDate(post.published_at)}</span>
                        </div>
                      )}

                      <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight mb-3 sm:mb-4">
                        {getTranslated(post, 'title', language)}
                      </CardTitle>

                      {getTranslated(post, 'excerpt', language) && (
                        <CardDescription className="text-base sm:text-lg text-slate-600 leading-relaxed line-clamp-3 text-justify">
                          {getTranslated(post, 'excerpt', language)}
                        </CardDescription>
                      )}

                      {/* Related project chips */}
                      {post.relatedProjectIds.length > 0 && allProjects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {allProjects
                            .filter(p => post.relatedProjectIds.includes(p.id))
                            .map(project => (
                              <button
                                key={project.id}
                                onClick={() => {
                                  setFiltersOpen(true)
                                  setSelectedProjectId(selectedProjectId === project.id ? null : project.id)
                                }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-all hover:scale-105 active:scale-95 ${
                                  selectedProjectId === project.id
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                <Rocket className="w-3 h-3" />
                                {project.title}
                              </button>
                            ))}
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="px-5 sm:px-8 md:px-10 pb-5 sm:pb-8">
                      <Button
                        asChild
                        className="w-full sm:w-auto bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold text-sm sm:text-base h-10 sm:h-11 transition-all duration-300 ease-out hover:brightness-110 hover:ring-2 hover:ring-red-500/40"
                      >
                        <Link href={`/blog/${post.slug}`} className="flex items-center justify-center">
                          {t.blogPage.readMore}
                          <ArrowRight className="ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
