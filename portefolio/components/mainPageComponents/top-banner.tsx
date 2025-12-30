"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, ArrowRight, Sparkles, Download } from "lucide-react"
import Link from "next/link"

export function TopBanner() {
  const [mounted, setMounted] = useState(false)
  const [currentRole, setCurrentRole] = useState(0)
  
  const roles = [
    { article: "a", role: "Developer" },
    { article: "an", role: "Inventor" },
    { article: "an", role: "Entrepreneur" }
  ]

  useEffect(() => {
    setMounted(true)
    
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative w-full bg-black overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-red-750 shadow-2xl">
      
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle glowing orbs */}
        <div className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] -top-24 sm:-top-32 lg:-top-48 -right-24 sm:-right-32 lg:-right-48 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] -bottom-16 sm:-bottom-24 lg:-bottom-32 -left-16 sm:-left-24 lg:-left-32 bg-red-900/20 rounded-full blur-3xl" />
      </div>
      
      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 lg:h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 py-6 xs:py-8 sm:py-10 md:py-12 lg:py-14 xl:py-16">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20">
          
          {/* Left side - Avatar */}
          <div className="flex-shrink-0 animate-in slide-in-from-bottom duration-700 order-1 lg:order-1">
            <div className="relative group">
              {/* Multi-layer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-red-600/40 to-red-700/40 rounded-full blur-2xl sm:blur-3xl scale-110 group-hover:scale-125 transition-transform duration-500" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg sm:blur-xl scale-105" />
              
              {/* Avatar with responsive sizes */}
              <Avatar className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-80 xl:h-80 border-4 xs:border-[5px] sm:border-[6px] border-white shadow-[0_0_40px_rgba(255,255,255,0.25)] sm:shadow-[0_0_50px_rgba(255,255,255,0.3)] lg:shadow-[0_0_60px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-300">
                <AvatarImage 
                  src="/images/avatar.jpg" 
                  alt="João Sousa" 
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-br from-red-600 to-red-800 text-white">
                  JS
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 text-center lg:text-left space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8 animate-in fade-in slide-in-from-right duration-700 order-2 lg:order-2 w-full max-w-3xl lg:max-w-none">
            
            {/* Greeting */}
            <div className="space-y-2 xs:space-y-2.5 sm:space-y-3">
              <p className="text-white/90 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-semibold drop-shadow-lg">
                Hello World, it's me,
              </p>
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black text-white leading-[1.1] sm:leading-tight drop-shadow-2xl">
                João Sousa
              </h1>
            </div>

            {/* Dynamic role - ALWAYS ONE LINE */}
            <div className="flex items-center justify-center lg:justify-start gap-1.5 xs:gap-2 text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl">
              <span className="text-white/90 font-semibold drop-shadow-lg whitespace-nowrap flex-shrink-0">I am</span>
              <div className="relative h-8 xs:h-9 sm:h-11 md:h-14 lg:h-14 xl:h-16 flex-1 min-w-0 max-w-[240px] xs:max-w-[280px] sm:max-w-[320px] md:max-w-[400px] overflow-hidden">
                {roles.map((item, index) => (
                  <span
                    key={item.role}
                    className={`absolute inset-0 flex items-center transition-all duration-500 ${
                      index === currentRole
                        ? "translate-y-0 opacity-100 scale-100"
                        : index < currentRole
                        ? "-translate-y-16 opacity-0 scale-90"
                        : "translate-y-16 opacity-0 scale-90"
                    }`}
                  >
                    <span className="text-white/90 font-semibold drop-shadow-lg mr-1.5 xs:mr-2 whitespace-nowrap flex-shrink-0">
                      {item.article}
                    </span>
                    <span className="font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] whitespace-nowrap truncate">
                      {item.role}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quote */}
            <blockquote className="border-l-4 xs:border-l-[5px] sm:border-l-[6px] border-gray-500 bg-white/95 backdrop-blur-md pl-4 xs:pl-5 sm:pl-6 py-3 xs:py-4 sm:py-5 rounded-r-lg sm:rounded-r-xl shadow-[0_4px_16px_rgba(0,0,0,0.15)] sm:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white transition-colors max-w-2xl mx-auto lg:mx-0">
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl text-slate-900 font-bold italic leading-tight">
                "Why not me?"
              </p>
              <cite className="block text-xs xs:text-sm sm:text-base lg:text-lg mt-2 xs:mt-2.5 sm:mt-3 not-italic font-bold text-red-800">
                — Francis Tiafoe
              </cite>
            </blockquote>

            {/* Action buttons - COMPLETELY RESPONSIVE */}
            <div className="flex flex-col items-center lg:items-start gap-3 xs:gap-3.5 sm:gap-4 pt-3 xs:pt-4 sm:pt-5 md:pt-6 w-full max-w-2xl mx-auto lg:mx-0">
              
              {/* Main action buttons row */}
              <div className="flex flex-col min-[500px]:flex-row gap-3 xs:gap-3.5 sm:gap-4 w-full">
                <Button 
                  size="lg" 
                  className="flex-1 bg-white hover:bg-gray-50 text-red-800 text-sm xs:text-base sm:text-lg md:text-xl font-bold px-5 xs:px-6 sm:px-8 md:px-10 py-4 xs:py-5 sm:py-6 md:py-7 shadow-[0_4px_20px_rgba(0,0,0,0.2)] sm:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] sm:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-200 group border-3 xs:border-[3.5px] sm:border-4 border-white hover:scale-105 rounded-lg sm:rounded-xl"
                  asChild
                >
                  <Link href="/projects" className="flex items-center justify-center">
                    <span className="truncate">Ver Projetos</span>
                    <ArrowRight className="ml-2 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0 group-hover:translate-x-2 transition-transform duration-200" />
                  </Link>
                </Button>

                <Button 
                  size="lg" 
                  className="flex-1 bg-white hover:bg-gray-50 text-red-800 text-sm xs:text-base sm:text-lg md:text-xl font-bold px-5 xs:px-6 sm:px-8 md:px-10 py-4 xs:py-5 sm:py-6 md:py-7 shadow-[0_4px_20px_rgba(0,0,0,0.2)] sm:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] sm:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-200 group border-3 xs:border-[3.5px] sm:border-4 border-white hover:scale-105 rounded-lg sm:rounded-xl"
                  asChild
                >
                  <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/curriculo.pdf`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    <span className="truncate">Download CV</span>
                    <Download className="ml-2 w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0 group-hover:translate-y-1 transition-transform duration-200" />
                  </a>
                </Button>
              </div>
              
              {/* Social buttons row */}
              <div className="flex gap-3 xs:gap-3.5 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-white/90 hover:bg-white text-slate-900 border-3 xs:border-[3.5px] sm:border-4 border-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-110 transition-all p-3 xs:p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl"
                  asChild
                >
                  <a href="https://www.linkedin.com/in/joaosousaa" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                  </a>
                </Button>
                
                <Button
                  size="lg"
                  className="bg-white/90 hover:bg-white text-slate-900 border-3 xs:border-[3.5px] sm:border-4 border-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-110 transition-all p-3 xs:p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl"
                  asChild
                >
                  <a href="https://github.com/JoaoSousa17" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <Github className="w-5 h-5 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
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
