"use client"

import React, { useState, useEffect, Suspense, lazy } from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, BookOpen, Rocket, ChevronDown, ChevronUp, Keyboard } from "lucide-react"
import { supabase, type Skill, type SkillCategory } from "@/lib/supabase"
import { useTranslation } from "@/lib/hooks/useTranslation"

const Spline = lazy(() => import("@splinetool/react-spline"))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

type SkillWithCategory = Skill & { category: SkillCategory }
type SkillContext = {
  projects: { id: string; title: string }[]
  courses:  { id: string; title: string }[]
}

export function getTextColor(bgColor: string | null): string {
  if (!bgColor) return '#ffffff'
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#1e293b' : '#ffffff'
}

// ─── Shared data hook ─────────────────────────────────────────────────────────

export function useSkillsData() {
  const [categories,       setCategories]       = useState<SkillCategory[]>([])
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, SkillWithCategory[]>>({})
  const [skillContext,     setSkillContext]      = useState<Record<string, SkillContext>>({})
  const [loading,          setLoading]           = useState(true)

  useEffect(() => { fetchSkills() }, [])

  const fetchSkills = async () => {
    try {
      const [
        { data: categoriesData },
        { data: skillsData },
        { data: projectSkillsData },
        { data: courseSkillsData },
      ] = await Promise.all([
        supabase.from('skill_categories').select('*').order('order', { ascending: true }),
        supabase.from('skills').select('*').order('name', { ascending: true }),
        supabase.from('project_skills').select('skill_id, projects(id, translations, title)'),
        supabase.from('course_skills').select('skill_id, courses(id, translations, title)'),
      ])

      const grouped: Record<string, SkillWithCategory[]> = {}
      categoriesData?.forEach(category => {
        const cs = skillsData?.filter(s => s.category_id === category.id).map(s => ({ ...s, category })) || []
        if (cs.length > 0) grouped[category.id] = cs
      })

      const ctx: Record<string, SkillContext> = {}
      const ensure = (id: string) => { if (!ctx[id]) ctx[id] = { projects: [], courses: [] } }

      projectSkillsData?.forEach((row: any) => {
        const proj = row.projects; if (!proj) return
        ensure(row.skill_id)
        const title = proj.translations?.en?.title || proj.translations?.pt?.title || proj.title || ''
        if (title && !ctx[row.skill_id].projects.find((p: any) => p.id === proj.id))
          ctx[row.skill_id].projects.push({ id: proj.id, title })
      })

      courseSkillsData?.forEach((row: any) => {
        const course = row.courses; if (!course) return
        ensure(row.skill_id)
        const title = course.translations?.en?.title || course.translations?.pt?.title || course.title || ''
        if (title && !ctx[row.skill_id].courses.find((c: any) => c.id === course.id))
          ctx[row.skill_id].courses.push({ id: course.id, title })
      })

      setCategories(categoriesData || [])
      setSkillsByCategory(grouped)
      setSkillContext(ctx)
    } catch (err) {
      console.error('Error fetching skills:', err)
    } finally {
      setLoading(false)
    }
  }

  return { categories, skillsByCategory, skillContext, loading }
}

// ─── SkillBadge ───────────────────────────────────────────────────────────────

