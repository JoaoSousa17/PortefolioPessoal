"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Languages, Menu, X, Home } from "lucide-react"

// Hooks de tradução e contexto
import { useLanguage } from "@/lib/context/LanguageContext"
import { useTranslation } from "@/lib/hooks/useTranslation"

const languages = [
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "en", label: "EN", flag: "🇬🇧" },
]

export function TopBar() {
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navButtonClass = 
    "text-slate-300 hover:text-white hover:bg-white/10 font-medium transition-all duration-200"

  function scrollToSection(href: string) {
    if (href.startsWith("#")) {
      const element = document.querySelector(href)
      if (element) {
        const offset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        })
      }
    }
    setMobileMenuOpen(false)
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="sticky top-0 z-50 h-16 w-full bg-slate-900/95 border-b border-white/10 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
        
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={scrollToTop}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg">JS</span>
          </div>
          <span className="font-bold text-lg text-white hidden min-[400px]:inline">
            João Sousa
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { name: t.nav.about, href: "#about" },
            { name: t.nav.projects, href: "#projects" },
            { name: t.nav.education, href: "#schools" },
            { name: t.nav.skills, href: "#skills" },
            { name: t.nav.contact, href: "#contact" },
            { name: t.nav.blog, href: "#blog" },
          ].map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={navButtonClass}
              onClick={() => scrollToSection(item.href)}
            >
              {item.name}
            </Button>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-slate-400 hidden sm:block" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[90px] sm:w-[100px] h-9 bg-slate-800 border-slate-700 text-white hover:bg-slate-750 transition-colors focus:ring-red-500/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {languages.map(lang => (
                  <SelectItem 
                    key={lang.code} 
                    value={lang.code}
                    className="text-white focus:bg-slate-700 focus:text-white cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 flex-shrink-0 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Menu Card */}
              <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-[360px] z-[101] animate-in slide-in-from-right-5 fade-in duration-300">
                <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                  
                  {/* Header */}
                  <div className="p-5 pb-4 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg ring-2 ring-red-500/30">
                          <span className="text-white font-bold text-lg">JS</span>
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-white">João Sousa</h2>
                          <p className="text-xs text-slate-400">{language === 'pt' ? 'Menu de Navegação' : 'Navigation Menu'}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-white hover:bg-white/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="py-3 px-3">
                    <Button
                      variant="ghost"
                      className="w-full text-slate-300 hover:text-white hover:bg-red-600/10 font-medium justify-start text-sm h-11 group transition-all duration-200 rounded-lg mb-2"
                      onClick={scrollToTop}
                    >
                      <Home className="w-4 h-4 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                      <span>Home</span>
                    </Button>

                    <Separator className="mb-2 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />

                    <div className="space-y-1">
                      {[
                        { name: t.nav.about, href: "#about" },
                        { name: t.nav.projects, href: "#projects" },
                        { name: t.nav.education, href: "#schools" },
                        { name: t.nav.skills, href: "#skills" },
                        { name: t.nav.contact, href: "#contact" },
                        { name: t.nav.blog, href: "#blog" },
                      ].map((item) => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          className="w-full text-slate-300 hover:text-white hover:bg-white/5 font-medium justify-start text-sm h-10 group transition-all duration-200 rounded-lg"
                          onClick={() => scrollToSection(item.href)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-3 group-hover:scale-150 transition-transform" />
                          <span>{item.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-slate-900/80 border-t border-slate-600 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-400 font-medium">
                        {language === 'pt' ? 'Idioma' : 'Language'}
                      </span>
                    </div>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[100px] h-8 bg-slate-800 border-slate-700 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code} className="text-white text-xs cursor-pointer">
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}