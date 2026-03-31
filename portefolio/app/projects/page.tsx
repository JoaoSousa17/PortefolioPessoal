"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft, ArrowRight, ExternalLink, Github, Rocket, Loader2,
  Search, X, Star, Calendar, ChevronDown, ChevronUp, Filter
} from "lucide-react"
import { supabase, type Project } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

type Skill = { id: string; name: string; color: string | null; category_id: string }
type Category = { id: string; name: string; order: number; translations: any }
type ProjectWithSkills = Project & { skills: Skill[] }
type SortMode = 'featured' | 'date'

// Deterministic pastel gradient per project based on title char codes
function getCardGradient(title: string) {
  const gradients = [
    'from-red-50 via-rose-50 to-orange-50',
    'from-slate-100 via-slate-50 to-zinc-50',
    'from-amber-50 via-yellow-50 to-orange-50',
    'from-red-100 via-rose-50 to-pink-50',
    'from-zinc-100 via-slate-50 to-stone-50',
    'from-orange-50 via-amber-50 to-red-50',
  ]
  const seed = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[seed % gradients.length]
}

export default function ProjectsPage() {
  const { t, language } = useTranslation()

  const [projects, setProjects]           = useState<ProjectWithSkills[]>([])
  const [allSkills, setAllSkills]         = useState<Skill[]>([])
  const [categories, setCategories]       = useState<Category[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [sortMode, setSortMode]           = useState<SortMode>('featured')
  const [filtersOpen, setFiltersOpen]     = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from("projects").select("*").eq("status", "active").order("created_at", { ascending: false })
      if (error) throw error
      const projectsData = data || []

      const projectIds = projectsData.map((p: any) => p.id)
      const { data: skillLinks } = await supabase
        .from("project_skills")
        .select("project_id, skills(id, name, color, category_id)")
        .in("project_id", projectIds)

      const { data: catsData } = await supabase
        .from("skill_categories").select("id, name, order, translations").order("order", { ascending: true })

      const skillsMap = new Map<string, Skill[]>()
      const allSkillsMap = new Map<string, Skill>()
      ;(skillLinks || []).forEach((link: any) => {
        const skill = link.skills as Skill | null
        if (!skill) return
        if (!skillsMap.has(link.project_id)) skillsMap.set(link.project_id, [])
        skillsMap.get(link.project_id)!.push(skill)
        allSkillsMap.set(skill.id, skill)
      })

      setProjects(projectsData.map((p: any) => ({ ...p, skills: skillsMap.get(p.id) || [] })))
      setAllSkills(Array.from(allSkillsMap.values()))
      setCategories(catsData || [])
    } catch (err) {
      console.error("Error fetching projects:", err)
    } finally {
      setLoading(false)
    }
  }

  const skillsByCategory = useMemo(() => {
    const map = new Map<string, Skill[]>()
    allSkills.forEach(skill => {
      if (!map.has(skill.category_id)) map.set(skill.category_id, [])
      map.get(skill.category_id)!.push(skill)
    })
    return map
  }, [allSkills])

  const filtered = useMemo(() => {
    let list = [...projects]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        getTranslated(p, 'title', language).toLowerCase().includes(q) ||
        getTranslated(p, 'description', language).toLowerCase().includes(q)
      )
    }
    if (selectedSkill) list = list.filter(p => p.skills.some(s => s.id === selectedSkill))
    if (sortMode === 'featured') {
      list.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1))
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return list
  }, [projects, search, selectedSkill, sortMode, language])

  const hasFilters = search.trim() !== '' || selectedSkill !== null
  const clearFilters = () => { setSearch(''); setSelectedSkill(null) }

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>
          <div className="relative container mx-auto px-4 sm:px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 sm:mb-8 group text-sm sm:text-base" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t.projectsPage.back}
              </Link>
            </Button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl ring-4 ring-red-500/20">
                <Rocket className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold drop-shadow-lg">{t.projectsPage.hero.title}</h1>
                <p className="text-base sm:text-xl text-white/70 mt-1">{t.projectsPage.hero.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/15">
                <p className="text-3xl font-bold">{projects.length}</p>
                <p className="text-xs text-white/60 mt-0.5">{t.projectsPage.stats.active}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/15">
                <p className="text-3xl font-bold">{projects.filter(p => p.featured).length}</p>
                <p className="text-xs text-white/60 mt-0.5">{t.projectsPage.stats.featured}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search + filter controls — floating card style */}
        <div className="container mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">

            {/* Main row */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={language === 'pt' ? 'Procurar projeto...' : 'Search project...'}
                  className="pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white focus:border-red-600 rounded-xl text-sm transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {/* Sort pills */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSortMode('featured')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortMode === 'featured'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${sortMode === 'featured' ? 'text-red-600 fill-red-600' : ''}`} />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Destaque' : 'Featured'}</span>
                  </button>
                  <button
                    onClick={() => setSortMode('date')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortMode === 'date'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 ${sortMode === 'date' ? 'text-red-600' : ''}`} />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Data' : 'Date'}</span>
                  </button>
                </div>

                {allSkills.length > 0 && (
                  <button
                    onClick={() => setFiltersOpen(v => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      filtersOpen || selectedSkill
                        ? 'bg-red-700 text-white border-red-700 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-red-600 hover:text-red-700'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Skills</span>
                    {selectedSkill && <span className="w-2 h-2 rounded-full bg-white/80" />}
                    {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Collapsible skills panel */}
            {filtersOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 flex-wrap pt-4">
                  <button
                    onClick={() => setSelectedSkill(null)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedSkill === null
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {language === 'pt' ? 'Todas' : 'All'}
                  </button>
                  {selectedSkill && (
                    <button onClick={() => setSelectedSkill(null)} className="flex items-center gap-1 text-xs text-red-700 font-semibold hover:text-red-800">
                      <X className="w-3 h-3" /> {language === 'pt' ? 'Limpar' : 'Clear'}
                    </button>
                  )}
                </div>

                {categories.filter(cat => skillsByCategory.has(cat.id)).map(cat => (
                  <div key={cat.id}>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2">
                      {getTranslated(cat, 'name', language)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(skillsByCategory.get(cat.id) || []).map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                          style={{
                            // Unselected: tinted background with skill colour, no harsh border
                            // Selected: full colour fill + thick red ring to pop it out
                            backgroundColor: skill.color ? skill.color + '28' : '#f1f5f9',
                            color: skill.color || '#475569',
                            border: selectedSkill === skill.id
                              ? '2px solid #dc2626'
                              : `1.5px solid ${skill.color ? skill.color + '55' : '#e2e8f0'}`,
                            boxShadow: selectedSkill === skill.id
                              ? `0 0 0 3px #dc262630, inset 0 0 0 99px ${skill.color || '#0f172a'}22`
                              : 'none',
                            fontWeight: selectedSkill === skill.id ? 800 : 600,
                          }}
                        >
                          {selectedSkill === skill.id && (
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: skill.color || '#dc2626' }}
                            />
                          )}
                          {skill.name}
                          {selectedSkill === skill.id && <X className="w-3 h-3 text-red-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results count strip */}
            {!loading && (
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">
                  {filtered.length === projects.length
                    ? `${projects.length} ${language === 'pt' ? 'projetos' : 'projects'}`
                    : `${filtered.length} ${language === 'pt' ? 'de' : 'of'} ${projects.length} ${language === 'pt' ? 'projetos' : 'projects'}`
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

        {/* Grid */}
        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-600 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-700 text-lg font-semibold mb-1">
                  {language === 'pt' ? 'Nenhum projeto encontrado' : 'No projects found'}
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  {language === 'pt' ? 'Tenta ajustar os filtros' : 'Try adjusting the filters'}
                </p>
                <Button variant="outline" onClick={clearFilters} className="rounded-xl border-2 hover:border-red-700 hover:text-red-700">
                  {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                {filtered.map((project, index) => {
                  const title       = getTranslated(project, 'title', language)
                  const description = getTranslated(project, 'description', language)
                  const gradient    = getCardGradient(title)

                  return (
                    <div
                      key={project.id}
                      className="group relative animate-in fade-in slide-in-from-bottom duration-500"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {/* Card */}
                      <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">

                        {/* Thumbnail area */}
                        <div className={`relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br ${gradient}`}>
                          {project.thumbnail_url ? (
                            <>
                              <img
                                src={project.thumbnail_url}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-20 h-20 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                <Rocket className="w-10 h-10 text-red-400" />
                              </div>
                            </div>
                          )}

                          {/* Featured badge */}
                          {project.featured && (
                            <div className="absolute top-3 left-3">
                              <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-red-700 text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-red-100">
                                <Star className="w-3 h-3 fill-red-600 text-red-600" />
                                {t.projectsPage.featured}
                              </span>
                            </div>
                          )}

                          {/* Links floating on image */}
                          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {project.github_url && (
                              <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                              >
                                <Github className="w-4 h-4 text-slate-800" />
                              </a>
                            )}
                            {project.main_url && (
                              <a
                                href={project.main_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-slate-800" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow flex flex-col p-5 sm:p-6">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug mb-2">
                            {title}
                          </h3>
                          {description && (
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
                              {description}
                            </p>
                          )}

                          {/* Skills */}
                          {project.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                              {project.skills.slice(0, 4).map(skill => (
                                <button
                                  key={skill.id}
                                  onClick={() => setSelectedSkill(skill.id === selectedSkill ? null : skill.id)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                                  style={{
                                    backgroundColor: selectedSkill === skill.id
                                      ? (skill.color || '#0f172a')
                                      : (skill.color ? skill.color + '18' : '#f1f5f9'),
                                    color: selectedSkill === skill.id ? 'white' : (skill.color || '#475569'),
                                    border: `1.5px solid ${skill.color ? skill.color + '40' : '#e2e8f0'}`,
                                  }}
                                >
                                  {skill.name}
                                </button>
                              ))}
                              {project.skills.length > 4 && (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200">
                                  +{project.skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* CTA */}
                          <Link
                            href={`/projects/${project.id}`}
                            className="flex items-center justify-between w-full bg-slate-900 hover:bg-red-700 text-white text-sm font-semibold px-4 py-3 rounded-2xl transition-all duration-300 group/btn mt-auto"
                          >
                            <span>{t.projectsPage.viewDetails}</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
