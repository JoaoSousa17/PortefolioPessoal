"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, BookOpen, Loader2, ArrowRight } from "lucide-react"
import { supabase, type Book } from "@/lib/supabase"
import Link from "next/link"

export function BooksSection() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const authors = books[currentIndex]?.authors
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (books.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [books.length])

  useEffect(() => {
    if (books.length === 0) return
  
    setAnimating(true)
  
    const timeout = setTimeout(() => {
      setAnimating(false)
    }, 300)
  
    return () => clearTimeout(timeout)
  }, [currentIndex])  

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('show_on_main', true)
        .order('read_date', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + books.length) % books.length)
  }
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % books.length)
  }  

  const getBookAtPosition = (offset: number) => {
    const index = (currentIndex + offset + books.length) % books.length
    return books[index]
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
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Livros
            </h2>
            <p className="text-slate-700 text-lg mt-2">
              Leituras que me inspiraram e moldaram
            </p>
          </div>
        </div>

        {/* Carousel */}
{books.length === 0 ? (
  <div className="bg-white/60 rounded-2xl p-12 text-center border border-slate-300 mb-12">
    <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
    <p className="text-slate-700 text-xl">
      Nenhum livro em destaque no momento.
    </p>
  </div>
) : (
  <div className="relative max-w-6xl mx-auto mb-16">

    {/* Navigation */}
    <div className="absolute -top-14 right-0 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        className="rounded-full border-slate-300 hover:bg-slate-100"
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        className="rounded-full border-slate-300 hover:bg-slate-100"
      >
        <ChevronRight />
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">

      {/* Main Book */}
      <div className={`md:col-span-3 flex gap-8 items-center transition-all duration-300 ease-out ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>

        {/* Cover */}
        <div className="w-56 h-80 rounded-xl overflow-hidden shadow-2xl border border-slate-200 flex-shrink-0">
          {books[currentIndex]?.cover_url ? (
            <img
              src={books[currentIndex].cover_url ?? undefined}
              alt={books[currentIndex].title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-slate-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="max-w-md">
          <h3 className="text-3xl font-bold text-slate-900 mb-3">
            {books[currentIndex]?.title}
          </h3>

        {authors && authors.length > 0 && (
        <p className="text-slate-600 font-medium mb-4">
            {authors.join(", ")}
        </p>
        )}

          {books[currentIndex]?.notes && (
            <p className="text-slate-600 leading-relaxed italic">
              “{books[currentIndex].notes}”
            </p>
          )}
        </div>
      </div>

      {/* Next Preview */}
      {books.length > 1 && (
        <div
          className="md:col-span-2 flex flex-col items-center opacity-60 hover:opacity-100 transition cursor-pointer"
          onClick={handleNext}
        >
          <p className="text-sm uppercase tracking-widest text-slate-500 mb-4">
            Próximo
          </p>

          <div className="w-40 h-60 rounded-lg overflow-hidden border border-slate-300 shadow-lg">
            {getBookAtPosition(1)?.cover_url ? (
              <img
                src={getBookAtPosition(1)?.cover_url ?? undefined}
                alt="Próximo livro"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Dots */}
    <div className="flex justify-center gap-2 mt-10">
      {books.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={`h-2 rounded-full transition-all ${
            index === currentIndex
              ? "w-8 bg-slate-900"
              : "w-2 bg-slate-400 hover:bg-slate-600"
          }`}
        />
      ))}
    </div>
  </div>
)}
        {/* View All Button */}
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom" style={{ animationDelay: '200ms' }}>
        <Button 
        size="lg"
        className="bg-slate-700 hover:bg-slate-800 text-white text-xl font-bold px-12 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 group border-4 border-slate-700 hover:scale-105"
        asChild
        >
        <Link href="/books">
            Consultar Todos os Livros
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </Link>
        </Button>
        </div>

      </div>
    </section>
  )
}
