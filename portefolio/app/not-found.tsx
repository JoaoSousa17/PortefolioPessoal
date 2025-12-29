"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Code, Coffee, Bug, Terminal, Wrench } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  const [dots, setDots] = useState('')
  const [showJoke, setShowJoke] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    const jokeTimer = setTimeout(() => {
      setShowJoke(true)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(jokeTimer)
    }
  }, [])

  const programmingJokes = [
    "// TODO: Encontrar esta página",
    "try { findPage() } catch { return 404; }",
    "if (pageExists) { show() } else { cry() }",
    "undefined is not a function... nem esta página!",
    "Error: Cannot read property 'page' of undefined"
  ]

  const [currentJoke] = useState(() => 
    programmingJokes[Math.floor(Math.random() * programmingJokes.length)]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
        
        {/* Floating code symbols */}
        <div className="absolute top-20 left-20 text-6xl text-white/5 font-mono animate-float">{'{'}</div>
        <div className="absolute top-40 right-32 text-5xl text-white/5 font-mono animate-float" style={{ animationDelay: '1s' }}>{'}'}</div>
        <div className="absolute bottom-32 left-40 text-7xl text-white/5 font-mono animate-float" style={{ animationDelay: '2s' }}>;</div>
        <div className="absolute bottom-20 right-20 text-6xl text-white/5 font-mono animate-float" style={{ animationDelay: '0.5s' }}>{'<>'}</div>
        <div className="absolute top-1/2 left-1/4 text-5xl text-white/5 font-mono animate-float" style={{ animationDelay: '1.5s' }}>{'()'}</div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        
        {/* Main Error Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Terminal Header */}
          <div className="bg-slate-900/80 px-6 py-4 border-b border-red-500/30 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
              <Terminal className="w-4 h-4" />
              <span>error.log</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-12 text-center">
            
            {/* 404 Display */}
            <div className="mb-8 relative">
              <div className="text-[180px] font-bold leading-none mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                404
              </div>
              <div className="absolute -top-6 -right-6 animate-bounce">
                <Bug className="w-16 h-16 text-red-500" />
              </div>
            </div>

            {/* Error Messages */}
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Oops! Página Não Encontrada
              </h1>
              
              <div className="bg-slate-900/60 border border-red-500/30 rounded-xl p-6 font-mono text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-red-400 flex-shrink-0">Error:</span>
                  <span className="text-slate-300">
                    Esta página foi abduzida por aliens{dots}
                  </span>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-orange-400 flex-shrink-0">Warning:</span>
                  <span className="text-slate-300">
                    Ou talvez nunca tenha existido 🤔
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 flex-shrink-0">Info:</span>
                  <span className="text-slate-300">
                    Mas não te preocupes, vamos resolver isto!
                  </span>
                </div>
              </div>

              {/* Programming Joke */}
              {showJoke && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="bg-slate-900/40 border border-blue-500/30 rounded-xl p-4 max-w-xl mx-auto">
                    <code className="text-blue-400 font-mono text-sm">
                      {currentJoke}
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="mb-8">
              <p className="text-lg text-slate-400 mb-6">
                Enquanto eu procuro o que aconteceu, podes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                
                <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105 group">
                  <Coffee className="w-10 h-10 text-green-500 mb-3 mx-auto group-hover:rotate-12 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Beber um Café ☕</h3>
                  <p className="text-sm text-slate-400">Porque debugging sem café não conta</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group">
                  <Code className="w-10 h-10 text-purple-500 mb-3 mx-auto group-hover:rotate-12 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Consultar Stack Overflow 📚</h3>
                  <p className="text-sm text-slate-400">A solução está sempre lá!</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 group">
                  <Wrench className="w-10 h-10 text-blue-500 mb-3 mx-auto group-hover:rotate-12 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Reiniciar o Computador 🔄</h3>
                  <p className="text-sm text-slate-400">A solução universal para tudo</p>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Link href="/">
                  <Home className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Voltar à Homepage
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 font-bold text-lg px-8 py-6 rounded-xl bg-slate-900/50 backdrop-blur transition-all duration-300 hover:scale-105"
                onClick={() => window.history.back()}
              >
                ← Voltar Atrás
              </Button>
            </div>

            {/* Easter Egg */}
            <div className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-xs text-slate-600 font-mono">
                Erro #404 | Stack Trace: [HomePage → ???] | Sugestão: git checkout homepage
              </p>
            </div>

          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 font-mono text-sm">
            💡 <span className="text-slate-400">Pro tip:</span> Ctrl+Z não funciona na vida real... nem aqui 😅
          </p>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}