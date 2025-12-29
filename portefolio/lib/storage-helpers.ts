import { supabase } from './supabase'

/**
 * Upload de ficheiro para o Supabase Storage
 * @param file - Ficheiro a fazer upload
 * @param bucket - Nome do bucket ('avatars', 'websites', 'cvs', etc)
 * @param path - Caminho dentro do bucket (opcional, gera automaticamente se não fornecido)
 * @returns URL público do ficheiro ou null em caso de erro
 */
export async function uploadToStorage(
  file: File, 
  bucket: string, 
  path?: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Gera nome único se path não for fornecido
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const extension = file.name.split('.').pop()
    const fileName = path || `${timestamp}_${randomString}.${extension}`

    // Upload do ficheiro
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Substitui se já existir
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error }
    }

    // Obter URL público
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error('Upload exception:', error)
    return { url: null, error: error as Error }
  }
}

/**
 * Upload de CV (sempre substitui o ficheiro curriculo.pdf)
 * @param file - Ficheiro PDF do CV
 * @returns URL público do CV ou null em caso de erro
 */
export async function uploadCV(file: File): Promise<{ url: string | null; error: Error | null }> {
  if (file.type !== 'application/pdf') {
    return { url: null, error: new Error('Apenas ficheiros PDF são permitidos') }
  }

  return uploadToStorage(file, 'cvs', 'curriculo.pdf')
}

/**
 * Upload de imagem de website
 * @param file - Ficheiro de imagem
 * @param websiteNumber - Número do website (1, 2 ou 3)
 * @returns URL público da imagem ou null em caso de erro
 */
export async function uploadWebsiteImage(
  file: File, 
  websiteNumber: 1 | 2 | 3
): Promise<{ url: string | null; error: Error | null }> {
  if (!file.type.startsWith('image/')) {
    return { url: null, error: new Error('Apenas ficheiros de imagem são permitidos') }
  }

  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 10)
  const extension = file.name.split('.').pop()
  const fileName = `website${websiteNumber}_${timestamp}_${randomString}.${extension}`

  return uploadToStorage(file, 'websites', fileName)
}

/**
 * Elimina ficheiro do Supabase Storage
 * @param bucket - Nome do bucket
 * @param path - Caminho do ficheiro a eliminar
 * @returns true se sucesso, false se erro
 */
export async function deleteFromStorage(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete exception:', error)
    return false
  }
}

/**
 * Obtém URL público de um ficheiro
 * @param bucket - Nome do bucket
 * @param path - Caminho do ficheiro
 * @returns URL público ou null
 */
export function getPublicUrl(bucket: string, path: string): string | null {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  } catch (error) {
    console.error('Get URL error:', error)
    return null
  }
}
