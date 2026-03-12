"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Tag, Loader2, X } from "lucide-react"
import { supabase, type BlogPost } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
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

export default function BlogPage() {
  const { t, language } = useTranslation()
  const [posts, setPosts]           = useState<BlogPostWithTags[]>([])
  const [allTags, setAllTags]       = useState<TagRecord[]>([])
  const [selectedTagId, setSelected] = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (error) throw error

      const postsWithTags = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: junctionData } = await supabase
            .from('blog_post_tags')
            .select('tag_id, tags(id, color, translations)')
            .eq('post_id', post.id)

          const tags: TagRecord[] = (junctionData || []).map((j: any) => j.tags as TagRecord | null).filter((t): t is TagRecord => t !== null)
          return { ...post, tags }
        })
      )

      setPosts(postsWithTags)

      const tagMap = new Map<string, TagRecord>()
      postsWithTags.forEach(p => p.tags.forEach((tag: TagRecord) => tagMap.set(tag.id, tag)))
      setAllTags(Array.from(tagMap.values()))
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = selectedTagId
    ? posts.filter(p => p.tags.some(tag => tag.id === selectedTagId))
    : posts

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 sm:mb-8 group text-sm sm:text-base" asChild>
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t.blogPage.backHome}
              </Link>
            </Button>

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold drop-shadow-lg">{t.blogPage.title}</h1>
                <p className="text-base sm:text-xl text-white/90 mt-1 sm:mt-2">{t.blogPage.subtitle}</p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20 inline-block">
                <p className="text-2xl sm:text-3xl font-bold">{filteredPosts.length}</p>
                <p className="text-xs sm:text-sm text-white/80">{t.blogPage.stats.published}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tag filter bar */}
        {allTags.length > 0 && (
          <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />

              {/* All posts button */}
              <button
                onClick={() => setSelected(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                  selectedTagId === null
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {language === 'pt' ? 'Todos' : 'All'}
              </button>

              {allTags.map(tag => {
                const name     = getTagName(tag, language)
                const isActive = selectedTagId === tag.id
                return (
                  <button
                    key={tag.id}
                    onClick={() => setSelected(isActive ? null : tag.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: isActive ? tag.color : 'white',
                      borderColor: tag.color,
                      color: isActive ? getTextColor(tag.color) : tag.color,
                    }}
                  >
                    {name}
                    {isActive && <X className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Posts list */}
        <section className="py-8 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-slate-300 max-w-4xl mx-auto">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 text-xl">{t.blogPage.noPosts}</p>
                {selectedTagId && (
                  <Button variant="outline" className="mt-4" onClick={() => setSelected(null)}>
                    <X className="w-4 h-4 mr-2" />
                    {language === 'pt' ? 'Limpar filtro' : 'Clear filter'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {filteredPosts.map((post, index) => (
                  <Card
                    key={post.id}
                    className="group bg-white border-0 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-in fade-in slide-in-from-bottom"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="h-1.5 sm:h-2 bg-gradient-to-r from-red-700 to-red-800 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                    <CardHeader className="p-5 sm:p-8 md:p-10">
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.map(tag => (
                            <button
                              key={tag.id}
                              onClick={() => setSelected(tag.id === selectedTagId ? null : tag.id)}
                              className="px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:scale-105"
                              style={{
                                backgroundColor: tag.color + '22',
                                color: tag.color,
                                border: `1.5px solid ${tag.color}`,
                              }}
                            >
                              {getTagName(tag, language)}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Date */}
                      {post.published_at && (
                        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-xs sm:text-sm font-medium">{formatDate(post.published_at)}</span>
                        </div>
                      )}

                      <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight mb-3 sm:mb-4">
                        {getTranslated(post, 'title', language)}
                      </CardTitle>

                      {getTranslated(post, 'excerpt', language) && (
                        <CardDescription className="text-base sm:text-lg text-slate-600 leading-relaxed line-clamp-3 text-justify">
                          {getTranslated(post, 'excerpt', language)}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="px-5 sm:px-8 md:px-10 pb-5 sm:pb-8">
                      <Button
                        asChild
                        className="w-full sm:w-auto bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold text-sm sm:text-base h-10 sm:h-11 transition-all duration-300 ease-out hover:brightness-110 hover:ring-2 hover:ring-red-500/40"
                      >
                        <Link href={`/blog/${post.slug}`} className="flex items-center justify-center">
                          {t.blogPage.readMore}
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