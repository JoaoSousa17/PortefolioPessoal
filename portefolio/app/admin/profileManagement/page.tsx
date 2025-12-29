"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Mail, 
  Linkedin, 
  Github, 
  Instagram, 
  Facebook, 
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Upload,
  BookOpen,
  Code2,
  Image as ImageIcon
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { uploadCV, uploadWebsiteImage } from "@/lib/storage-helpers"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type ProfileData = {
  id?: string
  name: string | null
  headline: string | null
  bio_short: string | null
  bio_long: string | null
  photo_url: string | null
  email: string | null
  linkedin_url: string | null
  github_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  whatsapp_url: string | null
  website1_url: string | null
  website1_name: string | null
  website1_image: string | null
  website2_url: string | null
  website2_name: string | null
  website2_image: string | null
  website3_url: string | null
  website3_name: string | null
  website3_image: string | null
  about_who_am_i: string | null
  about_developer: string | null
}

export default function ProfileManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [uploadingWebsite1, setUploadingWebsite1] = useState(false)
  const [uploadingWebsite2, setUploadingWebsite2] = useState(false)
  const [uploadingWebsite3, setUploadingWebsite3] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [website1ImageFile, setWebsite1ImageFile] = useState<File | null>(null)
  const [website2ImageFile, setWebsite2ImageFile] = useState<File | null>(null)
  const [website3ImageFile, setWebsite3ImageFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    headline: '',
    bio_short: '',
    bio_long: '',
    photo_url: '',
    email: '',
    linkedin_url: '',
    github_url: '',
    instagram_url: '',
    facebook_url: '',
    whatsapp_url: '',
    website1_url: '',
    website1_name: '',
    website1_image: '',
    website2_url: '',
    website2_name: '',
    website2_image: '',
    website3_url: '',
    website3_name: '',
    website3_image: '',
    about_who_am_i: '',
    about_developer: ''
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    fetchProfile()
    loadCurrentAboutContent()
  }, [router])

  const loadCurrentAboutContent = () => {
    // Default content from AboutSection component
    const defaultWhoAmI = `Hi, my name is João, and I am a startup enthusiast, studying Computer Science at FEUP and passionate about gym, tech, and business. Since I was a kid, I always said that my dream was to become an entrepreneur even though I didn't know which area I would want to work in or the obstacles I would have to face on this enriching journey.<br></br><br></br>

Everything started for me with my participation in the European Innovation Academy. It was definitely a pivotal gateway into the entrepreneurial environment. Shortly after, together with other program participants, we founded UPSTART, a student community, with the mission of sowing entrepreneurship in the academic ecosystem, proving to students the existence of more than one possible path.<br></br><br></br>

Since I was young, I have always been very interested in various topics, having studied many different areas, from languages to various sciences. <br></br><br></br>

Where does the phrase with which I start this summary come from? From a young age, I developed a deep connection with sports. This particular phrase was ingrained in me during my time as a tennis player, and I carry it with me as inspiration for navigating through challenges and projects that come my way.`

    const defaultDeveloper = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.`

    // Set defaults if fields are empty
    setProfileData(prev => ({
      ...prev,
      about_who_am_i: prev.about_who_am_i || defaultWhoAmI,
      about_developer: prev.about_developer || defaultDeveloper
    }))
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setErrorMessage('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value || null
    }))
  }

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingCV(true)

      if (file.type !== 'application/pdf') {
        setErrorMessage('Por favor seleciona um ficheiro PDF')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      setCvFile(file)
      setSuccessMessage('CV selecionado! Clica em "Guardar Perfil" para confirmar.')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error selecting CV:', error)
      setErrorMessage('Erro ao selecionar CV')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingCV(false)
    }
  }

  const handleWebsite1ImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingWebsite1(true)

      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      setWebsite1ImageFile(file)
      setSuccessMessage('Imagem Website 1 selecionada! Clica em "Guardar Perfil" para confirmar.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting image:', error)
      setErrorMessage('Erro ao selecionar imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingWebsite1(false)
    }
  }

  const handleWebsite2ImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingWebsite2(true)

      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      setWebsite2ImageFile(file)
      setSuccessMessage('Imagem Website 2 selecionada! Clica em "Guardar Perfil" para confirmar.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting image:', error)
      setErrorMessage('Erro ao selecionar imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingWebsite2(false)
    }
  }

  const handleWebsite3ImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingWebsite3(true)

      if (!file.type.startsWith('image/')) {
        setErrorMessage('Por favor seleciona uma imagem válida')
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      setWebsite3ImageFile(file)
      setSuccessMessage('Imagem Website 3 selecionada! Clica em "Guardar Perfil" para confirmar.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error selecting image:', error)
      setErrorMessage('Erro ao selecionar imagem')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setUploadingWebsite3(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      // Upload CV if selected
      if (cvFile) {
        const { url, error } = await uploadCV(cvFile)
        if (error) {
          setErrorMessage(`Erro ao fazer upload do CV: ${error.message}`)
          setTimeout(() => setErrorMessage(''), 5000)
          setSaving(false)
          return
        }
        // URL do CV não precisa ser guardado na BD, é sempre o mesmo caminho
        // Mas podes guardar se quiseres: profileData.cv_url = url
      }

      // Upload website images if selected
      if (website1ImageFile) {
        const { url, error } = await uploadWebsiteImage(website1ImageFile, 1)
        if (error) {
          setErrorMessage(`Erro ao fazer upload da imagem Website 1: ${error.message}`)
          setTimeout(() => setErrorMessage(''), 5000)
          setSaving(false)
          return
        }
        profileData.website1_image = url
      }

      if (website2ImageFile) {
        const { url, error } = await uploadWebsiteImage(website2ImageFile, 2)
        if (error) {
          setErrorMessage(`Erro ao fazer upload da imagem Website 2: ${error.message}`)
          setTimeout(() => setErrorMessage(''), 5000)
          setSaving(false)
          return
        }
        profileData.website2_image = url
      }

      if (website3ImageFile) {
        const { url, error } = await uploadWebsiteImage(website3ImageFile, 3)
        if (error) {
          setErrorMessage(`Erro ao fazer upload da imagem Website 3: ${error.message}`)
          setTimeout(() => setErrorMessage(''), 5000)
          setSaving(false)
          return
        }
        profileData.website3_image = url
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profile')
        .select('id')
        .single()

      let result

      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profile')
          .update(profileData)
          .eq('id', existingProfile.id)
      } else {
        // Insert new profile
        result = await supabase
          .from('profile')
          .insert([profileData])
      }

      if (result.error) throw result.error

      setSuccessMessage('Perfil guardado com sucesso!')
      
      // Reset file states
      setCvFile(null)
      setWebsite1ImageFile(null)
      setWebsite2ImageFile(null)
      setWebsite3ImageFile(null)
      
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Refresh data
      fetchProfile()
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrorMessage('Erro ao guardar perfil. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar perfil...</p>
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
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-blue-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-blue-700/15 rounded-full blur-3xl animate-pulse" 
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Perfil
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  Edita a tua informação pessoal, secção About e CV
                </p>
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

            <div className="space-y-6">
              
              {/* Basic Information */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
                        Informação Básica
                      </CardTitle>
                      <CardDescription className="text-blue-700 text-base">
                        Nome, título e biografias
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-slate-900 font-semibold text-base">
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="João Sousa"
                        className="h-12 border-2 border-slate-300 focus:border-blue-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="headline" className="text-slate-900 font-semibold text-base">
                        Headline
                      </Label>
                      <Input
                        id="headline"
                        value={profileData.headline || ''}
                        onChange={(e) => handleInputChange('headline', e.target.value)}
                        placeholder="Developer • Entrepreneur"
                        className="h-12 border-2 border-slate-300 focus:border-blue-600 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bio_short" className="text-slate-900 font-semibold text-base">
                      Biografia Curta
                    </Label>
                    <Textarea
                      id="bio_short"
                      value={profileData.bio_short || ''}
                      onChange={(e) => handleInputChange('bio_short', e.target.value)}
                      placeholder="Uma breve descrição sobre ti..."
                      rows={3}
                      className="border-2 border-slate-300 focus:border-blue-600 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bio_long" className="text-slate-900 font-semibold text-base">
                      Biografia Longa
                    </Label>
                    <Textarea
                      id="bio_long"
                      value={profileData.bio_long || ''}
                      onChange={(e) => handleInputChange('bio_long', e.target.value)}
                      placeholder="Uma descrição mais detalhada sobre o teu percurso..."
                      rows={6}
                      className="border-2 border-slate-300 focus:border-blue-600 rounded-lg resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="photo_url" className="text-slate-900 font-semibold text-base">
                      URL da Foto de Perfil
                    </Label>
                    <Input
                      id="photo_url"
                      value={profileData.photo_url || ''}
                      onChange={(e) => handleInputChange('photo_url', e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="h-12 border-2 border-slate-300 focus:border-blue-600 rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* About Section Content */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Secção About
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Conteúdo das duas subsecções na página principal
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="about_who_am_i" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-600" />
                      Who am I?
                    </Label>
                    <Textarea
                      id="about_who_am_i"
                      value={profileData.about_who_am_i || ''}
                      onChange={(e) => handleInputChange('about_who_am_i', e.target.value)}
                      placeholder="Hi, my name is João..."
                      rows={12}
                      className="border-2 border-slate-300 focus:border-slate-600 rounded-lg resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500">Suporta HTML. Usa &lt;br&gt;&lt;/br&gt; para quebras de linha.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="about_developer" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-red-600" />
                      What defines me as a developer?
                    </Label>
                    <Textarea
                      id="about_developer"
                      value={profileData.about_developer || ''}
                      onChange={(e) => handleInputChange('about_developer', e.target.value)}
                      placeholder="Lorem ipsum dolor sit amet..."
                      rows={8}
                      className="border-2 border-slate-300 focus:border-red-600 rounded-lg resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500">Suporta HTML. Usa &lt;br&gt;&lt;/br&gt; para quebras de linha.</p>
                  </div>
                </CardContent>
              </Card>

              {/* CV Upload */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                <CardHeader className="bg-gradient-to-br from-red-50 via-red-50 to-red-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-red-900 mb-2">
                        Currículo (CV)
                      </CardTitle>
                      <CardDescription className="text-red-700 text-base">
                        Substitui o ficheiro curriculo.pdf em /public
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="cv_upload" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                      <Upload className="w-4 h-4 text-red-600" />
                      Upload Novo CV (PDF)
                    </Label>
                    <Input
                      id="cv_upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      disabled={uploadingCV}
                      className="h-12 border-2 border-slate-300 focus:border-red-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    {cvFile && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                        <FileText className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">{cvFile.name}</span>
                        <span className="text-xs text-red-600">({(cvFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> O ficheiro será guardado como <code className="bg-blue-100 px-2 py-1 rounded">curriculo.pdf</code> no <strong>Supabase Storage</strong> (bucket: cvs)
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        O CV atual será automaticamente substituído. Acede ao ficheiro em: <code className="text-xs">/cvs/curriculo.pdf</code>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />
                <CardHeader className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-emerald-900 mb-2">
                        Contacto
                      </CardTitle>
                      <CardDescription className="text-emerald-700 text-base">
                        Email e WhatsApp
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@example.com"
                        className="h-12 border-2 border-slate-300 focus:border-emerald-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="whatsapp_url" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        WhatsApp URL
                      </Label>
                      <Input
                        id="whatsapp_url"
                        value={profileData.whatsapp_url || ''}
                        onChange={(e) => handleInputChange('whatsapp_url', e.target.value)}
                        placeholder="https://wa.me/..."
                        className="h-12 border-2 border-slate-300 focus:border-emerald-600 rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600" />
                <CardHeader className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-purple-900 mb-2">
                        Redes Sociais
                      </CardTitle>
                      <CardDescription className="text-purple-700 text-base">
                        LinkedIn, GitHub, Instagram e Facebook
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="linkedin_url" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin_url"
                        value={profileData.linkedin_url || ''}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="github_url" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                        <Github className="w-4 h-4 text-slate-800" />
                        GitHub
                      </Label>
                      <Input
                        id="github_url"
                        value={profileData.github_url || ''}
                        onChange={(e) => handleInputChange('github_url', e.target.value)}
                        placeholder="https://github.com/..."
                        className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="instagram_url" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram_url"
                        value={profileData.instagram_url || ''}
                        onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="facebook_url" className="text-slate-900 font-semibold text-base flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-700" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook_url"
                        value={profileData.facebook_url || ''}
                        onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="h-12 border-2 border-slate-300 focus:border-purple-600 rounded-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Websites */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
                <CardHeader className="bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Globe className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-orange-900 mb-2">
                        Websites
                      </CardTitle>
                      <CardDescription className="text-orange-700 text-base">
                        Links para websites pessoais ou projetos (usados na página Linktree)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 bg-white space-y-8">
                  
                  {/* Website 1 */}
                  <div className="space-y-4 p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <h4 className="font-bold text-purple-900 text-lg mb-4">Website 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="website1_name" className="text-slate-900 font-semibold text-sm">
                          Nome
                        </Label>
                        <Input
                          id="website1_name"
                          value={profileData.website1_name || ''}
                          onChange={(e) => handleInputChange('website1_name', e.target.value)}
                          placeholder="Meu Portfolio"
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="website1_url" className="text-slate-900 font-semibold text-sm">
                          URL
                        </Label>
                        <Input
                          id="website1_url"
                          value={profileData.website1_url || ''}
                          onChange={(e) => handleInputChange('website1_url', e.target.value)}
                          placeholder="https://..."
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="website1_image" className="text-slate-900 font-semibold text-sm">
                        Imagem de Fundo
                      </Label>
                      <Input
                        id="website1_image"
                        type="file"
                        accept="image/*"
                        onChange={handleWebsite1ImageUpload}
                        disabled={uploadingWebsite1}
                        className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-purple-50 file:text-purple-700"
                      />
                      {(website1ImageFile || profileData.website1_image) && (
                        <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                          <ImageIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-purple-700">
                            {website1ImageFile ? website1ImageFile.name : 'Imagem atual guardada'}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500">Deixa vazio para usar gradient roxo→rosa</p>
                    </div>
                  </div>

                  {/* Website 2 */}
                  <div className="space-y-4 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 text-lg mb-4">Website 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="website2_name" className="text-slate-900 font-semibold text-sm">
                          Nome
                        </Label>
                        <Input
                          id="website2_name"
                          value={profileData.website2_name || ''}
                          onChange={(e) => handleInputChange('website2_name', e.target.value)}
                          placeholder="Blog Pessoal"
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="website2_url" className="text-slate-900 font-semibold text-sm">
                          URL
                        </Label>
                        <Input
                          id="website2_url"
                          value={profileData.website2_url || ''}
                          onChange={(e) => handleInputChange('website2_url', e.target.value)}
                          placeholder="https://..."
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="website2_image" className="text-slate-900 font-semibold text-sm">
                        Imagem de Fundo
                      </Label>
                      <Input
                        id="website2_image"
                        type="file"
                        accept="image/*"
                        onChange={handleWebsite2ImageUpload}
                        disabled={uploadingWebsite2}
                        className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-blue-50 file:text-blue-700"
                      />
                      {(website2ImageFile || profileData.website2_image) && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700">
                            {website2ImageFile ? website2ImageFile.name : 'Imagem atual guardada'}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500">Deixa vazio para usar gradient azul→ciano</p>
                    </div>
                  </div>

                  {/* Website 3 */}
                  <div className="space-y-4 p-6 bg-red-50 rounded-xl border-2 border-red-200">
                    <h4 className="font-bold text-red-900 text-lg mb-4">Website 3</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="website3_name" className="text-slate-900 font-semibold text-sm">
                          Nome
                        </Label>
                        <Input
                          id="website3_name"
                          value={profileData.website3_name || ''}
                          onChange={(e) => handleInputChange('website3_name', e.target.value)}
                          placeholder="Loja Online"
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="website3_url" className="text-slate-900 font-semibold text-sm">
                          URL
                        </Label>
                        <Input
                          id="website3_url"
                          value={profileData.website3_url || ''}
                          onChange={(e) => handleInputChange('website3_url', e.target.value)}
                          placeholder="https://..."
                          className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="website3_image" className="text-slate-900 font-semibold text-sm">
                        Imagem de Fundo
                      </Label>
                      <Input
                        id="website3_image"
                        type="file"
                        accept="image/*"
                        onChange={handleWebsite3ImageUpload}
                        disabled={uploadingWebsite3}
                        className="h-11 border-2 border-slate-300 focus:border-orange-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-red-50 file:text-red-700"
                      />
                      {(website3ImageFile || profileData.website3_image) && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                          <ImageIcon className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-700">
                            {website3ImageFile ? website3ImageFile.name : 'Imagem atual guardada'}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500">Deixa vazio para usar gradient laranja→vermelho</p>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin')}
                  className="h-14 px-8 text-base font-semibold border-2"
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={saving || uploadingCV || uploadingWebsite1 || uploadingWebsite2 || uploadingWebsite3}
                  className="h-14 px-8 text-base font-bold bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Guardar Perfil
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
