"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Tag, Clock, Share2, Loader2 } from "lucide-react"
import { supabase, type BlogPost, type BlogTag } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type BlogPostWithTags = BlogPost & {
  tags: string[]
}

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPostWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug])

  const fetchPost = async (slug: string) => {
    try {
      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (postError) throw postError

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('blog_tags')
        .select('tag')
        .eq('post_id', postData.id)

      if (tagsError) throw tagsError

      setPost({
        ...postData,
        tags: tagsData?.map(t => t.tag) || []
      })
    } catch (error) {
      console.error('Error fetching post:', error)
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

  const estimateReadingTime = (content: string | null) => {
    if (!content) return null
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min de leitura`
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt || '',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
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

  if (!post) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
        <TopBar />
        <div className="flex-grow flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8 text-center">
            <p className="text-xl text-slate-700 mb-4">Artigo não encontrado</p>
            <Button asChild>
              <Link href="/blog">Voltar ao blog</Link>
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
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-6 max-w-4xl">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-6 group"
              asChild
            >
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao blog
              </Link>
            </Button>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg text-justify">
              {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatDate(post.published_at)}
                  </span>
                </div>
              )}
              
              {post._content && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {estimateReadingTime(post._content)}
                    </span>
                  </div>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partilhar
              </Button>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <Tag className="w-4 h-4 text-white/70" />
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              
              {/* Excerpt */}
              {post.excerpt && (
                <Card className="bg-gradient-to-br from-red-50 to-white border-l-4 border-red-700 p-6 md:p-8 mb-12 shadow-lg">
                  <p className="text-xl md:text-2xl text-slate-700 leading-relaxed italic font-medium text-justify">
                    {post.excerpt}
                  </p>
                </Card>
              )}

              {/* Main Content */}
              <Card className="bg-white border-0 shadow-xl p-8 md:p-12 mb-12">
                <article className="prose prose-slate prose-lg max-w-none">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {post._content?.split('\n').map((paragraph, index) => {
                      // Check if it's a heading (starts with ##)
                      if (paragraph.trim().startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-3xl font-bold text-slate-900 mt-10 mb-6 first:mt-0 text-justify">
                            {paragraph.replace('## ', '')}
                          </h2>
                        )
                      }
                      // Regular paragraph
                      if (paragraph.trim()) {
                        return (
                          <p key={index} className="mb-6 text-lg text-justify">
                            {paragraph}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>
                </article>
              </Card>

              {/* Tags Section */}
              {post.tags.length > 0 && (
                <Card className="bg-white border-0 shadow-xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Tag className="w-5 h-5 text-red-700" />
                    <h3 className="text-xl font-bold text-slate-900">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="bg-slate-100 text-slate-700 border-slate-300 font-medium px-4 py-2"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Back to Blog */}
              <div className="mt-12 text-center">
                <Separator className="mb-8" />
                <p className="text-slate-600 mb-6 text-lg">
                  Gostou deste artigo? Leia mais!
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all font-semibold"
                  asChild
                >
                  <Link href="/blog">
                    <ArrowLeft className="w-5 h-5 mr-2 rotate-180" />
                    Ver Todos os Artigos
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
