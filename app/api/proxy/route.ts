import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://laplace-platform-api-cbbnhnqg.uc.gateway.dev"

function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    headers["Authorization"] = authHeader
    headers["X-User-Authorization"] = authHeader
    return headers
  }

  const accessToken = request.cookies.get("laplace_docs_access_token")?.value
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
    headers["X-User-Authorization"] = `Bearer ${accessToken}`
    return headers
  }

  return headers
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const path = searchParams.get("path")
  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 })
  }

  const authHeaders = getAuthHeaders(request)
  if (!authHeaders["Authorization"]) {
    return NextResponse.json({ error: "No authentication configured" }, { status: 401 })
  }

  const url = new URL(`${API_BASE}${path}`)
  searchParams.forEach((value, key) => {
    if (key !== "path") url.searchParams.set(key, value)
  })

  const res = await fetch(url.toString(), { headers: authHeaders, cache: "no-store" })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const path = searchParams.get("path")
  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 })
  }

  const authHeaders = getAuthHeaders(request)

  let body: unknown = undefined
  try {
    body = await request.json()
  } catch {
    // No body
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  return NextResponse.json(data, { status: res.status })
}
