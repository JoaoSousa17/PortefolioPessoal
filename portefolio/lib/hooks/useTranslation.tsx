// app/hooks/useTranslation.ts
"use client"

import { translations } from "../i18n"
import { useLanguage } from "../context/LanguageContext"

export function useTranslation() {
  const { language, mounted } = useLanguage()

  // Before mount, always use "en" to match the server render.
  // After mount, use the real language from localStorage.
  // This prevents the SSR/client hydration mismatch.
  const resolvedLanguage = mounted ? language : "en"

  const t = translations[resolvedLanguage]

  return { t, language: resolvedLanguage }
}
