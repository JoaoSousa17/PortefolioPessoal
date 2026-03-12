"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Tag, Clock, Share2, Loader2, X } from "lucide-react"
import { supabase, type BlogPost } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import { MarkdownContent } from "@/components/ui/markdown-content"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { useRouter } from "next/navigation"

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

type TagRecord = {
  id: string
  color: string
  translations: Record<string, any>
}

type BlogPostWithTags = BlogPost & {
  tags: TagRecord[]
}

function getTagName(tag: TagRecord, lang: string): string {
  return tag.translations?.[lang]?.name || tag.translations?.en?.name || ''
}

function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#1e293b' : '#ffffff'
}

export default function BlogPostPage() {
  const { t, language } = useTranslation()
  const params          = useParams()
  const router          = useRouter()
  const [post, setPost] = useState<BlogPostWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) fetchPost(params.slug as string)
  }, [params.slug])

  const fetchPost = async (slug: string) => {
    try {
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (postError) throw postError

      const { data: junctionData } = await supabase
        .from('blog_post_tags')
        .select('tag_id, tags(id, color, translations)')
        .eq('post_id', postData.id)

      const tags: TagRecord[] = (junctionData || []).map((j: any) => j.tags).filter(Boolean)

      setPost({ ...postData, tags })
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const estimateReadingTime = (content: string | null) => {
    if (!content) return null
    const minutes = Math.ceil(content.trim().split(/\s+/).length / 200)
    return t.blogPage.readingTime.replace('{minutes}', minutes.toString())
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post ? getTranslated(post, 'title', language) : '', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert(t.blogPage.copiedLink)
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
            <p className="text-xl text-slate-700 mb-4">{t.blogPage.notFound}</p>
            <Button asChild><Link href="/blog">{t.blogPage.backToBlog}</Link></Button>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const title   = getTranslated(post, 'title', language)
  const excerpt = getTranslated(post, 'excerpt', language)
  const content = getTranslated(post, '_content', language)

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-6 max-w-4xl">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 group" asChild>
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t.blogPage.backToBlog}
              </Link>
            </Button>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.id}`}
                    className="px-3 py-1 rounded-full text-xs font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: tag.color,
                      color: getTextColor(tag.color),
                    }}
                  >
                    {getTagName(tag, language)}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg text-justify">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/90">
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatDate(post.published_at)}</span>
                </div>
              )}

              {content && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{estimateReadingTime(content)}</span>
                  </div>
                </>
              )}

              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto text-white hover:bg-white/10">
                <Share2 className="w-4 h-4 mr-2" />
                {t.blogPage.share}
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">

              {/* Excerpt */}
              {excerpt && (
                <Card className="bg-gradient-to-br from-red-50 to-white border-l-4 border-red-700 p-6 md:p-8 mb-12 shadow-lg">
                  <p className="text-xl md:text-2xl text-slate-700 leading-relaxed italic font-medium text-justify">
                    {excerpt}
                  </p>
                </Card>
              )}

              {/* Main content */}
              {content && (
                <Card className="bg-white border-0 shadow-xl p-8 md:p-12 mb-12">
                  <MarkdownContent content={content} variant="blog" />
                </Card>
              )}

              {/* Tags section */}
              {post.tags.length > 0 && (
                <Card className="bg-white border-0 shadow-xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Tag className="w-5 h-5 text-red-700" />
                    <h3 className="text-xl font-bold text-slate-900">{t.blogPage.tags}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Link
                        key={tag.id}
                        href="/blog"
                        className="px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 hover:shadow-md"
                        style={{
                          backgroundColor: tag.color,
                          color: getTextColor(tag.color),
                        }}
                      >
                        {getTagName(tag, language)}
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Back */}
              <div className="mt-12 text-center">
                <Separator className="mb-8" />
                <p className="text-slate-600 mb-6 text-lg">{t.blogPage.readMorePrompt}</p>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all font-semibold"
                  asChild
                >
                  <Link href="/blog">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t.blogPage.backToBlog}
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
