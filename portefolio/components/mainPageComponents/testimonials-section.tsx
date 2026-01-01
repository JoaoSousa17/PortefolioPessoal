"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote, Loader2 } from "lucide-react"
import { supabase, type Testimonial } from "@/lib/supabase"

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  useEffect(() => {
    if (testimonials.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000) // Muda a cada 6 segundos

    return () => clearInterval(interval)
  }, [testimonials.length])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('visible', true)
        .order('order', { ascending: true })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
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
            <Quote className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Testemunhos
            </h2>
            <p className="text-white/90 text-lg mt-2 text-justify">
              O que dizem sobre o meu trabalho
            </p>
          </div>
        </div>

        {/* Testimonials Carousel */}
        {testimonials.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
            <Quote className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/90 text-xl">
              Nenhum testemunho disponível no momento.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Testimonial Card */}
            <Card className="bg-white border-0 shadow-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
              {/* Quote decoration */}
              <div className="absolute top-8 right-8 opacity-10">
                <Quote className="w-24 h-24 text-red-700" />
              </div>

              <div className="relative">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`transition-all duration-700 ${
                      index === currentIndex
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 absolute inset-0 translate-x-8 pointer-events-none'
                    }`}
                  >
                    {/* Content */}
                    <div className="text-center mb-8">
                      <p className="text-xl md:text-2xl text-slate-700 leading-relaxed italic mb-6">
                        "{testimonial.content}"
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="w-20 h-20 border-4 border-slate-200 shadow-lg">
                        <AvatarImage 
                          src={testimonial.image_url || undefined} 
                          alt={testimonial.author_name} 
                        />
                        <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-red-600 to-red-800 text-white">
                          {testimonial.author_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">
                          {testimonial.author_name}
                        </p>
                        {testimonial.role && (
                          <p className="text-base text-slate-600 font-medium">
                            {testimonial.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-12 h-3 bg-white shadow-lg'
                      : 'w-3 h-3 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Ver testemunho ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
