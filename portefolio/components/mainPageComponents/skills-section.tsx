"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, BookOpen, Rocket } from "lucide-react"
import { supabase, type Skill, type SkillCategory } from "@/lib/supabase"
import { useTranslation } from "@/lib/hooks/useTranslation"

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

type SkillWithCategory = Skill & {
  category: SkillCategory
}

type SkillContext = {
  projects: { id: string; title: string }[]
  courses:  { id: string; title: string }[]
}

export function SkillsSection() {
  const { t, language } = useTranslation()

  const [categories,       setCategories]       = useState<SkillCategory[]>([])
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, SkillWithCategory[]>>({})
  const [skillContext,     setSkillContext]      = useState<Record<string, SkillContext>>({})
  const [loading,          setLoading]           = useState(true)

  useEffect(() => {
    fetchSkills()
  }, [])

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

      // Group skills by category
      const grouped: Record<string, SkillWithCategory[]> = {}
      categoriesData?.forEach(category => {
        const categorySkills = skillsData
          ?.filter(s => s.category_id === category.id)
          .map(s => ({ ...s, category })) || []
        if (categorySkills.length > 0) grouped[category.id] = categorySkills
      })

      // Build skill context map: skillId → { projects[], courses[] }
      const ctx: Record<string, SkillContext> = {}
      const ensureCtx = (id: string) => { if (!ctx[id]) ctx[id] = { projects: [], courses: [] } }

      projectSkillsData?.forEach((row: any) => {
        const proj = row.projects
        if (!proj) return
        ensureCtx(row.skill_id)
        const title = proj.translations?.en?.title || proj.translations?.pt?.title || proj.title || ''
        if (title && !ctx[row.skill_id].projects.find((p: any) => p.id === proj.id)) {
          ctx[row.skill_id].projects.push({ id: proj.id, title })
        }
      })

      courseSkillsData?.forEach((row: any) => {
        const course = row.courses
        if (!course) return
        ensureCtx(row.skill_id)
        const title = course.translations?.en?.title || course.translations?.pt?.title || course.title || ''
        if (title && !ctx[row.skill_id].courses.find((c: any) => c.id === course.id)) {
          ctx[row.skill_id].courses.push({ id: course.id, title })
        }
      })

      setCategories(categoriesData || [])
      setSkillsByCategory(grouped)
      setSkillContext(ctx)
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTextColor = (bgColor: string | null) => {
    if (!bgColor) return '#ffffff'
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#1e293b' : '#ffffff'
  }

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
    <section className="relative w-full bg-[#E8E2E1] py-16 md:py-24 overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] top-1/4 -right-32 bg-red-700/5 rounded-full blur-3xl" />
        <div className="absolute w-[600px] h-[600px] bottom-1/4 -left-48 bg-slate-800/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">

        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t.skills.title}
            </h2>
            <p className="text-slate-700 text-lg mt-2 text-justify">
              {t.skills.subtitle}
            </p>
          </div>
        </div>

        {Object.keys(skillsByCategory).length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-slate-300">
            <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 text-xl">{t.skills.empty}</p>
          </div>
        ) : (
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
                            getTextColor={getTextColor}
                            animationDelay={`${(categoryIndex * 100) + (index * 50)}ms`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine { animation: shine 0.8s ease-in-out; }
      `}</style>
    </section>
  )
}

// ─── SkillBadge with context tooltip ─────────────────────────────────────────

function SkillBadge({
  skill,
  skillName,
  ctx,
  getTextColor,
  animationDelay,
}: {
  skill: SkillWithCategory
  skillName: string
  ctx: SkillContext | null
  getTextColor: (c: string | null) => string
  animationDelay: string
}) {
  const [show, setShow] = useState(false)

  const bg        = skill.color || '#64748b'
  const textColor = getTextColor(skill.color)
  const isLight   = textColor === '#1e293b'

  return (
    <div
      className="relative"
      onMouseEnter={() => ctx && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Badge
        className="group relative px-4 py-3 text-base font-semibold border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-default animate-in fade-in zoom-in"
        style={{
          backgroundColor: bg,
          borderColor: bg,
          color: textColor,
          animationDelay,
        }}
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

      {/* Context tooltip */}
      {ctx && show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
          style={{ minWidth: '170px', maxWidth: '240px' }}
        >
          {/* Tooltip card */}
          <div
            className="relative rounded-xl shadow-2xl overflow-hidden border"
            style={{
              backgroundColor: bg,
              borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)',
              animation: 'tooltipIn 0.15s ease-out both',
            }}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isLight
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 55%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 55%)',
              }}
            />

            <div className="relative px-3.5 py-3 space-y-2.5">
              {ctx.projects.length > 0 && (
                <div>
                  <div
                    className="flex items-center gap-1.5 mb-1.5"
                    style={{ color: textColor, opacity: 0.65 }}
                  >
                    <Rocket className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">Projetos</span>
                  </div>
                  <ul className="space-y-0.5">
                    {ctx.projects.map(p => (
                      <li
                        key={p.id}
                        className="text-xs font-semibold leading-snug pl-1"
                        style={{ color: textColor, opacity: 0.9 }}
                      >
                        · {p.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ctx.projects.length > 0 && ctx.courses.length > 0 && (
                <div className="h-px w-full" style={{ backgroundColor: textColor, opacity: 0.15 }} />
              )}

              {ctx.courses.length > 0 && (
                <div>
                  <div
                    className="flex items-center gap-1.5 mb-1.5"
                    style={{ color: textColor, opacity: 0.65 }}
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">Cursos</span>
                  </div>
                  <ul className="space-y-0.5">
                    {ctx.courses.map(c => (
                      <li
                        key={c.id}
                        className="text-xs font-semibold leading-snug pl-1"
                        style={{ color: textColor, opacity: 0.9 }}
                      >
                        · {c.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Arrow pointing down */}
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
            style={{
              backgroundColor: bg,
              boxShadow: isLight ? '1px 1px 2px rgba(0,0,0,0.08)' : '1px 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(4px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}