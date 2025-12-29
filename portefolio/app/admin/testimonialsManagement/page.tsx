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
  MessageSquareQuote, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  User,
  Briefcase
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type Testimonial = {
  id: string
  author_name: string
  role: string
  image_url: string | null
  content: string
  order: number
  visible: boolean
}

type EditingTestimonial = {
  id: string
  author_name: string
  role: string
  image_url: string
  content: string
  visible: boolean
}

export default function TestimonialsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingTestimonial | null>(null)
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)
  
  const [newTestimonial, setNewTestimonial] = useState({
    author_name: '',
    role: '',
    image_url: '',
    content: '',
    visible: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

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
        .from('testimonials')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const newFileName = `testimonial_${timestamp}_${randomString}.${extension}`
      
      setImageFile(file)
      
      const imagePath = `/images/${newFileName}`
      setNewTestimonial(prev => ({
        ...prev,
        image_url: imagePath
      }))
      
      setSuccessMessage('Imagem selecionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Error selecting image:', error)
      setErrorMessage('Erro ao selecionar imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingData) return

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
      const newFileName = `testimonial_${timestamp}_${randomString}.${extension}`
      
      setEditingImageFile(file)
      
      const imagePath = `/images/${newFileName}`
      setEditingData({
        ...editingData,
        image_url: imagePath
      })
      
      setSuccessMessage('Imagem selecionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 2000)
    } catch (error) {
      console.error('Error selecting image:', error)
      setErrorMessage('Erro ao selecionar imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddTestimonial = async () => {
    if (!newTestimonial.author_name.trim() || !newTestimonial.content.trim()) {
      setErrorMessage('Nome e conteúdo são obrigatórios')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      // Get max order
      const maxOrder = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.order)) : 0

      const { error } = await supabase
        .from('testimonials')
        .insert([{
          author_name: newTestimonial.author_name,
          role: newTestimonial.role || null,
          image_url: newTestimonial.image_url || null,
          content: newTestimonial.content,
          order: maxOrder + 1,
          visible: newTestimonial.visible
        }])

      if (error) throw error

      setSuccessMessage('Testemunho adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setNewTestimonial({
        author_name: '',
        role: '',
        image_url: '',
        content: '',
        visible: true
      })
      setImageFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error adding testimonial:', error)
      setErrorMessage('Erro ao adicionar testemunho')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setEditingData({
      id: testimonial.id,
      author_name: testimonial.author_name,
      role: testimonial.role,
      image_url: testimonial.image_url || '',
      content: testimonial.content,
      visible: testimonial.visible
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
    setEditingImageFile(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData.author_name.trim() || !editingData.content.trim()) {
      setErrorMessage('Nome e conteúdo são obrigatórios')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('testimonials')
        .update({
          author_name: editingData.author_name,
          role: editingData.role || null,
          image_url: editingData.image_url || null,
          content: editingData.content,
          visible: editingData.visible
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Testemunho atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      setEditingImageFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error updating testimonial:', error)
      setErrorMessage('Erro ao atualizar testemunho')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este testemunho?')) return

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Testemunho eliminado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      setErrorMessage('Erro ao eliminar testemunho')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ visible: !currentVisibility })
        .eq('id', id)

      if (error) throw error

      setSuccessMessage(`Testemunho ${!currentVisibility ? 'visível' : 'ocultado'}!`)
      setTimeout(() => setSuccessMessage(''), 2000)
      fetchData()
    } catch (error) {
      console.error('Error toggling visibility:', error)
      setErrorMessage('Erro ao alterar visibilidade')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const moveTestimonial = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === testimonials.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newTestimonials = [...testimonials]
    const [moved] = newTestimonials.splice(index, 1)
    newTestimonials.splice(newIndex, 0, moved)

    const updates = newTestimonials.map((testimonial, idx) => ({
      id: testimonial.id,
      order: idx + 1
    }))

    try {
      for (const update of updates) {
        await supabase
          .from('testimonials')
          .update({ order: update.order })
          .eq('id', update.id)
      }

      setSuccessMessage('Ordem atualizada!')
      setTimeout(() => setSuccessMessage(''), 2000)
      fetchData()
    } catch (error) {
      console.error('Error updating order:', error)
      setErrorMessage('Erro ao atualizar ordem')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar testemunhos...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-teal-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-teal-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-xl">
                <MessageSquareQuote className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Testemunhos
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {testimonials.length} testemunho{testimonials.length !== 1 ? 's' : ''} • {testimonials.filter(t => t.visible).length} visíve{testimonials.filter(t => t.visible).length !== 1 ? 'is' : 'l'}
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
              
              {/* Testimonials List */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <MessageSquareQuote className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Testemunhos Existentes
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Reordena, edita ou elimina testemunhos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {testimonials.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageSquareQuote className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhum testemunho adicionado ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {testimonials.map((testimonial, index) => (
                        <div
                          key={testimonial.id}
                          className={`hover:bg-slate-50 transition-colors ${!testimonial.visible ? 'opacity-60' : ''}`}
                          style={{
                            animation: 'fadeIn 0.3s ease-in',
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'backwards'
                          }}
                        >
                          {editingId === testimonial.id && editingData ? (
                            // EDITING MODE
                            <div className="p-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <User className="w-4 h-4 text-teal-600" />
                                    Nome do Autor *
                                  </Label>
                                  <Input
                                    value={editingData.author_name}
                                    onChange={(e) => setEditingData({ ...editingData, author_name: e.target.value })}
                                    className="h-10 border-2 border-teal-600 rounded-lg font-semibold"
                                    autoFocus
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-teal-600" />
                                    Cargo/Função
                                  </Label>
                                  <Input
                                    value={editingData.role}
                                    onChange={(e) => setEditingData({ ...editingData, role: e.target.value })}
                                    className="h-10 border-2 border-teal-600 rounded-lg"
                                  />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm">
                                    Imagem
                                  </Label>
                                  <div className="space-y-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleEditImageUpload}
                                      disabled={uploadingImage}
                                      className="h-10 border-2 border-teal-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700"
                                    />
                                    {editingData.image_url && (
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={editingData.image_url}
                                          alt="Preview"
                                          className="w-16 h-16 rounded-full object-cover border-2 border-teal-300"
                                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                                        />
                                        <span className="text-xs text-teal-700 font-medium">{editingData.image_url.split('/').pop()}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm">
                                    Conteúdo do Testemunho *
                                  </Label>
                                  <Textarea
                                    value={editingData.content}
                                    onChange={(e) => setEditingData({ ...editingData, content: e.target.value })}
                                    rows={4}
                                    className="border-2 border-teal-600 rounded-lg resize-none"
                                  />
                                </div>

                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    id={`edit-visible-${testimonial.id}`}
                                    checked={editingData.visible}
                                    onChange={(e) => setEditingData({ ...editingData, visible: e.target.checked })}
                                    className="w-5 h-5 text-teal-600"
                                  />
                                  <Label htmlFor={`edit-visible-${testimonial.id}`} className="text-slate-900 font-semibold text-sm cursor-pointer">
                                    Visível no site
                                  </Label>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-slate-200">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={saveEdit}
                                  disabled={saving}
                                  className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Guardar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelEditing}
                                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // VIEW MODE
                            <div className="p-6">
                              <div className="flex items-start gap-6">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                  {testimonial.image_url ? (
                                    <img
                                      src={testimonial.image_url}
                                      alt={testimonial.author_name}
                                      className="w-16 h-16 rounded-full object-cover border-2 border-teal-300"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center border-2 border-teal-300">
                                      <User className="w-8 h-8 text-teal-600" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                  <div className="mb-3">
                                    <h3 className="text-lg font-bold text-slate-900">{testimonial.author_name}</h3>
                                    {testimonial.role && (
                                      <p className="text-sm text-slate-600 font-medium">{testimonial.role}</p>
                                    )}
                                  </div>
                                  <p className="text-slate-700 leading-relaxed italic">
                                    "{testimonial.content}"
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* Visibility */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleVisibility(testimonial.id, testimonial.visible)}
                                    className={testimonial.visible ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}
                                  >
                                    {testimonial.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>

                                  {/* Order */}
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveTestimonial(index, 'up')}
                                      disabled={index === 0}
                                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 p-0"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveTestimonial(index, 'down')}
                                      disabled={index === testimonials.length - 1}
                                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 p-0"
                                    >
                                      <ArrowDown className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* Edit/Delete */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditing(testimonial)}
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(testimonial.id)}
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add New Testimonial Form */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600" />
                <CardHeader className="bg-gradient-to-br from-teal-50 via-teal-50 to-teal-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-teal-900 mb-2">
                        Novo Testemunho
                      </CardTitle>
                      <CardDescription className="text-teal-700 text-base">
                        Adiciona um novo testemunho ao portfólio
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" />
                        Nome do Autor *
                      </Label>
                      <Input
                        id="name"
                        value={newTestimonial.author_name}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, author_name: e.target.value }))}
                        placeholder="Ex: Pedro Almeida"
                        className="h-11 border-2 border-slate-300 focus:border-teal-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-teal-600" />
                        Cargo/Função
                      </Label>
                      <Input
                        id="role"
                        value={newTestimonial.role}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Ex: Software Engineer"
                        className="h-11 border-2 border-slate-300 focus:border-teal-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="image" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" />
                        Imagem do Autor
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="h-11 border-2 border-slate-300 focus:border-teal-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        />
                        {newTestimonial.image_url && (
                          <div className="flex items-center gap-3 p-3 bg-teal-50 border-2 border-teal-200 rounded-lg">
                            <img
                              src={newTestimonial.image_url}
                              alt="Preview"
                              className="w-16 h-16 rounded-full object-cover border-2 border-teal-300"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <span className="text-sm text-teal-700 font-medium">{newTestimonial.image_url.split('/').pop()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="content" className="text-slate-900 font-semibold text-sm">
                        Conteúdo do Testemunho *
                      </Label>
                      <Textarea
                        id="content"
                        value={newTestimonial.content}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="O testemunho..."
                        rows={4}
                        className="border-2 border-slate-300 focus:border-teal-600 rounded-lg resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        type="checkbox"
                        id="visible"
                        checked={newTestimonial.visible}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, visible: e.target.checked }))}
                        className="w-5 h-5 text-teal-600"
                      />
                      <Label htmlFor="visible" className="text-slate-900 font-semibold text-sm cursor-pointer">
                        Visível no site
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button
                      onClick={handleAddTestimonial}
                      disabled={saving || uploadingImage}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Testemunho
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
  )
}
