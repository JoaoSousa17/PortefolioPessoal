"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink, Github, Calendar, Loader2, Tag, BookOpen, ArrowRight } from "lucide-react"
import { supabase, type Project } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import { MarkdownContent } from "@/components/ui/markdown-content"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

type RelatedPost = {
  slug: string
  title: string
  excerpt: string | null
  published_at: string | null
  translations: any
}

type ProjectWithTags = Project & {
  tags: string[]
  relatedPosts: RelatedPost[]
}

export default function ProjectDetailPage() {
  const { t, language } = useTranslation()
  const params = useParams()

  const [project, setProject] = useState<ProjectWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchProject(params.id as string)
  }, [params.id])

  const fetchProject = async (id: string) => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

      if (projectError) throw projectError

      const { data: tagsData } = await supabase
        .from("project_tags")
        .select("tag")
        .eq("project_id", id)

      // Fetch related blog posts via junction table
      const { data: junctionData } = await supabase
        .from("project_blog_posts")
        .select("blog_post_slug")
        .eq("project_id", id)

      let relatedPosts: RelatedPost[] = []
      if (junctionData && junctionData.length > 0) {
        const slugs = junctionData.map((r: any) => r.blog_post_slug)
        const { data: postsData } = await supabase
          .from("blog_posts")
          .select("slug, title, excerpt, published_at, translations")
          .in("slug", slugs)
          .eq("published", true)
        relatedPosts = postsData || []
      }

      setProject({
        ...projectData,
        tags: tagsData?.map((t: any) => t.tag) || [],
        relatedPosts,
      })
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "numeric", month: "long", year: "numeric"
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
            <p className="text-xl text-slate-700 mb-4">{t.projectDetail.notFound}</p>
            <Button asChild>
              <Link href="/projects">{t.projectDetail.backToProjects}</Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const title           = getTranslated(project, 'title', language)
  const description     = getTranslated(project, 'description', language)
  const longDescription = getTranslated(project, 'long_description', language)

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 sm:mb-8 group text-sm sm:text-base" asChild>
              <Link href="/projects">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t.projectDetail.back}
              </Link>
            </Button>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
              <div className="flex-grow">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4 drop-shadow-lg">{title}</h1>
                {description && (
                  <p className="text-base sm:text-xl text-white/90 mb-4 sm:mb-6 leading-relaxed">{description}</p>
                )}
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
                  {project.created_at && (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">{formatDate(project.created_at)}</span>
                    </div>
                  )}
                  {project.featured && (
                    <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                      {t.projectDetail.featured}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  {project.main_url && (
                    <Button size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-gray-100 shadow-lg font-semibold text-sm sm:text-base h-10 sm:h-11" asChild>
                      <a href={project.main_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{t.projectDetail.live}
                      </a>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-semibold text-sm sm:text-base h-10 sm:h-11" asChild>
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{t.projectDetail.github}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              {project.thumbnail_url && (
                <div className="w-full md:w-96 flex-shrink-0">
                  <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white/20">
                    <img src={project.thumbnail_url} alt={title} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

              {project.tags.length > 0 && (
                <Card className="bg-white border-0 shadow-lg sm:shadow-xl p-5 sm:p-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-red-700" />
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t.projectDetail.technologies}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-medium px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {longDescription && (
                <Card className="bg-white border-0 shadow-lg sm:shadow-xl p-5 sm:p-8 md:p-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 pb-0 sm:mb-6">{t.projectDetail.about}</h2>
                  <MarkdownContent content={longDescription} variant="blog" />
                </Card>
              )}

              {/* Related blog posts */}
              {project.relatedPosts.length > 0 && (
                <Card className="bg-white border-0 shadow-lg sm:shadow-xl p-5 sm:p-8">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-red-700" />
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {t.projectDetail.relatedPosts.section}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 mb-5 sm:mb-6 ml-7">
                    {t.projectDetail.relatedPosts.subtitle}
                  </p>
                  <div className="space-y-3">
                    {project.relatedPosts.map(post => {
                      const postTitle   = getTranslated(post, 'title', language)
                      const postExcerpt = getTranslated(post, 'excerpt', language)
                      return (
                        <Link
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/40 transition-all duration-200"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center flex-shrink-0 group-hover:from-red-200 transition-colors">
                            <BookOpen className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors leading-snug mb-1">
                              {postTitle}
                            </p>
                            {postExcerpt && (
                              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{postExcerpt}</p>
                            )}
                            {post.published_at && (
                              <p className="text-xs text-slate-400 mt-1.5">
                                {new Date(post.published_at).toLocaleDateString(
                                  language === 'pt' ? 'pt-PT' : 'en-GB',
                                  { day: 'numeric', month: 'long', year: 'numeric' }
                                )}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </Link>
                      )
                    })}
                  </div>
                </Card>
              )}

              <div className="pt-4 sm:pt-6 text-center">
                <p className="text-slate-600 mb-4 sm:mb-6 text-base sm:text-lg">{t.projectDetail.cta}</p>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all font-semibold text-sm sm:text-base h-10 sm:h-11" asChild>
                  <Link href="/projects">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 rotate-180" />
                    {t.projectDetail.viewAll}
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
