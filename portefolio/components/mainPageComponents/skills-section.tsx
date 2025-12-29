"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2 } from "lucide-react"
import { supabase, type Skill, type SkillCategory } from "@/lib/supabase"

type SkillWithCategory = Skill & {
  category: SkillCategory
}

export function SkillsSection() {
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, SkillWithCategory[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('skill_categories')
        .select('*')
        .order('order', { ascending: true })

      if (categoriesError) throw categoriesError

      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .order('name', { ascending: true })

      if (skillsError) throw skillsError

      // Group skills by category
      const grouped: Record<string, SkillWithCategory[]> = {}
      
      categoriesData?.forEach(category => {
        const categorySkills = skillsData
          ?.filter(skill => skill.category_id === category.id)
          .map(skill => ({
            ...skill,
            category
          })) || []
        
        if (categorySkills.length > 0) {
          grouped[category.name] = categorySkills
        }
      })

      setSkillsByCategory(grouped)
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to determine if color is light or dark for text contrast
  const getTextColor = (bgColor: string | null) => {
    if (!bgColor) return '#ffffff'
    
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    
    return brightness > 155 ? '#1e293b' : '#ffffff'
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
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] top-1/4 -right-32 bg-red-700/5 rounded-full blur-3xl" />
        <div className="absolute w-[600px] h-[600px] bottom-1/4 -left-48 bg-slate-800/5 rounded-full blur-3xl" />
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Skills & Competências
            </h2>
            <p className="text-slate-700 text-lg mt-2">
              Tecnologias e habilidades que domino
            </p>
          </div>
        </div>

        {/* Skills by category */}
        {Object.keys(skillsByCategory).length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-slate-300">
            <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 text-xl">
              Nenhuma skill registada no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(skillsByCategory).map(([categoryName, skills], categoryIndex) => (
              <div 
                key={categoryName}
                className="animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${categoryIndex * 100}ms` }}
              >
                {/* Category header */}
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-red-700 to-red-800 rounded-full" />
                    {categoryName}
                  </h3>
                </div>

                {/* Skills grid */}
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <Badge
                      key={skill.id}
                      className="group relative px-4 py-3 text-base font-semibold border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-default animate-in fade-in zoom-in"
                      style={{
                        backgroundColor: skill.color || '#64748b',
                        borderColor: skill.color || '#64748b',
                        color: getTextColor(skill.color),
                        animationDelay: `${(categoryIndex * 100) + (index * 50)}ms`
                      }}
                    >
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shine" />
                      
                      <div className="relative flex items-center gap-2.5">
                        {skill.icon && (
                          <img 
                            src={skill.icon} 
                            alt={skill.name}
                            className="w-5 h-5 object-contain group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              // Hide icon if it fails to load
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <span className="font-bold tracking-wide">
                          {skill.name}
                        </span>
                      </div>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 0.8s ease-in-out;
        }
      `}</style>
    </section>
  )
}
