"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ExternalLink, Github, Rocket, Loader2 } from "lucide-react"
import { supabase, type Project } from "@/lib/supabase"
import Link from "next/link"

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProjects()
  }, [])

  const fetchFeaturedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
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
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Projetos Desenvolvidos
            </h2>
            <p className="text-white/90 text-lg mt-2">
              Projetos em destaque que marcam a minha jornada
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
            <Rocket className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/90 text-xl">
              Nenhum projeto em destaque no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {projects.map((project, index) => (
              <Card 
                key={project.id}
                className="group bg-white border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-3 overflow-hidden animate-in fade-in slide-in-from-bottom flex flex-col"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Thumbnail with gradient overlay */}
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-white">
                  {project.thumbnail_url ? (
                    <>
                      <img 
                        src={project.thumbnail_url} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50">
                      <Rocket className="w-20 h-20 text-red-300" />
                    </div>
                  )}
                  
                  {/* Featured badge positioned on thumbnail */}
                  {project.featured && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg text-sm px-3 py-1">
                      Destaque
                    </Badge>
                  )}
                </div>
                
                {/* Content area with flex-grow to push footer down */}
                <div className="flex-grow flex flex-col">
                  <CardHeader className="space-y-3 pb-4">
                    <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight">
                      {project.title}
                    </CardTitle>
                    {project.description && (
                      <CardDescription className="text-base text-slate-600 leading-relaxed line-clamp-3 text-justify">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </div>

                {/* Footer always at bottom */}
                <CardFooter className="flex gap-3 pt-4 mt-auto border-t border-slate-100">
                <Button
  asChild
  className="
    flex-1 font-semibold text-white
    bg-gradient-to-r from-red-700 to-red-800
    transition-all duration-300 ease-out
    hover:brightness-110 hover:saturate-110
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
  "
>
  <Link
    href={`/projects/${project.id}`}
    className="relative flex items-center justify-center gap-2"
  >
    <span>Ver Projeto</span>
    <ExternalLink className="w-4 h-4 opacity-80" />
  </Link>
</Button>

                  {project.github_url && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-2 border-slate-300 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 w-11 h-11"
                      asChild
                    >
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-5 h-5" />
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '400ms' }}>
          <Button 
            size="lg"
            className="bg-white hover:bg-gray-50 text-slate-900 text-xl font-bold px-12 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 group border-4 border-white hover:scale-105"
            asChild
          >
            <Link href="/projects">
              Ver Todos os Projetos
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  )
}