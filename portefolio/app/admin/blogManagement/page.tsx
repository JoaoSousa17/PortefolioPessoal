"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  BookOpen, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  FileText
} from "lucide-react"
import { supabase, type BlogPost } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type NewBlogPost = {
  title: string
  slug: string
  excerpt: string
  _content: string
  published: boolean
  published_at: string | null
  tags: string[]
}

type BlogPostWithTags = BlogPost & {
  tags: string[]
}

export default function BlogManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [posts, setPosts] = useState<BlogPostWithTags[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [tagInput, setTagInput] = useState('')
  
  const [newPost, setNewPost] = useState<NewBlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    _content: '',
    published: false,
    published_at: null,
    tags: []
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    fetchPosts()
  }, [router])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })

      if (postsError) {
        console.error('Error fetching posts:', postsError)
        throw postsError
      }

      if (!postsData) {
        setPosts([])
        return
      }

      // Fetch tags for each post
      const postsWithTags = await Promise.all(
        postsData.map(async (post) => {
          try {
            const { data: tagsData, error: tagsError } = await supabase
              .from('blog_tags')
              .select('tag')
              .eq('post_id', post.id)

            if (tagsError) {
              console.error(`Error fetching tags for post ${post.id}:`, tagsError)
              return {
                ...post,
                tags: []
              }
            }

            return {
              ...post,
              tags: tagsData?.map(t => t.tag) || []
            }
          } catch (error) {
            console.error(`Error processing tags for post ${post.id}:`, error)
            return {
              ...post,
              tags: []
            }
          }
        })
      )

      setPosts(postsWithTags)
    } catch (error) {
      console.error('Error in fetchPosts:', error)
      setErrorMessage(`Erro ao carregar artigos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleInputChange = (field: keyof NewBlogPost, value: string | boolean) => {
    setNewPost(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      setNewPost(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAddPost = async () => {
    if (!newPost.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    if (!newPost.slug.trim()) {
      setErrorMessage('O slug é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      // Set published_at if publishing
      const publishedAt = newPost.published ? new Date().toISOString() : null

      // Insert blog post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .insert([{
          title: newPost.title,
          slug: newPost.slug,
          excerpt: newPost.excerpt || null,
          _content: newPost._content || null,
          published: newPost.published,
          published_at: publishedAt
        }])
        .select()
        .single()

      if (postError) throw postError

      // Insert tags
      if (newPost.tags.length > 0 && postData) {
        const tagsToInsert = newPost.tags.map(tag => ({
          post_id: postData.id,
          tag: tag
        }))

        const { error: tagsError } = await supabase
          .from('blog_tags')
          .insert(tagsToInsert)

        if (tagsError) throw tagsError
      }

      setSuccessMessage('Artigo adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Reset form
      setNewPost({
        title: '',
        slug: '',
        excerpt: '',
        _content: '',
        published: false,
        published_at: null,
        tags: []
      })
      setTagInput('')
      
      // Refresh posts list
      fetchPosts()
    } catch (error) {
      console.error('Error adding post:', error)
      setErrorMessage('Erro ao adicionar artigo. Verifica se o slug já existe.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este artigo?')) return

    try {
      // Delete tags first (foreign key constraint)
      await supabase
        .from('blog_tags')
        .delete()
        .eq('post_id', id)

      // Delete post
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Artigo eliminado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      setErrorMessage('Erro ao eliminar artigo')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar artigos...</p>
        </div>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-purple-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-purple-700/15 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative container mx-auto px-6">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-6 group"
              asChild
            >
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão do Blog
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {posts.length} artigo{posts.length !== 1 ? 's' : ''} • {posts.filter(p => p.published).length} publicado{posts.filter(p => p.published).length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-7xl">
            
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-emerald-900 text-lg">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 text-lg">{errorMessage}</p>
                    <p className="text-sm text-red-700 mt-1">Verifica a consola do browser para mais detalhes.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Add New Post */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl sticky top-6">
                  <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                  <CardHeader className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Plus className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
                          Novo Artigo
                        </CardTitle>
                        <CardDescription className="text-purple-700 text-base">
                          Cria um novo post para o blog
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 bg-white space-y-5">
                    
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-slate-900 font-semibold text-sm">
                        Título *
                      </Label>
                      <Input
                        id="title"
                        value={newPost.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Título do artigo"
                        className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-slate-900 font-semibold text-sm">
                        Slug * <span className="text-xs text-slate-500 font-normal">(gerado automaticamente)</span>
                      </Label>
                      <Input
                        id="slug"
                        value={newPost.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="url-do-artigo"
                        className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg font-mono text-sm"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                      <Label htmlFor="excerpt" className="text-slate-900 font-semibold text-sm">
                        Resumo
                      </Label>
                      <Textarea
                        id="excerpt"
                        value={newPost.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        placeholder="Breve resumo do artigo..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-purple-600 rounded-lg resize-none text-sm"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-slate-900 font-semibold text-sm">
                        Conteúdo
                      </Label>
                      <Textarea
                        id="content"
                        value={newPost._content}
                        onChange={(e) => handleInputChange('_content', e.target.value)}
                        placeholder="Conteúdo completo do artigo..."
                        rows={8}
                        className="border-2 border-slate-300 focus:border-purple-600 rounded-lg resize-none text-sm"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-600" />
                        Tags
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="Adicionar tag..."
                          className="h-11 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                        />
                        <Button
                          type="button"
                          onClick={handleAddTag}
                          variant="outline"
                          className="border-2 border-purple-600 text-purple-700 hover:bg-purple-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {newPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newPost.tags.map((tag, index) => (
                            <Badge 
                              key={index}
                              className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag}
                              <span className="ml-2 text-purple-600">×</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Published */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                        <input
                          type="checkbox"
                          id="published"
                          checked={newPost.published}
                          onChange={(e) => handleInputChange('published', e.target.checked)}
                          className="w-5 h-5 text-emerald-600 border-2 border-emerald-400 rounded focus:ring-2 focus:ring-emerald-500"
                        />
                        <Label htmlFor="published" className="text-slate-900 font-semibold text-sm flex items-center gap-2 cursor-pointer">
                          <Eye className="w-4 h-4 text-emerald-600" />
                          Publicar imediatamente
                        </Label>
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      onClick={handleAddPost}
                      disabled={saving}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group mt-4"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Artigo
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Posts List */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                  <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                  <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                          Artigos Existentes
                        </CardTitle>
                        <CardDescription className="text-slate-700 text-base">
                          Gere e edita os teus artigos
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 bg-white">
                    {posts.length === 0 ? (
                      <div className="p-12 text-center">
                        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-700 text-lg">
                          Nenhum artigo adicionado ainda.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-100 border-b-2 border-slate-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Artigo</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Data</th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {posts.map((post, index) => (
                              <tr 
                                key={post.id} 
                                className="hover:bg-slate-50 transition-colors"
                                style={{ 
                                  animation: 'fadeIn 0.3s ease-in',
                                  animationDelay: `${index * 50}ms`,
                                  animationFillMode: 'backwards'
                                }}
                              >
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="font-bold text-slate-900 mb-1">{post.title}</p>
                                    <p className="text-sm text-slate-500 font-mono">/{post.slug}</p>
                                    {post.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {post.tags.slice(0, 3).map((tag, idx) => (
                                          <Badge 
                                            key={idx}
                                            variant="outline"
                                            className="text-xs bg-purple-50 text-purple-700 border-purple-300"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                        {post.tags.length > 3 && (
                                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                                            +{post.tags.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge 
                                    className={`w-fit text-xs ${
                                      post.published 
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                        : 'bg-slate-100 text-slate-800 border-slate-300'
                                    }`}
                                  >
                                    {post.published ? (
                                      <>
                                        <Eye className="w-3 h-3 mr-1" />
                                        Publicado
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3 h-3 mr-1" />
                                        Rascunho
                                      </>
                                    )}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(post.published_at)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      asChild
                                    >
                                      <Link href={`/admin/blogManagement/${post.slug}`}>
                                        <Edit className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePost(post.id)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
