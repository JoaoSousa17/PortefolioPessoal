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
  Loader2, 
  Heart, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Award,
  BookOpen,
  Building
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type SocialProject = {
  id: string
  title: string
  date: string | null
  image_url: string | null
  _description: string | null
  institution_name: string | null
  instituition_logo: string | null
  institution_link: string | null
  certificate_url: string | null
  is_public: boolean
  is_voluntariado: boolean
}

type EditingProject = {
  id: string
  title: string
  date: string
  image_url: string
  _description: string
  institution_name: string
  instituition_logo: string
  institution_link: string
  certificate_url: string
  is_public: boolean
}

export default function SocialProjectsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  
  const [volunteers, setVolunteers] = useState<SocialProject[]>([])
  const [bookProject, setBookProject] = useState<SocialProject | null>(null)
  
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingProject | null>(null)
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null)
  const [editingCertFile, setEditingCertFile] = useState<File | null>(null)
  
  // New volunteer form
  const [newVolunteer, setNewVolunteer] = useState({
    title: '',
    date: '',
    image_url: '',
    _description: '',
    institution_name: '',
    instituition_logo: '',
    institution_link: '',
    certificate_url: '',
    is_public: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)

  // Book project editing
  const [editingBook, setEditingBook] = useState(false)
  const [bookData, setBookData] = useState({
    title: '',
    _description: '',
    is_public: true
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch volunteers
      const { data: volData, error: volError } = await supabase
        .from('social_projects')
        .select('*')
        .eq('is_voluntariado', true)
        .order('date', { ascending: false })

      if (volError) throw volError
      setVolunteers(volData || [])

      // Fetch book project
      const { data: bookData, error: bookError } = await supabase
        .from('social_projects')
        .select('*')
        .eq('is_voluntariado', false)
        .single()

      if (bookError && bookError.code !== 'PGRST116') throw bookError
      setBookProject(bookData || null)
      
      if (bookData) {
        setBookData({
          title: bookData.title,
          _description: bookData._description || '',
          is_public: bookData.is_public
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `social_${timestamp}_${randomString}.${extension}`
      const imagePath = `/logo_skills/${newFileName}`
      
      if (isEdit && editingData) {
        setEditingImageFile(file)
        setEditingData({ ...editingData, image_url: imagePath })
      } else {
        setImageFile(file)
        setNewVolunteer(prev => ({ ...prev, image_url: imagePath }))
      }
      
      setSuccessMessage('Imagem selecionada!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Error selecting image:', error)
      setErrorMessage('Erro ao selecionar imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingLogo(true)
      
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `institution_${timestamp}_${randomString}.${extension}`
      const logoPath = `/logo_skills/${newFileName}`
      
      if (isEdit && editingData) {
        setEditingLogoFile(file)
        setEditingData({ ...editingData, instituition_logo: logoPath })
      } else {
        setLogoFile(file)
        setNewVolunteer(prev => ({ ...prev, instituition_logo: logoPath }))
      }
      
      setSuccessMessage('Logo selecionado!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Error selecting logo:', error)
      setErrorMessage('Erro ao selecionar logo')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingCertificate(true)
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Por favor seleciona um PDF ou imagem')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `cert_social_${timestamp}_${randomString}.${extension}`
      const certPath = `/certificates/${newFileName}`
      
      if (isEdit && editingData) {
        setEditingCertFile(file)
        setEditingData({ ...editingData, certificate_url: certPath })
      } else {
        setCertFile(file)
        setNewVolunteer(prev => ({ ...prev, certificate_url: certPath }))
      }
      
      setSuccessMessage('Certificado selecionado!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Error selecting certificate:', error)
      setErrorMessage('Erro ao selecionar certificado')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleAddVolunteer = async () => {
    if (!newVolunteer.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('social_projects')
        .insert([{
          title: newVolunteer.title,
          date: newVolunteer.date || null,
          image_url: newVolunteer.image_url || null,
          _description: newVolunteer._description || null,
          institution_name: newVolunteer.institution_name || null,
          instituition_logo: newVolunteer.instituition_logo || null,
          institution_link: newVolunteer.institution_link || null,
          certificate_url: newVolunteer.certificate_url || null,
          is_public: newVolunteer.is_public,
          is_voluntariado: true
        }])

      if (error) throw error

      setSuccessMessage('Voluntariado adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setNewVolunteer({
        title: '',
        date: '',
        image_url: '',
        _description: '',
        institution_name: '',
        instituition_logo: '',
        institution_link: '',
        certificate_url: '',
        is_public: true
      })
      setImageFile(null)
      setLogoFile(null)
      setCertFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error adding volunteer:', error)
      setErrorMessage('Erro ao adicionar voluntariado')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (project: SocialProject) => {
    setEditingId(project.id)
    setEditingData({
      id: project.id,
      title: project.title,
      date: project.date || '',
      image_url: project.image_url || '',
      _description: project._description || '',
      institution_name: project.institution_name || '',
      instituition_logo: project.instituition_logo || '',
      institution_link: project.institution_link || '',
      certificate_url: project.certificate_url || '',
      is_public: project.is_public
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
    setEditingImageFile(null)
    setEditingLogoFile(null)
    setEditingCertFile(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('social_projects')
        .update({
          title: editingData.title,
          date: editingData.date || null,
          image_url: editingData.image_url || null,
          _description: editingData._description || null,
          institution_name: editingData.institution_name || null,
          instituition_logo: editingData.instituition_logo || null,
          institution_link: editingData.institution_link || null,
          certificate_url: editingData.certificate_url || null,
          is_public: editingData.is_public
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Voluntariado atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      setEditingImageFile(null)
      setEditingLogoFile(null)
      setEditingCertFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error updating volunteer:', error)
      setErrorMessage('Erro ao atualizar voluntariado')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este voluntariado?')) return

    try {
      const { error } = await supabase
        .from('social_projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Voluntariado eliminado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error deleting volunteer:', error)
      setErrorMessage('Erro ao eliminar voluntariado')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const saveBookProject = async () => {
    if (!bookData.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      if (bookProject) {
        // Update existing
        const { error } = await supabase
          .from('social_projects')
          .update({
            title: bookData.title,
            _description: bookData._description || null,
            is_public: bookData.is_public
          })
          .eq('id', bookProject.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('social_projects')
          .insert([{
            title: bookData.title,
            _description: bookData._description || null,
            is_public: bookData.is_public,
            is_voluntariado: false
          }])

        if (error) throw error
      }

      setSuccessMessage('Projeto do livro atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      setEditingBook(false)
      fetchData()
    } catch (error) {
      console.error('Error saving book project:', error)
      setErrorMessage('Erro ao guardar projeto')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-rose-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar projetos sociais...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-rose-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-rose-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Projetos Sociais
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {volunteers.length} voluntariado{volunteers.length !== 1 ? 's' : ''} • 1 projeto
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

            <div className="space-y-8">
              
              {/* Volunteers Table */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Voluntariados
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Experiências de voluntariado
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {volunteers.length === 0 ? (
                    <div className="p-12 text-center">
                      <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhum voluntariado adicionado ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Título</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Instituição</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Data</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Público</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {volunteers.map((volunteer, index) => (
                            <tr 
                              key={volunteer.id}
                              className="hover:bg-slate-50 transition-colors"
                              style={{
                                animation: 'fadeIn 0.3s ease-in',
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                              {editingId === volunteer.id && editingData ? (
                                // EDITING MODE
                                <>
                                  <td className="px-6 py-4" colSpan={5}>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label className="text-xs font-semibold">Título *</Label>
                                          <Input
                                            value={editingData.title}
                                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                                            className="h-9 border-2 border-rose-600"
                                            autoFocus
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-xs font-semibold">Data</Label>
                                          <Input
                                            type="date"
                                            value={editingData.date}
                                            onChange={(e) => setEditingData({ ...editingData, date: e.target.value })}
                                            className="h-9 border-2 border-rose-600"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-xs font-semibold">Instituição</Label>
                                          <Input
                                            value={editingData.institution_name}
                                            onChange={(e) => setEditingData({ ...editingData, institution_name: e.target.value })}
                                            className="h-9 border-2 border-rose-600"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-xs font-semibold">Link Instituição</Label>
                                          <Input
                                            value={editingData.institution_link}
                                            onChange={(e) => setEditingData({ ...editingData, institution_link: e.target.value })}
                                            placeholder="https://..."
                                            className="h-9 border-2 border-rose-600"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-xs font-semibold">Imagem</Label>
                                          <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, true)}
                                            className="h-9 text-xs file:mr-2 file:py-1 file:px-2 file:text-xs"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-xs font-semibold">Logo Instituição</Label>
                                          <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleLogoUpload(e, true)}
                                            className="h-9 text-xs file:mr-2 file:py-1 file:px-2 file:text-xs"
                                          />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <Label className="text-xs font-semibold">Certificado</Label>
                                          <Input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                                            onChange={(e) => handleCertUpload(e, true)}
                                            className="h-9 text-xs file:mr-2 file:py-1 file:px-2 file:text-xs"
                                          />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                          <Label className="text-xs font-semibold">Descrição</Label>
                                          <Textarea
                                            value={editingData._description}
                                            onChange={(e) => setEditingData({ ...editingData, _description: e.target.value })}
                                            rows={3}
                                            className="border-2 border-rose-600 text-sm resize-none"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            id={`edit-public-${volunteer.id}`}
                                            checked={editingData.is_public}
                                            onChange={(e) => setEditingData({ ...editingData, is_public: e.target.checked })}
                                            className="w-4 h-4"
                                          />
                                          <Label htmlFor={`edit-public-${volunteer.id}`} className="text-xs font-semibold cursor-pointer">
                                            Visível publicamente
                                          </Label>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 justify-end pt-2 border-t">
                                        <Button size="sm" onClick={saveEdit} disabled={saving} className="bg-emerald-600">
                                          <Check className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                // VIEW MODE
                                <>
                                  <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{volunteer.title}</div>
                                    {volunteer._description && (
                                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{volunteer._description}</p>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    {volunteer.institution_name && (
                                      <div>
                                        <div className="font-medium text-slate-700">{volunteer.institution_name}</div>
                                        {volunteer.institution_link && (
                                          <a href={volunteer.institution_link} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-600 hover:underline flex items-center gap-1 mt-1">
                                            <ExternalLink className="w-3 h-3" />
                                            Website
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-slate-600">{formatDate(volunteer.date)}</div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    {volunteer.is_public ? (
                                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Sim</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-slate-600">Não</Badge>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditing(volunteer)}
                                        className="text-blue-600 hover:bg-blue-50"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(volunteer.id)}
                                        className="text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add New Volunteer Form */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600" />
                <CardHeader className="bg-gradient-to-br from-rose-50 via-rose-50 to-rose-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-rose-900 mb-2">
                        Novo Voluntariado
                      </CardTitle>
                      <CardDescription className="text-rose-700 text-base">
                        Adiciona uma nova experiência de voluntariado
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Título *</Label>
                      <Input
                        value={newVolunteer.title}
                        onChange={(e) => setNewVolunteer(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: EIA Volunteer"
                        className="h-11 border-2 border-slate-300 focus:border-rose-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-600" />
                        Data
                      </Label>
                      <Input
                        type="date"
                        value={newVolunteer.date}
                        onChange={(e) => setNewVolunteer(prev => ({ ...prev, date: e.target.value }))}
                        className="h-11 border-2 border-slate-300 focus:border-rose-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Building className="w-4 h-4 text-rose-600" />
                        Instituição
                      </Label>
                      <Input
                        value={newVolunteer.institution_name}
                        onChange={(e) => setNewVolunteer(prev => ({ ...prev, institution_name: e.target.value }))}
                        placeholder="Nome da organização"
                        className="h-11 border-2 border-slate-300 focus:border-rose-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-rose-600" />
                        Link Instituição
                      </Label>
                      <Input
                        value={newVolunteer.institution_link}
                        onChange={(e) => setNewVolunteer(prev => ({ ...prev, institution_link: e.target.value }))}
                        placeholder="https://..."
                        className="h-11 border-2 border-slate-300 focus:border-rose-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-rose-600" />
                        Imagem
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploadingImage}
                        className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-rose-50 file:text-rose-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Logo Instituição</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, false)}
                        disabled={uploadingLogo}
                        className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-rose-50 file:text-rose-700"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Award className="w-4 h-4 text-rose-600" />
                        Certificado (PDF ou Imagem)
                      </Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => handleCertUpload(e, false)}
                        disabled={uploadingCertificate}
                        className="h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-rose-50 file:text-rose-700"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold">Descrição</Label>
                      <Textarea
                        value={newVolunteer._description}
                        onChange={(e) => setNewVolunteer(prev => ({ ...prev, _description: e.target.value }))}
                        placeholder="Descreve a experiência de voluntariado..."
                        rows={4}
                        className="border-2 border-slate-300 focus:border-rose-600 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        type="checkbox"
                        id="public"
                        checked={newVolunteer.is_public}
                        onChange={(e) => setNewVolunteer(prev => ({ ...prev, is_public: e.target.checked }))}
                        className="w-5 h-5"
                      />
                      <Label htmlFor="public" className="text-sm font-semibold cursor-pointer">
                        Visível publicamente
                      </Label>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button
                      onClick={handleAddVolunteer}
                      disabled={saving || uploadingImage || uploadingLogo || uploadingCertificate}
                      className="h-12 px-8 bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-800 hover:to-rose-900 group"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Voluntariado
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Book Project */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                <CardHeader className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 pt-8 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
                          Projeto do Livro
                        </CardTitle>
                        <CardDescription className="text-purple-700 text-base">
                          Projeto social de matriz educativa e cultural
                        </CardDescription>
                      </div>
                    </div>
                    {!editingBook && bookProject && (
                      <Button
                        variant="ghost"
                        onClick={() => setEditingBook(true)}
                        className="text-purple-900 hover:bg-purple-200"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  {editingBook ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Título *</Label>
                        <Input
                          value={bookData.title}
                          onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                          className="h-11 border-2 border-purple-600"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Descrição</Label>
                        <Textarea
                          value={bookData._description}
                          onChange={(e) => setBookData({ ...bookData, _description: e.target.value })}
                          rows={6}
                          placeholder="Descrição detalhada do projeto..."
                          className="border-2 border-purple-600 resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="book-public"
                          checked={bookData.is_public}
                          onChange={(e) => setBookData({ ...bookData, is_public: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <Label htmlFor="book-public" className="text-sm font-semibold cursor-pointer">
                          Visível publicamente
                        </Label>
                      </div>
                      <div className="flex gap-2 justify-end pt-4 border-t-2 border-slate-200">
                        <Button onClick={saveBookProject} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                          <Check className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingBook(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : bookProject ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{bookProject.title}</h3>
                        <Badge className={bookProject.is_public ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600'}>
                          {bookProject.is_public ? 'Público' : 'Privado'}
                        </Badge>
                      </div>
                      {bookProject._description && (
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{bookProject._description}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 mb-4">Nenhum projeto configurado.</p>
                      <Button onClick={() => setEditingBook(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Projeto
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

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
