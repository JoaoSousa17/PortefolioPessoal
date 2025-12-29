"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Languages, Menu, X } from "lucide-react"

const languages = [
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "en", label: "EN", flag: "🇬🇧" },
]

const navItems = [
  { name: "Sobre", href: "#about" },
  { name: "Projetos", href: "#projects" },
  { name: "Formação", href: "#schools" },
  { name: "Skills", href: "#skills" },
  { name: "Contacto", href: "#contact" },
  { name: "Blog", href: "#blog" },
]

export function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = pathname.split("/")[1] || "pt"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Detecta hash na URL e faz scroll quando a página carregar
  useEffect(() => {
    const hash = window.location.hash
    if (hash && pathname === '/') {
      // Delay para garantir que o DOM está pronto
      const timer = setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          const offset = 80
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          })
        }
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [pathname])

  function handleLanguageChange(lang: string) {
    const segments = pathname.split("/")
    segments[1] = lang
    router.push(segments.join("/"))
  }

  function scrollToSection(href: string) {
    // Se não estamos na home page, navega para home com hash
    if (pathname !== '/' && pathname !== '') {
      router.push('/' + href)
      setMobileMenuOpen(false)
      return
    }

    // Se estamos na home page, faz scroll direto
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
        setMobileMenuOpen(false)
      }
    } else {
      router.push(href)
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="sticky top-0 z-50 h-16 w-full bg-slate-900/95 border-b border-white/10 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg">JS</span>
          </div>
          <span className="font-bold text-lg text-white hidden sm:inline">João Sousa</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
              onClick={() => scrollToSection(item.href)}
            >
              {item.name}
            </Button>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-4">
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-slate-400 hidden sm:block" />
            <Select value={currentLang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[100px] h-9 bg-slate-800 border-slate-700 text-white hover:bg-slate-750 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {languages.map(lang => (
                  <SelectItem 
                    key={lang.code} 
                    value={lang.code}
                    className="text-white hover:bg-slate-700 cursor-pointer"
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

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 border-slate-800 w-[280px]">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/10 font-medium justify-start text-base h-12"
                    onClick={() => scrollToSection(item.href)}
                  >
                    {item.name}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
