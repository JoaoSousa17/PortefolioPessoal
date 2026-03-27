import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SKIP_STATUS_PREFIXES = [
  "/maintance",
  "/auth",
  "/admin",
  "/_next",
  "/api",
  "/favicon.ico",
  "/images",
  "/contact.vcf",
]

function skipStatusCheck(pathname: string): boolean {
  return SKIP_STATUS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )
}

const ADMIN_COOKIE = "admin_authenticated"

function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/")
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Admin auth guard
  if (isAdminRoute(pathname)) {
    const authCookie = request.cookies.get(ADMIN_COOKIE)
    if (!authCookie?.value) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = "/auth"
      loginUrl.search = ""
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // 2. Skip exempt paths
  if (skipStatusCheck(pathname)) {
    return NextResponse.next()
  }

  // 3. Check site status
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data } = await supabase
      .from("site_status")
      .select("under_construction, under_maintenance")
      .limit(1)
      .single()

    if (data?.under_maintenance || data?.under_construction) {
      const mode = data.under_maintenance ? "maintenance" : "construction"

      const url = request.nextUrl.clone()
      url.pathname = "/maintance"
      url.search = ""

      // Pass the mode via a request header — readable by the page via
      // the /api/site-mode route (headers are server-only, not client-visible)
      const response = NextResponse.rewrite(url)
      response.headers.set("x-site-mode", mode)

      // Also set a cookie so the client page can read it reliably
      response.cookies.set("site-mode", mode, {
        path: "/",
        maxAge: 10,          // short-lived — only needed for this render
        sameSite: "strict",
        httpOnly: false,     // must be readable by client JS
      })

      return response
    }
  } catch (err) {
    console.error("Middleware: failed to fetch site_status", err)
  }

  // Clear the mode cookie when site is online
  const response = NextResponse.next()
  response.cookies.delete("site-mode")
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
