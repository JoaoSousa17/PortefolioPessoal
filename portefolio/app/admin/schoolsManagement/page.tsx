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
  GraduationCap, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Image as ImageIcon,
  BookOpen,
  Lightbulb
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type School = {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  learnings: string | null
  order: number
  created_at: string
}

type EditingSchool = {
  id: string
  name: string
  logo_url: string
  website: string
  description: string
  learnings: string
  order: number
}

export default function SchoolsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingSchool | null>(null)
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null)
  
  const [newSchool, setNewSchool] = useState({
    name: '',
    logo_url: '',
    website: '',
    description: '',
    learnings: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)

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
        .from('schools')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error
      setSchools(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
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
      const newFileName = `school_logo_${timestamp}_${randomString}.${extension}`
      
      setLogoFile(file)
      
      const logoPath = `/logo_skills/${newFileName}`
      setNewSchool(prev => ({
        ...prev,
        logo_url: logoPath
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
      const newFileName = `school_logo_${timestamp}_${randomString}.${extension}`
      
      setEditingLogoFile(file)
      
      const logoPath = `/logo_skills/${newFileName}`
      setEditingData({
        ...editingData,
        logo_url: logoPath
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

  const handleAddSchool = async () => {
    if (!newSchool.name.trim()) {
      setErrorMessage('O nome da instituição é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      // Get max order and add 1
      const maxOrder = schools.length > 0 ? Math.max(...schools.map(s => s.order)) : 0

      const { error } = await supabase
        .from('schools')
        .insert([{
          name: newSchool.name,
          logo_url: newSchool.logo_url || null,
          website: newSchool.website || null,
          description: newSchool.description || null,
          learnings: newSchool.learnings || null,
          order: maxOrder + 1
        }])

      if (error) throw error

      setSuccessMessage('Escola adicionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setNewSchool({
        name: '',
        logo_url: '',
        website: '',
        description: '',
        learnings: ''
      })
      setLogoFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error adding school:', error)
      setErrorMessage('Erro ao adicionar escola. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (school: School) => {
    setEditingId(school.id)
    setEditingData({
      id: school.id,
      name: school.name,
      logo_url: school.logo_url || '',
      website: school.website || '',
      description: school.description || '',
      learnings: school.learnings || '',
      order: school.order
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
    setEditingLogoFile(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData.name.trim()) {
      setErrorMessage('O nome da instituição é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('schools')
        .update({
          name: editingData.name,
          logo_url: editingData.logo_url || null,
          website: editingData.website || null,
          description: editingData.description || null,
          learnings: editingData.learnings || null
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Escola atualizada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      setEditingLogoFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error updating school:', error)
      setErrorMessage('Erro ao atualizar escola. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta escola?')) return

    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Escola eliminada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error deleting school:', error)
      setErrorMessage('Erro ao eliminar escola')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const moveSchool = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === schools.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newSchools = [...schools]
    const [movedSchool] = newSchools.splice(index, 1)
    newSchools.splice(newIndex, 0, movedSchool)

    // Update order values
    const updates = newSchools.map((school, idx) => ({
      id: school.id,
      order: idx + 1
    }))

    try {
      // Update all orders in database
      for (const update of updates) {
        await supabase
          .from('schools')
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
          <Loader2 className="w-12 h-12 text-indigo-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar escolas...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-indigo-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Escolas
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {schools.length} instituiç{schools.length !== 1 ? 'ões' : 'ão'}
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
              
              {/* Schools List */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Instituições Existentes
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Edita inline, reordena ou elimina escolas
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {schools.length === 0 ? (
                    <div className="p-12 text-center">
                      <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhuma escola adicionada ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {schools.map((school, index) => (
                        <div
                          key={school.id}
                          className="hover:bg-slate-50 transition-colors"
                          style={{
                            animation: 'fadeIn 0.3s ease-in',
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'backwards'
                          }}
                        >
                          {editingId === school.id && editingData ? (
                            // EDITING MODE
                            <div className="p-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Logo Upload */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                                    Logo
                                  </Label>
                                  <div className="space-y-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleEditLogoUpload}
                                      disabled={uploadingLogo}
                                      className="h-10 border-2 border-indigo-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                                    />
                                    {editingData.logo_url && (
                                      <img
                                        src={editingData.logo_url}
                                        alt="Logo"
                                        className="w-16 h-16 object-contain rounded border-2 border-indigo-300"
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm">
                                    Nome *
                                  </Label>
                                  <Input
                                    value={editingData.name}
                                    onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                                    className="h-10 border-2 border-indigo-600 rounded-lg font-semibold"
                                    autoFocus
                                  />
                                </div>

                                {/* Website */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-indigo-600" />
                                    Website
                                  </Label>
                                  <Input
                                    value={editingData.website}
                                    onChange={(e) => setEditingData({ ...editingData, website: e.target.value })}
                                    placeholder="https://..."
                                    className="h-10 border-2 border-indigo-600 rounded-lg"
                                  />
                                </div>

                                {/* Description */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    Descrição
                                  </Label>
                                  <Textarea
                                    value={editingData.description}
                                    onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Sobre a instituição..."
                                    className="border-2 border-indigo-600 rounded-lg resize-none"
                                  />
                                </div>

                                {/* Learnings */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                                    Aprendizagens
                                  </Label>
                                  <Textarea
                                    value={editingData.learnings}
                                    onChange={(e) => setEditingData({ ...editingData, learnings: e.target.value })}
                                    rows={3}
                                    placeholder="O que aprendeste nesta instituição..."
                                    className="border-2 border-indigo-600 rounded-lg resize-none"
                                  />
                                </div>
                              </div>

                              {/* Actions */}
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
                                {/* Logo */}
                                <div className="flex-shrink-0">
                                  {school.logo_url ? (
                                    <img
                                      src={school.logo_url}
                                      alt={school.name}
                                      className="w-16 h-16 object-contain rounded border-2 border-slate-300"
                                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center border-2 border-slate-300">
                                      <GraduationCap className="w-8 h-8 text-slate-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                  <h3 className="text-xl font-bold text-slate-900 mb-2">{school.name}</h3>
                                  
                                  {school.website && (
                                    <a
                                      href={school.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-3"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Website
                                    </a>
                                  )}

                                  {school.description && (
                                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                      <span className="font-semibold text-slate-700">Sobre:</span> {school.description}
                                    </p>
                                  )}

                                  {school.learnings && (
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                      <span className="font-semibold text-slate-700">Aprendizagens:</span> {school.learnings}
                                    </p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* Order buttons */}
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveSchool(index, 'up')}
                                      disabled={index === 0}
                                      className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-8 w-8 p-0"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => moveSchool(index, 'down')}
                                      disabled={index === schools.length - 1}
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
                                      onClick={() => startEditing(school)}
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(school.id)}
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

              {/* Add New School Form */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600" />
                <CardHeader className="bg-gradient-to-br from-indigo-50 via-indigo-50 to-indigo-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-indigo-900 mb-2">
                        Nova Escola
                      </CardTitle>
                      <CardDescription className="text-indigo-700 text-base">
                        Adiciona uma nova instituição à timeline
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name" className="text-slate-900 font-semibold text-sm">
                        Nome da Instituição *
                      </Label>
                      <Input
                        id="name"
                        value={newSchool.name}
                        onChange={(e) => setNewSchool(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Universidade do Porto"
                        className="h-11 border-2 border-slate-300 focus:border-indigo-600 rounded-lg"
                      />
                    </div>

                    {/* Logo */}
                    <div className="space-y-2">
                      <Label htmlFor="logo" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        Logo
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="h-11 border-2 border-slate-300 focus:border-indigo-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {newSchool.logo_url && (
                          <div className="flex items-center gap-2">
                            <img
                              src={newSchool.logo_url}
                              alt="Logo preview"
                              className="w-12 h-12 object-contain rounded border-2 border-indigo-300"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <span className="text-xs text-indigo-700 font-medium">{newSchool.logo_url.split('/').pop()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={newSchool.website}
                        onChange={(e) => setNewSchool(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://..."
                        className="h-11 border-2 border-slate-300 focus:border-indigo-600 rounded-lg"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={newSchool.description}
                        onChange={(e) => setNewSchool(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Sobre a instituição..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-indigo-600 rounded-lg resize-none"
                      />
                    </div>

                    {/* Learnings */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="learnings" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                        Aprendizagens
                      </Label>
                      <Textarea
                        id="learnings"
                        value={newSchool.learnings}
                        onChange={(e) => setNewSchool(prev => ({ ...prev, learnings: e.target.value }))}
                        placeholder="O que aprendeste nesta instituição..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-indigo-600 rounded-lg resize-none"
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button
                      onClick={handleAddSchool}
                      disabled={saving || uploadingLogo}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Escola
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
