"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radar, ExternalLink, Loader2, Telescope } from "lucide-react"
import { supabase, type TechRadar } from "@/lib/supabase"
import { useTranslation } from "@/lib/hooks/useTranslation"

function getTranslated(item: any, field: string, lang: string): string {
  return item.translations?.[lang]?.[field]
      || item.translations?.['en']?.[field]
      || item[field]
      || ''
}

export function TechRadarSection() {
  const { t, language } = useTranslation()

  const [techItems, setTechItems] = useState<TechRadar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTechRadar()
  }, [])

  const fetchTechRadar = async () => {
    try {
      const { data, error } = await supabase
        .from('tech_radar')
        .select('*')
        .eq('is_valid', true)
        .order('category', { ascending: true })

      if (error) throw error
      setTechItems(data || [])
    } catch (error) {
      console.error('Error fetching tech radar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryBadge = (category: string | null) => {
    switch (category) {
      case 'learn':
        return { label: t.techRadar.categories.learn, color: 'bg-amber-100 text-amber-800 border-amber-300' }
      case 'using':
        return { label: t.techRadar.categories.using, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
      case 'explore':
        return { label: t.techRadar.categories.explore, color: 'bg-red-100 text-red-800 border-red-300' }
      default:
        return null
    }
  }

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

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-slate-800/5 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-red-700/5 rounded-full blur-3xl" />
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-xl">
            <Radar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              {t.techRadar.title}
            </h2>
            <p className="text-slate-700 text-lg mt-2 text-justify">
              {t.techRadar.subtitle}
            </p>
          </div>
        </div>

        {/* Tech Items Grid */}
        {techItems.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-slate-300">
            <Radar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 text-xl">
              {t.techRadar.empty}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {techItems.map((item, index) => {
              const badge = getCategoryBadge(item.category)
              const name  = getTranslated(item, '_name', language)
              const notes = getTranslated(item, 'notes', language)

              return (
                <Card
                  key={item.id}
                  className="group bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden animate-in fade-in slide-in-from-bottom flex flex-col h-full"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="relative h-40 overflow-hidden bg-black">
                    {item.image_url ? (
                      <>
                        <img
                          src={item.image_url}
                          alt={name}
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Telescope className="w-16 h-16 text-slate-300" />
                      </div>
                    )}

                    {badge && (
                      <Badge className={`absolute top-3 right-3 ${badge.color} border font-semibold shadow-lg`}>
                        {badge.label}
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3 flex-grow">
                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight">
                      {name}
                    </CardTitle>
                    {notes && (
                      <CardDescription className="text-sm text-slate-600 leading-relaxed line-clamp-2 mt-2 text-justify">
                        {notes}
                      </CardDescription>
                    )}
                  </CardHeader>

                  {item.urll && (
                    <CardContent className="pt-0 pb-4 mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-700 hover:text-red-800 hover:bg-red-50 font-semibold group/btn"
                        asChild
                      >
                        <a href={item.urll} target="_blank" rel="noopener noreferrer">
                          {t.techRadar.learnMore}
                          <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </a>
                      </Button>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
