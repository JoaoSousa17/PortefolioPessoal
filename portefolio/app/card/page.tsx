"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Linkedin, 
  Instagram, 
  Facebook, 
  Github, 
  MessageCircle, 
  Mail,
  ExternalLink,
  Loader2
} from "lucide-react"
import { supabase } from "@/lib/supabase"

type ProfileData = {
  name: string
  bio_long: string
  photo_url: string
  linkedin_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  github_url: string | null
  whatsapp_url: string | null
  email: string | null
  website1_url: string | null
  website1_name: string | null
  website1_image: string | null
  website2_url: string | null
  website2_name: string | null
  website2_image: string | null
  website3_url: string | null
  website3_name: string | null
  website3_image: string | null
}

export default function LinktreePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const socialButtons = [
    {
      name: 'LinkedIn',
      url: profile?.linkedin_url,
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#004182]',
      textColor: 'text-white'
    },
    {
      name: 'Instagram',
      url: profile?.instagram_url,
      icon: Instagram,
      color: 'bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F56040] hover:from-[#6B2C94] hover:via-[#C1286C] hover:to-[#D55030]',
      textColor: 'text-white'
    },
    {
      name: 'Facebook',
      url: profile?.facebook_url,
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#0C63D4]',
      textColor: 'text-white'
    },
    {
      name: 'GitHub',
      url: profile?.github_url,
      icon: Github,
      color: 'bg-[#181717] hover:bg-[#000000]',
      textColor: 'text-white'
    },
    {
      name: 'WhatsApp',
      url: profile?.whatsapp_url,
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#1EBE57]',
      textColor: 'text-white'
    },
    {
      name: 'Email',
      url: profile?.email ? `mailto:${profile.email}` : null,
      icon: Mail,
      color: 'bg-[#EA4335] hover:bg-[#C5341E]',
      textColor: 'text-white'
    }
  ].filter(button => button.url)

  const websites = [
    {
      name: profile?.website1_name,
      url: profile?.website1_url,
      image: profile?.website1_image,
      color: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      name: profile?.website2_name,
      url: profile?.website2_url,
      image: profile?.website2_image,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      name: profile?.website3_name,
      url: profile?.website3_url,
      image: profile?.website3_image,
      color: 'bg-gradient-to-br from-orange-500 to-red-500'
    }
  ].filter(website => website.url)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate-700 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 text-lg font-semibold">A carregar...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-700 text-lg">Perfil não encontrado</p>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen py-12 px-4 flex items-center justify-center relative"
      style={{
        backgroundImage: `url('/images/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Avatar - Half outside, half inside */}
        <div className="flex justify-center mb-[-60px] relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="relative group">
            {/* Multi-layer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-rose-500 to-red-600 rounded-full blur-2xl opacity-40 scale-110 group-hover:scale-125 group-hover:opacity-60 transition-all duration-500 animate-pulse" 
                 style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-white/30 rounded-full blur-xl scale-105" />
            
            <Avatar className="relative w-32 h-32 border-4 border-white shadow-[0_0_40px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-all duration-500 ring-4 ring-red-100">
              <AvatarImage src={profile.photo_url} alt={profile.name} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-red-600 to-red-800 text-white">
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Floating sparkle effect */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-rose-400 rounded-full animate-pulse" 
                 style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Main Card */}
        <div 
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-2 border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700"
          style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,1), 0 1px 3px rgba(220,38,38,0.1), 0 0 0 1px rgba(220,38,38,0.05)'
          }}
        >
          <div className="pt-20 pb-8 px-8">
            
            {/* Name */}
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-3 animate-in fade-in slide-in-from-bottom duration-700"
                style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
              {profile.name}
            </h1>

            {/* Quote */}
            <div className="relative mb-6 animate-in fade-in slide-in-from-bottom duration-700"
                 style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
              <div className="absolute -left-2 top-0 text-4xl text-red-200 font-serif">"</div>
              <p className="text-lg text-slate-600 text-center italic font-medium px-4 relative">
                Why not me?
              </p>
              <div className="absolute -right-2 bottom-0 text-4xl text-red-200 font-serif">"</div>
              <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-rose-500 mx-auto mt-3 rounded-full" />
            </div>

            {/* Bio */}
            <p className="text-slate-700 text-center leading-relaxed mb-1 text-sm animate-in fade-in slide-in-from-bottom duration-700 whitespace-pre-line" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }} >
                {profile.bio_long}
            </p>
            <p className="text-slate-700 text-center leading-relaxed mb-6 text-sm animate-in fade-in slide-in-from-bottom duration-700 whitespace-pre-line" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }} >
                Inventor, Developer, Entrepreneur
            </p>
            {/* Save as Contact Button */}
            <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom duration-700"
                 style={{ animationDelay: '450ms', animationFillMode: 'backwards' }}>
              <Button
                asChild
                className="
                      px-8 py-3 rounded-full
                      w-full font-bold text-white
                      bg-gradient-to-r from-red-600 to-red-700
                      transition-all duration-300 ease-out
                      hover:brightness-110 hover:saturate-110
                      hover:ring-2 hover:ring-red-500/40
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                    "
              >
                <a href="/contact.vcf" download="contact.vcf" className="flex items-center gap-2">
                  <svg 
                    className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  Save as Contact
                </a>
              </Button>
            </div>

            {/* LINKS Separator */}
            <div className="relative my-8 animate-in fade-in slide-in-from-left duration-700"
                 style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
              <Separator className="bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Links
                  </span>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" 
                       style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3 mb-6">
              {socialButtons.map((button, index) => (
                <Button
                  key={button.name}
                  asChild
                  className={`w-full h-14 ${button.color} ${button.textColor} font-semibold text-base shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 group relative overflow-hidden`}
                  style={{
                    animation: 'fadeInUp 0.5s ease-out',
                    animationDelay: `${600 + (index * 80)}ms`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <a href={button.url!} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <button.icon className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    {button.name}
                    
                    {/* Arrow indicator */}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                  </a>
                </Button>
              ))}
            </div>

            {/* Separator */}
            {websites.length > 0 && (
              <div className="relative my-8 animate-in fade-in slide-in-from-right duration-700"
                   style={{ animationDelay: `${600 + (socialButtons.length * 80)}ms`, animationFillMode: 'backwards' }}>
                <Separator className="bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                      Websites
                    </span>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" 
                         style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Website Cards */}
            {websites.length > 0 && (
              <div className="space-y-4">
                {websites.map((website, index) => (
                  <a
                    key={index}
                    href={website.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                    style={{
                      animation: 'fadeInUp 0.5s ease-out',
                      animationDelay: `${700 + (socialButtons.length * 80) + (index * 100)}ms`,
                      animationFillMode: 'backwards'
                    }}
                  >
                    <div 
                      className="relative h-32 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 cursor-pointer ring-2 ring-transparent hover:ring-red-300"
                    >
                      {/* Background Image or Color */}
                      {website.image ? (
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${website.image})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 group-hover:from-black/80 transition-colors duration-300" />
                        </div>
                      ) : (
                        <div className={`absolute inset-0 ${website.color} transition-transform duration-500 group-hover:scale-110`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                        </div>
                      )}

                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Content */}
                      <div className="relative h-full flex items-center justify-between px-6">
                        <div>
                          <h3 className="text-white text-xl font-bold drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                            {website.name}
                          </h3>
                          <p className="text-white/90 text-sm mt-1 drop-shadow flex items-center gap-2">
                            Visitar website
                            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                          </p>
                        </div>
                        <ExternalLink className="w-6 h-6 text-white drop-shadow-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-in fade-in duration-700"
             style={{ animationDelay: '1s', animationFillMode: 'backwards' }}>
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm text-slate-600 font-medium">
              © {new Date().getFullYear()} {profile.name}
            </p>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
