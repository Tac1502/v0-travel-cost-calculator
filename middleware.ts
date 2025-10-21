import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables")
    // Allow access to login/signup pages without Supabase
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") {
      return NextResponse.next()
    }
    // Redirect to login for other pages
    if (request.nextUrl.pathname !== "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })

  // Get auth token from cookies
  const token = request.cookies.get("sb-access-token")?.value

  if (token) {
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    // Protected routes
    const protectedPaths = ["/history", "/vehicles", "/settings", "/result"]
    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    // Redirect to login if not authenticated
    if (isProtectedPath && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Redirect to home if authenticated and trying to access login/signup
    if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") && user) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  } else {
    // No token, redirect protected routes to login
    const protectedPaths = ["/history", "/vehicles", "/settings", "/result"]
    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    if (isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
