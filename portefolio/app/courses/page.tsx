"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, ExternalLink, Calendar, Loader2, GraduationCap } from "lucide-react"
import { supabase, type Course } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
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

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-8 group"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar à página inicial
              </Link>
            </Button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
                  Licenças & Certificações
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Todos os cursos e certificações que complementam a minha formação
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <p className="text-3xl font-bold">{courses.length}</p>
                <p className="text-sm text-white/80">Total de Cursos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <p className="text-3xl font-bold">{courses.filter(c => c.featured).length}</p>
                <p className="text-sm text-white/80">Em Destaque</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <p className="text-3xl font-bold">{courses.filter(c => c.importance === 'high').length}</p>
                <p className="text-sm text-white/80">Alta Relevância</p>
              </div>
            </div>
          </div>
        </section>

        {/* Courses List */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-slate-300">
                <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 text-xl">
                  Nenhum curso disponível no momento.
                </p>
              </div>
            ) : (
              <Card className="bg-white border-0 shadow-2xl overflow-hidden max-w-5xl mx-auto">
                <div className="divide-y divide-slate-200">
                  {courses.map((course, index) => (
                    <div
                      key={course.id}
                      className="group relative p-6 md:p-8 hover:bg-slate-50 transition-all duration-300 animate-in fade-in slide-in-from-right"
                      style={{ animationDelay: `${index * 50}ms` }}
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
                              {course.featured && (
                                <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-md">
                                  Destaque
                                </Badge>
                              )}
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
