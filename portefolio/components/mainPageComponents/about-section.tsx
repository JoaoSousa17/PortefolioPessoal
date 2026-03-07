"use client"

import { User, Code2 } from "lucide-react"
import { useTranslation } from "@/lib/hooks/useTranslation"

export function AboutSection() {
  const { t } = useTranslation()

  return (
    <section className="relative w-full bg-[#E8E2E1] py-12 md:py-16">
      <div className="container mx-auto px-6">
        
        <div className="space-y-16">
          
          {/* Quem sou eu? */}
          <div className="group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                {t.about.whoAmI.title}
              </h2>
            </div>
            
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed hyphens-auto text-justify whitespace-pre-line">
                {t.about.whoAmI.text}
              </p>
            </div>
          </div>

          {/* O que me define enquanto developer? */}
          <div className="group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                {t.about.developer.title}
              </h2>
            </div>
            
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-200">
              <p className="text-lg md:text-xl text-slate-700 leading-relaxed hyphens-auto text-justify whitespace-pre-line">
                {t.about.developer.text}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />
    </section>
  )
}
