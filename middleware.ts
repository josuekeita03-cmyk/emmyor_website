import { type NextRequest, NextResponse } from "next/server"
import { i18n } from "@/lib/i18n-config"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  // Handle API routes and static files
  if (pathname.startsWith("/api") || 
      pathname.startsWith("/_next") || 
      pathname.startsWith("/static") ||
      pathname.includes(".")) {
    return NextResponse.next()
  }

  // Allow OAuth callback URLs to bypass authentication checks
  if (pathname.includes("/api/auth/callback") || pathname.includes("/api/auth/signin")) {
    return NextResponse.next()
  }

  // Get token for authentication
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Extract locale from pathname if present
  const locale = pathnameHasLocale 
    ? pathname.split("/")[1] 
    : i18n.defaultLocale

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/admin"]
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.includes(route)
  )

  // Public routes that should not require authentication
  const publicRoutes = ["/farmer-registration", "/login", "/register"]
  const isPublicRoute = publicRoutes.some(route => 
    pathname === `/${locale}${route}` || pathname.includes(route)
  )

  // Skip authentication check for public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Admin-only routes
  const isAdminRoute = pathname.includes("/admin")

  // Don't redirect if already on login page
  const isLoginPage = pathname.includes("/login")

  if (isProtectedRoute && !isLoginPage) {
    if (!token) {
      // Redirect to login page with locale
      const loginUrl = `/${locale}/login?callbackUrl=${encodeURIComponent(pathname)}`
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }

    // Check admin role for admin routes
    if (isAdminRoute && token.role !== "ADMIN" && token.role !== "COMMERCIAL") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }
  }

  // Handle locale redirection
  if (!pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
