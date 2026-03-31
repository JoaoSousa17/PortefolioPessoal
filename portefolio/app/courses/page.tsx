"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Award, ExternalLink, Calendar, Loader2, GraduationCap,
  Search, X, Star, Filter, ChevronDown, ChevronUp, SlidersHorizontal
} from "lucide-react"
import { supabase, type Course } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import { MarkdownContent } from "@/components/ui/markdown-content"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

type Skill = { id: string; name: string; color: string | null }
type CourseWithSkills = Course & { skills: Skill[] }
type SortMode = 'featured' | 'date' | 'importance'

const IMPORTANCE_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

export default function CoursesPage() {
  const { t, language } = useTranslation()

  const [courses, setCourses]         = useState<CourseWithSkills[]>([])
  const [allSkills, setAllSkills]     = useState<Skill[]>([])
  const [allInstitutions, setAllInstitutions] = useState<string[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [sortMode, setSortMode]       = useState<SortMode>('date')
  const [selectedSkill, setSelectedSkill]           = useState<string | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('completion_date', { ascending: false, nullsFirst: false })
      if (error) throw error
      const coursesData = data || []

      // Fetch skills for all courses
      const ids = coursesData.map((c: any) => c.id)
      const { data: skillLinks } = await supabase
        .from('course_skills')
        .select('course_id, skills(id, name, color)')
        .in('course_id', ids)

      const skillsMap = new Map<string, Skill[]>()
      const allSkillsMap = new Map<string, Skill>()
      ;(skillLinks || []).forEach((link: any) => {
        const skill = link.skills as Skill | null
        if (!skill) return
        if (!skillsMap.has(link.course_id)) skillsMap.set(link.course_id, [])
        skillsMap.get(link.course_id)!.push(skill)
        allSkillsMap.set(skill.id, skill)
      })

      const enriched: CourseWithSkills[] = coursesData.map((c: any) => ({
        ...c,
        skills: skillsMap.get(c.id) || [],
      }))

      setCourses(enriched)
      setAllSkills(Array.from(allSkillsMap.values()).sort((a, b) => a.name.localeCompare(b.name)))

      // Unique institutions
      const institutions = [...new Set(coursesData.map((c: any) => c.college_name).filter(Boolean))] as string[]
      setAllInstitutions(institutions.sort())
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let list = [...courses]

    // Text search — title + institution
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        getTranslated(c, 'title', language).toLowerCase().includes(q) ||
        c.college_name?.toLowerCase().includes(q)
      )
    }

    // Institution filter
    if (selectedInstitution) list = list.filter(c => c.college_name === selectedInstitution)

    // Skill filter
    if (selectedSkill) list = list.filter(c => c.skills.some(s => s.id === selectedSkill))

    // Sort
    if (sortMode === 'featured') {
      list.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1))
    } else if (sortMode === 'importance') {
      list.sort((a, b) => (IMPORTANCE_ORDER[a.importance ?? ''] ?? 99) - (IMPORTANCE_ORDER[b.importance ?? ''] ?? 99))
    } else {
      list.sort((a, b) => {
        if (!a.completion_date && !b.completion_date) return 0
        if (!a.completion_date) return 1
        if (!b.completion_date) return -1
        return new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
      })
    }

    return list
  }, [courses, search, selectedSkill, selectedInstitution, sortMode, language])

  const hasFilters   = search.trim() !== '' || selectedSkill !== null || selectedInstitution !== null
  const clearFilters = () => { setSearch(''); setSelectedSkill(null); setSelectedInstitution(null) }

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })
  }

  const getImportanceBadge = (importance: string | null) => {
    switch (importance) {
      case 'high':   return { label: t.coursesPage.importance.high,   color: 'bg-red-100 text-red-800 border-red-300' }
      case 'medium': return { label: t.coursesPage.importance.medium, color: 'bg-amber-100 text-amber-800 border-amber-300' }
      case 'low':    return { label: t.coursesPage.importance.low,    color: 'bg-slate-100 text-slate-800 border-slate-300' }
      default:       return null
    }
  }

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
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t.coursesPage.backHome}
              </Link>
            </Button>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold drop-shadow-lg">{t.coursesPage.title}</h1>
                <p className="text-base sm:text-xl text-white/90 mt-1 sm:mt-2">{t.coursesPage.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{courses.length}</p>
                <p className="text-xs sm:text-sm text-white/80">{t.coursesPage.stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{courses.filter(c => c.featured).length}</p>
                <p className="text-xs sm:text-sm text-white/80">{t.coursesPage.stats.featured}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{courses.filter(c => c.importance === 'high').length}</p>
                <p className="text-xs sm:text-sm text-white/80">{t.coursesPage.stats.highImportance}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter card — floating */}
        <div className="container mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">

            {/* Row 1: search + sort + filter toggle */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={language === 'pt' ? 'Pesquisar por título ou instituição...' : 'Search by title or institution...'}
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
                      sortMode === 'featured' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${sortMode === 'featured' ? 'text-red-600 fill-red-600' : ''}`} />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Destaque' : 'Featured'}</span>
                  </button>
                  <button
                    onClick={() => setSortMode('importance')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortMode === 'importance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Award className={`w-3.5 h-3.5 ${sortMode === 'importance' ? 'text-red-600' : ''}`} />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Relevância' : 'Importance'}</span>
                  </button>
                  <button
                    onClick={() => setSortMode('date')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortMode === 'date' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 ${sortMode === 'date' ? 'text-red-600' : ''}`} />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Data' : 'Date'}</span>
                  </button>
                </div>

                {/* Filters toggle */}
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    filtersOpen || selectedSkill || selectedInstitution
                      ? 'bg-red-700 text-white border-red-700 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-600 hover:text-red-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'pt' ? 'Filtros' : 'Filters'}</span>
                  {(selectedSkill || selectedInstitution) && <span className="w-2 h-2 rounded-full bg-white/80" />}
                  {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Collapsible filters panel */}
            {filtersOpen && (
              <div className="px-4 sm:px-5 pb-6 pt-1 border-t border-slate-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">

                {/* Clear */}
                <div className="flex items-center gap-3 flex-wrap pt-4">
                  {(selectedSkill || selectedInstitution) && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-700 font-semibold hover:text-red-800">
                      <X className="w-3 h-3" /> {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                    </button>
                  )}
                </div>

                {/* Institution filter */}
                {allInstitutions.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2.5">
                      {language === 'pt' ? 'Instituição' : 'Institution'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedInstitution(null)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedInstitution === null
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {language === 'pt' ? 'Todas' : 'All'}
                      </button>
                      {allInstitutions.map(inst => (
                        <button
                          key={inst}
                          onClick={() => setSelectedInstitution(selectedInstitution === inst ? null : inst)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all hover:scale-105 active:scale-95 ${
                            selectedInstitution === inst
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <GraduationCap className="w-3 h-3" />
                          {inst}
                          {selectedInstitution === inst && <X className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills filter */}
                {allSkills.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-2.5">
                      {language === 'pt' ? 'Skill' : 'Skill'}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                      {allSkills.map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: selectedSkill === skill.id ? (skill.color || '#0f172a') : (skill.color ? skill.color + '18' : 'white'),
                            borderColor: selectedSkill === skill.id ? '#dc2626' : (skill.color ? skill.color + '55' : '#e2e8f0'),
                            color: selectedSkill === skill.id ? 'white' : (skill.color || '#475569'),
                            boxShadow: selectedSkill === skill.id ? '0 0 0 3px #dc262630' : 'none',
                            fontWeight: selectedSkill === skill.id ? 800 : 600,
                          }}
                        >
                          {selectedSkill === skill.id && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: skill.color || '#dc2626' }} />
                          )}
                          {skill.name}
                          {selectedSkill === skill.id && <X className="w-3 h-3 text-red-300" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results strip */}
            {!loading && (
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">
                  {filtered.length === courses.length
                    ? `${courses.length} ${language === 'pt' ? 'cursos' : 'courses'}`
                    : `${filtered.length} ${language === 'pt' ? 'de' : 'of'} ${courses.length} ${language === 'pt' ? 'cursos' : 'courses'}`
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

        {/* Courses List */}
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
                  {language === 'pt' ? 'Nenhum curso encontrado' : 'No courses found'}
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  {language === 'pt' ? 'Tenta ajustar os filtros' : 'Try adjusting the filters'}
                </p>
                <Button variant="outline" onClick={clearFilters} className="rounded-xl border-2 hover:border-red-700 hover:text-red-700">
                  {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                </Button>
              </div>
            ) : (
              <Card className="bg-white border-0 shadow-lg sm:shadow-2xl overflow-hidden max-w-5xl mx-auto">
                <div className="divide-y divide-slate-200">
                  {filtered.map((course, index) => {
                    const importanceBadge = getImportanceBadge(course.importance)
                    const title = getTranslated(course, 'title', language)
                    const description = getTranslated(course, 'description', language)

                    return (
                      <div
                        key={course.id}
                        className="group relative p-4 sm:p-6 md:p-8 hover:bg-slate-50 transition-all duration-300 animate-in fade-in slide-in-from-right"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-red-700 to-red-800 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                        <div className="flex gap-4 sm:gap-6">
                          {/* Logo */}
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                              {course.college_logo ? (
                                <img src={course.college_logo} alt={course.college_name} className="w-full h-full object-contain p-1.5 sm:p-2" />
                              ) : (
                                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-400" />
                              )}
                            </div>
                          </div>

                          <div className="flex-grow min-w-0">
                            <div className="flex flex-col gap-3 sm:gap-4 mb-2 sm:mb-3">
                              <div className="flex-grow">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors mb-1.5 sm:mb-2 leading-tight">
                                  {title}
                                </h3>
                                {/* Institution as clickable filter */}
                                <button
                                  onClick={() => setSelectedInstitution(
                                    selectedInstitution === course.college_name ? null : course.college_name
                                  )}
                                  className={`text-sm sm:text-base md:text-lg font-semibold transition-colors mb-2 hover:text-red-700 ${
                                    selectedInstitution === course.college_name ? 'text-red-700' : 'text-slate-700'
                                  }`}
                                >
                                  {course.college_name}
                                </button>
                              </div>

                              <div className="flex flex-wrap items-start gap-2">
                                {course.featured && (
                                  <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-md text-xs sm:text-sm">
                                    {t.coursesPage.featured}
                                  </Badge>
                                )}
                                {importanceBadge && (
                                  <Badge variant="outline" className={`${importanceBadge.color} border font-semibold text-xs sm:text-sm`}>
                                    {importanceBadge.label}
                                  </Badge>
                                )}
                                {course.completion_date && (
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="text-xs sm:text-sm font-medium">{formatDate(course.completion_date)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {description && (
                              <MarkdownContent content={description} variant="compact" className="mb-3 sm:mb-4" />
                            )}

                            {/* Skills pills */}
                            {course.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                                {course.skills.map(skill => (
                                  <button
                                    key={skill.id}
                                    onClick={() => setSelectedSkill(skill.id === selectedSkill ? null : skill.id)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                    style={{
                                      backgroundColor: selectedSkill === skill.id
                                        ? (skill.color || '#0f172a')
                                        : (skill.color ? skill.color + '18' : '#f1f5f9'),
                                      borderColor: selectedSkill === skill.id ? '#dc2626' : (skill.color ? skill.color + '50' : '#e2e8f0'),
                                      border: `1.5px solid ${selectedSkill === skill.id ? '#dc2626' : (skill.color ? skill.color + '50' : '#e2e8f0')}`,
                                      color: selectedSkill === skill.id ? 'white' : (skill.color || '#475569'),
                                      boxShadow: selectedSkill === skill.id ? '0 0 0 3px #dc262630' : 'none',
                                    }}
                                  >
                                    {skill.name}
                                  </button>
                                ))}
                              </div>
                            )}

                            {course.certificate_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-700 hover:text-red-800 hover:bg-red-50 font-semibold group/btn pl-0 h-8 sm:h-9 text-sm sm:text-base"
                                asChild
                              >
                                <a href={course.certificate_url} target="_blank" rel="noopener noreferrer">
                                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                  {t.coursesPage.viewCertificate}
                                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}