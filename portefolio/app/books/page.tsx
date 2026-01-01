"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, ExternalLink, Calendar, Loader2 } from "lucide-react"
import { supabase, type Book } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('read_date', { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })
  }

  const getGoogleBooksUrl = (googleBookId: string | null) => {
    if (!googleBookId) return null
    return `https://books.google.com/books?id=${googleBookId}`
  }

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-16 md:py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-6 sm:mb-8 group text-sm sm:text-base"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar à página inicial
              </Link>
            </Button>

            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold drop-shadow-lg">
                  Biblioteca
                </h1>
                <p className="text-base sm:text-xl text-white/90 mt-1 sm:mt-2">
                  Todos os livros que li e me marcaram
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{books.length}</p>
                <p className="text-xs sm:text-sm text-white/80">Livros Lidos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{books.filter(b => b.show_on_main).length}</p>
                <p className="text-xs sm:text-sm text-white/80">Em Destaque</p>
              </div>
            </div>
          </div>
        </section>

        {/* Books Grid */}
        <section className="py-8 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-slate-300">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 text-xl">
                  Nenhum livro disponível no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
                {books.map((book, index) => (
                  <Card 
                    key={book.id}
                    className="group bg-white border-0 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 overflow-hidden animate-in fade-in zoom-in flex flex-col"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Book Cover */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                      {book.cover_url ? (
                        <>
                          <img 
                            src={book.cover_url} 
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
                        </div>
                      )}
                      
                      {/* Featured badge */}
                      {book.show_on_main && (
                        <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                          Destaque
                        </Badge>
                      )}

                      {/* Book spine effect */}
                      <div className="absolute right-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 opacity-60" />
                    </div>
                    
                    {/* Content */}
                    <CardHeader className="p-3 sm:p-4 flex-grow">
                      <CardTitle className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-tight line-clamp-2 mb-1.5 sm:mb-2">
                        {book.title}
                      </CardTitle>
                      {book.authors && book.authors.length > 0 && (
                        <CardDescription className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                          {book.authors.join(', ')}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="p-3 sm:p-4 pt-0 mt-auto">
                      {/* Read Date */}
                      {book.read_date && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 mb-2 sm:mb-3 text-[10px] sm:text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(book.read_date)}</span>
                        </div>
                      )}

                      {/* Google Books Link */}
                      {book.google_book_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-2 hover:border-red-700 hover:bg-red-50 hover:text-red-700 transition-all font-medium text-[10px] sm:text-xs h-8 sm:h-9"
                          asChild
                        >
                          <a href={getGoogleBooksUrl(book.google_book_id)!} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1 sm:mr-2" />
                            Ver no Google Books
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
