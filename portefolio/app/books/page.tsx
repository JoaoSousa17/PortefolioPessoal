"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, BookOpen, ExternalLink, Calendar, Loader2,
  Search, X, Star, Filter, ChevronDown, ChevronUp, CheckSquare, Square
} from "lucide-react"
import { supabase, type Book } from "@/lib/supabase"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"
import { useTranslation } from "@/lib/hooks/useTranslation"

type SortMode = 'featured' | 'date'
type ReadFilter = 'all' | 'read' | 'unread'

export default function BooksPage() {
  const { t, language } = useTranslation()
  const [books, setBooks]           = useState<Book[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [sortMode, setSortMode]     = useState<SortMode>('featured')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => { fetchBooks() }, [])

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('read_date', { ascending: false, nullsFirst: false })
      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let list = [...books]

    // Text search — title + authors
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.authors?.some(a => a.toLowerCase().includes(q))
      )
    }

    // Read / unread filter
    if (readFilter === 'read')   list = list.filter(b => b.read_date !== null)
    if (readFilter === 'unread') list = list.filter(b => b.read_date === null)

    // Sort
    if (sortMode === 'featured') {
      list.sort((a, b) => (a.show_on_main === b.show_on_main ? 0 : a.show_on_main ? -1 : 1))
    } else {
      // date: read books sorted desc, unread at the end
      list.sort((a, b) => {
        if (!a.read_date && !b.read_date) return 0
        if (!a.read_date) return 1
        if (!b.read_date) return -1
        return new Date(b.read_date).getTime() - new Date(a.read_date).getTime()
      })
    }

    return list
  }, [books, search, readFilter, sortMode])

  const hasFilters  = search.trim() !== '' || readFilter !== 'all'
  const clearFilters = () => { setSearch(''); setReadFilter('all') }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' })
  }

  const getGoogleBooksUrl = (googleBookId: string | null) => {
    if (!googleBookId) return null
    return `https://books.google.com/books?id=${googleBookId}`
  }

  const readCount   = books.filter(b => b.read_date !== null).length
  const unreadCount = books.filter(b => b.read_date === null).length

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-600/20 rounded-full blur-3xl" />
          </div>
          <div className="relative container mx-auto px-4 sm:px-6">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-6 sm:mb-8 group text-sm sm:text-base" asChild>
              <Link href="/">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t.booksPage.backHome}
              </Link>
            </Button>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-xl">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold drop-shadow-lg">{t.booksPage.title}</h1>
                <p className="text-base sm:text-xl text-white/90 mt-1 sm:mt-2">{t.booksPage.subtitle}</p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-6 mt-6 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{books.length}</p>
                <p className="text-xs sm:text-sm text-white/80">{t.booksPage.stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 py-2 sm:px-6 sm:py-3 border border-white/20">
                <p className="text-2xl sm:text-3xl font-bold">{books.filter(b => b.show_on_main).length}</p>
                <p className="text-xs sm:text-sm text-white/80">{t.booksPage.stats.featured}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter card — floating over hero bottom */}
        <div className="container mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-8 sm:mb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">

            {/* Search + sort row */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={language === 'pt' ? 'Pesquisar por título ou autor...' : 'Search by title or author...'}
                  className="pl-10 h-11 border-slate-200 bg-slate-50 focus:bg-white focus:border-red-600 rounded-xl text-sm transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {/* Sort toggle */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setSortMode('featured')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortMode === 'featured' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${sortMode === 'featured' ? 'text-red-600 fill-red-600' : ''}`} />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Destaque' : 'Featured'}</span>
                  </button>
                  <button
                    onClick={() => setSortMode('date')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortMode === 'date' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 ${sortMode === 'date' ? 'text-red-600' : ''}`} />
                    <span className="hidden sm:inline">{language === 'pt' ? 'Data' : 'Date'}</span>
                  </button>
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    filtersOpen || readFilter !== 'all'
                      ? 'bg-red-700 text-white border-red-700 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-red-600 hover:text-red-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{language === 'pt' ? 'Filtros' : 'Filters'}</span>
                  {readFilter !== 'all' && <span className="w-2 h-2 rounded-full bg-white/80" />}
                  {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Collapsible filters */}
            {filtersOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] mb-3 pt-4">
                  {language === 'pt' ? 'Estado de leitura' : 'Reading status'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'all',    labelPt: 'Todos',       labelEn: 'All',      count: books.length },
                    { value: 'read',   labelPt: 'Lidos',       labelEn: 'Read',     count: readCount },
                    { value: 'unread', labelPt: 'Não lidos',   labelEn: 'Unread',   count: unreadCount },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setReadFilter(opt.value)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all hover:scale-105 active:scale-95 ${
                        readFilter === opt.value
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {readFilter === opt.value
                        ? <CheckSquare className="w-3.5 h-3.5" />
                        : <Square className="w-3.5 h-3.5" />}
                      {language === 'pt' ? opt.labelPt : opt.labelEn}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        readFilter === opt.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>{opt.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results strip */}
            {!loading && (
              <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">
                  {filtered.length === books.length
                    ? `${books.length} ${language === 'pt' ? 'livros' : 'books'}`
                    : `${filtered.length} ${language === 'pt' ? 'de' : 'of'} ${books.length} ${language === 'pt' ? 'livros' : 'books'}`
                  }
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-700 font-semibold hover:text-red-800">
                    <X className="w-3 h-3" />
                    {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Books Grid */}
        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-slate-700 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-16 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-700 text-lg font-semibold mb-1">
                  {language === 'pt' ? 'Nenhum livro encontrado' : 'No books found'}
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  {language === 'pt' ? 'Tenta ajustar os filtros' : 'Try adjusting the filters'}
                </p>
                <Button variant="outline" onClick={clearFilters} className="rounded-xl border-2 hover:border-red-700 hover:text-red-700">
                  {language === 'pt' ? 'Limpar filtros' : 'Clear filters'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
                {filtered.map((book, index) => (
                  <Card
                    key={book.id}
                    className="group bg-white border-0 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 overflow-hidden animate-in fade-in zoom-in flex flex-col"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
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

                      {book.show_on_main && (
                        <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-lg text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                          {t.booksPage.featuredBadge}
                        </Badge>
                      )}

                      {/* To Read badge */}
                      {!book.read_date && (
                        <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                          {language === 'pt' ? 'Por ler' : 'To Read'}
                        </Badge>
                      )}

                      <div className="absolute right-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 opacity-60" />
                    </div>

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
                      {book.read_date ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 mb-2 sm:mb-3 text-[10px] sm:text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(book.read_date)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-2 sm:mb-3 text-[10px] sm:text-xs text-amber-600 font-medium">
                          <BookOpen className="w-3 h-3" />
                          <span>{language === 'pt' ? 'Por ler' : 'Unread'}</span>
                        </div>
                      )}

                      {book.google_book_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-2 hover:border-red-700 hover:bg-red-50 hover:text-red-700 transition-all font-medium text-[10px] sm:text-xs h-8 sm:h-9"
                          asChild
                        >
                          <a href={getGoogleBooksUrl(book.google_book_id)!} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1 sm:mr-2" />
                            {t.booksPage.viewOnGoogle}
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
