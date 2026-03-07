"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Code, Coffee, Bug, Terminal, Wrench } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

export default function NotFound() {
  const { t } = useTranslation()
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

  const programmingJokes = t.errorPage.jokes

  const [currentJoke] = useState(() => 
    programmingJokes[Math.floor(Math.random() * programmingJokes.length)]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="hidden sm:block absolute top-20 left-20 text-6xl text-white/5 font-mono animate-float">{'{'}</div>
        <div className="hidden sm:block absolute top-40 right-32 text-5xl text-white/5 font-mono animate-float" style={{ animationDelay: '1s' }}>{'}'}</div>
        <div className="hidden sm:block absolute bottom-32 left-40 text-7xl text-white/5 font-mono animate-float" style={{ animationDelay: '2s' }}>;</div>
        <div className="hidden sm:block absolute bottom-20 right-20 text-6xl text-white/5 font-mono animate-float" style={{ animationDelay: '0.5s' }}>{'<>'}</div>
        <div className="hidden sm:block absolute top-1/2 left-1/4 text-5xl text-white/5 font-mono animate-float" style={{ animationDelay: '1.5s' }}>{'()'}</div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        
        <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          
          <div className="bg-slate-900/80 px-4 sm:px-6 py-3 sm:py-4 border-b border-red-500/30 flex items-center gap-2 sm:gap-3">
            <div className="flex gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 font-mono text-xs sm:text-sm">
              <Terminal className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>error.log</span>
            </div>
          </div>

          <div className="p-6 sm:p-12 text-center">
            
            <div className="mb-6 sm:mb-8 relative">
              <div className="text-[120px] sm:text-[180px] font-bold leading-none mb-3 sm:mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                404
              </div>
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 animate-bounce">
                <Bug className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                {t.errorPage.title}
              </h1>
              
              <div className="bg-slate-900/60 border border-red-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 font-mono text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-red-400 flex-shrink-0 text-xs sm:text-base">{t.errorPage.labels.error}</span>
                  <span className="text-slate-300 text-xs sm:text-base">{t.errorPage.messages.error}{dots}</span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className="text-orange-400 flex-shrink-0 text-xs sm:text-base">{t.errorPage.labels.warning}</span>
                  <span className="text-slate-300 text-xs sm:text-base">{t.errorPage.messages.warning}</span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-yellow-400 flex-shrink-0 text-xs sm:text-base">{t.errorPage.labels.info}</span>
                  <span className="text-slate-300 text-xs sm:text-base">{t.errorPage.messages.info}</span>
                </div>
              </div>

              {showJoke && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="bg-slate-900/40 border border-blue-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-xl mx-auto">
                    <code className="text-blue-400 font-mono text-xs sm:text-sm">{currentJoke}</code>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 sm:mb-8">
              <p className="text-base sm:text-lg text-slate-400 mb-4 sm:mb-6">{t.errorPage.suggestions.text}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
                
                <div className="bg-slate-900/40 border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105 group">
                  <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mb-2 sm:mb-3 mx-auto group-hover:rotate-12 transition-transform" />
                  <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{t.errorPage.suggestions.coffee.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{t.errorPage.suggestions.coffee.desc}</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group">
                  <Code className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 mb-2 sm:mb-3 mx-auto group-hover:rotate-12 transition-transform" />
                  <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{t.errorPage.suggestions.stack.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{t.errorPage.suggestions.stack.desc}</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 group">
                  <Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mb-2 sm:mb-3 mx-auto group-hover:rotate-12 transition-transform" />
                  <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{t.errorPage.suggestions.restart.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{t.errorPage.suggestions.restart.desc}</p>
                </div>

              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Link href="/">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  {t.errorPage.actions.home}
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl bg-slate-900/50 backdrop-blur transition-all duration-300 hover:scale-105"
                onClick={() => window.history.back()}
              >
                {t.errorPage.actions.back}
              </Button>
            </div>

            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-700">
              <p className="text-[10px] sm:text-xs text-slate-600 font-mono">{t.errorPage.easterEgg}</p>
            </div>

          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-slate-500 font-mono text-xs sm:text-sm">
            💡 <span className="text-slate-400">{t.errorPage.proTip.label}</span> {t.errorPage.proTip.text}
          </p>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
