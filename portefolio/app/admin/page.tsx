"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  LogOut,
  User,
  Rocket,
  BookOpen,
  GraduationCap,
  Heart,
  MessageSquare,
  Award,
  Radar,
  Code2,
  Shield,
  Languages,
  Quote,
  School,
  Library,
  Wrench,
  HardHat,
  AlertTriangle,
  Loader2,
  Globe,
  CheckCircle2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteStatus = {
  id: string
  under_construction: boolean
  under_maintenance: boolean
}

type AdminSection = {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
  gradient: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [mounted, setMounted] = useState(false)

  // Site status
  const [siteStatus, setSiteStatus] = useState<SiteStatus | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [savingField, setSavingField] = useState<string | null>(null)
  const [statusError, setStatusError] = useState("")

  // ─── Auth guard ───────────────────────────────────────────────────────────

  useEffect(() => {
    setMounted(true)
    const isAuthenticated = localStorage.getItem("admin_authenticated")
    const storedUsername = localStorage.getItem("admin_username")

    if (!isAuthenticated) {
      router.replace("/auth")
      return
    }

    setUsername(storedUsername || "Admin")
    fetchSiteStatus()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_username")
    // Clear the auth cookie so middleware also de-authenticates
    document.cookie = "admin_authenticated=; path=/; max-age=0; SameSite=Lax"
    router.push("/")
  }

  // ─── Site status ──────────────────────────────────────────────────────────

  const fetchSiteStatus = async () => {
    try {
      setLoadingStatus(true)
      const { data, error } = await supabase
        .from("site_status")
        .select("*")
        .limit(1)
        .single()
      if (error) throw error
      setSiteStatus(data)
    } catch (err) {
      console.error("Error fetching site status:", err)
    } finally {
      setLoadingStatus(false)
    }
  }

  const updateField = async (
    field: "under_construction" | "under_maintenance",
    value: boolean
  ) => {
    setSavingField(field)
    setStatusError("")
    try {
      const res = await fetch("/api/site-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Unknown error")
      setSiteStatus(json.data)
    } catch (err: any) {
      console.error("Error updating site status:", err)
      setStatusError(err.message ?? "Erro ao atualizar estado")
    } finally {
      setSavingField(null)
    }
  }

  const bringOnline = async () => {
    if (!siteStatus) return
    if (siteStatus.under_maintenance) await updateField("under_maintenance", false)
    else if (siteStatus.under_construction) await updateField("under_construction", false)
  }

  const isOnline = !siteStatus?.under_construction && !siteStatus?.under_maintenance
  const isBusy = loadingStatus || !!savingField

  // ─── Site status label ────────────────────────────────────────────────────

  const statusLabel = loadingStatus
    ? "A carregar..."
    : siteStatus?.under_maintenance
    ? "Manutenção"
    : siteStatus?.under_construction
    ? "Em Construção"
    : "Online"

  const statusColor = isOnline
    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
    : siteStatus?.under_maintenance
    ? "bg-blue-500/20 border-blue-400/40 text-blue-300"
    : "bg-amber-500/20 border-amber-400/40 text-amber-300"

  const statusDot = isOnline
    ? "bg-emerald-400"
    : siteStatus?.under_maintenance
    ? "bg-blue-400"
    : "bg-amber-400"

  // ─── Sections ─────────────────────────────────────────────────────────────

  const adminSections: AdminSection[] = [
    {
      id: "profile",
      title: "Perfil",
      description: "Gerir informação pessoal e biografia",
      icon: User,
      href: "/admin/profileManagement",
      color: "text-blue-700",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      id: "projects",
      title: "Projetos",
      description: "Adicionar e editar projetos do portfólio",
      icon: Rocket,
      href: "/admin/projectManagement",
      color: "text-red-700",
      gradient: "from-red-600 to-red-700",
    },
    {
      id: "blog",
      title: "Blog",
      description: "Criar e publicar artigos",
      icon: BookOpen,
      href: "/admin/blogManagement",
      color: "text-purple-700",
      gradient: "from-purple-600 to-purple-700",
    },
    {
      id: "skills",
      title: "Skills",
      description: "Gerir competências e categorias",
      icon: Code2,
      href: "/admin/skillsManagement",
      color: "text-emerald-700",
      gradient: "from-emerald-600 to-emerald-700",
    },
    {
      id: "tech-radar",
      title: "Tech Radar",
      description: "Tecnologias em aprendizagem e uso",
      icon: Radar,
      href: "/admin/techRadarManagement",
      color: "text-cyan-700",
      gradient: "from-cyan-600 to-cyan-700",
    },
    {
      id: "courses",
      title: "Cursos",
      description: "Certificações e formações",
      icon: GraduationCap,
      href: "/admin/coursesManagement",
      color: "text-orange-700",
      gradient: "from-orange-600 to-orange-700",
    },
    {
      id: "schools",
      title: "Escolas",
      description: "Percurso académico e instituições",
      icon: School,
      href: "/admin/schoolsManagement",
      color: "text-indigo-700",
      gradient: "from-indigo-600 to-indigo-700",
    },
    {
      id: "books",
      title: "Livros",
      description: "Biblioteca de leituras",
      icon: Library,
      href: "/admin/booksManagement",
      color: "text-amber-700",
      gradient: "from-amber-600 to-amber-700",
    },
    {
      id: "languages",
      title: "Idiomas",
      description: "Línguas e níveis de proficiência",
      icon: Languages,
      href: "/admin/languagesManagement",
      color: "text-pink-700",
      gradient: "from-pink-600 to-pink-700",
    },
    {
      id: "social-projects",
      title: "Projetos Sociais",
      description: "Voluntariado e impacto social",
      icon: Heart,
      href: "/admin/socialProjectsManagement",
      color: "text-rose-700",
      gradient: "from-rose-600 to-rose-700",
    },
    {
      id: "testimonials",
      title: "Testemunhos",
      description: "Recomendações e feedbacks",
      icon: Quote,
      href: "/admin/testimonialsManagement",
      color: "text-violet-700",
      gradient: "from-violet-600 to-violet-700",
    },
    {
      id: "messages",
      title: "Mensagens",
      description: "Ver mensagens de contacto",
      icon: MessageSquare,
      href: "/admin/messagesManagement",
      color: "text-teal-700",
      gradient: "from-teal-600 to-teal-700",
    },
  ]

  if (!mounted) return null

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: "4s" }}
            />
            <div
              className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: "5s", animationDelay: "1s" }}
            />
          </div>

          <div className="relative container mx-auto px-6">
            {/* ── Top row: title ←→ controls ── */}
            <div className="flex items-start justify-between gap-8 mb-10 flex-wrap">

              {/* Left: identity */}
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
                    Admin Dashboard
                  </h1>
                  <p className="text-xl text-white/90 mt-2">
                    Bem-vindo, <span className="font-bold">{username}</span>
                  </p>
                </div>
              </div>

              {/* Right: stacked controls — all same width (w-56) */}
              <div
                className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-right"
                style={{ width: "224px" }} /* 56 × 4 = 224 px = w-56 */
              >
                {/* Status indicator */}
                <div
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold w-full ${statusColor}`}
                >
                  {loadingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  ) : (
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot} animate-pulse`}
                    />
                  )}
                  <span>{statusLabel}</span>
                </div>

                <Separator className="bg-white/10" />

                {/* Online toggle */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 w-full">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <Label
                      htmlFor="toggle-online"
                      className="text-white/90 text-sm font-medium cursor-pointer select-none"
                    >
                      Online
                    </Label>
                  </div>
                  <Switch
                    id="toggle-online"
                    checked={isOnline}
                    onCheckedChange={(v) => v && bringOnline()}
                    disabled={isBusy || isOnline}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                {/* Construction toggle */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 w-full">
                  <div className="flex items-center gap-2">
                    {savingField === "under_construction" ? (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
                    ) : (
                      <HardHat
                        className={`w-4 h-4 flex-shrink-0 ${
                          siteStatus?.under_construction
                            ? "text-amber-400"
                            : "text-slate-400"
                        }`}
                      />
                    )}
                    <Label
                      htmlFor="toggle-construction"
                      className="text-white/90 text-sm font-medium cursor-pointer select-none"
                    >
                      Construção
                    </Label>
                  </div>
                  <Switch
                    id="toggle-construction"
                    checked={siteStatus?.under_construction ?? false}
                    onCheckedChange={(v) => updateField("under_construction", v)}
                    disabled={isBusy}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                {/* Maintenance toggle */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 w-full">
                  <div className="flex items-center gap-2">
                    {savingField === "under_maintenance" ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                    ) : (
                      <Wrench
                        className={`w-4 h-4 flex-shrink-0 ${
                          siteStatus?.under_maintenance
                            ? "text-blue-400"
                            : "text-slate-400"
                        }`}
                      />
                    )}
                    <Label
                      htmlFor="toggle-maintenance"
                      className="text-white/90 text-sm font-medium cursor-pointer select-none"
                    >
                      Manutenção
                    </Label>
                  </div>
                  <Switch
                    id="toggle-maintenance"
                    checked={siteStatus?.under_maintenance ?? false}
                    onCheckedChange={(v) => updateField("under_maintenance", v)}
                    disabled={isBusy}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                {/* Error */}
                {statusError && (
                  <p className="text-red-300 text-xs px-1">{statusError}</p>
                )}

                <Separator className="bg-white/10" />

                {/* Logout — same width */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 backdrop-blur-sm font-semibold group transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Sair
                </Button>
              </div>
            </div>

            {/* Warning banner */}
            {(siteStatus?.under_construction || siteStatus?.under_maintenance) && (
              <div
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-sm animate-in fade-in slide-in-from-bottom ${
                  siteStatus?.under_maintenance
                    ? "bg-blue-500/15 border-blue-400/40"
                    : "bg-amber-500/15 border-amber-400/40"
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 ${
                    siteStatus?.under_maintenance
                      ? "text-blue-300"
                      : "text-amber-300"
                  }`}
                />
                <p className="text-white/90 text-sm font-medium">
                  {siteStatus?.under_maintenance
                    ? "O site está em manutenção. Visitantes vêem a página de manutenção. O painel admin está sempre acessível."
                    : "O site está em modo de construção. Visitantes vêem a página de construção. O painel admin está sempre acessível."}
                </p>
              </div>
            )}

            {/* Stats */}
            <div
              className="flex flex-wrap gap-4 mt-6 animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: "100ms" }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <p className="text-2xl font-bold">{adminSections.length}</p>
                <p className="text-sm text-white/80">Secções disponíveis</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 flex items-center gap-3">
                {loadingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                ) : (
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${statusDot} animate-pulse flex-shrink-0`}
                  />
                )}
                <div>
                  <p className="text-2xl font-bold leading-none">{statusLabel}</p>
                  <p className="text-sm text-white/80">Estado do site</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cards Grid ────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="mb-12 animate-in fade-in slide-in-from-bottom">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Gestão de Conteúdos
              </h2>
              <p className="text-lg text-slate-600">
                Selecione a secção que deseja gerir
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {adminSections.map((section, index) => {
                const Icon = section.icon
                return (
                  <Card
                    key={section.id}
                    className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-in fade-in slide-in-from-bottom cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link href={section.href}>
                      <CardHeader className="pb-4">
                        <div className="mb-4">
                          <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <CardTitle
                          className={`text-2xl font-bold ${section.color} group-hover:text-slate-900 transition-colors leading-tight`}
                        >
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-slate-600 leading-relaxed mt-2 text-base">
                          {section.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                            Gerir
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-red-600 group-hover:to-red-700 flex items-center justify-center transition-all duration-300">
                            <svg
                              className="w-4 h-4 text-slate-600 group-hover:text-white transition-all"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div
              className="mt-16 animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: "200ms" }}
            >
              <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      asChild
                      className="h-auto py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-red-600 text-slate-900 shadow-md hover:shadow-lg transition-all group"
                    >
                      <Link
                        href="/admin/projectManagement"
                        className="flex flex-col items-center gap-2"
                      >
                        <Rocket className="w-6 h-6 text-red-700 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Novo Projeto</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="h-auto py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-purple-600 text-slate-900 shadow-md hover:shadow-lg transition-all group"
                    >
                      <Link
                        href="/admin/blogManagement"
                        className="flex flex-col items-center gap-2"
                      >
                        <BookOpen className="w-6 h-6 text-purple-700 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Novo Artigo</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="h-auto py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-600 text-slate-900 shadow-md hover:shadow-lg transition-all group"
                    >
                      <Link
                        href="/admin/messagesManagement"
                        className="flex flex-col items-center gap-2"
                      >
                        <MessageSquare className="w-6 h-6 text-teal-700 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Ver Mensagens</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div
              className="mt-8 text-center animate-in fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <p className="text-slate-600">
                Última atualização:{" "}
                <span className="font-semibold">
                  {new Date().toLocaleDateString("pt-PT")}
                </span>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
