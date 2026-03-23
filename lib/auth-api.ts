/**
 * Auth API client — calls backend auth endpoints through the Next.js proxy.
 */

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AuthError"
    this.status = status
  }
}

export interface AuthUser {
  id: number
  email: string
  name: string
  role: "super_admin" | "admin" | "user"
  tenant_id: number
  active_tenant_id?: number
  tenant_name?: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: AuthUser
  modules: string[]
  facilities: string[] | null
}

interface RefreshResponse {
  access_token: string
  refresh_token: string
}

interface MeResponse {
  user: AuthUser
  modules: string[]
  facilities: string[] | null
}

async function authFetch<T>(
  path: string,
  options: {
    method?: string
    body?: Record<string, unknown>
    accessToken?: string
  } = {}
): Promise<T> {
  const { method = "POST", body, accessToken } = options

  const url = new URL("/api/proxy", window.location.origin)
  url.searchParams.set("path", path)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new AuthError(data.error || data.message || `Auth error ${res.status}`, res.status)
  }

  return data as T
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return authFetch<LoginResponse>("/v1/auth/login", {
    body: { email, password },
  })
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  return authFetch<RefreshResponse>("/v1/auth/refresh", {
    body: { refresh_token: refreshToken },
  })
}

export async function getMe(accessToken: string): Promise<MeResponse> {
  return authFetch<MeResponse>("/v1/auth/me", {
    method: "GET",
    accessToken,
  })
}

export async function logout(refreshToken: string, accessToken?: string): Promise<void> {
  await authFetch<void>("/v1/auth/logout", {
    body: { refresh_token: refreshToken },
    accessToken,
  })
}
