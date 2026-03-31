import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl


  // Never intercept these paths
  if (
    pathname.startsWith("/maintance") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon")
  ) {
    return NextResponse.next()
  }

  // Check admin cookie — allow through everything if logged in
  const isAdmin = request.cookies.get("admin_authenticated")?.value === "true"

  // Admin route guard
  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
    return NextResponse.next()
  }

  // Admin logged in → bypass maintenance/construction
  if (isAdmin) {
    return NextResponse.next()
  }

  // Check site status for regular visitors
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

    if (data?.under_maintenance) {
      const url = new URL("/maintance", request.url)
      const res = NextResponse.rewrite(url)
      res.cookies.set("x-site-mode", "maintenance", { path: "/", maxAge: 60, httpOnly: false })
      return res
    }

    if (data?.under_construction) {
      const url = new URL("/maintance", request.url)
      const res = NextResponse.rewrite(url)
      res.cookies.set("x-site-mode", "construction", { path: "/", maxAge: 60, httpOnly: false })
      return res
    }
  } catch (e) {
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
