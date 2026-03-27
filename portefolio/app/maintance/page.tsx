"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

// The middleware sets a short-lived cookie "site-mode" = "maintenance" | "construction"
// before doing the rewrite. We read it here on the client.
function getMode(): "maintenance" | "construction" {
  if (typeof window === "undefined") return "maintenance"

  // Read the cookie the middleware set
  const cookies = Object.fromEntries(
    document.cookie.split("; ").map((c) => {
      const [k, ...v] = c.split("=")
      return [k.trim(), v.join("=")]
    })
  )

  if (cookies["site-mode"] === "construction") return "construction"
  return "maintenance"
}

// ─── Per-mode config ───────────────────────────────────────────────────────────

const CONFIG = {
  maintenance: {
    emoji: "🔧",
    accentLight: "#3b82f6",
    accentDark: "#1d4ed8",
    glowColor: "rgba(59,130,246,0.25)",
    badgeBg: "rgba(59,130,246,0.15)",
    badgeBorder: "#3b82f6",
    badgeColor: "#93c5fd",
    badgeText: "Under Maintenance",
    bgFrom: "#0f172a",
    bgMid: "#0c1a2e",
    bgTo: "#0f172a",
    blob1: "rgba(59,130,246,0.18)",
    blob2: "rgba(29,78,216,0.13)",
    title: "We'll be right back",
    subtitle:
      "We're performing some scheduled maintenance and improvements. The site will be back online shortly — thank you for your patience!",
    details: [
      { icon: "⏱", text: "Estimated downtime: short" },
      { icon: "⚙️", text: "Improvements in progress" },
    ],
    ctaLabel: "Get in touch by email →",
    ctaHref: "mailto:joao@example.com",
    ctaExternal: false,
  },
  construction: {
    emoji: "🚧",
    accentLight: "#f59e0b",
    accentDark: "#b45309",
    glowColor: "rgba(245,158,11,0.25)",
    badgeBg: "rgba(245,158,11,0.15)",
    badgeBorder: "#f59e0b",
    badgeColor: "#fcd34d",
    badgeText: "Under Construction",
    bgFrom: "#1a1200",
    bgMid: "#1c1505",
    bgTo: "#1a1200",
    blob1: "rgba(245,158,11,0.18)",
    blob2: "rgba(180,83,9,0.13)",
    title: "Something new is coming",
    subtitle:
      "We're building something special here. Check back soon — you won't want to miss what's on the way!",
    details: [
      { icon: "🏗", text: "Design & development in progress" },
      { icon: "🚀", text: "Launch coming soon" },
    ],
    ctaLabel: "Follow progress on LinkedIn →",
    ctaHref: "https://www.linkedin.com/in/joaosousaa",
    ctaExternal: true,
  },
} as const

type Mode = keyof typeof CONFIG

export default function MaintenancePage() {
  const [mode, setMode] = useState<Mode>("maintenance")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMode(getMode())
    setReady(true)
  }, [])

  const c = CONFIG[mode]

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${c.bgFrom} 0%, ${c.bgMid} 50%, ${c.bgTo} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        opacity: ready ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: "-160px", right: "-160px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: c.blob1, filter: "blur(80px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-120px", left: "-120px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: c.blob2, filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "520px", width: "100%", textAlign: "center",
        position: "relative", zIndex: 1,
      }}>

        {/* Icon */}
        <div style={{
          width: "104px", height: "104px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${c.accentLight}, ${c.accentDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", fontSize: "52px",
          boxShadow: `0 0 48px ${c.glowColor}, 0 0 0 6px rgba(255,255,255,0.06)`,
        }}>
          {c.emoji}
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "7px 18px", borderRadius: "999px",
          background: c.badgeBg,
          border: `1px solid ${c.badgeBorder}`,
          color: c.badgeColor,
          fontSize: "13px", fontWeight: 700,
          letterSpacing: "0.05em", textTransform: "uppercase",
          marginBottom: "24px",
        }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: c.accentLight,
            boxShadow: `0 0 6px ${c.accentLight}`,
          }} />
          {c.badgeText}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(30px, 5vw, 46px)",
          fontWeight: 900, color: "#ffffff",
          margin: "0 0 16px", lineHeight: 1.15,
        }}>
          {c.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "16px", color: "rgba(255,255,255,0.65)",
          lineHeight: 1.7, margin: "0 0 40px",
        }}>
          {c.subtitle}
        </p>

        {/* Info card */}
        <div style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: "18px",
          padding: "28px 28px 24px",
          marginBottom: "24px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${c.accentLight}22`,
        }}>
          {c.details.map((d, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "10px 12px",
              background: i % 2 === 0 ? "rgba(0,0,0,0.03)" : "transparent",
              borderRadius: "10px",
              marginBottom: i < c.details.length - 1 ? "8px" : "20px",
            }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>{d.icon}</span>
              <span style={{ color: "#374151", fontWeight: 500, fontSize: "14px", textAlign: "left" }}>
                {d.text}
              </span>
            </div>
          ))}

          <div style={{ height: "1px", background: "#e5e7eb", margin: "0 0 20px" }} />

          <a
            href={c.ctaHref}
            target={c.ctaExternal ? "_blank" : "_self"}
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", width: "100%", padding: "13px 20px",
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${c.accentLight}, ${c.accentDark})`,
              color: "#ffffff", fontWeight: 700, fontSize: "15px",
              textDecoration: "none", boxSizing: "border-box",
              boxShadow: `0 4px 20px ${c.glowColor}`,
            }}
          >
            {c.ctaLabel}
          </a>
        </div>

        {/* Social */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "36px" }}>
          {[
            { href: "https://github.com/JoaoSousa17", label: "GitHub" },
            { href: "https://www.linkedin.com/in/joaosousaa", label: "LinkedIn" },
          ].map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 22px", borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "14px", fontWeight: 500,
                textDecoration: "none",
              }}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Admin */}
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", margin: "0 0 12px" }}>
          Are you the admin?{" "}
          <Link href="/auth" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline" }}>
            Access the panel
          </Link>
        </p>

        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: "11px" }}>
          © {new Date().getFullYear()} João Sousa
        </p>
      </div>
    </div>
  )
}
