"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Github, Rocket, Loader2 } from "lucide-react"
import { supabase, type Project } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
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
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
                  Todos os Projetos
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Explore todos os projetos que desenvolvi
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <p className="text-3xl font-bold">{projects.length}</p>
                <p className="text-sm text-white/80">Projetos Ativos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <p className="text-3xl font-bold">{projects.filter(p => p.featured).length}</p>
                <p className="text-sm text-white/80">Em Destaque</p>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-slate-300">
                <Rocket className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 text-xl">
                  Nenhum projeto disponível no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <Card 
                    key={project.id}
                    className="group bg-white border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-3 overflow-hidden animate-in fade-in slide-in-from-bottom flex flex-col h-full"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Thumbnail */}
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
                      
                      {/* Featured badge */}
                      {project.featured && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg text-sm px-3 py-1">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow flex flex-col">
                      <CardHeader className="space-y-3 pb-4">
                        <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight">
                          {project.title}
                        </CardTitle>
                        {project.description && (
                          <CardDescription className="text-base text-slate-600 leading-relaxed line-clamp-3">
                            {project.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                    </div>

                    {/* Footer */}
                    <CardFooter className="flex flex-col gap-3 pt-4 mt-auto border-t border-slate-100">
                    <Button
                    asChild
                    className="
                      w-full font-semibold text-white
                      bg-gradient-to-r from-red-700 to-red-800
                      transition-all duration-300 ease-out
                      hover:brightness-110 hover:saturate-110
                      hover:ring-2 hover:ring-red-500/40
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                    "
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-center"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4 rotate-180 opacity-80" />
                      Ver Detalhes
                    </Link>
                  </Button>

                      
                      <div className="flex gap-2">
                        {project.main_url && (
                          <Button 
                            variant="outline"
                            className="flex-1 border-2 hover:border-slate-900 hover:bg-slate-50 transition-all font-medium"
                            asChild
                          >
                            <a href={project.main_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Demo
                            </a>
                          </Button>
                        )}
                        {project.github_url && (
                          <Button 
                            variant="outline"
                            size="icon"
                            className="border-2 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all"
                            asChild
                          >
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="w-5 h-5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
