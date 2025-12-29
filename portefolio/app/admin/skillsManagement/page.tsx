"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Code2, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Palette,
  Tag
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type SkillCategory = {
  id: string
  name: string
}

type Skill = {
  id: string
  category_id: string
  name: string
  color: string | null
  icon: string | null
}

type SkillWithCategory = Skill & {
  category_name: string
}

type EditingSkill = {
  id: string
  name: string
  color: string
  icon: string
}

export default function SkillsManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [skills, setSkills] = useState<SkillWithCategory[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingSkill | null>(null)
  const [editingIconFile, setEditingIconFile] = useState<File | null>(null)
  
  const [newSkill, setNewSkill] = useState({
    name: '',
    category_id: '',
    color: '#3B82F6',
    icon: ''
  })
  const [iconFile, setIconFile] = useState<File | null>(null)

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
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('skill_categories')
        .select('*')
        .order('name', { ascending: true })

      if (categoriesError) throw categoriesError

      // Fetch skills with category names
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select(`
          id,
          category_id,
          name,
          color,
          icon,
          skill_categories(name)
        `)
        .order('name', { ascending: true })

      if (skillsError) throw skillsError

      setCategories(categoriesData || [])
      
      // Format skills data
      const formattedSkills = (skillsData || []).map(skill => ({
        id: skill.id,
        category_id: skill.category_id,
        name: skill.name,
        color: skill.color,
        icon: skill.icon,
        category_name: (skill.skill_categories as any)?.name || 'Sem categoria'
      }))
      
      setSkills(formattedSkills)
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingIcon(true)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `skill_${timestamp}_${randomString}.${extension}`
      
      // Store file for upload when saving
      setIconFile(file)
      
      // Set the icon path that will be saved to database
      const iconPath = `/logo_skills/${newFileName}`
      setNewSkill(prev => ({
        ...prev,
        icon: iconPath
      }))
      
      setSuccessMessage('Ícone selecionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting icon:', error)
      setErrorMessage('Erro ao selecionar ícone')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleEditIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingData) return

    try {
      setUploadingIcon(true)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const newFileName = `skill_${timestamp}_${randomString}.${extension}`
      
      // Store file for upload when saving
      setEditingIconFile(file)
      
      // Set the icon path
      const iconPath = `/logo_skills/${newFileName}`
      setEditingData({
        ...editingData,
        icon: iconPath
      })
      
      setSuccessMessage('Ícone selecionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting icon:', error)
      setErrorMessage('Erro ao selecionar ícone')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      setErrorMessage('O nome da skill é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    if (!newSkill.category_id) {
      setErrorMessage('A categoria é obrigatória')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('skills')
        .insert([{
          name: newSkill.name,
          category_id: newSkill.category_id,
          color: newSkill.color || null,
          icon: newSkill.icon || null
        }])

      if (error) throw error

      setSuccessMessage('Skill adicionada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Reset form
      setNewSkill({
        name: '',
        category_id: '',
        color: '#3B82F6',
        icon: ''
      })
      setIconFile(null)
      
      // Refresh list
      fetchData()
    } catch (error) {
      console.error('Error adding skill:', error)
      setErrorMessage('Erro ao adicionar skill. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (skill: SkillWithCategory) => {
    setEditingId(skill.id)
    setEditingData({
      id: skill.id,
      name: skill.name,
      color: skill.color || '#3B82F6',
      icon: skill.icon || ''
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
    setEditingIconFile(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData.name.trim()) {
      setErrorMessage('O nome da skill é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const { error } = await supabase
        .from('skills')
        .update({
          name: editingData.name,
          color: editingData.color || null,
          icon: editingData.icon || null
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Skill atualizada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      setEditingIconFile(null)
      
      // Refresh list
      fetchData()
    } catch (error) {
      console.error('Error updating skill:', error)
      setErrorMessage('Erro ao atualizar skill. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta skill?')) return

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Skill eliminada com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchData()
    } catch (error) {
      console.error('Error deleting skill:', error)
      setErrorMessage('Erro ao eliminar skill')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar skills...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-emerald-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-xl">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Skills
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {skills.length} skill{skills.length !== 1 ? 's' : ''} • {categories.length} categoria{categories.length !== 1 ? 's' : ''}
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
              
              {/* Skills List - Now First */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Code2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Skills Existentes
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Edita inline ou elimina skills
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {skills.length === 0 ? (
                    <div className="p-12 text-center">
                      <Code2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhuma skill adicionada ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b-2 border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Skill</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Categoria</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Cor</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Ícone</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {skills.map((skill, index) => (
                            <tr 
                              key={skill.id} 
                              className="hover:bg-slate-50 transition-colors"
                              style={{ 
                                animation: 'fadeIn 0.3s ease-in',
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'backwards'
                              }}
                            >
                              {editingId === skill.id && editingData ? (
                                // EDITING MODE
                                <>
                                  <td className="px-6 py-4">
                                    <Input
                                      value={editingData.name}
                                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                                      className="h-10 border-2 border-emerald-600 rounded-lg font-semibold"
                                      autoFocus
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">{skill.category_name}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2 items-center">
                                      <Input
                                        type="color"
                                        value={editingData.color}
                                        onChange={(e) => setEditingData({ ...editingData, color: e.target.value })}
                                        className="h-10 w-16 border-2 border-emerald-600 rounded-lg cursor-pointer"
                                      />
                                      <Input
                                        type="text"
                                        value={editingData.color}
                                        onChange={(e) => setEditingData({ ...editingData, color: e.target.value })}
                                        className="h-10 w-28 border-2 border-emerald-600 rounded-lg font-mono text-sm"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-2">
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditIconUpload}
                                        disabled={uploadingIcon}
                                        className="h-10 border-2 border-emerald-600 rounded-lg text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                      />
                                      {editingData.icon && (
                                        <div className="flex items-center gap-2">
                                          <img 
                                            src={editingData.icon} 
                                            alt="Icon" 
                                            className="w-6 h-6 object-contain rounded"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none'
                                            }}
                                          />
                                          <span className="text-xs text-slate-600 font-mono">{editingData.icon}</span>
                                        </div>
                                      )}
                                    </div>
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
                                    <div className="flex items-center gap-3">
                                      <Badge 
                                        className="text-sm px-3 py-1 font-semibold"
                                        style={{ 
                                          backgroundColor: (skill.color || '#3B82F6') + '20',
                                          color: skill.color || '#3B82F6',
                                          borderColor: (skill.color || '#3B82F6') + '40',
                                          borderWidth: '2px'
                                        }}
                                      >
                                        {skill.name}
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600 font-medium">{skill.category_name}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-6 h-6 rounded border-2 border-slate-300"
                                        style={{ backgroundColor: skill.color || '#3B82F6' }}
                                      />
                                      <span className="text-sm font-mono text-slate-600">{skill.color || '-'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {skill.icon ? (
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={skill.icon} 
                                          alt={skill.name} 
                                          className="w-8 h-8 object-contain rounded border border-slate-300"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                        <span className="text-xs text-slate-500 font-mono">{skill.icon.split('/').pop()}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => startEditing(skill)}
                                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(skill.id)}
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

              {/* Add New Skill Form - Now Below */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />
                <CardHeader className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-emerald-900 mb-2">
                        Nova Skill
                      </CardTitle>
                      <CardDescription className="text-emerald-700 text-base">
                        Adiciona uma nova competência
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-900 font-semibold text-sm">
                        Nome *
                      </Label>
                      <Input
                        id="name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="React, Python, SQL..."
                        className="h-11 border-2 border-slate-300 focus:border-emerald-600 rounded-lg"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-900 font-semibold text-sm">
                        Categoria *
                      </Label>
                      <select
                        id="category"
                        value={newSkill.category_id}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, category_id: e.target.value }))}
                        className="w-full h-11 border-2 border-slate-300 focus:border-emerald-600 rounded-lg px-3 text-sm bg-white"
                      >
                        <option value="">Seleciona uma categoria</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                      <Label htmlFor="color" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Palette className="w-4 h-4 text-emerald-600" />
                        Cor
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={newSkill.color}
                          onChange={(e) => setNewSkill(prev => ({ ...prev, color: e.target.value }))}
                          className="h-11 w-20 border-2 border-slate-300 focus:border-emerald-600 rounded-lg cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={newSkill.color}
                          onChange={(e) => setNewSkill(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#3B82F6"
                          className="h-11 flex-1 border-2 border-slate-300 focus:border-emerald-600 rounded-lg font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                      <Label htmlFor="icon" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        Ícone (imagem)
                      </Label>
                      <div className="space-y-2">
                        <Input
                          id="icon"
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          disabled={uploadingIcon}
                          className="h-11 border-2 border-slate-300 focus:border-emerald-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {newSkill.icon && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={newSkill.icon} 
                              alt="Icon preview" 
                              className="w-8 h-8 object-contain rounded border-2 border-emerald-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            <span className="text-xs text-emerald-700 font-medium">{newSkill.icon}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview and Button Row */}
                  <div className="flex items-center justify-between gap-6 mt-6 pt-6 border-t-2 border-slate-200">
                    {/* Preview */}
                    {newSkill.name && (
                      <div className="flex items-center gap-4">
                        <Label className="text-slate-900 font-semibold text-sm">Preview:</Label>
                        <Badge 
                          className="text-base px-4 py-2"
                          style={{ 
                            backgroundColor: newSkill.color + '20',
                            color: newSkill.color,
                            borderColor: newSkill.color + '40',
                            borderWidth: '2px'
                          }}
                        >
                          {newSkill.name}
                        </Badge>
                      </div>
                    )}

                    {/* Add Button */}
                    <Button
                      onClick={handleAddSkill}
                      disabled={saving}
                      className="h-12 px-8 text-base font-bold bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group ml-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          A adicionar...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Adicionar Skill
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
