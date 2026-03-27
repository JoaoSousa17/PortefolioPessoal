"use client"

import { Sparkles, Loader2 } from "lucide-react"
import { useTranslation } from "@/lib/hooks/useTranslation"
import { useSkillsData, SkillsGrid } from "./skills-section-desktop"

function getTranslatedLocal(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

export function SkillsSection() {
  const { t, language } = useTranslation()
  const { categories, skillsByCategory, skillContext, loading } = useSkillsData()

  if (loading) {
    return (
      <section className="relative w-full bg-[#E8E2E1] py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full bg-[#E8E2E1] py-16 md:py-24 overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] top-1/4 -right-32 bg-red-700/5 rounded-full blur-3xl" />
        <div className="absolute w-[600px] h-[600px] bottom-1/4 -left-48 bg-slate-800/5 rounded-full blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">

        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">{t.skills.title}</h2>
            <p className="text-slate-700 text-lg mt-2 text-justify">{t.skills.subtitle}</p>
          </div>
        </div>

        {Object.keys(skillsByCategory).length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-slate-300">
            <Sparkles className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 text-xl">{t.skills.empty}</p>
          </div>
        ) : (
          <SkillsGrid
            categories={categories}
            skillsByCategory={skillsByCategory}
            skillContext={skillContext}
            language={language}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes shine { 0% { transform:translateX(-100%) } 100% { transform:translateX(100%) } }
        .animate-shine   { animation: shine 0.8s ease-in-out }
      `}</style>
    </section>
  )
}