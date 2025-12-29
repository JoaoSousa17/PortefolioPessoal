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
  Award, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  GraduationCap,
  Calendar,
  Star,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type Course = {
  id: string
  title: string
  college_name: string
  description: string | null
  importance: 'high' | 'medium' | 'low' | null
  certificate_url: string | null
  college_logo: string | null
  featured: boolean
  completion_date: string | null
  created_at: string
}

type EditingCourse = {
  id: string
  title: string
  college_name: string
  description: string
  importance: 'high' | 'medium' | 'low' | null
  certificate_url: string
  college_logo: string
  featured: boolean
  completion_date: string
}

export default function CoursesManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCertificate, setUploadingCertificate] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingCourse | null>(null)
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null)
  const [editingCertificateFile, setEditingCertificateFile] = useState<File | null>(null)
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null)
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    college_name: '',
    description: '',
    importance: 'medium' as 'high' | 'medium' | 'low',
    certificate_url: '',
    college_logo: '',
    featured: false,
    completion_date: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)

  const importanceLevels = [
    { value: 'high', label: 'Alta Relevância', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'medium', label: 'Média Relevância', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'low', label: 'Baixa Relevância', color: 'bg-slate-100 text-slate-800 border-slate-300' }
  ]

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
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('completion_date', { ascending: false, nullsFirst: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingCertificate(true)
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Por favor seleciona um PDF ou imagem válida (JPG, PNG, WEBP)')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `certificate_${timestamp}_${randomString}.${extension}`
      
      setCertificateFile(file)
      
      const certificatePath = `/certificates/${newFileName}`
      setNewCourse(prev => ({
        ...prev,
        certificate_url: certificatePath
      }))
      
      setSuccessMessage('Certificado selecionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting certificate:', error)
      setErrorMessage('Erro ao selecionar certificado')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleEditCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingData) return

    try {
      setUploadingCertificate(true)
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Por favor seleciona um PDF ou imagem válida (JPG, PNG, WEBP)')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `certificate_${timestamp}_${randomString}.${extension}`
      
      setEditingCertificateFile(file)
      
      const certificatePath = `/certificates/${newFileName}`
      setEditingData({
        ...editingData,
        certificate_url: certificatePath
      })
      
      setSuccessMessage('Certificado selecionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting certificate:', error)
      setErrorMessage('Erro ao selecionar certificado')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingCertificate(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const newFileName = `course_logo_${timestamp}_${randomString}.${extension}`
      
      setLogoFile(file)
      
      const logoPath = `/logo_skills/${newFileName}`
      setNewCourse(prev => ({
        ...prev,
        college_logo: logoPath
      }))
      
      setSuccessMessage('Logo selecionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting logo:', error)
      setErrorMessage('Erro ao selecionar logo')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleEditLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingData) return

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
      const newFileName = `course_logo_${timestamp}_${randomString}.${extension}`
      
      setEditingLogoFile(file)
      
      const logoPath = `/logo_skills/${newFileName}`
      setEditingData({
        ...editingData,
        college_logo: logoPath
      })
      
      setSuccessMessage('Logo selecionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting logo:', error)
      setErrorMessage('Erro ao selecionar logo')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleAddCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.college_name.trim()) {
      setErrorMessage('Título e nome da instituição são obrigatórios')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('courses')
        .insert([{
          title: newCourse.title,
          college_name: newCourse.college_name,
          description: newCourse.description || null,
          importance: newCourse.importance,
          certificate_url: newCourse.certificate_url || null,
          college_logo: newCourse.college_logo || null,
          featured: newCourse.featured,
          completion_date: newCourse.completion_date || null
        }])

      if (error) throw error

      setSuccessMessage('Curso adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setNewCourse({
        title: '',
        college_name: '',
        description: '',
        importance: 'medium',
        certificate_url: '',
        college_logo: '',
        featured: false,
        completion_date: ''
      })
      setLogoFile(null)
      setCertificateFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error adding course:', error)
      setErrorMessage('Erro ao adicionar curso. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (course: Course) => {
    setEditingId(course.id)
    setEditingData({
      id: course.id,
      title: course.title,
      college_name: course.college_name,
      description: course.description || '',
      importance: course.importance,
      certificate_url: course.certificate_url || '',
      college_logo: course.college_logo || '',
      featured: course.featured,
      completion_date: course.completion_date || ''
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
    setEditingLogoFile(null)
    setEditingCertificateFile(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData.title.trim() || !editingData.college_name.trim()) {
      setErrorMessage('Título e nome da instituição são obrigatórios')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('courses')
        .update({
          title: editingData.title,
          college_name: editingData.college_name,
          description: editingData.description || null,
          importance: editingData.importance,
          certificate_url: editingData.certificate_url || null,
          college_logo: editingData.college_logo || null,
          featured: editingData.featured,
          completion_date: editingData.completion_date || null
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Curso atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      setEditingLogoFile(null)
      setEditingCertificateFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error updating course:', error)
      setErrorMessage('Erro ao atualizar curso. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este curso?')) return

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Curso eliminado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error deleting course:', error)
      setErrorMessage('Erro ao eliminar curso')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const getImportanceBadge = (importance: 'high' | 'medium' | 'low' | null) => {
    const level = importanceLevels.find(l => l.value === importance)
    return level || { label: '-', color: 'bg-slate-100 text-slate-600' }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isCertificatePDF = (url: string | null) => {
    if (!url) return false
    return url.toLowerCase().endsWith('.pdf')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingCertificate(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-slate-200 bg-gradient-to-r from-orange-50 to-orange-100">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Award className="w-7 h-7 text-orange-600" />
                Certificado
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingCertificate(null)}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full w-10 h-10 p-0"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-88px)]">
              {isCertificatePDF(viewingCertificate) ? (
                <iframe
                  src={viewingCertificate}
                  className="w-full h-[70vh] rounded-lg border-2 border-slate-300"
                  title="Certificate PDF"
                />
              ) : (
                <img 
                  src={viewingCertificate} 
                  alt="Certificate" 
                  className="w-full h-auto rounded-lg border-2 border-slate-300"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-orange-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-orange-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-xl">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Cursos
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {courses.length} curso{courses.length !== 1 ? 's' : ''} • {courses.filter(c => c.featured).length} em destaque
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
              
              {/* Courses List */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Cursos Existentes
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Edita inline ou elimina cursos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {courses.length === 0 ? (
                    <div className="p-12 text-center">
                      <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhum curso adicionado ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Logo</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Curso</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Instituição</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Importância</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Data</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Destaque</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {courses.map((course, index) => (
                            <tr 
                              key={course.id} 
                              className="hover:bg-slate-50 transition-colors"
                              style={{ 
                                animation: 'fadeIn 0.3s ease-in',
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                              {editingId === course.id && editingData ? (
                                // EDITING MODE
                                <>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2">
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditLogoUpload}
                                        disabled={uploadingLogo}
                                        className="h-10 border-2 border-orange-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700"
                                      />
                                      {editingData.college_logo && (
                                        <img 
                                          src={editingData.college_logo} 
                                          alt="Logo" 
                                          className="w-12 h-12 object-contain rounded border-2 border-orange-300"
                                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                                        />
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Input
                                      value={editingData.title}
                                      onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                                      className="h-10 border-2 border-orange-600 rounded-lg font-semibold mb-2"
                                      placeholder="Título do curso"
                                      autoFocus
                                    />
                                    <Textarea
                                      value={editingData.description}
                                      onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                                      rows={2}
                                      placeholder="Descrição..."
                                      className="border-2 border-orange-600 rounded-lg text-sm resize-none"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <Input
                                      value={editingData.college_name}
                                      onChange={(e) => setEditingData({ ...editingData, college_name: e.target.value })}
                                      className="h-10 border-2 border-orange-600 rounded-lg mb-2"
                                      placeholder="Nome da instituição"
                                    />
                                    <div className="space-y-2">
                                      <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        onChange={handleEditCertificateUpload}
                                        disabled={uploadingCertificate}
                                        className="h-10 border-2 border-orange-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700"
                                      />
                                      {editingData.certificate_url && (
                                        <div className="flex items-center gap-2">
                                          <Award className="w-4 h-4 text-orange-600" />
                                          <span className="text-xs text-orange-700 font-medium truncate">
                                            {editingData.certificate_url.split('/').pop()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={editingData.importance || ''}
                                      onChange={(e) => setEditingData({ ...editingData, importance: e.target.value as any })}
                                      className="w-full h-10 border-2 border-orange-600 rounded-lg px-2 text-sm bg-white"
                                    >
                                      {importanceLevels.map(level => (
                                        <option key={level.value} value={level.value}>{level.label}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Input
                                      type="date"
                                      value={editingData.completion_date}
                                      onChange={(e) => setEditingData({ ...editingData, completion_date: e.target.value })}
                                      className="h-10 border-2 border-orange-600 rounded-lg text-sm"
                                    />
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={editingData.featured}
                                      onChange={(e) => setEditingData({ ...editingData, featured: e.target.checked })}
                                      className="w-5 h-5 text-orange-600 border-2 border-orange-400 rounded"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={saveEdit}
                                        disabled={saving}
                                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={cancelEditing}
                                        className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                // VIEW MODE
                                <>
                                  <td className="px-6 py-4">
                                    {course.college_logo ? (
                                      <img 
                                        src={course.college_logo} 
                                        alt={course.college_name} 
                                        className="w-12 h-12 object-contain rounded border border-slate-300"
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-slate-400" />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div>
                                      <p className="font-bold text-slate-900 mb-1">{course.title}</p>
                                      {course.description && (
                                        <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div>
                                      <p className="font-semibold text-slate-700 mb-1">{course.college_name}</p>
                                      {course.certificate_url && (
                                        <button
                                          onClick={() => setViewingCertificate(course.certificate_url)}
                                          className="text-orange-600 hover:text-orange-800 text-xs flex items-center gap-1 font-semibold hover:underline"
                                        >
                                          <Award className="w-3 h-3" />
                                          Ver Certificado
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`${getImportanceBadge(course.importance).color} border font-semibold text-xs`}>
                                      {getImportanceBadge(course.importance).label}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(course.completion_date)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    {course.featured && (
                                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto" />
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditing(course)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(course.id)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
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

              {/* Add New Course Form */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
                <CardHeader className="bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-orange-900 mb-2">
                        Novo Curso
                      </CardTitle>
                      <CardDescription className="text-orange-700 text-base">
                        Adiciona um novo curso ou certificação
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Title */}
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="title" className="text-slate-900 font-semibold text-sm">
                        Título do Curso *
                      </Label>
                      <Input
                        id="title"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Introduction to AI Agents"
                        className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                      />
                    </div>

                    {/* Importance */}
                    <div className="space-y-2">
                      <Label htmlFor="importance" className="text-slate-900 font-semibold text-sm">
                        Importância
                      </Label>
                      <select
                        id="importance"
                        value={newCourse.importance}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, importance: e.target.value as any }))}
                        className="w-full h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg px-3 text-sm bg-white"
                      >
                        {importanceLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* College Name */}
                    <div className="space-y-2">
                      <Label htmlFor="college_name" className="text-slate-900 font-semibold text-sm">
                        Instituição *
                      </Label>
                      <Input
                        id="college_name"
                        value={newCourse.college_name}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, college_name: e.target.value }))}
                        placeholder="Ex: DataCamp"
                        className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                      />
                    </div>

                    {/* Completion Date */}
                    <div className="space-y-2">
                      <Label htmlFor="completion_date" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        Data de Conclusão
                      </Label>
                      <Input
                        id="completion_date"
                        type="date"
                        value={newCourse.completion_date}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, completion_date: e.target.value }))}
                        className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                      />
                    </div>

                    {/* Featured */}
                    <div className="space-y-2 flex items-end">
                      <div className="flex items-center gap-3 h-11">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={newCourse.featured}
                          onChange={(e) => setNewCourse(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-5 h-5 text-orange-600 border-2 border-slate-300 rounded"
                        />
                        <Label htmlFor="featured" className="text-slate-900 font-semibold text-sm cursor-pointer flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          Em Destaque
                        </Label>
                      </div>
                    </div>

                    {/* Certificate Upload */}
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="certificate" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange-600" />
                        Certificado (PDF ou Imagem)
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="certificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={handleCertificateUpload}
                          disabled={uploadingCertificate}
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        {newCourse.certificate_url && (
                          <div className="flex items-center gap-2 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                            <Award className="w-5 h-5 text-orange-600 flex-shrink-0" />
                            <span className="text-sm text-orange-700 font-medium truncate">
                              {newCourse.certificate_url.split('/').pop()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="space-y-2">
                      <Label htmlFor="logo" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-600" />
                        Logo da Instituição
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        {newCourse.college_logo && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={newCourse.college_logo} 
                              alt="Logo preview" 
                              className="w-8 h-8 object-contain rounded border-2 border-orange-300"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <span className="text-xs text-orange-700 font-medium">{newCourse.college_logo.split('/').pop()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 lg:col-span-3">
                      <Label htmlFor="description" className="text-slate-900 font-semibold text-sm">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={newCourse.description}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do curso..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-orange-600 rounded-lg resize-none"
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button
                      onClick={handleAddCourse}
                      disabled={saving || uploadingLogo || uploadingCertificate}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Curso
                        </>
                      )}
                    </Button>
                  </div>
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
    </>
  )
}
