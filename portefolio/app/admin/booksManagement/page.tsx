"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Loader2, 
  BookOpen, 
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Search,
  Star,
  Calendar,
  ExternalLink
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { searchBooks, type GoogleBook, formatGoogleBookForDB } from "@/lib/google-books"
import { TopBar } from "@/components/ui/top-bar"
import { Footer } from "@/components/ui/footer"
import Link from "next/link"

type Book = {
  id: string
  google_book_id: string | null
  title: string
  authors: string[] | null
  cover_url: string | null
  notes: string | null
  read_date: string | null
  show_on_main: boolean
  created_at: string
}

type EditingBook = {
  id: string
  title: string
  authors: string
  cover_url: string
  notes: string
  read_date: string
  show_on_main: boolean
}

export default function BooksManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<EditingBook | null>(null)
  
  // Google Books Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([])
  const [searching, setSearching] = useState(false)
  const [addingBookId, setAddingBookId] = useState<string | null>(null)

  // Manual Add
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualBook, setManualBook] = useState({
    title: '',
    authors: '',
    cover_url: '',
    notes: '',
    read_date: '',
    google_book_id: '', // External link for manual books
    show_on_main: false
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    fetchBooks()
  }, [router])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('read_date', { ascending: false, nullsFirst: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error('Error fetching books:', error)
      setErrorMessage('Erro ao carregar livros')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const data = await searchBooks(searchQuery, 12)
      setSearchResults(data.items || [])
      
      if (!data.items || data.items.length === 0) {
        setErrorMessage('Nenhum resultado encontrado')
        setTimeout(() => setErrorMessage(''), 3000)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setErrorMessage('Erro ao pesquisar livros')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSearching(false)
    }
  }

  const handleAddGoogleBook = async (googleBook: GoogleBook) => {
    setAddingBookId(googleBook.id)
    try {
      const bookData = formatGoogleBookForDB(googleBook)
      
      const { error } = await supabase
        .from('books')
        .insert([{
          ...bookData,
          show_on_main: false,
        }])

      if (error) {
        if (error.code === '23505') {
          setErrorMessage('Este livro já foi adicionado!')
        } else {
          throw error
        }
        setTimeout(() => setErrorMessage(''), 5000)
        return
      }

      setSuccessMessage('Livro adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // Clear search
      setSearchQuery('')
      setSearchResults([])
      
      fetchBooks()
    } catch (error) {
      console.error('Error adding book:', error)
      setErrorMessage('Erro ao adicionar livro')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setAddingBookId(null)
    }
  }

  const handleAddManualBook = async () => {
    if (!manualBook.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const authorsArray = manualBook.authors
        ? manualBook.authors.split(',').map(a => a.trim()).filter(Boolean)
        : null

      const { error } = await supabase
        .from('books')
        .insert([{
          title: manualBook.title,
          authors: authorsArray,
          cover_url: manualBook.cover_url || null,
          notes: manualBook.notes || null,
          read_date: manualBook.read_date || null,
          google_book_id: manualBook.google_book_id || null, // External link
          show_on_main: manualBook.show_on_main
        }])

      if (error) throw error

      setSuccessMessage('Livro adicionado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setManualBook({
        title: '',
        authors: '',
        cover_url: '',
        notes: '',
        read_date: '',
        google_book_id: '',
        show_on_main: false
      })
      setShowManualForm(false)
      
      fetchBooks()
    } catch (error) {
      console.error('Error adding manual book:', error)
      setErrorMessage('Erro ao adicionar livro. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (book: Book) => {
    setEditingId(book.id)
    setEditingData({
      id: book.id,
      title: book.title,
      authors: book.authors ? book.authors.join(', ') : '',
      cover_url: book.cover_url || '',
      notes: book.notes || '',
      read_date: book.read_date || '',
      show_on_main: book.show_on_main
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
  }

  const saveEdit = async () => {
    if (!editingData) return

    if (!editingData.title.trim()) {
      setErrorMessage('O título é obrigatório')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      setSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const authorsArray = editingData.authors
        ? editingData.authors.split(',').map(a => a.trim()).filter(Boolean)
        : null

      const { error } = await supabase
        .from('books')
        .update({
          title: editingData.title,
          authors: authorsArray,
          cover_url: editingData.cover_url || null,
          notes: editingData.notes || null,
          read_date: editingData.read_date || null,
          show_on_main: editingData.show_on_main
        })
        .eq('id', editingData.id)

      if (error) throw error

      setSuccessMessage('Livro atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      setEditingId(null)
      setEditingData(null)
      
      fetchBooks()
    } catch (error) {
      console.error('Error updating book:', error)
      setErrorMessage('Erro ao atualizar livro. Tenta novamente.')
      setTimeout(() => setErrorMessage(''), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar este livro?')) return

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('Livro eliminado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      setErrorMessage('Erro ao eliminar livro')
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E2E1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar livros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E8E2E1] flex flex-col">
      <TopBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-amber-600/20 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-amber-700/15 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          <div className="relative container mx-auto px-6">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mb-6 group"
              asChild
            >
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Dashboard
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                  Gestão de Livros
                </h1>
                <p className="text-xl text-white/90 mt-2">
                  {books.length} livro{books.length !== 1 ? 's' : ''} • {books.filter(b => b.show_on_main).length} em destaque
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 max-w-7xl">
            
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-emerald-900 text-lg">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top shadow-lg">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-red-900 text-lg">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-8">
              
              {/* Books List */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600" />
                <CardHeader className="bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
                        Livros Existentes
                      </CardTitle>
                      <CardDescription className="text-slate-700 text-base">
                        Edita ou elimina livros
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-white">
                  {books.length === 0 ? (
                    <div className="p-12 text-center">
                      <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-700 text-lg">
                        Nenhum livro adicionado ainda.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                      {books.map((book, index) => (
                        <div
                          key={book.id}
                          className="group bg-white border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:shadow-lg transition-all duration-300"
                          style={{
                            animation: 'fadeIn 0.3s ease-in',
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'backwards'
                          }}
                        >
                          {editingId === book.id && editingData ? (
                            // EDITING MODE
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold">Título *</Label>
                                <Input
                                  value={editingData.title}
                                  onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                                  className="h-9 border-2 border-amber-600 rounded text-sm"
                                  autoFocus
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-semibold">Autores (sep. por vírgula)</Label>
                                <Input
                                  value={editingData.authors}
                                  onChange={(e) => setEditingData({ ...editingData, authors: e.target.value })}
                                  className="h-9 border-2 border-amber-600 rounded text-sm"
                                  placeholder="Autor 1, Autor 2"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-semibold">URL da Capa</Label>
                                <Input
                                  value={editingData.cover_url}
                                  onChange={(e) => setEditingData({ ...editingData, cover_url: e.target.value })}
                                  className="h-9 border-2 border-amber-600 rounded text-sm"
                                  placeholder="https://..."
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-semibold">Notas</Label>
                                <Textarea
                                  value={editingData.notes}
                                  onChange={(e) => setEditingData({ ...editingData, notes: e.target.value })}
                                  rows={2}
                                  className="border-2 border-amber-600 rounded text-sm resize-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs font-semibold">Data de Leitura</Label>
                                <Input
                                  type="date"
                                  value={editingData.read_date}
                                  onChange={(e) => setEditingData({ ...editingData, read_date: e.target.value })}
                                  className="h-9 border-2 border-amber-600 rounded text-sm"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`edit-featured-${book.id}`}
                                  checked={editingData.show_on_main}
                                  onChange={(e) => setEditingData({ ...editingData, show_on_main: e.target.checked })}
                                  className="w-4 h-4 text-amber-600"
                                />
                                <Label htmlFor={`edit-featured-${book.id}`} className="text-xs font-semibold cursor-pointer">
                                  Mostrar em destaque
                                </Label>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={saveEdit}
                                  disabled={saving}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditing}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // VIEW MODE
                            <>
                              {/* Cover */}
                              <div className="relative h-48 bg-slate-100 rounded-t-xl overflow-hidden">
                                {book.cover_url ? (
                                  <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-slate-400" />
                                  </div>
                                )}
                                {book.show_on_main && (
                                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white border-0">
                                    <Star className="w-3 h-3 mr-1 fill-white" />
                                    Destaque
                                  </Badge>
                                )}
                              </div>

                              {/* Info */}
                              <div className="p-4 space-y-2">
                                <h3 className="font-bold text-slate-900 line-clamp-2 text-sm min-h-[2.5rem]">
                                  {book.title}
                                </h3>
                                
                                {book.authors && book.authors.length > 0 && (
                                  <p className="text-xs text-slate-600 line-clamp-1">
                                    {book.authors.join(', ')}
                                  </p>
                                )}

                                {book.read_date && (
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(book.read_date)}
                                  </div>
                                )}

                                {book.notes && (
                                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                                    "{book.notes}"
                                  </p>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditing(book)}
                                    className="flex-1 text-blue-600 hover:bg-blue-50"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(book.id)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Google Books Search */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
                <CardHeader className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 pt-8 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
                        Pesquisar no Google Books
                      </CardTitle>
                      <CardDescription className="text-blue-700 text-base">
                        Encontra e adiciona livros da API do Google
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <form onSubmit={handleGoogleSearch} className="flex gap-2 mb-6">
                    <Input
                      type="text"
                      placeholder="Pesquisar por título, autor ou ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 h-11 border-2 border-slate-300 focus:border-blue-600"
                    />
                    <Button 
                      type="submit" 
                      disabled={searching}
                      className="h-11 bg-blue-600 hover:bg-blue-700"
                    >
                      {searching ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Pesquisar
                    </Button>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((book) => (
                        <div key={book.id} className="border-2 border-slate-200 rounded-xl p-4 hover:border-blue-500 transition-colors">
                          <div className="flex gap-3">
                            {/* Cover */}
                            <div className="flex-shrink-0 w-16 h-24 bg-slate-100 rounded overflow-hidden">
                              {book.volumeInfo.imageLinks?.thumbnail ? (
                                <img
                                  src={book.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')}
                                  alt={book.volumeInfo.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1">
                                {book.volumeInfo.title}
                              </h4>
                              {book.volumeInfo.authors && (
                                <p className="text-xs text-slate-600 line-clamp-1 mb-2">
                                  {book.volumeInfo.authors.join(', ')}
                                </p>
                              )}
                              {book.volumeInfo.publishedDate && (
                                <Badge variant="outline" className="text-xs mb-2">
                                  {book.volumeInfo.publishedDate.split('-')[0]}
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleAddGoogleBook(book)}
                                disabled={addingBookId === book.id}
                                className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
                              >
                                {addingBookId === book.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : (
                                  <Plus className="w-3 h-3 mr-1" />
                                )}
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manual Add Form */}
              <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600" />
                <CardHeader className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 pt-8 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Plus className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-3xl font-bold text-amber-900 mb-2">
                          Adicionar Livro Manualmente
                        </CardTitle>
                        <CardDescription className="text-amber-700 text-base">
                          Para livros não encontrados no Google Books
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowManualForm(!showManualForm)}
                      className="text-amber-900 hover:bg-amber-200"
                    >
                      {showManualForm ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </div>
                </CardHeader>
                
                {showManualForm && (
                  <CardContent className="p-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Title */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="manual-title" className="text-slate-900 font-semibold text-sm">
                          Título *
                        </Label>
                        <Input
                          id="manual-title"
                          value={manualBook.title}
                          onChange={(e) => setManualBook(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Nome do livro"
                          className="h-11 border-2 border-slate-300 focus:border-amber-600 rounded-lg"
                        />
                      </div>

                      {/* Authors */}
                      <div className="space-y-2">
                        <Label htmlFor="manual-authors" className="text-slate-900 font-semibold text-sm">
                          Autores (separados por vírgula)
                        </Label>
                        <Input
                          id="manual-authors"
                          value={manualBook.authors}
                          onChange={(e) => setManualBook(prev => ({ ...prev, authors: e.target.value }))}
                          placeholder="Autor 1, Autor 2"
                          className="h-11 border-2 border-slate-300 focus:border-amber-600 rounded-lg"
                        />
                      </div>

                      {/* Read Date */}
                      <div className="space-y-2">
                        <Label htmlFor="manual-date" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          Data de Leitura
                        </Label>
                        <Input
                          id="manual-date"
                          type="date"
                          value={manualBook.read_date}
                          onChange={(e) => setManualBook(prev => ({ ...prev, read_date: e.target.value }))}
                          className="h-11 border-2 border-slate-300 focus:border-amber-600 rounded-lg"
                        />
                      </div>

                      {/* Cover URL */}
                      <div className="space-y-2">
                        <Label htmlFor="manual-cover" className="text-slate-900 font-semibold text-sm">
                          URL da Capa
                        </Label>
                        <Input
                          id="manual-cover"
                          value={manualBook.cover_url}
                          onChange={(e) => setManualBook(prev => ({ ...prev, cover_url: e.target.value }))}
                          placeholder="https://..."
                          className="h-11 border-2 border-slate-300 focus:border-amber-600 rounded-lg"
                        />
                      </div>

                      {/* External Link */}
                      <div className="space-y-2">
                        <Label htmlFor="manual-link" className="text-slate-900 font-semibold text-sm flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-amber-600" />
                          Link Externo (opcional)
                        </Label>
                        <Input
                          id="manual-link"
                          value={manualBook.google_book_id}
                          onChange={(e) => setManualBook(prev => ({ ...prev, google_book_id: e.target.value }))}
                          placeholder="https://..."
                          className="h-11 border-2 border-slate-300 focus:border-amber-600 rounded-lg"
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="manual-notes" className="text-slate-900 font-semibold text-sm">
                          Notas
                        </Label>
                        <Textarea
                          id="manual-notes"
                          value={manualBook.notes}
                          onChange={(e) => setManualBook(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Pensamentos sobre o livro..."
                          rows={3}
                          className="border-2 border-slate-300 focus:border-amber-600 rounded-lg resize-none"
                        />
                      </div>

                      {/* Show on Main */}
                      <div className="flex items-center gap-3 md:col-span-2">
                        <input
                          type="checkbox"
                          id="manual-featured"
                          checked={manualBook.show_on_main}
                          onChange={(e) => setManualBook(prev => ({ ...prev, show_on_main: e.target.checked }))}
                          className="w-5 h-5 text-amber-600"
                        />
                        <Label htmlFor="manual-featured" className="text-slate-900 font-semibold text-sm cursor-pointer flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          Mostrar em Destaque
                        </Label>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="flex justify-end mt-6 pt-6 border-t-2 border-slate-200">
                      <Button
                        onClick={handleAddManualBook}
                        disabled={saving}
                        className="h-12 px-8 text-base font-bold bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            A adicionar...
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                            Adicionar Livro
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
