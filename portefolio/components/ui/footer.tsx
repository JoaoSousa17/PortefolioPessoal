"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Heart, Mail, Linkedin, Github, Instagram, Facebook, MessageCircle, ArrowUp, Download, FileText } from "lucide-react"
import { supabase, type Profile } from "@/lib/supabase"
import Link from "next/link"

export function Footer() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: "Sobre", href: "#about" },
    { name: "Projetos", href: "#projects" },
    { name: "Formação", href: "#schools" },
    { name: "Skills", href: "#skills" },
  ]

  const moreLinks = [
    { name: "Tech Radar", href: "#tech-radar" },
    { name: "Blog", href: "#blog" },
    { name: "Testemunhos", href: "#testimonials" },
    { name: "Contacto", href: "#contact" },
  ]

  const socialLinks = [
    { icon: Linkedin, href: profile?.linkedin_url, label: "LinkedIn" },
    { icon: Github, href: profile?.github_url, label: "GitHub" },
    { icon: Instagram, href: profile?.instagram_url, label: "Instagram" },
    { icon: Facebook, href: profile?.facebook_url, label: "Facebook" },
    { icon: MessageCircle, href: profile?.whatsapp_url ? `https://wa.me/${profile.whatsapp_url.replace(/\D/g, '')}` : null, label: "WhatsApp" },
  ].filter(link => link.href)

  return (
    <footer className="relative w-full bg-slate-900 text-white overflow-hidden">
      
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-700 to-red-600" />

      <div className="container mx-auto px-6 py-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* About Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">JS</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">João Sousa</h3>
                <p className="text-sm text-slate-400">{profile?.headline || "Developer & Innovator"}</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm text-justify">
              {profile?.bio_short || "Apaixonado por tecnologia, inovação e criação de soluções que fazem a diferença."}
            </p>
            
            {/* Download CV Button - Creative placement */}
            <Button
              asChild
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 group mt-6"
            >
              <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/curriculo.pdf`} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-2" />
                Download CV
                <Download className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" />
              </a>
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Links Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-red-600 transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Explorar</h4>
            <ul className="space-y-3">
              {moreLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-red-600 transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Conecta-te</h4>
            
            {profile?.email && (
              <a 
                href={`mailto:${profile.email}`}
                className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 mb-6 group"
              >
                <Mail className="w-4 h-4 text-red-600" />
                <span className="group-hover:underline">{profile.email}</span>
              </a>
            )}

            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="outline"
                  size="icon"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-red-600 transition-all group"
                  asChild
                >
                  <a href={social.href!} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <social.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

        </div>

        <Separator className="bg-slate-800 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-slate-400 text-sm flex items-center gap-2 justify-center md:justify-start">
              © {currentYear} João Sousa. Feito com 
              <Heart className="w-4 h-4 text-red-600 fill-red-600 animate-pulse" />
              e muito café.
            </p>
          </div>

          {/* Back to Top */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-slate-400 hover:text-white hover:bg-white/10 group"
          >
            Voltar ao topo
            <ArrowUp className="w-4 h-4 ml-2 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>

      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    
    </footer>
  )
}
