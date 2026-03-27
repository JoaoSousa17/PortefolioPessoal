"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import {
  Users, Globe, TrendingUp, Eye, Clock,
  ExternalLink, Loader2, RefreshCw, AlertCircle,
  MapPin, Activity,
} from "lucide-react"
import type { AnalyticsData } from "@/lib/analytics"

// ─── Analytics URL ────────────────────────────────────────────────────────────

const GA_URL =
  "https://analytics.google.com/analytics/web/#/a387311845p528052977/reports/intelligenthome"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${d}/${m}`
}

// Country flag from ISO code
function Flag({ code }: { code: string }) {
  const upper = code.toUpperCase()
  const flag  = [...upper]
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("")
  return <span style={{ fontSize: 18, lineHeight: 1 }}>{flag}</span>
}

// Bar colours for country chart
const COUNTRY_COLOURS = [
  "#e11d48", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6",
]

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  accent: string
}) {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className={`h-1 ${accent}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            {sub && (
              <p className="text-xs text-slate-500 mt-1">{sub}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center opacity-90`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Custom tooltip for area chart ───────────────────────────────────────────

function DailyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      <p className="text-red-400">Sessions: {payload[0]?.value}</p>
      <p className="text-blue-400">Users: {payload[1]?.value}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")
  const [cached, setCached]   = useState(false)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("/api/analytics")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed")
      setData(json.data)
      setCached(json.cached)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500" />
        <CardContent className="p-10 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">A carregar dados de analytics…</p>
        </CardContent>
      </Card>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-600 via-rose-500 to-orange-500" />
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <div>
            <p className="font-bold text-slate-900 mb-1">Erro ao carregar analytics</p>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
          <Button onClick={load} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const topCountries = data.byCountry.slice(0, 8)
  const topCities    = data.byCity.slice(0, 10)
  const maxCountrySessions = Math.max(...topCountries.map((c) => c.sessions), 1)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
            <p className="text-slate-600 text-sm">
              Últimos 30 dias
              {cached && (
                <span className="ml-2 text-amber-600 text-xs">· cache</span>
              )}
              {data.fetchedAt && (
                <span className="ml-2 text-xs">
                  · atualizado às {new Date(data.fetchedAt).toLocaleTimeString("pt-PT", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={load}
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 shadow-md"
          >
            <a href={GA_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Google Analytics
            </a>
          </Button>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Utilizadores"
          value={fmt(data.totalUsers)}
          sub="únicos"
          accent="bg-red-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Sessões"
          value={fmt(data.totalSessions)}
          sub={`${(data.bounceRate * 100).toFixed(1)}% bounce`}
          accent="bg-orange-500"
        />
        <StatCard
          icon={Eye}
          label="Page Views"
          value={fmt(data.totalPageViews)}
          sub={`${(data.totalPageViews / Math.max(data.totalSessions, 1)).toFixed(1)} por sessão`}
          accent="bg-rose-600"
        />
        <StatCard
          icon={Clock}
          label="Duração média"
          value={fmtDuration(data.avgSessionDuration)}
          sub="por sessão"
          accent="bg-red-700"
        />
      </div>

      {/* ── Daily area chart ─────────────────────────────────────────────── */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-orange-400" />
        <CardHeader className="pb-2 pt-5 px-6">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            Visitantes por dia
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data.dailyVisits.map((d) => ({
                ...d,
                date: fmtDate(d.date),
              }))}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(data.dailyVisits.length / 8)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip content={<DailyTooltip />} />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#e11d48"
                strokeWidth={2}
                fill="url(#gradSessions)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradUsers)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 justify-center mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />Sessions
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />Users
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom row: countries + cities ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Countries */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-orange-500 to-amber-400" />
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              Por país
              <Badge variant="outline" className="ml-auto text-xs font-normal border-slate-200 text-slate-500">
                {data.byCountry.length} países
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topCountries}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + "…" : v}
                />
                <Tooltip
                  formatter={(v: any) => [v, "Sessions"]}
                  contentStyle={{
                    background: "#0f172a", border: "none",
                    borderRadius: 8, fontSize: 12,
                  }}
                  itemStyle={{ color: "#ffffff" }}
                  labelStyle={{ color: "#ffffff", fontWeight: 700, marginBottom: 2 }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
                  {topCountries.map((_, i) => (
                    <Cell key={i} fill={COUNTRY_COLOURS[i % COUNTRY_COLOURS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cities */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-rose-500 to-pink-400" />
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Por cidade
              <Badge variant="outline" className="ml-auto text-xs font-normal border-slate-200 text-slate-500">
                top {topCities.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <div className="space-y-2.5 mt-1">
              {topCities.map((city, i) => {
                const pct = Math.round((city.sessions / data.totalSessions) * 100)
                const maxSessions = topCities[0]?.sessions ?? 1
                const barPct = Math.round((city.sessions / maxSessions) * 100)
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-400 w-4 text-right flex-shrink-0">
                          {i + 1}
                        </span>
                        <Flag code={
                          data.byCountry.find((c) => c.country === city.country)
                            ?.countryCode ?? "XX"
                        } />
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {city.city === "(not set)" ? "Unknown" : city.city}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {city.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-slate-700">
                          {fmt(city.sessions)}
                        </span>
                        <span className="text-xs text-slate-400 w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barPct}%`,
                          background: `hsl(${350 - i * 12}, 75%, ${50 + i * 2}%)`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
