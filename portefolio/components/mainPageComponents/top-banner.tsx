"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, Linkedin, ArrowRight, Download } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

export function TopBanner() {
  const { t } = useTranslation()

  const [mounted, setMounted] = useState(false)
  const [currentRole, setCurrentRole] = useState(0)
  
  const roles = t.topBanner.roles

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [roles.length])

  if (!mounted) return null

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-red-750 shadow-2xl">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -top-48 -right-48 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute w-[500px] h-[500px] -bottom-32 -left-32 bg-red-900/20 rounded-full blur-3xl" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-20">
          
          {/* Avatar — smaller on md to prevent overflow */}
          <div className="flex-shrink-0 animate-in slide-in-from-bottom">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-red-600/40 to-red-700/40 rounded-full blur-3xl scale-110 group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-105" />
              <Avatar className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-80 lg:h-80 border-[6px] border-white shadow-[0_0_60px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-300">
                <AvatarImage src="/images/avatar.jpg" alt="João Sousa" className="object-cover" />
                <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-red-600 to-red-800 text-white">
                  JS
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content — min-w-0 prevents flex child from overflowing */}
          <div className="flex-1 min-w-0 text-center md:text-left space-y-8 animate-in fade-in slide-in-from-right">
            
            <div className="space-y-3">
              <p className="text-white/90 text-2xl md:text-3xl font-semibold drop-shadow-lg">
                {t.topBanner.greeting}
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight drop-shadow-2xl">
                João Sousa
              </h1>
            </div>

            {/* Role animation — always flex-row, items-center for perfect alignment */}
            <div className="flex flex-row items-center justify-center md:justify-start text-3xl md:text-4xl">
              <span className="text-white/90 font-semibold drop-shadow-lg whitespace-nowrap mr-2">
                {t.topBanner.iAm}
              </span>

              <div className="relative h-16 overflow-hidden" style={{ minWidth: 0 }}>
                {roles.map((item, index) => (
                  <div
                    key={item.role}
                    className={`absolute inset-0 flex items-center transition-all duration-500 ${
                      index === currentRole
                        ? "translate-y-0 opacity-100 scale-100"
                        : index < currentRole
                        ? "-translate-y-16 opacity-0 scale-90"
                        : "translate-y-16 opacity-0 scale-90"
                    }`}
                  >
                    <span className="text-white/90 font-semibold drop-shadow-lg mr-2 whitespace-nowrap">
                      {item.article}
                    </span>
                    <span className="font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] whitespace-nowrap">
                      {item.role}
                    </span>
                  </div>
                ))}
                {/* Invisible placeholder to give the container the right width */}
                <div className="invisible flex items-center h-16" aria-hidden="true">
                  {roles.reduce((longest, item) => {
                    const len = (item.article + ' ' + item.role).length
                    return len > (longest.article + ' ' + longest.role).length ? item : longest
                  }, roles[0]) && (
                    <>
                      <span className="text-white/90 font-semibold mr-2 whitespace-nowrap">
                        {roles.reduce((l, i) => (i.article + ' ' + i.role).length > (l.article + ' ' + l.role).length ? i : l, roles[0]).article}
                      </span>
                      <span className="font-black whitespace-nowrap">
                        {roles.reduce((l, i) => (i.article + ' ' + i.role).length > (l.article + ' ' + l.role).length ? i : l, roles[0]).role}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <blockquote className="border-l-[6px] border-gray-500 bg-white/95 backdrop-blur-md pl-6 py-5 rounded-r-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white transition-colors text-left">
              <p className="text-2xl md:text-3xl text-slate-900 font-bold italic">
                "{t.topBanner.quote}"
              </p>
              <cite className="block text-lg mt-3 not-italic font-bold text-red-800">
                {t.topBanner.quoteAuthor}
              </cite>
            </blockquote>

            {/*
              Button layout:
              - mobile/sm: tudo em coluna
              - md (tablet): CTA buttons em linha, social na linha seguinte
              - lg+: tudo numa só linha (CTA + social com ml-auto)
            */}
            <div className="flex flex-col lg:flex-row lg:items-center items-center md:items-start gap-4 pt-6 lg:flex-wrap">

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-red-800 text-xl font-bold px-10 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-200 group border-4 border-white hover:scale-105"
                  asChild
                >
                  <Link href="/projects">
                    {t.topBanner.viewProjects}
                    <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform duration-200" />
                  </Link>
                </Button>

                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-red-800 text-xl font-bold px-10 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-200 group border-4 border-white hover:scale-105"
                  asChild
                >
                  <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/curriculo.pdf`} target="_blank">
                    {t.topBanner.downloadCv}
                    <Download className="ml-2 w-6 h-6 group-hover:translate-y-1 transition-transform duration-200" />
                  </a>
                </Button>
              </div>

              {/* Social icons — own row on md, same row on lg+ */}
              <div className="flex gap-4 justify-center md:justify-start lg:ml-auto">
                <Button size="lg" className="bg-white/90 hover:bg-white text-slate-900 border-4 border-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-110 transition-all p-6" asChild>
                  <a href="https://www.linkedin.com/in/joaosousaa" target="_blank">
                    <Linkedin className="w-6 h-6" />
                  </a>
                </Button>
                <Button size="lg" className="bg-white/90 hover:bg-white text-slate-900 border-4 border-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-110 transition-all p-6" asChild>
                  <a href="https://github.com/JoaoSousa17" target="_blank">
                    <Github className="w-6 h-6" />
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
