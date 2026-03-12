"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowRight, Calendar, Loader2 } from "lucide-react"
import { supabase, type BlogPost } from "@/lib/supabase"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

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

export function BlogSection() {
  const { t, language } = useTranslation()
  const [latestPost, setLatestPost] = useState<BlogPostWithTags | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchLatestPost() }, [])

  const fetchLatestPost = async () => {
    try {
      const { data: post, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (postError) throw postError

      if (post) {
        const { data: junctionData } = await supabase
          .from('blog_post_tags')
          .select('tag_id, tags(id, color, translations)')
          .eq('post_id', post.id)

        const tags: TagRecord[] = (junctionData || []).map((j: any) => j.tags).filter(Boolean)
        setLatestPost({ ...post, tags })
      }
    } catch (error) {
      console.error("Error fetching latest post:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("pt-PT", {
      day: "numeric", month: "long", year: "numeric",
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-700/10 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-800/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center shadow-xl">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{t.blog.title}</h2>
            <p className="text-white/90 text-lg mt-2 text-justify">{t.blog.subtitle}</p>
          </div>
        </div>

        {!latestPost ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20 mb-12">
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/90 text-xl">{t.blog.empty}</p>
          </div>
        ) : (
          <Card className="group bg-white border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom">
            {/* Latest badge */}
            <div className="absolute top-4 right-6 z-10">
              <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                {t.blog.latest}
              </span>
            </div>

            <div className="md:flex">
              <div className="flex-grow p-8 md:p-10">
                <CardHeader className="p-0 mb-6">

                  {/* Tags */}
                  {latestPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {latestPost.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: tag.color,
                            color: getTextColor(tag.color),
                          }}
                        >
                          {getTagName(tag, language)}
                        </span>
                      ))}
                    </div>
                  )}

                  <CardTitle className="text-3xl md:text-4xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight mb-4 text-justify">
                    {getTranslated(latestPost, 'title', language)}
                  </CardTitle>

                  {latestPost.published_at && (
                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatDate(latestPost.published_at)}</span>
                    </div>
                  )}

                  {getTranslated(latestPost, 'excerpt', language) && (
                    <CardDescription className="text-lg text-slate-600 leading-relaxed text-justify">
                      {getTranslated(latestPost, 'excerpt', language)}
                    </CardDescription>
                  )}
                </CardHeader>

                <Button
                  asChild
                  className="bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold transition-all duration-300 ease-out hover:brightness-110 hover:ring-2 hover:ring-red-500/40"
                >
                  <Link href={`/blog/${latestPost.slug}`} className="flex items-center justify-center">
                    {t.blog.readMore}
                    <ArrowRight className="ml-2 w-4 h-4 opacity-80" />
                  </Link>
                </Button>
              </div>

              <div className="hidden md:block w-2 bg-gradient-to-b from-red-700 to-red-800" />
            </div>
          </Card>
        )}

        <div className="flex justify-center animate-in fade-in slide-in-from-bottom">
          <Button
            size="lg"
            className="bg-white hover:bg-gray-50 text-slate-900 text-xl font-bold px-12 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 group border-4 border-white hover:scale-105"
            asChild
          >
            <Link href="/blog">
              {t.blog.viewAll}
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
