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
  Radar, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type TechRadarItem = {
  id: string
  _name: string
  image_url: string | null
  category: 'learn' | 'using' | 'explore' | null
  notes: string | null
  urll: string | null
  is_valid: boolean
}

type EditingTechRadar = {
  id: string
  _name: string
  image_url: string
  category: 'learn' | 'using' | 'explore' | null
  notes: string
  urll: string
}

export default function TechRadarManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [techItems, setTechItems] = useState<TechRadarItem[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingTechRadar | null>(null)
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null)
  
  const [newItem, setNewItem] = useState({
    _name: '',
    image_url: '',
    category: 'learn' as 'learn' | 'using' | 'explore',
    notes: '',
    urll: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const categories = [
    { value: 'learn', label: 'Learning', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'using', label: 'Using', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'explore', label: 'Exploring', color: 'bg-red-100 text-red-800 border-red-300' }
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
        .from('tech_radar')
        .select('*')
        .order('_name', { ascending: true })

      if (error) throw error
      setTechItems(data || [])
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
      const newFileName = `tech_${timestamp}_${randomString}.${extension}`
      
      setImageFile(file)
      
      const imagePath = `/logo_skills/${newFileName}`
      setNewItem(prev => ({
        ...prev,
        image_url: imagePath
      }))
      
      setSuccessMessage('Imagem selecionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
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
      const newFileName = `tech_${timestamp}_${randomString}.${extension}`
      
      setEditingImageFile(file)
      
      const imagePath = `/logo_skills/${newFileName}`
      setEditingData({
        ...editingData,
        image_url: imagePath
      })
      
      setSuccessMessage('Imagem selecionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting image:', error)
      setErrorMessage('Erro ao selecionar imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem._name.trim()) {
      setErrorMessage('O nome é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('tech_radar')
        .insert([{
          _name: newItem._name,
          image_url: newItem.image_url || null,
          category: newItem.category,
          notes: newItem.notes || null,
          urll: newItem.urll || null,
          is_valid: true
        }])

      if (error) throw error

      setSuccessMessage('Tecnologia adicionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setNewItem({
        _name: '',
        image_url: '',
        category: 'learn',
        notes: '',
        urll: ''
      })
      setImageFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error adding item:', error)
      setErrorMessage('Erro ao adicionar tecnologia. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (item: TechRadarItem) => {
    setEditingId(item.id)
    setEditingData({
      id: item.id,
      _name: item._name,
      image_url: item.image_url || '',
      category: item.category,
      notes: item.notes || '',
      urll: item.urll || ''
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
    setEditingImageFile(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData._name.trim()) {
      setErrorMessage('O nome é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('tech_radar')
        .update({
          _name: editingData._name,
          image_url: editingData.image_url || null,
          category: editingData.category,
          notes: editingData.notes || null,
          urll: editingData.urll || null
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Tecnologia atualizada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      setEditingImageFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error updating item:', error)
      setErrorMessage('Erro ao atualizar tecnologia. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const toggleValidity = async (id: string, currentValidity: boolean) => {
    try {
      const { error } = await supabase
        .from('tech_radar')
        .update({ is_valid: !currentValidity })
        .eq('id', id)

      if (error) throw error

      setSuccessMessage(`Tecnologia ${!currentValidity ? 'ativada' : 'desativada'} com sucesso!`)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error toggling validity:', error)
      setErrorMessage('Erro ao alterar estado')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta tecnologia?')) return

    try {
      const { error } = await supabase
        .from('tech_radar')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Tecnologia eliminada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
      setErrorMessage('Erro ao eliminar tecnologia')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const getCategoryBadge = (category: 'learn' | 'using' | 'explore' | null) => {
    const cat = categories.find(c => c.value === category)
    return cat || { label: '-', color: 'bg-slate-100 text-slate-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar Tech Radar...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-cyan-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-xl">
                <Radar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão do Tech Radar
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {techItems.length} tecnologia{techItems.length !== 1 ? 's' : ''} • {techItems.filter(t => t.is_valid).length} ativa{techItems.filter(t => t.is_valid).length !== 1 ? 's' : ''}
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
              
              {/* Tech Radar List */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Radar className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Tecnologias Existentes
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Edita inline ou elimina tecnologias
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {techItems.length === 0 ? (
                    <div className="p-12 text-center">
                      <Radar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhuma tecnologia adicionada ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Imagem</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Nome</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Categoria</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Notas</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">URL</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Ativa</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {techItems.map((item, index) => (
                            <tr 
                              key={item.id} 
                              className={`hover:bg-slate-50 transition-colors ${!item.is_valid ? 'opacity-50' : ''}`}
                              style={{ 
                                animation: 'fadeIn 0.3s ease-in',
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                              {editingId === item.id && editingData ? (
                                // EDITING MODE
                                <>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2">
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditImageUpload}
                                        disabled={uploadingImage}
                                        className="h-10 border-2 border-cyan-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700"
                                      />
                                      {editingData.image_url && (
                                        <img 
                                          src={editingData.image_url} 
                                          alt="Preview" 
                                          className="w-12 h-12 object-contain rounded border-2 border-cyan-300"
                                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                                        />
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Input
                                      value={editingData._name}
                                      onChange={(e) => setEditingData({ ...editingData, _name: e.target.value })}
                                      className="h-10 border-2 border-cyan-600 rounded-lg font-semibold"
                                      autoFocus
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <select
                                      value={editingData.category || ''}
                                      onChange={(e) => setEditingData({ ...editingData, category: e.target.value as any })}
                                      className="w-full h-10 border-2 border-cyan-600 rounded-lg px-2 text-sm bg-white"
                                    >
                                      {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Textarea
                                      value={editingData.notes}
                                      onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                                      rows={2}
                                      className="border-2 border-cyan-600 rounded-lg text-sm resize-none"
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <Input
                                      value={editingData.urll}
                                      onChange={(e) => setEditingData({ ...editingData, urll: e.target.value })}
                                      placeholder="https://..."
                                      className="h-10 border-2 border-cyan-600 rounded-lg text-sm"
                                    />
                                  </td>
                                  <td className="px-6 py-4"></td>
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
                                    {item.image_url ? (
                                      <img 
                                        src={item.image_url} 
                                        alt={item._name} 
                                        className="w-12 h-12 object-contain rounded border border-slate-300"
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="font-semibold text-slate-900">{item._name}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`${getCategoryBadge(item.category).color} border font-semibold`}>
                                      {getCategoryBadge(item.category).label}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 line-clamp-2">{item.notes || '-'}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {item.urll ? (
                                      <a 
                                        href={item.urll} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-cyan-600 hover:text-cyan-800 text-sm flex items-center gap-1"
                                      >
                                        <LinkIcon className="w-3 h-3" />
                                        Link
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 text-sm">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleValidity(item.id, item.is_valid)}
                                      className={item.is_valid ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditing(item)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(item.id)}
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

              {/* Add New Item Form */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600" />
                <CardHeader className="bg-gradient-to-br from-cyan-50 via-cyan-50 to-cyan-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-cyan-900 mb-2">
                        Nova Tecnologia
                      </CardTitle>
                      <CardDescription className="text-cyan-700 text-base">
                        Adiciona uma nova tecnologia ao radar
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-900 font-semibold text-sm">
                        Nome *
                      </Label>
                      <Input
                        id="name"
                        value={newItem._name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, _name: e.target.value }))}
                        placeholder="React, Docker, AWS..."
                        className="h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-900 font-semibold text-sm">
                        Categoria *
                      </Label>
                      <select
                        id="category"
                        value={newItem.category}
                        onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg px-3 text-sm bg-white"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* URL */}
                    <div className="space-y-2">
                      <Label htmlFor="urll" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-cyan-600" />
                        URL
                      </Label>
                      <Input
                        id="urll"
                        value={newItem.urll}
                        onChange={(e) => setNewItem(prev => ({ ...prev, urll: e.target.value }))}
                        placeholder="https://..."
                        className="h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg"
                      />
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-cyan-600" />
                        Imagem
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="h-11 border-2 border-slate-300 focus:border-cyan-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                        />
                        {newItem.image_url && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={newItem.image_url} 
                              alt="Preview" 
                              className="w-8 h-8 object-contain rounded border-2 border-cyan-300"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <span className="text-xs text-cyan-700 font-medium">{newItem.image_url.split('/').pop()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-600" />
                        Notas
                      </Label>
                      <Textarea
                        id="notes"
                        value={newItem.notes}
                        onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notas ou descrição sobre a tecnologia..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-cyan-600 rounded-lg resize-none"
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button
                      onClick={handleAddItem}
                      disabled={saving || uploadingImage}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-cyan-700 to-cyan-800 hover:from-cyan-800 hover:to-cyan-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Tecnologia
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