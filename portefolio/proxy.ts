// proxy.ts (na raiz do projeto)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Exceções (Caminhos que nunca são interceptados)
  if (
    pathname.startsWith("/maintance") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon")
  ) {
    return NextResponse.next()
  }

  // 2. Lógica de Autenticação Admin
  const isAdmin = request.cookies.get("admin_authenticated")?.value === "true"

  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
    return NextResponse.next()
  }

  if (isAdmin) return NextResponse.next()

  // 3. Verificação de Status do Site (Supabase)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from("site_status")
      .select("under_construction, under_maintenance")
      .limit(1)
      .single()

    if (error) throw error

    if (data?.under_maintenance || data?.under_construction) {
      const mode = data.under_maintenance ? "maintenance" : "construction"
      const url = new URL("/maintance", request.url)
      
      // No novo padrão Proxy, o rewrite é a forma recomendada de manter a URL
      const res = NextResponse.rewrite(url)
      res.cookies.set("x-site-mode", mode, { path: "/", maxAge: 60 })
      return res
    }
  } catch (e) {
    console.error("Proxy Error:", e)
  }

  return NextResponse.next()
}

// O Matcher permanece igual
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
