"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  MailOpen,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Calendar,
  MessageSquare
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type ContactMessage = {
  id: string
  name: string
  contact: string
  subject: string
  message: string
  created_at: string
  is_read: boolean
}

export default function MessagesManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState<ContactMessage[]>([])
  const [readMessages, setReadMessages] = useState<ContactMessage[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [expandedUnread, setExpandedUnread] = useState<Set<string>>(new Set())
  const [expandedRead, setExpandedRead] = useState<Set<string>>(new Set())

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
      
      // Fetch unread messages
      const { data: unread, error: unreadError } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })

      if (unreadError) throw unreadError
      setUnreadMessages(unread || [])

      // Fetch read messages
      const { data: read, error: readError } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('is_read', true)
        .order('created_at', { ascending: false })

      if (readError) throw readError
      setReadMessages(read || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setErrorMessage('Erro ao carregar mensagens')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Mensagem marcada como lida!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Remove from expanded if it was
      setExpandedUnread(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      
      fetchData()
    } catch (error) {
      console.error('Error marking message as read:', error)
      setErrorMessage('Erro ao marcar mensagem')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const toggleExpand = (id: string, isUnread: boolean) => {
    if (isUnread) {
      setExpandedUnread(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    } else {
      setExpandedRead(prev => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar mensagens...</p>
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
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Mensagens de Contacto
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {unreadMessages.length} não lida{unreadMessages.length !== 1 ? 's' : ''} • {readMessages.length} lida{readMessages.length !== 1 ? 's' : ''}
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
              
              {/* Unread Messages */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                <CardHeader className="bg-gradient-to-br from-red-50 via-red-50 to-red-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-red-900 mb-2">
                        Mensagens Não Lidas
                      </CardTitle>
                      <CardDescription className="text-red-700 text-base">
                        {unreadMessages.length} mensagem{unreadMessages.length !== 1 ? 's' : ''} aguardando leitura
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {unreadMessages.length === 0 ? (
                    <div className="p-12 text-center">
                      <MailOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Todas as mensagens foram lidas! 🎉
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {unreadMessages.map((message, index) => {
                        const isExpanded = expandedUnread.has(message.id)
                        
                        return (
                          <div
                            key={message.id}
                            className="hover:bg-red-50/50 transition-colors"
                            style={{
                              animation: 'fadeIn 0.3s ease-in',
                              animationDelay: `${index * 50}ms`,
                              animationFillMode: 'backwards'
                            }}
                          >
                            <div className="p-6">
                              {/* Header - Always Visible */}
                              <div 
                                className="flex items-start justify-between gap-4 cursor-pointer"
                                onClick={() => toggleExpand(message.id, true)}
                              >
                                <div className="flex-grow">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-red-500 text-white border-0 font-bold">NOVA</Badge>
                                    <h3 className="text-lg font-bold text-slate-900">{message.subject}</h3>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                    <span className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      {message.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {message.contact}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(message.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markAsRead(message.id)
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    <MailOpen className="w-4 h-4 mr-2" />
                                    Marcar como Lida
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-300"
                                  >
                                    {isExpanded ? '▲' : '▼'}
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded Content */}
                              {isExpanded && (
                                <div className="mt-6 pt-6 border-t-2 border-red-100 animate-in fade-in slide-in-from-top">
                                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <MessageSquare className="w-5 h-5 text-red-600" />
                                      <h4 className="font-bold text-slate-900">Mensagem:</h4>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                      {message.message}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Read Messages */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <MailOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Mensagens Lidas
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Histórico de {readMessages.length} mensagem{readMessages.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {readMessages.length === 0 ? (
                    <div className="p-12 text-center">
                      <Mail className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhuma mensagem lida ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {readMessages.map((message, index) => {
                        const isExpanded = expandedRead.has(message.id)
                        
                        return (
                          <div
                            key={message.id}
                            className="hover:bg-slate-50 transition-colors opacity-75"
                            style={{
                              animation: 'fadeIn 0.3s ease-in',
                              animationDelay: `${index * 50}ms`,
                              animationFillMode: 'backwards'
                            }}
                          >
                            <div className="p-6">
                              {/* Header - Always Visible */}
                              <div 
                                className="flex items-start justify-between gap-4 cursor-pointer"
                                onClick={() => toggleExpand(message.id, false)}
                              >
                                <div className="flex-grow">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-slate-700">{message.subject}</h3>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <User className="w-4 h-4" />
                                      {message.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {message.contact}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(message.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-300 flex-shrink-0"
                                >
                                  {isExpanded ? '▲' : '▼'}
                                </Button>
                              </div>

                              {/* Expanded Content */}
                              {isExpanded && (
                                <div className="mt-6 pt-6 border-t-2 border-slate-100 animate-in fade-in slide-in-from-top">
                                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <MessageSquare className="w-5 h-5 text-slate-600" />
                                      <h4 className="font-bold text-slate-900">Mensagem:</h4>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                      {message.message}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
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
