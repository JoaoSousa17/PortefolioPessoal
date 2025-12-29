"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Languages, Star, Info, Loader2 } from "lucide-react"
import { supabase, type Language } from "@/lib/supabase"

export function LanguagesSection() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null)

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('_level', { ascending: false })

      if (error) throw error
      setLanguages(data || [])
    } catch (error) {
      console.error('Error fetching languages:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (level: number | null) => {
    if (!level) return null
    const fullStars = Math.floor(level)
    const hasHalfStar = level % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-5 h-5 text-slate-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-slate-300" />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <section className="relative w-full bg-[#A99290] py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative w-full bg-[#A99290] py-16 md:py-24 overflow-hidden">
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-700/10 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-800/10 rounded-full blur-3xl" />
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center shadow-xl">
            <Languages className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Línguas
            </h2>
            <p className="text-white/90 text-lg mt-2">
              Idiomas que domino e estou a aprender
            </p>
          </div>
        </div>

        {/* Languages Grid */}
        {languages.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
            <Languages className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/90 text-xl">
              Nenhuma língua registada no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((language, index) => (
              <Card
                key={language.id}
                className="group relative bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-visible animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  {/* Flag and Name */}
                  <div className="flex items-center gap-4 mb-4">
                    {language.flag_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md border-2 border-slate-200 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={language.flag_url} 
                          alt={language._name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                        {language._name}
                      </h3>
                    </div>
                    
                    {/* Info Icon with Tooltip */}
                    {language.info && (
                      <div 
                        className="relative"
                        onMouseEnter={() => setHoveredLanguage(language.id)}
                        onMouseLeave={() => setHoveredLanguage(null)}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 flex items-center justify-center cursor-help transition-colors duration-300">
                          <Info className="w-4 h-4 text-slate-600 hover:text-red-700 transition-colors" />
                        </div>
                        
                        {/* Tooltip */}
                        {hoveredLanguage === language.id && (
                          <div className="absolute z-50 bottom-full right-0 mb-2 w-72 p-4 bg-slate-900 text-white text-sm rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-slate-900 rotate-45" />
                            <p className="relative z-10 leading-relaxed">{language.info}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-2">
                    {renderStars(language._level)}
                    {language._level && (
                      <span className="text-sm font-semibold text-slate-600 ml-2">
                        {language._level.toFixed(1)}/5.0
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
