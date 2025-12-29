"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Award, ExternalLink, Calendar, ArrowRight, Loader2, GraduationCap } from "lucide-react"
import { supabase, type Course } from "@/lib/supabase"
import Link from "next/link"

export function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedCourses()
  }, [])

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('featured', true)
        .order('completion_date', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })
  }

  const getImportanceBadge = (importance: string | null) => {
    switch (importance) {
      case 'high':
        return { label: 'Alta Relevância', color: 'bg-red-100 text-red-800 border-red-300' }
      case 'medium':
        return { label: 'Média Relevância', color: 'bg-amber-100 text-amber-800 border-amber-300' }
      case 'low':
        return { label: 'Baixa Relevância', color: 'bg-slate-100 text-slate-800 border-slate-300' }
      default:
        return null
    }
  }

  if (loading) {
    return (
      <section className="relative w-full bg-[#A99290] py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full bg-[#A99290] py-16 md:py-24 overflow-hidden">
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-700/10 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-800/10 rounded-full blur-3xl" />
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center shadow-xl">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Licenças & Certificações
            </h2>
            <p className="text-white/90 text-lg mt-2">
              Cursos e certificações que complementam a minha formação
            </p>
          </div>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
            <Award className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/90 text-xl">
              Nenhum curso em destaque no momento.
            </p>
          </div>
        ) : (
          <Card className="bg-white border-0 shadow-2xl overflow-hidden mb-12">
            <div className="divide-y divide-slate-200">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="group relative p-6 md:p-8 hover:bg-slate-50 transition-all duration-300 animate-in fade-in slide-in-from-right"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover indicator bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-700 to-red-800 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  
                  <div className="flex gap-6">
                    {/* College Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                        {course.college_logo ? (
                          <img 
                            src={course.college_logo} 
                            alt={course.college_name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                        <div className="flex-grow">
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors mb-2 leading-tight">
                            {course.title}
                          </h3>
                          <p className="text-base md:text-lg font-semibold text-slate-700 mb-2">
                            {course.college_name}
                          </p>
                        </div>

                        {/* Badges and Date */}
                        <div className="flex flex-col items-start md:items-end gap-2">
                          {course.importance && getImportanceBadge(course.importance) && (
                            <Badge 
                              variant="outline"
                              className={`${getImportanceBadge(course.importance)!.color} border font-semibold`}
                            >
                              {getImportanceBadge(course.importance)!.label}
                            </Badge>
                          )}
                          {course.completion_date && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {formatDate(course.completion_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {course.description && (
                        <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
                          {course.description}
                        </p>
                      )}

                      {/* Certificate Link */}
                      {course.certificate_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-700 hover:text-red-800 hover:bg-red-50 font-semibold group/btn pl-0"
                          asChild
                        >
                          <a href={course.certificate_url} target="_blank" rel="noopener noreferrer">
                            <Award className="w-4 h-4 mr-2" />
                            Ver Certificado
                            <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* View All Button */}
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '400ms' }}>
          <Button 
            size="lg"
            className="bg-white hover:bg-gray-50 text-slate-900 text-xl font-bold px-12 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 group border-4 border-white hover:scale-105"
            asChild
          >
            <Link href="/courses">
              Consultar Todos os Cursos
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  )
}
