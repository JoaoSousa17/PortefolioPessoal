"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Tag, Loader2 } from "lucide-react"
import { supabase, type BlogPost, type BlogTag } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type BlogPostWithTags = BlogPost & {
  tags: string[]
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostWithTags[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      // Fetch all published posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (postsError) throw postsError

      // Fetch tags for all posts
      const postsWithTags = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: tagsData } = await supabase
            .from('blog_tags')
            .select('tag')
            .eq('post_id', post.id)

          return {
            ...post,
            tags: tagsData?.map(t => t.tag) || []
          }
        })
      )

      setPosts(postsWithTags)
    } catch (error) {
      console.error('Error fetching posts:', error)
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

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-16 md:py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-6 sm:mb-8 group text-sm sm:text-base"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar à página inicial
              </Link>
            </Button>

            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold drop-shadow-lg">
                  Blog
                </h1>
                <p className="text-base sm:text-xl text-white/90 mt-1 sm:mt-2">
                  Artigos sobre tecnologia, programação e inovação
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{posts.length}</p>
                <p className="text-xs sm:text-sm text-white/80">Artigos Publicados</p>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-8 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-slate-300">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 text-xl">
                  Nenhum artigo publicado no momento.
                </p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {posts.map((post, index) => (
                  <Card 
                    key={post.id}
                    className="group bg-white border-0 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-in fade-in slide-in-from-bottom"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {/* Hover accent line */}
                    <div className="h-1.5 sm:h-2 bg-gradient-to-r from-red-700 to-red-800 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    
                    <CardHeader className="p-5 sm:p-8 md:p-10">
                      {/* Date and Tags */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        {post.published_at && (
                          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">
                              {formatDate(post.published_at)}
                            </span>
                          </div>
                        )}
                        
                        {post.tags.length > 0 && (
                          <>
                            <span className="text-slate-400 hidden sm:inline">•</span>
                            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {post.tags.slice(0, 3).map((tag, i) => (
                                  <Badge 
                                    key={i}
                                    variant="outline"
                                    className="bg-slate-100 text-slate-700 border-slate-300 font-medium text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 3 && (
                                  <Badge 
                                    variant="outline"
                                    className="bg-slate-100 text-slate-700 border-slate-300 font-medium text-xs"
                                  >
                                    +{post.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight mb-3 sm:mb-4">
                        {post.title}
                      </CardTitle>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <CardDescription className="text-base sm:text-lg text-slate-600 leading-relaxed line-clamp-3 text-justify">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="px-5 sm:px-8 md:px-10 pb-5 sm:pb-8">
                        <Button
                        asChild
                        className="
                            w-full sm:w-auto
                            bg-gradient-to-r from-red-700 to-red-800
                            text-white font-semibold
                            text-sm sm:text-base
                            h-10 sm:h-11
                            transition-all duration-300 ease-out
                            hover:brightness-110 hover:saturate-110
                            hover:ring-2 hover:ring-red-500/40
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                        "
                        >
                            <Link
                                href={`/blog/${post.slug}`}
                                className="flex items-center justify-center"
                            >
                                Ler artigo completo
                                <ArrowRight className="ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                            </Link>
                        </Button>
                    </CardContent>
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
