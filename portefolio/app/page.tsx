"use client"

import { TopBar } from "@/components/ui/top-bar"
import { TopBanner } from "@/components/mainPageComponents/top-banner"
import { AboutSection } from "@/components/mainPageComponents/about-section"
import { ProjectsSection } from "@/components/mainPageComponents/projects-section"
import { SchoolsSection } from "@/components/mainPageComponents/schools-section"
import { CoursesSection } from "@/components/mainPageComponents/courses-section"
import { SkillsSection } from "@/components/mainPageComponents/skills-section"
import { SkillsSectionDesktop } from "@/components/mainPageComponents/skills-section-desktop"
import { ContactSection } from "@/components/mainPageComponents/contact-section"
import { TechRadarSection } from "@/components/mainPageComponents/tech-radar-section"
import { BlogSection } from "@/components/mainPageComponents/blog-section"
import { SocialSection } from "@/components/mainPageComponents/social-section"
import { TestimonialsSection } from "@/components/mainPageComponents/testimonials-section"
import { BooksSection } from "@/components/mainPageComponents/books-section"
import { LanguagesSection } from "@/components/mainPageComponents/languages-section"
import { FunFactsSection } from "@/components/mainPageComponents/funfacts-section"
import { Footer } from "@/components/ui/footer"
import { useEffect, useState } from "react"

// ─── Responsive skills switcher ───────────────────────────────────────────────
// lg breakpoint = 1024px (same as Tailwind's lg:)
// Renders desktop version (Spline) on lg+, mobile version (badges only) below.

function SkillsSectionResponsive() {
  const [isLg, setIsLg] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsLg(mq.matches)
    setMounted(true)

    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Avoid flash of wrong component during hydration
  if (!mounted) return null

  return isLg ? <SkillsSectionDesktop /> : <SkillsSection />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
    
    console.log(`
%c👋 Olá, dev curioso.

%cPorque estás aqui?
%cSe gostas de código bem feito,
fala comigo 😄

%c👉 joaosousa.dev
`,
      "color:#e11d48; font-size:20px; font-weight:bold;",
      "color:#0f172a; font-size:14px;",
      "color:#0f172a; font-size:14px;",
      "color:#e11d48; font-size:14px; font-weight:bold;"
    )
  }, [])

  return (
    <main className="min-h-screen bg-[#E8E2E1]">
      <TopBar />
      <TopBanner />
      <div id="about"><AboutSection /></div>
      <div id="projects"><ProjectsSection /></div>
      <div id="schools"><SchoolsSection /></div>
      <div id="courses"><CoursesSection /></div>
      <div id="skills"><SkillsSectionResponsive /></div>
      <div id="contact"><ContactSection /></div>
      <div id="tech-radar"><TechRadarSection /></div>
      <div id="blog"><BlogSection /></div>
      <div id="social"><SocialSection /></div>
      <div id="testimonials"><TestimonialsSection /></div>
      <div id="books"><BooksSection /></div>
      <div id="languages"><LanguagesSection /></div>
      <div id="funfacts"><FunFactsSection /></div>
      <Footer />
    </main>
  )
}