export function SkillBadge({
  skill, skillName, ctx, animationDelay,
}: {
  skill: SkillWithCategory
  skillName: string
  ctx: SkillContext | null
  animationDelay: string
}) {
  const [show,    setShow]    = useState(false)
  const [pos,     setPos]     = useState({ x: 0, y: 0, above: true })
  const badgeRef              = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const bg        = skill.color || '#64748b'
  const textColor = getTextColor(skill.color)
  const isLight   = textColor === '#1e293b'
  const TOOLTIP_W = 220

  const handleMouseEnter = () => {
    if (!ctx || !badgeRef.current) return
    const rect        = badgeRef.current.getBoundingClientRect()
    const itemCount   = (ctx.projects?.length || 0) + (ctx.courses?.length || 0)
    const estHeight   = 64 + itemCount * 22
    const above       = rect.top > estHeight + 16
    // Clamp X so tooltip never leaves the viewport
    const rawX        = rect.left + rect.width / 2
    const half        = TOOLTIP_W / 2
    const clampedX    = Math.min(Math.max(rawX, half + 8), window.innerWidth - half - 8)
    setPos({
      x: clampedX,
      y: above ? rect.top + window.scrollY - 10 : rect.bottom + window.scrollY + 10,
      above,
    })
    setShow(true)
  }

  // Portal tooltip rendered at document.body level — escapes all overflow:hidden ancestors
  const tooltip = (ctx && show && mounted) ? (
    typeof document !== 'undefined'
      ? require('react-dom').createPortal(
          <div
            className="pointer-events-none"
            style={{
              position:  'absolute',
              left:      pos.x,
              top:       pos.y,
              transform: pos.above ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
              zIndex:    99999,
              minWidth:  '170px',
              maxWidth:  `${TOOLTIP_W}px`,
            }}
          >
            <div
              className="relative rounded-xl shadow-2xl overflow-hidden border"
              style={{
                backgroundColor: bg,
                borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)',
                animation: 'tooltipIn 0.15s ease-out both',
              }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{
                background: isLight
                  ? 'linear-gradient(135deg,rgba(255,255,255,0.28) 0%,transparent 55%)'
                  : 'linear-gradient(135deg,rgba(255,255,255,0.10) 0%,transparent 55%)',
              }} />
              <div className="relative px-3.5 py-3 space-y-2.5">
                {ctx.projects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: textColor, opacity: 0.65 }}>
                      <Rocket className="w-3 h-3 flex-shrink-0" />
                      <span className="text-xs font-black uppercase tracking-widest">Projetos</span>
                    </div>
                    <ul className="space-y-0.5">
                      {ctx.projects.map(p => (
                        <li key={p.id} className="text-xs font-semibold leading-snug pl-1" style={{ color: textColor, opacity: 0.9 }}>· {p.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ctx.projects.length > 0 && ctx.courses.length > 0 && (
                  <div className="h-px w-full" style={{ backgroundColor: textColor, opacity: 0.15 }} />
                )}
                {ctx.courses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: textColor, opacity: 0.65 }}>
                      <BookOpen className="w-3 h-3 flex-shrink-0" />
                      <span className="text-xs font-black uppercase tracking-widest">Cursos</span>
                    </div>
                    <ul className="space-y-0.5">
                      {ctx.courses.map(c => (
                        <li key={c.id} className="text-xs font-semibold leading-snug pl-1" style={{ color: textColor, opacity: 0.9 }}>· {c.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
              style={{
                backgroundColor: bg,
                boxShadow: isLight ? '1px 1px 2px rgba(0,0,0,0.08)' : '1px 1px 2px rgba(0,0,0,0.2)',
                ...(pos.above ? { bottom: '-6px' } : { top: '-6px' }),
              }}
            />
          </div>,
          document.body
        )
      : null
  ) : null

  return (
    <>
      <div
        className="relative"
        ref={badgeRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
      >
        <Badge
          className="group relative px-4 py-3 text-base font-semibold border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-default animate-in fade-in zoom-in"
          style={{ backgroundColor: bg, borderColor: bg, color: textColor, animationDelay }}
        >
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shine" />
          <div className="relative flex items-center gap-2.5">
            {skill.icon && (
              <img
                src={skill.icon}
                alt={skillName}
                className="w-5 h-5 object-contain group-hover:scale-110 transition-transform duration-300"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            )}
            <span className="font-bold tracking-wide">{skillName}</span>
          </div>
        </Badge>
      </div>

      {tooltip}

      <style jsx global>{`
        @keyframes tooltipIn { from { opacity:0; transform:translateY(4px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes shine     { 0% { transform:translateX(-100%) } 100% { transform:translateX(100%) } }
        .animate-shine       { animation: shine 0.8s ease-in-out }
      `}</style>
    </>
  )
}

// ─── SkillsGrid ───────────────────────────────────────────────────────────────

export function SkillsGrid({
  categories, skillsByCategory, skillContext, language,
}: {
  categories: SkillCategory[]
  skillsByCategory: Record<string, SkillWithCategory[]>
  skillContext: Record<string, SkillContext>
  language: string
}) {
  return (
    <div className="space-y-12">
      {categories
        .filter(cat => skillsByCategory[cat.id]?.length > 0)
        .map((category, categoryIndex) => {
          const skills       = skillsByCategory[category.id]
          const categoryName = getTranslated(category, 'name', language)
          return (
            <div
              key={category.id}
              className="animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: `${categoryIndex * 100}ms` }}
            >
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                  <div className="h-1 w-12 bg-gradient-to-r from-red-700 to-red-800 rounded-full" />
                  {categoryName}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => {
                  const skillName = getTranslated(skill, 'name', language)
                  const ctx       = skillContext[skill.id]
                  const hasCtx    = ctx && (ctx.projects.length > 0 || ctx.courses.length > 0)
                  return (
                    <SkillBadge
                      key={skill.id}
                      skill={skill}
                      skillName={skillName}
                      ctx={hasCtx ? ctx : null}
                      animationDelay={`${(categoryIndex * 100) + (index * 50)}ms`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
    </div>
  )
}

// ─── Desktop section ──────────────────────────────────────────────────────────

export function SkillsSectionDesktop() {
  const { t, language } = useTranslation()
  const { categories, skillsByCategory, skillContext, loading } = useSkillsData()
  const [showGrid,     setShowGrid]     = useState(false)
  const [splineLoaded, setSplineLoaded] = useState(false)

  const sceneUrl = language === 'pt' ? '/assets/skills_keyboard.spline' : '/assets/skills_keyboard_en.spline'
  const splineWrapRef = React.useRef<HTMLDivElement>(null)

  if (loading) {
    return (
      <section className="relative w-full bg-[#E8E2E1] py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full bg-[#E8E2E1] overflow-hidden" style={{ paddingBottom: '5rem' }}>

      <div style={{ paddingTop: '5rem' }} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] top-0 -right-32 bg-red-700/5 rounded-full blur-3xl" />
        <div className="absolute w-[700px] h-[700px] bottom-1/4 -left-48 bg-slate-800/5 rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">

        <div className="flex items-start gap-8">

          {/* Left column */}
          <div className="flex flex-col gap-6 w-[300px] flex-shrink-0 pt-4">

            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl flex-shrink-0">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-slate-900 leading-tight">{t.skills.title}</h2>
                <p className="text-slate-600 text-sm mt-1">{t.skills.subtitle}</p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-slate-300 to-transparent" />

            <div className="rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm p-5 shadow-sm animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
                  <Keyboard className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-sm">
                  {language === 'pt' ? 'Interativo' : 'Interactive'}
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                {language === 'pt'
                  ? 'Cada tecla representa uma skill. Usa o teclado para explorar em 3D.'
                  : 'Each key represents a skill. Use the keyboard to explore in 3D.'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm p-5 shadow-sm animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '200ms' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                {language === 'pt' ? 'Em números' : 'By the numbers'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    {Object.values(skillsByCategory).reduce((acc, arr) => acc + arr.length, 0)}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">skills</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    {Object.keys(skillsByCategory).length}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {language === 'pt' ? 'categorias' : 'categories'}
                  </p>
                </div>
              </div>
            </div>

            {!splineLoaded && (
              <div className="flex items-center gap-2 text-slate-400 px-1 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                <span className="text-xs font-medium">
                  {language === 'pt' ? 'A carregar cena 3D...' : 'Loading 3D scene...'}
                </span>
              </div>
            )}

            <button
              onClick={() => setShowGrid(prev => !prev)}
              className="group flex items-center gap-2 px-5 py-3 rounded-full border-2 border-slate-300 bg-white/70 hover:bg-white hover:border-red-300 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 text-slate-700 font-semibold text-sm w-fit animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: '300ms' }}
            >
              <Sparkles className="w-4 h-4 text-red-700 group-hover:scale-110 transition-transform" />
              {showGrid
                ? (language === 'pt' ? 'Ocultar skills' : 'Hide skills')
                : (language === 'pt' ? 'Ver todas as skills' : 'View all skills')}
              {showGrid
                ? <ChevronUp className="w-4 h-4 text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
                : <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />}
            </button>
          </div>

          {/* Right: Spline */}
          <div
            ref={splineWrapRef}
            className="flex-1 spline-wrap"
            style={{ height: '680px', marginTop: '-5rem' }}
          >
            <Suspense fallback={null}>
              <Spline
                scene={sceneUrl}
                onLoad={() => {
                  setSplineLoaded(true)
                  if (splineWrapRef.current) {
                    splineWrapRef.current.querySelectorAll('canvas').forEach(c => {
                      c.style.background = 'transparent'
                    })
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  transform: 'scale(1.15)',
                  transformOrigin: 'center center',
                  opacity: splineLoaded ? 1 : 0,
                  transition: 'opacity 0.6s ease',
                }}
              />
            </Suspense>
          </div>
        </div>

        {/* Collapsible skills grid */}
        <div
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: showGrid ? '9999px' : '0px', opacity: showGrid ? 1 : 0 }}
        >
          <div className="pt-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {language === 'pt' ? 'Lista completa' : 'Full list'}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>
            {Object.keys(skillsByCategory).length === 0 ? (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-slate-300">
                <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 text-xl">{t.skills.empty}</p>
              </div>
            ) : (
              <SkillsGrid
                categories={categories}
                skillsByCategory={skillsByCategory}
                skillContext={skillContext}
                language={language}
              />
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes shine { 0% { transform:translateX(-100%) } 100% { transform:translateX(100%) } }
        .animate-shine   { animation: shine 0.8s ease-in-out }
        .spline-wrap canvas { background: transparent !important; }
        .spline-wrap > div  { background: transparent !important; }
      `}</style>
    </section>
  )
}
