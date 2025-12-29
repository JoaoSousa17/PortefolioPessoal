"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, ExternalLink, Award, Users, Sparkles, Lock, Loader2, Calendar } from "lucide-react"
import { supabase, type SocialProject } from "@/lib/supabase"

export function SocialSection() {
  const [volunteerProjects, setVolunteerProjects] = useState<SocialProject[]>([])
  const [otherProject, setOtherProject] = useState<SocialProject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSocialProjects()
  }, [])

  const fetchSocialProjects = async () => {
    try {
      // Fetch volunteer projects ordered by date
      const { data: volunteers, error: volunteersError } = await supabase
        .from('social_projects')
        .select('*')
        .eq('is_public', true)
        .eq('is_voluntariado', true)
        .order('date', { ascending: false })

      if (volunteersError) throw volunteersError
      setVolunteerProjects(volunteers || [])

      // Fetch other social project (non-volunteer)
      const { data: other, error: otherError } = await supabase
        .from('social_projects')
        .select('*')
        .eq('is_public', true)
        .eq('is_voluntariado', false)
        .limit(1)
        .single()

      if (otherError && otherError.code !== 'PGRST116') throw otherError
      setOtherProject(other)
    } catch (error) {
      console.error('Error fetching social projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })
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
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Projetos Sociais & Voluntariado
            </h2>
            <p className="text-slate-700 text-lg mt-2">
              Contribuindo para causas que fazem a diferença
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT: Volunteer Projects */}
          <div className="animate-in fade-in slide-in-from-left" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                Voluntariado
              </h3>
            </div>

            {volunteerProjects.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-slate-300">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700">
                  Nenhum projeto de voluntariado no momento.
                </p>
              </div>
            ) : (
              <Card className="bg-white border-0 shadow-xl overflow-hidden">
                <div className="divide-y divide-slate-200">
                  {volunteerProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="group relative p-6 md:p-8 hover:bg-slate-50 transition-all duration-300"
                    >
                      {/* Hover indicator bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-700 to-red-800 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                      
                      <div className="flex gap-4">
                        {/* Institution Logo */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                            {project.instituition_logo ? (
                              <img 
                                src={project.instituition_logo} 
                                alt={project.institution_name || ''}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <Heart className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                            <div className="flex-grow">
                              <h4 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors mb-2 leading-tight">
                                {project.title}
                              </h4>
                              <p className="text-base md:text-lg font-semibold text-slate-700 mb-2">
                                {project.institution_name}
                              </p>
                            </div>

                            {/* Date */}
                            <div className="flex flex-col items-start md:items-end gap-2">
                              {project.date && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {formatDate(project.date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {project._description && (
                            <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
                              {project._description}
                            </p>
                          )}

                          {/* Links */}
                          <div className="flex flex-wrap gap-3">
                            {project.institution_link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold group/btn pl-0"
                                asChild
                              >
                                <a href={project.institution_link} target="_blank" rel="noopener noreferrer">
                                  Visitar instituição
                                  <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </a>
                              </Button>
                            )}
                            {project.certificate_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-700 hover:text-red-800 hover:bg-red-50 font-semibold group/btn pl-0"
                                asChild
                              >
                                <a href={project.certificate_url} target="_blank" rel="noopener noreferrer">
                                  <Award className="w-4 h-4 mr-2" />
                                  Ver Certificado
                                  <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Vertical Separator */}
          <Separator orientation="vertical" className="hidden lg:block absolute left-1/2 top-32 bottom-8 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

          {/* RIGHT: Other Social Project */}
          <div className="animate-in fade-in slide-in-from-right" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
                Outros Projetos
              </h3>
            </div>

            {!otherProject ? (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-slate-300">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700">
                  Nenhum projeto social disponível no momento.
                </p>
              </div>
            ) : (
              <Card className="group relative bg-white border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Decorative corner elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent opacity-30 rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-slate-100 to-transparent opacity-30 rounded-tr-full" />

                <div className="relative p-8 md:p-10">
                  {/* Lock Badge */}
                  <Badge className="mb-6 bg-red-100 text-red-800 border-red-300 border">
                    <Lock className="w-3 h-3 mr-1" />
                    Em Desenvolvimento
                  </Badge>

                  {/* Book Image */}
                  {otherProject.instituition_logo && (
                    <div className="flex justify-center mb-8">
                      <div className="relative w-48 h-64 rounded-lg overflow-hidden shadow-2xl group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-shadow duration-500">
                        <img 
                          src={otherProject.instituition_logo} 
                          alt={otherProject.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </div>
                  )}

                  <h4 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-red-700 mb-4 leading-tight transition-colors text-center">
                    {otherProject.title}
                  </h4>

                  {otherProject._description && (
                    <p className="text-slate-700 leading-relaxed mb-6 text-base text-center">
                      {otherProject._description}
                    </p>
                  )}

                  {otherProject.institution_name && (
                    <p className="text-red-700 font-semibold text-lg text-center">
                      {otherProject.institution_name}
                    </p>
                  )}

                  {/* Mystery element */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-slate-600">
                      <Sparkles className="w-5 h-5 text-red-700" />
                      <p className="text-sm italic font-medium">
                        Algo especial está a ser preparado... Fica atento!
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

        </div>

      </div>
    </section>
  )
}
