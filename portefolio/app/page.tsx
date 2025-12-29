"use client"

import { TopBar } from "@/components/ui/top-bar"
import { TopBanner } from "@/components/mainPageComponents/top-banner"
import { AboutSection } from "@/components/mainPageComponents/about-section"
import { ProjectsSection } from "@/components/mainPageComponents/projects-section"
import { SchoolsSection } from "@/components/mainPageComponents/schools-section"
import { CoursesSection } from "@/components/mainPageComponents/courses-section"
import { SkillsSection } from "@/components/mainPageComponents/skills-section"
import { ContactSection } from "@/components/mainPageComponents/contact-section"
import { TechRadarSection } from "@/components/mainPageComponents/tech-radar-section"
import { BlogSection } from "@/components/mainPageComponents/blog-section"
import { SocialSection } from "@/components/mainPageComponents/social-section"
import { TestimonialsSection } from "@/components/mainPageComponents/testimonials-section"
import { BooksSection } from "@/components/mainPageComponents/books-section"
import { LanguagesSection } from "@/components/mainPageComponents/languages-section"
import { FunFactsSection } from "@/components/mainPageComponents/funfacts-section"
import { Footer } from "@/components/ui/footer"
import { useEffect } from "react"

export default function HomePage() {

  useEffect(() => {
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
      <div id="skills"><SkillsSection /></div>
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
