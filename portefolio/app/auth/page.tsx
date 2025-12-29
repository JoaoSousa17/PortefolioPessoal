"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, User, Loader2, Shield, AlertCircle, ArrowLeft, KeyRound, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: rpcError } = await supabase
        .rpc('verify_admin_login', {
          p_username: username,
          p_password: password
        })

      if (rpcError) throw rpcError

      if (data === true) {
        localStorage.setItem('admin_authenticated', 'true')
        localStorage.setItem('admin_username', username)
        router.push('/admin')
      } else {
        setError('Username ou password incorretos')
      }
    } catch (error) {
      console.error('Error logging in:', error)
      setError('Erro ao fazer login. Tenta novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main glowing orbs */}
        <div className="absolute w-[600px] h-[600px] -top-48 -right-48 bg-red-600/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute w-[500px] h-[500px] -bottom-32 -left-32 bg-red-700/15 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/10 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.3; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.6; }
          90% { opacity: 0.3; }
        }
      `}</style>

      {/* Back Button */}
      <div className="relative z-10 container mx-auto px-6 pt-8 animate-in fade-in slide-in-from-top">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 group transition-all duration-300"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar à página inicial
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          
          {/* Decorative top section with avatar */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
            {/* Avatar with glow effect */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-red-600/40 to-red-700/40 rounded-full blur-2xl scale-110 animate-pulse" 
                   style={{ animationDuration: '3s' }} />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.4)] border-4 border-white/20">
                <Shield className="w-12 h-12 text-white" />
              </div>
              {/* Sparkle effect */}
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" 
                        style={{ animationDuration: '2s' }} />
            </div>

            <h1 className="text-5xl font-black text-white mb-3 drop-shadow-2xl">
              Admin Access
            </h1>
            <p className="text-white/80 text-lg">
              Área restrita • Autenticação requerida
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-[0_20px_80px_rgba(0,0,0,0.5)] bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom overflow-hidden" 
                style={{ animationDelay: '200ms' }}>
            
            {/* Decorative top border */}
            <div className="h-2 bg-gradient-to-r from-red-600 via-red-700 to-red-600 animate-pulse" 
                 style={{ animationDuration: '3s' }} />

            <CardContent className="px-8 py-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Error Message with enhanced styling */}
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-red-900 text-lg">Erro de autenticação</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Username Field with enhanced effects */}
                <div className="space-y-3 group">
                  <Label 
                    htmlFor="username" 
                    className="text-slate-900 font-bold text-base flex items-center gap-2 transition-colors group-focus-within:text-red-700"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      focusedField === 'username' 
                        ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-lg scale-110' 
                        : 'bg-slate-200'
                    }`}>
                      <User className={`w-4 h-4 transition-colors ${
                        focusedField === 'username' ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Digite o seu username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="border-2 border-slate-300 focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all duration-300 h-14 text-base rounded-xl pl-4 pr-12 shadow-sm hover:shadow-md focus:shadow-lg"
                      autoComplete="username"
                    />
                    {focusedField === 'username' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field with enhanced effects */}
                <div className="space-y-3 group">
                  <Label 
                    htmlFor="password" 
                    className="text-slate-900 font-bold text-base flex items-center gap-2 transition-colors group-focus-within:text-red-700"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-lg scale-110' 
                        : 'bg-slate-200'
                    }`}>
                      <Lock className={`w-4 h-4 transition-colors ${
                        focusedField === 'password' ? 'text-white' : 'text-slate-600'
                      }`} />
                    </div>
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite a sua password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="border-2 border-slate-300 focus:border-red-600 focus:ring-4 focus:ring-red-100 transition-all duration-300 h-14 text-base rounded-xl pl-4 pr-12 shadow-sm hover:shadow-md focus:shadow-lg"
                      autoComplete="current-password"
                    />
                    {focusedField === 'password' && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button with enhanced effects */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white shadow-[0_8px_32px_rgba(220,38,38,0.4)] hover:shadow-[0_12px_48px_rgba(220,38,38,0.6)] transition-all duration-300 h-16 text-lg font-black rounded-xl mt-8 group relative overflow-hidden border-2 border-red-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      A autenticar...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Entrar no Admin
                      <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </Button>

                {/* Security notice */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Conexão segura</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Os seus dados são protegidos com encriptação de ponta a ponta
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Bottom decoration */}
          <div className="text-center mt-8 animate-in fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-white/60 text-sm">
              Desenvolvido com ❤️ por João Sousa
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
