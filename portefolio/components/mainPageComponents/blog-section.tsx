"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowRight, Calendar, Tag, Loader2 } from "lucide-react"
import { supabase, type BlogPost, type BlogTag } from "@/lib/supabase"
import Link from "next/link"

type BlogPostWithTags = BlogPost & {
  tags: string[]
}

export function BlogSection() {
  const [latestPost, setLatestPost] = useState<BlogPostWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestPost()
  }, [])

  const fetchLatestPost = async () => {
    try {
      // Fetch the latest published post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single()

      if (postError) throw postError

      if (post) {
        // Fetch tags for this post
        const { data: tags, error: tagsError } = await supabase
          .from('blog_tags')
          .select('tag')
          .eq('post_id', post.id)

        if (tagsError) throw tagsError

        setLatestPost({
          ...post,
          tags: tags?.map(t => t.tag) || []
        })
      }
    } catch (error) {
      console.error('Error fetching latest post:', error)
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
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Blog
            </h2>
            <p className="text-white/90 text-lg mt-2">
              Partilha de conhecimento e experiências
            </p>
          </div>
        </div>

        {/* Latest Post Card */}
        {!latestPost ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 mb-12">
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/90 text-xl">
              Nenhum artigo publicado no momento.
            </p>
          </div>
        ) : (
          <Card className="group bg-white border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom">
            
            {/* Latest Article Badge */}
            <Badge className="absolute top-2 right-6 bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg text-sm px-4 py-1.5 z-10">
              Último artigo
            </Badge>

            <div className="md:flex">
              {/* Content Side */}
              <div className="flex-grow p-8 md:p-10">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight mb-4 text-justify">
                    {latestPost.title}
                  </CardTitle>
                  
                  {/* Date and Tags */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    {latestPost.published_at && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {formatDate(latestPost.published_at)}
                        </span>
                      </div>
                    )}
                    
                    {latestPost.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-600" />
                        <div className="flex flex-wrap gap-2">
                          {latestPost.tags.map((tag, index) => (
                            <Badge 
                              key={index}
                              variant="outline"
                              className="bg-slate-100 text-slate-700 border-slate-300 font-medium"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {latestPost.excerpt && (
                    <CardDescription className="text-lg text-slate-600 leading-relaxed text-justify">
                      {latestPost.excerpt}
                    </CardDescription>
                  )}
                </CardHeader>

                <Button
                asChild
                className="
                    bg-gradient-to-r from-red-700 to-red-800
                    text-white font-semibold
                    transition-all duration-300 ease-out
                    hover:brightness-110 hover:saturate-110
                    hover:ring-2 hover:ring-red-500/40
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                "
                >
                    <Link
                        href={`/blog/${latestPost.slug}`}
                        className="flex items-center justify-center"
                    >
                        Ler artigo completo
                        <ArrowRight className="ml-2 w-4 h-4 opacity-80" />
                    </Link>
                </Button>

              </div>

              {/* Visual Element - Optional decorative side */}
              <div className="hidden md:block w-2 bg-gradient-to-b from-red-700 to-red-800" />
            </div>
          </Card>
        )}

        {/* View All Button */}
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '200ms' }}>
          <Button 
            size="lg"
            className="bg-white hover:bg-gray-50 text-slate-900 text-xl font-bold px-12 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 group border-4 border-white hover:scale-105"
            asChild
          >
            <Link href="/blog">
              Ver Mais Artigos
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  )
}
