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
  Rocket, 
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Star,
  Archive,
  Upload
} from "lucide-react"
import { supabase, type Project } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type NewProjectData = {
  title: string
  description: string
  long_description: string
  thumbnail_url: string
  main_url: string
  github_url: string
  status: 'active' | 'archived'
  featured: boolean
}

export default function ProjectsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [newProject, setNewProject] = useState<NewProjectData>({
    title: '',
    description: '',
    long_description: '',
    thumbnail_url: '',
    main_url: '',
    github_url: '',
    status: 'active',
    featured: false
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    fetchProjects()
  }, [router])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      setErrorMessage('Erro ao carregar projetos')
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
      
      setNewProject(prev => ({
        ...prev,
        thumbnail_url: publicUrl
      }))
      
      setSuccessMessage('Imagem carregada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error uploading image:', error)
      setErrorMessage('Erro ao fazer upload da imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleInputChange = (field: keyof NewProjectData, value: string | boolean) => {
    setNewProject(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddProject = async () => {
    if (!newProject.title.trim()) {
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
        .insert([{
          title: newProject.title,
          description: newProject.description || null,
          long_description: newProject.long_description || null,
          thumbnail_url: newProject.thumbnail_url || null,
          main_url: newProject.main_url || null,
          github_url: newProject.github_url || null,
          status: newProject.status,
          featured: newProject.featured
        }])

      if (error) throw error

      setSuccessMessage('Projeto adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Reset form
      setNewProject({
        title: '',
        description: '',
        long_description: '',
        thumbnail_url: '',
        main_url: '',
        github_url: '',
        status: 'active',
        featured: false
      })
      
      // Refresh projects list
      fetchProjects()
    } catch (error) {
      console.error('Error adding project:', error)
      setErrorMessage('Erro ao adicionar projeto. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este projeto?')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Projeto eliminado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      setErrorMessage('Erro ao eliminar projeto')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar projetos...</p>
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
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Projetos
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {projects.length} projeto{projects.length !== 1 ? 's' : ''} no portfólio
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
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-red-900 text-lg">{errorMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Add New Project */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl sticky top-6">
                  <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                  <CardHeader className="bg-gradient-to-br from-red-50 via-red-50 to-red-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Plus className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl font-bold text-red-900 mb-2">
                          Novo Projeto
                        </CardTitle>
                        <CardDescription className="text-red-700 text-base">
                          Adiciona um novo projeto ao portfólio
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
                        value={newProject.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Nome do projeto"
                        className="h-11 border-2 border-slate-300 focus:border-red-600 rounded-lg"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-slate-900 font-semibold text-sm">
                        Descrição Curta
                      </Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Breve descrição..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-red-600 rounded-lg resize-none text-sm"
                      />
                    </div>

                    {/* Long Description */}
                    <div className="space-y-2">
                      <Label htmlFor="long_description" className="text-slate-900 font-semibold text-sm">
                        Descrição Longa
                      </Label>
                      <Textarea
                        id="long_description"
                        value={newProject.long_description}
                        onChange={(e) => handleInputChange('long_description', e.target.value)}
                        placeholder="Descrição detalhada..."
                        rows={4}
                        className="border-2 border-slate-300 focus:border-red-600 rounded-lg resize-none text-sm"
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-red-600" />
                        Imagem do Projeto
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="h-11 border-2 border-slate-300 focus:border-red-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
                        {newProject.thumbnail_url && (
                          <div className="text-xs text-emerald-700 font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {newProject.thumbnail_url}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* URLs */}
                    <div className="space-y-2">
                      <Label htmlFor="main_url" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-red-600" />
                        URL Demo
                      </Label>
                      <Input
                        id="main_url"
                        value={newProject.main_url}
                        onChange={(e) => handleInputChange('main_url', e.target.value)}
                        placeholder="https://..."
                        className="h-11 border-2 border-slate-300 focus:border-red-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github_url" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Github className="w-4 h-4 text-red-600" />
                        URL GitHub
                      </Label>
                      <Input
                        id="github_url"
                        value={newProject.github_url}
                        onChange={(e) => handleInputChange('github_url', e.target.value)}
                        placeholder="https://github.com/..."
                        className="h-11 border-2 border-slate-300 focus:border-red-600 rounded-lg"
                      />
                    </div>

                    {/* Status & Featured */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={newProject.featured}
                          onChange={(e) => handleInputChange('featured', e.target.checked)}
                          className="w-5 h-5 text-red-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <Label htmlFor="featured" className="text-slate-900 font-semibold text-sm flex items-center gap-2 cursor-pointer">
                          <Star className="w-4 h-4 text-yellow-600" />
                          Projeto em Destaque
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="archived"
                          checked={newProject.status === 'archived'}
                          onChange={(e) => handleInputChange('status', e.target.checked ? 'archived' : 'active')}
                          className="w-5 h-5 text-red-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <Label htmlFor="archived" className="text-slate-900 font-semibold text-sm flex items-center gap-2 cursor-pointer">
                          <Archive className="w-4 h-4 text-slate-600" />
                          Arquivado
                        </Label>
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      onClick={handleAddProject}
                      disabled={saving || uploadingImage}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group mt-4"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Projeto
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Projects List */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                  <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                  <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Rocket className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                          Projetos Existentes
                        </CardTitle>
                        <CardDescription className="text-slate-700 text-base">
                          Gere e edita os teus projetos
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 bg-white">
                    {projects.length === 0 ? (
                      <div className="p-12 text-center">
                        <Rocket className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-700 text-lg">
                          Nenhum projeto adicionado ainda.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-100 border-b-2 border-slate-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Projeto</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                              <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Links</th>
                              <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {projects.map((project, index) => (
                              <tr 
                                key={project.id} 
                                className="hover:bg-slate-50 transition-colors"
                                style={{ 
                                  animation: 'fadeIn 0.3s ease-in',
                                  animationDelay: `${index * 50}ms`,
                                  animationFillMode: 'backwards'
                                }}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {project.thumbnail_url ? (
                                      <img 
                                        src={project.thumbnail_url} 
                                        alt={project.title}
                                        className="w-12 h-12 rounded-lg object-cover border-2 border-slate-200"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-slate-900">{project.title}</p>
                                      {project.description && (
                                        <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">
                                          {project.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                    <Badge 
                                      className={`w-fit text-xs ${
                                        project.status === 'active' 
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                          : 'bg-slate-100 text-slate-800 border-slate-300'
                                      }`}
                                    >
                                      {project.status === 'active' ? 'Ativo' : 'Arquivado'}
                                    </Badge>
                                    {project.featured && (
                                      <Badge className="w-fit text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                                        <Star className="w-3 h-3 mr-1" />
                                        Destaque
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    {project.main_url && (
                                      <a 
                                        href={project.main_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                      >
                                        <ExternalLink className="w-5 h-5" />
                                      </a>
                                    )}
                                    {project.github_url && (
                                      <a 
                                        href={project.github_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-slate-700 hover:text-slate-900 transition-colors"
                                      >
                                        <Github className="w-5 h-5" />
                                      </a>
                                    )}
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
                                      <Link href={`/admin/projectManagement/${project.id}`}>
                                        <Edit className="w-4 h-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteProject(project.id)}
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
