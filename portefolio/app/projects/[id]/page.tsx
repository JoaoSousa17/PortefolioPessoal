"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink, Github, Calendar, Loader2, Tag } from "lucide-react"
import { supabase, type Project, type ProjectTag } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type ProjectWithTags = Project & {
  tags: string[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<ProjectWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string)
    }
  }, [params.id])

  const fetchProject = async (id: string) => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) throw projectError

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('project_tags')
        .select('tag')
        .eq('project_id', id)

      if (tagsError) throw tagsError

      setProject({
        ...projectData,
        tags: tagsData?.map(t => t.tag) || []
      })
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
        <TopBar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
        <TopBar />
        <div className="flex-grow flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8 text-center">
            <p className="text-xl text-slate-700 mb-4">Projeto não encontrado</p>
            <Button asChild>
              <Link href="/projects">Voltar aos projetos</Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-6">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-8 group"
              asChild
            >
              <Link href="/projects">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar aos projetos
              </Link>
            </Button>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-grow">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {project.title}
                </h1>
                
                {project.description && (
                  <p className="text-xl text-white/90 mb-6 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {project.created_at && (
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(project.created_at)}</span>
                    </div>
                  )}
                  {project.featured && (
                    <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 px-4 py-2 text-sm">
                      Projeto em Destaque
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {project.main_url && (
                    <Button
                      size="lg"
                      className="bg-white text-slate-900 hover:bg-gray-100 shadow-lg font-semibold"
                      asChild
                    >
                      <a href={project.main_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Ver Projeto Live
                      </a>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
                      asChild
                    >
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-5 h-5 mr-2" />
                        Ver no GitHub
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              {project.thumbnail_url && (
                <div className="w-full md:w-96 flex-shrink-0">
                  <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
                    <img 
                      src={project.thumbnail_url} 
                      alt={project.title}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              
              {/* Tags */}
              {project.tags.length > 0 && (
                <Card className="bg-white border-0 shadow-xl p-8 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Tag className="w-5 h-5 text-red-700" />
                    <h2 className="text-2xl font-bold text-slate-900">Tecnologias</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map((tag, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="bg-slate-100 text-slate-700 border-slate-300 font-medium px-4 py-2 text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Long Description */}
              {project.long_description && (
                <Card className="bg-white border-0 shadow-xl p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">
                    Sobre o Projeto
                  </h2>
                  <Separator className="mb-6" />
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">
                      {project.long_description}
                    </p>
                  </div>
                </Card>
              )}

              {/* Call to Action */}
              <div className="mt-12 text-center">
                <p className="text-slate-600 mb-6 text-lg">
                  Gostou deste projeto? Veja mais!
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all font-semibold"
                  asChild
                >
                  <Link href="/projects">
                    <ArrowLeft className="w-5 h-5 mr-2 rotate-180" />
                    Ver Todos os Projetos
                  </Link>
                </Button>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
