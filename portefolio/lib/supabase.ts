import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  name: string | null
  headline: string | null
  bio_short: string | null
  bio_long: string | null
  photo_url: string | null
  linkedin_url: string | null
  github_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  whatsapp_url: string | null
  email: string | null
  website1_url: string | null
  website2_url: string | null
  website3_url: string | null
  created_at: string
}

export type Project = {
  id: string
  title: string
  description: string | null
  long_description: string | null
  thumbnail_url: string | null
  main_url: string | null
  github_url: string | null
  status: 'active' | 'archived' | null
  featured: boolean | null
  created_at: string
}

export type ProjectTag = {
  id: string
  project_id: string
  tag: string
}

export type School = {
  id: string
  name: string
  website: string | null
  logo_url: string | null
  description: string | null
  learnings: string | null
  order: number | null
  created_at: string
}

export type SkillCategory = {
  id: string
  name: string
  order: number | null
}

export type Skill = {
  id: string
  category_id: string
  name: string
  color: string | null
  icon: string | null
}

export type Course = {
  id: string
  title: string
  college_name: string
  description: string | null
  importance: 'high' | 'medium' | 'low' | null
  certificate_url: string | null
  college_logo: string | null
  featured: boolean | null
  completion_date: string | null
  created_at: string
}

export type ContactMessage = {
  id: string
  name: string
  contact: string
  subject: string
  message: string
  created_at: string
}

export type Language = {
  id: string
  _name: string
  flag_url: string | null
  _level: number | null
  info: string | null
}

export type TechRadar = {
  id: string
  _name: string
  image_url: string | null
  category: 'learn' | 'using' | 'explore' | null
  notes: string | null
  urll: string | null
  is_valid: boolean | null
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  _content: string | null
  published: boolean | null
  published_at: string | null
}

export type BlogTag = {
  id: string
  post_id: string
  tag: string
}

export type SocialProject = {
  id: string
  title: string
  date: string | null
  image_url: string | null
  _description: string | null
  institution_name: string | null
  instituition_logo: string | null
  institution_link: string | null
  certificate_url: string | null
  is_public: boolean | null
  is_voluntariado: boolean | null
}

export type Testimonial = {
  id: string
  author_name: string
  role: string | null
  image_url: string | null
  content: string
  order: number | null
  visible: boolean | null
}

export type Book = {
  id: string
  google_book_id: string | null
  title: string
  authors: string[] | null
  cover_url: string | null
  notes: string | null
  read_date: string | null
  show_on_main: boolean | null
  created_at: string
}
