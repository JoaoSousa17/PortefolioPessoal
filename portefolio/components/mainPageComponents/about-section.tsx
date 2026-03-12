"use client"

import { useState, useEffect } from "react"
import { User, Code2, Loader2 } from "lucide-react"
import { supabase, type Profile } from "@/lib/supabase"
import { useTranslation } from "@/lib/hooks/useTranslation"

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

export function AboutSection() {
  const { t, language } = useTranslation()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="relative w-full bg-[#E8E2E1] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-10 h-10 text-slate-700 animate-spin" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />
      </section>
    )
  }

  const whoAmI   = profile ? getTranslated(profile, 'about_who_am_i', language) : ''
  const developer = profile ? getTranslated(profile, 'about_developer', language) : ''

  return (
    <section className="relative w-full bg-[#E8E2E1] py-12 md:py-16">
      <div className="container mx-auto px-6">
        
        <div className="space-y-16">
          
          {/* Quem sou eu? */}
          {whoAmI && (
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
                  {whoAmI}
                </p>
              </div>
            </div>
          )}

          {/* O que me define enquanto developer? */}
          {developer && (
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
                  {developer}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />
    </section>
  )
}
