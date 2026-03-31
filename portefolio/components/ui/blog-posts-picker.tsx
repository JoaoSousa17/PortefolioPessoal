"use client"

// portefolio/components/ui/blog-posts-picker.tsx

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BookOpen, Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

type PostOption = {
  slug: string
  title: string
  published_at: string | null
  translations: any
}

function getTranslated(item: any, field: string): string {
  return item.translations?.en?.[field] || item.translations?.pt?.[field] || item[field] || ''
}

interface BlogPostsPickerProps {
  selectedSlugs: string[]
  onChange: (slugs: string[]) => void
  label?: string
}

export function BlogPostsPicker({ selectedSlugs, onChange, label = "Blog Posts Relacionados" }: BlogPostsPickerProps) {
  const [posts, setPosts]     = useState<PostOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('slug, title, published_at, translations')
        .eq('published', true)
        .order('published_at', { ascending: false })
      setPosts(data || [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  const toggle = (slug: string) => {
    onChange(
      selectedSlugs.includes(slug)
        ? selectedSlugs.filter(s => s !== slug)
        : [...selectedSlugs, slug]
    )
  }

  const filtered = posts.filter(p =>
    getTranslated(p, 'title').toLowerCase().includes(search.toLowerCase())
  )

  const selectedPosts = posts.filter(p => selectedSlugs.includes(p.slug))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-red-600 flex-shrink-0" />
        <span className="text-slate-900 font-semibold text-sm">{label}</span>
        {selectedSlugs.length > 0 && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
            {selectedSlugs.length}
          </span>
        )}
      </div>

      {/* Selected pills */}
      {selectedPosts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPosts.map(post => (
            <button
              key={post.slug}
              type="button"
              onClick={() => toggle(post.slug)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-semibold border border-red-200 hover:bg-red-200 transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              <span className="max-w-[180px] truncate">{getTranslated(post, 'title')}</span>
              <X className="w-3 h-3 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Procurar artigo..."
          className="pl-8 h-9 border-2 border-slate-200 focus:border-red-500 rounded-lg text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Post list */}
      <div className="border-2 border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            {posts.length === 0 ? 'Nenhum artigo publicado.' : 'Nenhum artigo encontrado.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(post => {
              const selected = selectedSlugs.includes(post.slug)
              const title    = getTranslated(post, 'title')
              return (
                <button
                  key={post.slug}
                  type="button"
                  onClick={() => toggle(post.slug)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    selected ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected ? 'bg-red-600 border-red-600' : 'border-slate-300'
                  }`}>
                    {selected && <span className="text-white text-[10px] font-black">✓</span>}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className={`text-sm font-medium truncate ${selected ? 'text-red-800' : 'text-slate-800'}`}>
                      {title}
                    </p>
                    {post.published_at && (
                      <p className="text-xs text-slate-400">
                        {new Date(post.published_at).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
