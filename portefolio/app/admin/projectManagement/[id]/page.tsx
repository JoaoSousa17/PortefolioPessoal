"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  Rocket, 
  ExternalLink,
  Github,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Star,
  Archive,
  Trash2,
  RefreshCw
} from "lucide-react"
import { supabase, type Project } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type ProjectData = {
  title: string
  description: string | null
  long_description: string | null
  thumbnail_url: string | null
  main_url: string | null
  github_url: string | null
  status: 'active' | 'archived'
  featured: boolean
}

export default function EditProject() {
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [projectData, setProjectData] = useState<ProjectData>({
    title: '',
    description: null,
    long_description: null,
    thumbnail_url: null,
    main_url: null,
    github_url: null,
    status: 'active',
    featured: false
  })

  const [originalData, setOriginalData] = useState<ProjectData | null>(null)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    if (projectId) {
      fetchProject()
    }
  }, [router, projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error

      if (data) {
        const formattedData = {
          title: data.title || '',
          description: data.description,
          long_description: data.long_description,
          thumbnail_url: data.thumbnail_url,
          main_url: data.main_url,
          github_url: data.github_url,
          status: data.status || 'active',
          featured: data.featured || false
        }
        setProjectData(formattedData)
        setOriginalData(formattedData)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setErrorMessage('Erro ao carregar projeto')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      
      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `project_${timestamp}_${randomString}.${extension}`
      
      // Create form data for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', newFileName)
      
      // In a real scenario, you would upload to your server/storage
      // For now, we'll simulate the upload and set a placeholder URL
      const publicUrl = `/projects/${newFileName}`
      
      setProjectData(prev => ({
        ...prev,
        thumbnail_url: publicUrl
      }))
      
      setSuccessMessage('Imagem atualizada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error uploading image:', error)
      setErrorMessage('Erro ao fazer upload da imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleInputChange = (field: keyof ProjectData, value: string | boolean) => {
    setProjectData(prev => ({
      ...prev,
      [field]: field === 'title' ? value : (value || null)
    }))
  }

  const handleSave = async () => {
    if (!projectData.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('projects')
        .update({
          title: projectData.title,
          description: projectData.description,
          long_description: projectData.long_description,
          thumbnail_url: projectData.thumbnail_url,
          main_url: projectData.main_url,
          github_url: projectData.github_url,
          status: projectData.status,
          featured: projectData.featured
        })
        .eq('id', projectId)

      if (error) throw error

      setSuccessMessage('Projeto atualizado com sucesso!')
      setOriginalData(projectData)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating project:', error)
      setErrorMessage('Erro ao atualizar projeto. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalData) {
      setProjectData(originalData)
      setSuccessMessage('Alterações revertidas!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tens a certeza que queres eliminar este projeto? Esta ação não pode ser revertida.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      router.push('/admin/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      setErrorMessage('Erro ao eliminar projeto')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const hasChanges = originalData && JSON.stringify(projectData) !== JSON.stringify(originalData)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar projeto...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-red-700/15 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative container mx-auto px-6">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-6 group"
              asChild
            >
              <Link href="/admin/projectManagement">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar aos Projetos
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                    Editar Projeto
                  </h1>
                  <p className="text-xl text-white/90 mt-2">
                    {projectData.title || 'Carregando...'}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge 
                  className={`text-sm px-4 py-2 ${
                    projectData.status === 'active' 
                      ? 'bg-emerald-500 text-white border-0' 
                      : 'bg-slate-500 text-white border-0'
                  }`}
                >
                  {projectData.status === 'active' ? 'Ativo' : 'Arquivado'}
                </Badge>
                {projectData.featured && (
                  <Badge className="text-sm px-4 py-2 bg-yellow-500 text-white border-0">
                    <Star className="w-4 h-4 mr-1" />
                    Destaque
                  </Badge>
                )}
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
                <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                <CardHeader className="bg-gradient-to-br from-red-50 via-red-50 to-red-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Rocket className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-red-900 mb-2">
                        Informação do Projeto
                      </CardTitle>
                      <CardDescription className="text-red-700 text-base">
                        Título, descrições e imagem
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
                      value={projectData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Nome do projeto"
                      className="h-12 border-2 border-slate-300 focus:border-red-600 rounded-lg"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-slate-900 font-semibold text-base">
                      Descrição Curta
                    </Label>
                    <Textarea
                      id="description"
                      value={projectData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Breve descrição..."
                      rows={3}
                      className="border-2 border-slate-300 focus:border-red-600 rounded-lg resize-none"
                    />
                  </div>

                  {/* Long Description */}
                  <div className="space-y-3">
                    <Label htmlFor="long_description" className="text-slate-900 font-semibold text-base">
                      Descrição Longa
                    </Label>
                    <Textarea
                      id="long_description"
                      value={projectData.long_description || ''}
                      onChange={(e) => handleInputChange('long_description', e.target.value)}
                      placeholder="Descrição detalhada..."
                      rows={6}
                      className="border-2 border-slate-300 focus:border-red-600 rounded-lg resize-none"
                    />
                  </div>

                  {/* Current Image Preview */}
                  {projectData.thumbnail_url && (
                    <div className="space-y-3">
                      <Label className="text-slate-900 font-semibold text-base">
                        Imagem Atual
                      </Label>
                      <div className="relative w-full max-w-md">
                        <img 
                          src={projectData.thumbnail_url} 
                          alt={projectData.title}
                          className="w-full h-48 object-cover rounded-lg border-2 border-slate-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 text-slate-900 border border-slate-300">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            Atual
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="thumbnail" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-red-600" />
                      {projectData.thumbnail_url ? 'Alterar Imagem' : 'Adicionar Imagem'}
                    </Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="h-12 border-2 border-slate-300 focus:border-red-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    {uploadingImage && (
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        A fazer upload...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Links */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <ExternalLink className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
                        Links e URLs
                      </CardTitle>
                      <CardDescription className="text-blue-700 text-base">
                        Demo e repositório do projeto
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  
                  <div className="space-y-3">
                    <Label htmlFor="main_url" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      URL Demo
                    </Label>
                    <Input
                      id="main_url"
                      value={projectData.main_url || ''}
                      onChange={(e) => handleInputChange('main_url', e.target.value)}
                      placeholder="https://..."
                      className="h-12 border-2 border-slate-300 focus:border-blue-600 rounded-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="github_url" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <Github className="w-4 h-4 text-blue-600" />
                      URL GitHub
                    </Label>
                    <Input
                      id="github_url"
                      value={projectData.github_url || ''}
                      onChange={(e) => handleInputChange('github_url', e.target.value)}
                      placeholder="https://github.com/..."
                      className="h-12 border-2 border-slate-300 focus:border-blue-600 rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status & Settings */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                <CardHeader className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
                        Configurações
                      </CardTitle>
                      <CardDescription className="text-purple-700 text-base">
                        Status e visibilidade do projeto
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={projectData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="w-6 h-6 text-yellow-600 border-2 border-yellow-400 rounded focus:ring-2 focus:ring-yellow-500"
                    />
                    <Label htmlFor="featured" className="text-slate-900 font-semibold text-base flex items-center gap-2 cursor-pointer flex-1">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Projeto em Destaque
                      <span className="text-sm text-slate-600 font-normal ml-auto">
                        Aparecerá em destaque no portfólio
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-slate-300 rounded-xl">
                    <input
                      type="checkbox"
                      id="archived"
                      checked={projectData.status === 'archived'}
                      onChange={(e) => handleInputChange('status', e.target.checked ? 'archived' : 'active')}
                      className="w-6 h-6 text-slate-600 border-2 border-slate-400 rounded focus:ring-2 focus:ring-slate-500"
                    />
                    <Label htmlFor="archived" className="text-slate-900 font-semibold text-base flex items-center gap-2 cursor-pointer flex-1">
                      <Archive className="w-5 h-5 text-slate-600" />
                      Arquivado
                      <span className="text-sm text-slate-600 font-normal ml-auto">
                        Projeto não será exibido publicamente
                      </span>
                    </Label>
                  </div>
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
                  Eliminar Projeto
                </Button>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin/projects')}
                    className="h-14 px-8 text-base font-semibold border-2"
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={saving || uploadingImage || !hasChanges}
                    className="h-14 px-8 text-base font-bold bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
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