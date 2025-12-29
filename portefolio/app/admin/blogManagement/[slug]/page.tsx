"use client"

import { useState, useEffect, use } from "react"
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
  CheckCircle2,
  AlertCircle,
  Tag,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Calendar,
  Plus
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type PostData = {
  title: string
  slug: string
  excerpt: string | null
  _content: string | null
  published: boolean
  published_at: string | null
  tags: string[]
}

export default function EditBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = use(params) // Unwrap the Promise
  const postSlug = slug

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [actualPostId, setActualPostId] = useState<string>('')
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    slug: '',
    excerpt: null,
    _content: null,
    published: false,
    published_at: null,
    tags: []
  })

  const [originalData, setOriginalData] = useState<PostData | null>(null)

  useEffect(() => {
    console.log('Edit Blog Post - useEffect triggered')
    console.log('postSlug from params:', postSlug)
    
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    console.log('Is authenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to /auth')
      router.push('/auth')
      return
    }
    
    if (postSlug) {
      console.log('Fetching post with slug:', postSlug)
      fetchPost()
    } else {
      console.log('No postSlug found in params')
      setErrorMessage('Slug do artigo não encontrado na URL')
      setLoading(false)
    }
  }, [router, postSlug])

  const fetchPost = async () => {
    console.log('=== Starting fetchPost ===')
    console.log('Looking for post with slug:', postSlug)
    
    try {
      setLoading(true)
      setErrorMessage('')

      // Fetch post by slug instead of id
      console.log('Querying blog_posts table...')
      const { data: postDataRaw, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug) // postSlug is the slug from the URL
        .single()

      console.log('Query result:', { postDataRaw, postError })

      if (postError) {
        console.error('Error fetching post:', postError)
        throw postError
      }

      if (!postDataRaw) {
        console.error('No post data returned')
        throw new Error('Post not found')
      }

      console.log('Post found:', postDataRaw.title)
      console.log('Post ID:', postDataRaw.id)

      // Fetch tags using the actual post id
      console.log('Fetching tags for post ID:', postDataRaw.id)
      const { data: tagsData, error: tagsError } = await supabase
        .from('blog_tags')
        .select('tag')
        .eq('post_id', postDataRaw.id)

      console.log('Tags result:', { tagsData, tagsError })

      if (tagsError) {
        console.error('Error fetching tags:', tagsError)
        throw tagsError
      }

      const formattedData = {
        title: postDataRaw.title || '',
        slug: postDataRaw.slug || '',
        excerpt: postDataRaw.excerpt,
        _content: postDataRaw._content,
        published: postDataRaw.published || false,
        published_at: postDataRaw.published_at,
        tags: tagsData?.map(t => t.tag) || []
      }

      console.log('Formatted data:', formattedData)

      setActualPostId(postDataRaw.id)
      setPostData(formattedData)
      setOriginalData(formattedData)
      
      console.log('=== fetchPost completed successfully ===')
    } catch (error) {
      console.error('=== Error in fetchPost ===')
      console.error('Error details:', error)
      setErrorMessage(`Erro ao carregar artigo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      console.log('Setting loading to false')
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

  const handleInputChange = (field: keyof PostData, value: string | boolean) => {
    setPostData(prev => ({
      ...prev,
      [field]: field === 'title' || field === 'slug' ? value : (value || null)
    }))

    // Auto-generate slug from title if slug field is empty
    if (field === 'title' && typeof value === 'string' && !postData.slug) {
      setPostData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSave = async () => {
    if (!postData.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    if (!postData.slug.trim()) {
      setErrorMessage('O slug é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      // Update published_at if changing from unpublished to published
      let publishedAt = postData.published_at
      if (postData.published && !originalData?.published) {
        publishedAt = new Date().toISOString()
      } else if (!postData.published) {
        publishedAt = null
      }

      // Update blog post
      const { error: postError } = await supabase
        .from('blog_posts')
        .update({
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          _content: postData._content,
          published: postData.published,
          published_at: publishedAt
        })
        .eq('id', actualPostId)

      if (postError) throw postError

      // Delete existing tags
      await supabase
        .from('blog_tags')
        .delete()
        .eq('post_id', actualPostId)

      // Insert new tags
      if (postData.tags.length > 0) {
        const tagsToInsert = postData.tags.map(tag => ({
          post_id: actualPostId,
          tag: tag
        }))

        const { error: tagsError } = await supabase
          .from('blog_tags')
          .insert(tagsToInsert)

        if (tagsError) throw tagsError
      }

      setSuccessMessage('Artigo atualizado com sucesso!')
      
      const updatedData = { ...postData, published_at: publishedAt }
      setPostData(updatedData)
      setOriginalData(updatedData)
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating post:', error)
      setErrorMessage('Erro ao atualizar artigo. Verifica se o slug já existe.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalData) {
      setPostData(originalData)
      setTagInput('')
      setSuccessMessage('Alterações revertidas!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tens a certeza que queres eliminar este artigo? Esta ação não pode ser revertida.')) {
      return
    }

    try {
      // Delete tags first (foreign key constraint)
      await supabase
        .from('blog_tags')
        .delete()
        .eq('post_id', actualPostId)

      // Delete post
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', actualPostId)

      if (error) throw error

      router.push('/admin/blog')
    } catch (error) {
      console.error('Error deleting post:', error)
      setErrorMessage('Erro ao eliminar artigo')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const hasChanges = originalData && JSON.stringify(postData) !== JSON.stringify(originalData)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não publicado'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar artigo...</p>
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
              <Link href="/admin/blog">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Blog
              </Link>
            </Button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                    Editar Artigo
                  </h1>
                  <p className="text-xl text-white/90 mt-2">
                    {postData.title || 'Carregando...'}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge 
                  className={`text-sm px-4 py-2 ${
                    postData.published 
                      ? 'bg-emerald-500 text-white border-0' 
                      : 'bg-slate-500 text-white border-0'
                  }`}
                >
                  {postData.published ? (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Publicado
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Rascunho
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-5xl">
            
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
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-red-900 text-lg">{errorMessage}</p>
              </div>
            )}

            {/* Changes Warning */}
            {hasChanges && (
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-500 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-amber-900 text-lg">Tens alterações não guardadas</p>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="border-2 border-amber-600 text-amber-900 hover:bg-amber-100 font-semibold"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reverter
                </Button>
              </div>
            )}

            <div className="space-y-6">
              
              {/* Basic Information */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                <CardHeader className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
                        Informação do Artigo
                      </CardTitle>
                      <CardDescription className="text-purple-700 text-base">
                        Título, slug e resumo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  
                  {/* Title */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-slate-900 font-semibold text-base">
                      Título *
                    </Label>
                    <Input
                      id="title"
                      value={postData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Título do artigo"
                      className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-3">
                    <Label htmlFor="slug" className="text-slate-900 font-semibold text-base">
                      Slug *
                    </Label>
                    <Input
                      id="slug"
                      value={postData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-do-artigo"
                      className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg font-mono text-sm"
                    />
                    <p className="text-sm text-slate-600">
                      URL: <span className="font-mono text-purple-700">/blog/{postData.slug}</span>
                    </p>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-3">
                    <Label htmlFor="excerpt" className="text-slate-900 font-semibold text-base">
                      Resumo
                    </Label>
                    <Textarea
                      id="excerpt"
                      value={postData.excerpt || ''}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Breve resumo do artigo..."
                      rows={3}
                      className="border-2 border-slate-300 focus:border-purple-600 rounded-lg resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
                        Conteúdo
                      </CardTitle>
                      <CardDescription className="text-blue-700 text-base">
                        Corpo completo do artigo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="content" className="text-slate-900 font-semibold text-base">
                      Conteúdo do Artigo
                    </Label>
                    <Textarea
                      id="content"
                      value={postData._content || ''}
                      onChange={(e) => handleInputChange('_content', e.target.value)}
                      placeholder="Escreve o conteúdo completo do artigo aqui..."
                      rows={20}
                      className="border-2 border-slate-300 focus:border-blue-600 rounded-lg resize-none font-mono text-sm"
                    />
                    <p className="text-sm text-slate-600">
                      Podes usar Markdown para formatar o texto
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
                <CardHeader className="bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Tag className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-orange-900 mb-2">
                        Tags
                      </CardTitle>
                      <CardDescription className="text-orange-700 text-base">
                        Organiza o artigo por tópicos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  
                  <div className="space-y-3">
                    <Label htmlFor="tags" className="text-slate-900 font-semibold text-base">
                      Adicionar Tags
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Nome da tag..."
                        className="h-12 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="h-12 px-6 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {postData.tags.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-slate-900 font-semibold text-base">
                        Tags Atuais ({postData.tags.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {postData.tags.map((tag, index) => (
                          <Badge 
                            key={index}
                            className="bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200 cursor-pointer text-base px-4 py-2"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag}
                            <span className="ml-2 text-orange-600 font-bold">×</span>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">
                        Clica numa tag para a remover
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Publication Settings */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />
                <CardHeader className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-emerald-900 mb-2">
                        Publicação
                      </CardTitle>
                      <CardDescription className="text-emerald-700 text-base">
                        Configurações de visibilidade
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                    <input
                      type="checkbox"
                      id="published"
                      checked={postData.published}
                      onChange={(e) => handleInputChange('published', e.target.checked)}
                      className="w-6 h-6 text-emerald-600 border-2 border-emerald-400 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <Label htmlFor="published" className="text-slate-900 font-semibold text-base flex items-center gap-2 cursor-pointer flex-1">
                      {postData.published ? (
                        <>
                          <Eye className="w-5 h-5 text-emerald-600" />
                          Artigo Publicado
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-5 h-5 text-slate-600" />
                          Artigo em Rascunho
                        </>
                      )}
                      <span className="text-sm text-slate-600 font-normal ml-auto">
                        {postData.published ? 'Visível publicamente' : 'Apenas visível para admin'}
                      </span>
                    </Label>
                  </div>

                  {postData.published_at && (
                    <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold">Data de publicação:</span>
                        <span>{formatDate(postData.published_at)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="h-14 px-8 text-base font-semibold border-2 border-red-500 text-red-700 hover:bg-red-50 hover:border-red-600 group"
                >
                  <Trash2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Eliminar Artigo
                </Button>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/blog')}
                    className="h-14 px-8 text-base font-semibold border-2"
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="h-14 px-8 text-base font-bold bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Guardar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
