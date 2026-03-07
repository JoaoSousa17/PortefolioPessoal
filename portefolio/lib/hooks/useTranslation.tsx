// app/hooks/useTranslation.ts
"use client"

import { translations } from "../i18n"
import { useLanguage } from "../context/LanguageContext"

export function useTranslation() {
  const { language } = useLanguage()

  const t = translations[language]

  return { t, language }
}
