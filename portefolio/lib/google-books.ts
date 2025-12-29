// Google Books API Service

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'

export type GoogleBook = {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    description?: string
    publishedDate?: string
    pageCount?: number
    categories?: string[]
    averageRating?: number
  }
}

export type GoogleBooksSearchResponse = {
  items?: GoogleBook[]
  totalItems: number
}

/**
 * Pesquisar livros na Google Books API
 * @param query - Termo de pesquisa (título, autor, ISBN, etc.)
 * @param maxResults - Número máximo de resultados (padrão: 10)
 */
export async function searchBooks(
  query: string, 
  maxResults: number = 10
): Promise<GoogleBooksSearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      printType: 'books',
      langRestrict: 'pt', // Prioriza livros em português
    })

    // Se tiveres uma API Key do Google, adiciona aqui
    // const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
    // if (apiKey) {
    //   params.append('key', apiKey)
    // }

    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error searching books:', error)
    throw error
  }
}

/**
 * Obter detalhes de um livro específico pelo ID
 * @param bookId - Google Books ID
 */
export async function getBookById(bookId: string): Promise<GoogleBook> {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${bookId}`)
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching book details:', error)
    throw error
  }
}

/**
 * Formatar livro do Google Books para o formato da nossa DB
 */
export function formatGoogleBookForDB(googleBook: GoogleBook) {
  return {
    google_book_id: googleBook.id,
    title: googleBook.volumeInfo.title,
    authors: googleBook.volumeInfo.authors || [],
    cover_url: googleBook.volumeInfo.imageLinks?.thumbnail || 
               googleBook.volumeInfo.imageLinks?.smallThumbnail || null,
  }
}

/**
 * Pesquisar por ISBN (mais preciso)
 */
export async function searchByISBN(isbn: string): Promise<GoogleBook | null> {
  try {
    const data = await searchBooks(`isbn:${isbn}`, 1)
    return data.items?.[0] || null
  } catch (error) {
    console.error('Error searching by ISBN:', error)
    return null
  }
}
