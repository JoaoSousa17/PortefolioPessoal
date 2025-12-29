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
  Languages, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Flag,
  Image as ImageIcon
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type Language = {
  id: string
  _name: string
  flag_url: string | null
  _level: number | null
  info: string | null
}

type EditingLanguage = {
  id: string
  _name: string
  flag_url: string
  _level: number
  info: string
}

export default function LanguagesManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFlag, setUploadingFlag] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingLanguage | null>(null)
  const [editingFlagFile, setEditingFlagFile] = useState<File | null>(null)
  
  const [newLanguage, setNewLanguage] = useState({
    _name: '',
    flag_url: '',
    _level: 3,
    info: ''
  })
  const [flagFile, setFlagFile] = useState<File | null>(null)

  const levelLabels = [
    { value: 0, label: 'Iniciante', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 1, label: 'Básico', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { value: 2, label: 'Intermediário', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 3, label: 'Avançado', color: 'bg-lime-100 text-lime-800 border-lime-300' },
    { value: 4, label: 'Fluente', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 5, label: 'Nativo', color: 'bg-blue-100 text-blue-800 border-blue-300' }
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
        .from('languages')
        .select('*')
        .order('_level', { ascending: false, nullsFirst: false })

      if (error) throw error
      setLanguages(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleFlagUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingFlag(true)
      
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `flag_${timestamp}_${randomString}.${extension}`
      
      setFlagFile(file)
      
      const flagPath = `/logo_skills/${newFileName}`
      setNewLanguage(prev => ({
        ...prev,
        flag_url: flagPath
      }))
      
      setSuccessMessage('Bandeira selecionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting flag:', error)
      setErrorMessage('Erro ao selecionar bandeira')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingFlag(false)
    }
  }

  const handleEditFlagUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingData) return

    try {
      setUploadingFlag(true)
      
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `flag_${timestamp}_${randomString}.${extension}`
      
      setEditingFlagFile(file)
      
      const flagPath = `/logo_skills/${newFileName}`
      setEditingData({
        ...editingData,
        flag_url: flagPath
      })
      
      setSuccessMessage('Bandeira selecionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting flag:', error)
      setErrorMessage('Erro ao selecionar bandeira')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingFlag(false)
    }
  }

  const handleAddLanguage = async () => {
    if (!newLanguage._name.trim()) {
      setErrorMessage('O nome do idioma é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('languages')
        .insert([{
          _name: newLanguage._name,
          flag_url: newLanguage.flag_url || null,
          _level: newLanguage._level,
          info: newLanguage.info || null
        }])

      if (error) throw error

      setSuccessMessage('Idioma adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setNewLanguage({
        _name: '',
        flag_url: '',
        _level: 3,
        info: ''
      })
      setFlagFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error adding language:', error)
      setErrorMessage('Erro ao adicionar idioma. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (language: Language) => {
    setEditingId(language.id)
    setEditingData({
      id: language.id,
      _name: language._name,
      flag_url: language.flag_url || '',
      _level: language._level ?? 3,
      info: language.info || ''
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
    setEditingFlagFile(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData._name.trim()) {
      setErrorMessage('O nome do idioma é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('languages')
        .update({
          _name: editingData._name,
          flag_url: editingData.flag_url || null,
          _level: editingData._level,
          info: editingData.info || null
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Idioma atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      setEditingFlagFile(null)
      
      fetchData()
    } catch (error) {
      console.error('Error updating language:', error)
      setErrorMessage('Erro ao atualizar idioma. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este idioma?')) return

    try {
      const { error } = await supabase
        .from('languages')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Idioma eliminado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error deleting language:', error)
      setErrorMessage('Erro ao eliminar idioma')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const getLevelBadge = (level: number | null) => {
    if (level === null) return levelLabels[3]
    const rounded = Math.round(level)
    return levelLabels[Math.min(Math.max(rounded, 0), 5)] || levelLabels[3]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar idiomas...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-pink-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-pink-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center shadow-xl">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Idiomas
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {languages.length} idioma{languages.length !== 1 ? 's' : ''}
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
              
              {/* Languages List */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Languages className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Idiomas Existentes
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Edita inline ou elimina idiomas
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {languages.length === 0 ? (
                    <div className="p-12 text-center">
                      <Languages className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhum idioma adicionado ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {languages.map((language, index) => (
                        <div
                          key={language.id}
                          className="hover:bg-slate-50 transition-colors"
                          style={{
                            animation: 'fadeIn 0.3s ease-in',
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'backwards'
                          }}
                        >
                          {editingId === language.id && editingData ? (
                            // EDITING MODE
                            <div className="p-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Flag Upload */}
                                <div className="space-y-2">
                                  <Label className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                                    <Flag className="w-4 h-4 text-pink-600" />
                                    Bandeira
                                  </Label>
                                  <div className="space-y-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleEditFlagUpload}
                                      disabled={uploadingFlag}
                                      className="h-10 border-2 border-pink-600 rounded-lg text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700"
                                    />
                                    {editingData.flag_url && (
                                      <img
                                        src={editingData.flag_url}
                                        alt="Flag"
                                        className="w-16 h-12 object-cover rounded border-2 border-pink-300"
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
                                    value={editingData._name}
                                    onChange={(e) => setEditingData({ ...editingData, _name: e.target.value })}
                                    className="h-10 border-2 border-pink-600 rounded-lg font-semibold"
                                    autoFocus
                                  />
                                </div>

                                {/* Level */}
                                <div className="space-y-3 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm">
                                    Nível de Proficiência: {editingData._level.toFixed(1)} - {getLevelBadge(editingData._level).label}
                                  </Label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={editingData._level}
                                    onChange={(e) => setEditingData({ ...editingData, _level: parseFloat(e.target.value) })}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                                  />
                                  <div className="flex justify-between text-xs text-slate-600">
                                    {levelLabels.map(level => (
                                      <span key={level.value} className="font-medium">{level.label}</span>
                                    ))}
                                  </div>
                                </div>

                                {/* Info */}
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-slate-900 font-semibold text-sm">
                                    Informação Adicional
                                  </Label>
                                  <Textarea
                                    value={editingData.info}
                                    onChange={(e) => setEditingData({ ...editingData, info: e.target.value })}
                                    rows={3}
                                    placeholder="Certificações, contexto de aprendizagem..."
                                    className="border-2 border-pink-600 rounded-lg resize-none"
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
                                {/* Flag */}
                                <div className="flex-shrink-0">
                                  {language.flag_url ? (
                                    <img
                                      src={language.flag_url}
                                      alt={language._name}
                                      className="w-20 h-14 object-cover rounded border-2 border-slate-300 shadow-sm"
                                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                                    />
                                  ) : (
                                    <div className="w-20 h-14 bg-slate-100 rounded flex items-center justify-center border-2 border-slate-300">
                                      <Flag className="w-8 h-8 text-slate-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{language._name}</h3>
                                      <Badge className={`${getLevelBadge(language._level).color} border font-semibold`}>
                                        Nível {language._level?.toFixed(1) ?? '3.0'} - {getLevelBadge(language._level).label}
                                      </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditing(language)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(language.id)}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {language.info && (
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                      {language.info}
                                    </p>
                                  )}
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

              {/* Add New Language Form */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600" />
                <CardHeader className="bg-gradient-to-br from-pink-50 via-pink-50 to-pink-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-pink-900 mb-2">
                        Novo Idioma
                      </CardTitle>
                      <CardDescription className="text-pink-700 text-base">
                        Adiciona um novo idioma ao portfólio
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-900 font-semibold text-sm">
                        Nome do Idioma *
                      </Label>
                      <Input
                        id="name"
                        value={newLanguage._name}
                        onChange={(e) => setNewLanguage(prev => ({ ...prev, _name: e.target.value }))}
                        placeholder="Ex: Inglês, Francês, Português"
                        className="h-11 border-2 border-slate-300 focus:border-pink-600 rounded-lg"
                      />
                    </div>

                    {/* Flag */}
                    <div className="space-y-2">
                      <Label htmlFor="flag" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Flag className="w-4 h-4 text-pink-600" />
                        Bandeira
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="flag"
                          type="file"
                          accept="image/*"
                          onChange={handleFlagUpload}
                          disabled={uploadingFlag}
                          className="h-11 border-2 border-slate-300 focus:border-pink-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                        />
                        {newLanguage.flag_url && (
                          <div className="flex items-center gap-2">
                            <img
                              src={newLanguage.flag_url}
                              alt="Flag preview"
                              className="w-16 h-12 object-cover rounded border-2 border-pink-300"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <span className="text-xs text-pink-700 font-medium">{newLanguage.flag_url.split('/').pop()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Level Slider */}
                    <div className="space-y-3 md:col-span-2">
                      <Label className="text-slate-900 font-semibold text-sm">
                        Nível de Proficiência: {newLanguage._level.toFixed(1)} - {getLevelBadge(newLanguage._level).label}
                      </Label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={newLanguage._level}
                        onChange={(e) => setNewLanguage(prev => ({ ...prev, _level: parseFloat(e.target.value) }))}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                      />
                      <div className="flex justify-between text-xs text-slate-600">
                        {levelLabels.map(level => (
                          <span key={level.value} className="font-medium">{level.label}</span>
                        ))}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="info" className="text-slate-900 font-semibold text-sm">
                        Informação Adicional
                      </Label>
                      <Textarea
                        id="info"
                        value={newLanguage.info}
                        onChange={(e) => setNewLanguage(prev => ({ ...prev, info: e.target.value }))}
                        placeholder="Certificações, contexto de aprendizagem..."
                        rows={3}
                        className="border-2 border-slate-300 focus:border-pink-600 rounded-lg resize-none"
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                    <Button
                      onClick={handleAddLanguage}
                      disabled={saving || uploadingFlag}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-pink-700 to-pink-800 hover:from-pink-800 hover:to-pink-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Idioma
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
