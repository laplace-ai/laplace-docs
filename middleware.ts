import { NextRequest, NextResponse } from "next/server"
import { decodeJwt } from "jose"

const PUBLIC_ROUTES = ["/login"]
const PUBLIC_PREFIXES = ["/api/", "/_next/", "/favicon.ico", "/images/"]
const ACCESS_TOKEN_COOKIE = "laplace_docs_access_token"

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function isTokenValid(token: string): boolean {
  try {
    const payload = decodeJwt(token)
    if (!payload.exp) return false
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const hasValidToken = accessToken ? isTokenValid(accessToken) : false

  // Login page: if already authenticated, redirect to docs
  if (pathname === "/login") {
    if (hasValidToken) {
      return NextResponse.redirect(new URL("/docs/getting-started", request.url))
    }
    return NextResponse.next()
  }

  // Other public routes: always allow
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Protected routes: require valid token
  if (!hasValidToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
