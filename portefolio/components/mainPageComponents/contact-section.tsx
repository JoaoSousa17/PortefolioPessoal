"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mail,
  Linkedin,
  Github,
  Instagram,
  Facebook,
  MessageCircle,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { supabase, type Profile } from "@/lib/supabase"
import { useTranslation } from "@/lib/hooks/useTranslation"

export function ContactSection() {
  const { t } = useTranslation()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus('idle')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Request failed')

      setSubmitStatus('success')
      setFormData({ name: '', contact: '', subject: '', message: '' })
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  const socialLinks = [
    {
      icon: Linkedin,
      href: profile?.linkedin_url,
      bgColor: 'bg-[#0A66C2]'
    },
    {
      icon: Github,
      href: profile?.github_url,
      bgColor: 'bg-[#181717]'
    },
    {
      icon: Instagram,
      href: profile?.instagram_url,
      bgColor: 'bg-gradient-to-br from-[#E4405F] to-[#833AB4]'
    },
    {
      icon: Facebook,
      href: profile?.facebook_url,
      bgColor: 'bg-[#1877F2]'
    },
    {
      icon: MessageCircle,
      href: profile?.whatsapp_url
        ? `https://wa.me/${profile.whatsapp_url.replace(/\D/g, '')}`
        : null,
      bgColor: 'bg-[#25D366]'
    }
  ].filter(link => link.href)

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
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-red-700/10 rounded-full blur-3xl" />
        <div className="absolute w-[400px] h-[400px] -bottom-24 -left-24 bg-slate-800/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white via-gray-100 to-white" />

      <div className="relative container mx-auto px-6">
        
        <div className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center shadow-xl">
            <Send className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {t.contact.title}
            </h2>
            <p className="text-white/90 text-lg mt-2 text-justify">
              {t.contact.subtitle}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom">
          
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-32 h-32 border-4 border-slate-200 shadow-xl mb-6">
              <AvatarImage src={profile?.photo_url || undefined} />
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-red-600 to-red-800 text-white">
                {profile?.name?.split(' ').map(n => n[0]).join('') || 'JS'}
              </AvatarFallback>
            </Avatar>

            <p className="text-xl text-slate-700 text-center max-w-2xl leading-relaxed">
              "If you never try, you'll never know."
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-8">
            {socialLinks.map((social, index) => (
              <Button
                key={index}
                size="icon"
                className={`${social.bgColor} hover:scale-110 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 w-12 h-12`}
                asChild
              >
                <a href={social.href!} target="_blank" rel="noopener noreferrer">
                  <social.icon className="w-5 h-5" />
                </a>
              </Button>
            ))}
          </div>

          <Separator className="my-1" />

          <form onSubmit={handleSubmit} className="space-y-6">

            {submitStatus === 'success' && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">{t.contact.successTitle}</p>
                  <p className="text-sm text-green-700">{t.contact.successText}</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">{t.contact.errorTitle}</p>
                  <p className="text-sm text-red-700">{t.contact.errorText}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-900 font-semibold">
                  {t.contact.name}
                </Label>
                <Input
                  placeholder={t.contact.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-2 border-slate-300 focus:border-red-700 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-900 font-semibold">
                  {t.contact.contact}
                </Label>
                <Input
                  placeholder={t.contact.contactPlaceholder}
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                  className="border-2 border-slate-300 focus:border-red-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 font-semibold">
                {t.contact.subject}
              </Label>
              <Input
                placeholder={t.contact.subjectPlaceholder}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="border-2 border-slate-300 focus:border-red-700 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 font-semibold">
                {t.contact.message}
              </Label>
              <Textarea
                placeholder={t.contact.messagePlaceholder}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
                className="border-2 border-slate-300 focus:border-red-700 transition-colors resize-none"
              />
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="w-full py-6 text-lg font-bold text-white bg-gradient-to-r from-red-700 to-red-800">
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t.contact.sending}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {t.contact.send}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}