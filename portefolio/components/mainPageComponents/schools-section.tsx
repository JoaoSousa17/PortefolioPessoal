"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, ExternalLink, Loader2, BookOpen, Lightbulb } from "lucide-react"
import { supabase, type School } from "@/lib/supabase"

export function SchoolsSection() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      setSchools(data || [])
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSchool = (schoolId: string) => {
    setExpandedSchools(prev => {
      const newSet = new Set(prev)
      if (newSet.has(schoolId)) {
        newSet.delete(schoolId)
      } else {
        newSet.add(schoolId)
      }
      return newSet
    })
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
        <div className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-slate-800/5 rounded-full blur-3xl" />
        <div className="absolute w-[500px] h-[500px] -bottom-32 -right-32 bg-red-700/5 rounded-full blur-3xl" />
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Formação Académica
            </h2>
            <p className="text-slate-700 text-lg mt-2">
              Instituições que moldaram o meu percurso educativo
            </p>
          </div>
        </div>

        {/* Timeline */}
        {schools.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-slate-300">
            <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 text-xl">
              Nenhuma instituição registada no momento.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-700 via-slate-700 to-red-700 transform md:-translate-x-1/2" />
            
            <div className="space-y-12">
              {schools.map((school, index) => {
                const isExpanded = expandedSchools.has(school.id)
                const isEven = index % 2 === 0

                return (
                  <div
                    key={school.id}
                    className={`relative flex items-center ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    } animate-in fade-in slide-in-from-bottom`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 w-6 h-6 transform -translate-x-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-700 to-red-800 border-4 border-[#E8E2E1] shadow-lg group-hover:scale-125 transition-transform" />
                    </div>

                    {/* Content card */}
                    <div className={`flex-1 ml-20 md:ml-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                      <div
                        className={`group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-slate-200 hover:border-red-700 cursor-pointer ${
                          isExpanded ? 'scale-[1.02]' : ''
                        }`}
                        onClick={() => toggleSchool(school.id)}
                      >
                        {/* Card header with logo and name */}
                        <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-slate-50 to-white border-b-2 border-slate-100">
                          {/* Logo */}
                          <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white shadow-lg border-2 border-slate-200 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                            {school.logo_url ? (
                              <img 
                                src={school.logo_url} 
                                alt={school.name}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <GraduationCap className="w-10 h-10 text-slate-400" />
                            )}
                          </div>

                          {/* Name and website */}
                          <div className="flex-grow">
                            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors mb-1">
                              {school.name}
                            </h3>
                            {school.website && (
                              <a 
                                href={school.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 font-semibold text-sm group/link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Visitar website
                                <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                              </a>
                            )}
                          </div>

                          {/* Expand indicator */}
                          <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Card content */}
                        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[800px]' : 'max-h-0'}`}>
                          <div className="p-6 space-y-6">
                            {/* Description */}
                            {school.description && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                  </div>
                                  <h4 className="text-lg font-bold text-slate-900">Sobre</h4>
                                </div>
                                <p className="text-slate-700 leading-relaxed pl-10">
                                  {school.description}
                                </p>
                              </div>
                            )}

                            {/* Learnings */}
                            {school.learnings && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                                    <Lightbulb className="w-4 h-4 text-white" />
                                  </div>
                                  <h4 className="text-lg font-bold text-slate-900">Aprendizagens</h4>
                                </div>
                                <p className="text-slate-700 leading-relaxed pl-10">
                                  {school.learnings}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Collapsed preview */}
                        {!isExpanded && school.description && (
                          <div className="px-6 pb-6">
                            <p className="text-slate-600 line-clamp-2 text-sm">
                              {school.description}
                            </p>
                            <p className="text-red-700 font-semibold text-sm mt-3 flex items-center gap-2">
                              Clique para ver mais
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Spacer for alternating layout on desktop */}
                    <div className="hidden md:block flex-1" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
