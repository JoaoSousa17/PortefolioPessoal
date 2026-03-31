// lib/analytics.ts
// Fetches data from the Google Analytics Data API (GA4) using a service account.
// All calls are server-side only (used in API routes / Server Actions).

export type DailyVisit = {
    date: string        // "YYYY-MM-DD"
    sessions: number
    users: number
  }
  
  export type CountryVisit = {
    country: string
    countryCode: string // ISO 3166-1 alpha-2
    sessions: number
    users: number
  }
  
  export type CityVisit = {
    city: string
    country: string
    sessions: number
    users: number
  }
  
  export type AnalyticsData = {
    totalUsers: number
    totalSessions: number
    totalPageViews: number
    avgSessionDuration: number   // seconds
    bounceRate: number           // 0–1
    dailyVisits: DailyVisit[]
    byCountry: CountryVisit[]
    byCity: CityVisit[]
    fetchedAt: string            // ISO timestamp
  }
  
  // ─── Constants ────────────────────────────────────────────────────────────────
  
  const GA4_PROPERTY_ID = "528052977"  // from the Analytics URL
  const GA4_API_BASE    = "https://analyticsdata.googleapis.com/v1beta"
  
  // ─── Google OAuth2 — service-account JWT flow ─────────────────────────────────
  
  async function getAccessToken(): Promise<string> {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var is missing")
  
    const sa = JSON.parse(raw) as {
      client_email: string
      private_key: string
    }
  
    const now   = Math.floor(Date.now() / 1000)
    const exp   = now + 3600
    const scope = "https://www.googleapis.com/auth/analytics.readonly"
  
    // Build JWT header + payload
    const header  = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
    const payload = btoa(JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp,
      scope,
    })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  
    const signingInput = `${header}.${payload}`
  
    // Sign with RS256 using the service-account private key
    const pemBody = sa.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/g, "")
      .replace(/-----END PRIVATE KEY-----/g, "")
      .replace(/\s/g, "")
  
    const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))
  
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    )
  
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(signingInput)
    )
  
    const sigBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  
    const jwt = `${signingInput}.${sigBase64}`
  
    // Exchange JWT for an access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion:  jwt,
      }),
    })
  
    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      throw new Error(`Failed to get access token: ${err}`)
    }
  
    const { access_token } = await tokenRes.json()
    return access_token as string
  }
  
  // ─── GA4 runReport helper ─────────────────────────────────────────────────────
  
  async function runReport(
    token: string,
    body: Record<string, unknown>
  ): Promise<any> {
    const res = await fetch(
      `${GA4_API_BASE}/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )
  
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`GA4 API error: ${err}`)
    }
  
    return res.json()
  }
  
  // ─── Main export ──────────────────────────────────────────────────────────────
  
  export async function fetchAnalyticsData(
    daysBack = 30
  ): Promise<AnalyticsData> {
    const token = await getAccessToken()
  
    const dateRange = {
      startDate: `${daysBack}daysAgo`,
      endDate:   "today",
    }
  
    // ── 1. Daily sessions + users ──────────────────────────────────────────────
    const dailyRaw = await runReport(token, {
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    })
  
    const dailyVisits: DailyVisit[] = (dailyRaw.rows ?? []).map((row: any) => {
      const raw = row.dimensionValues[0].value as string   // "20240315"
      const date = `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`
      return {
        date,
        sessions: parseInt(row.metricValues[0].value, 10),
        users:    parseInt(row.metricValues[1].value, 10),
      }
    })
  
    // ── 2. Totals + bounce + avg duration ──────────────────────────────────────
    const totalsRaw = await runReport(token, {
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    })
  
    const mv = totalsRaw.rows?.[0]?.metricValues ?? []
    const totalUsers        = parseInt(mv[0]?.value ?? "0", 10)
    const totalSessions     = parseInt(mv[1]?.value ?? "0", 10)
    const totalPageViews    = parseInt(mv[2]?.value ?? "0", 10)
    const avgSessionDuration= parseFloat(mv[3]?.value ?? "0")
    const bounceRate        = parseFloat(mv[4]?.value ?? "0")
  
    // ── 3. By country ──────────────────────────────────────────────────────────
    const countryRaw = await runReport(token, {
      dateRanges: [dateRange],
      dimensions: [
        { name: "country" },
        { name: "countryId" },
      ],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 20,
    })
  
    const byCountry: CountryVisit[] = (countryRaw.rows ?? []).map((row: any) => ({
      country:     row.dimensionValues[0].value,
      countryCode: row.dimensionValues[1].value,
      sessions:    parseInt(row.metricValues[0].value, 10),
      users:       parseInt(row.metricValues[1].value, 10),
    }))
  
    // ── 4. By city ─────────────────────────────────────────────────────────────
    const cityRaw = await runReport(token, {
      dateRanges: [dateRange],
      dimensions: [
        { name: "city" },
        { name: "country" },
      ],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 15,
    })
  
    const byCity: CityVisit[] = (cityRaw.rows ?? []).map((row: any) => ({
      city:     row.dimensionValues[0].value,
      country:  row.dimensionValues[1].value,
      sessions: parseInt(row.metricValues[0].value, 10),
      users:    parseInt(row.metricValues[1].value, 10),
    }))
  
    return {
      totalUsers,
      totalSessions,
      totalPageViews,
      avgSessionDuration,
      bounceRate,
      dailyVisits,
      byCountry,
      byCity,
      fetchedAt: new Date().toISOString(),
    }
  }
  