"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { decodeJwt } from "jose"
import * as authApi from "@/lib/auth-api"
import type { AuthUser } from "@/lib/auth-api"

export type { AuthUser }

export interface AuthContextValue {
  user: AuthUser | null
  modules: string[]
  isLoading: boolean
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasModule: (moduleKey: string) => boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  modules: [],
  isLoading: true,
  isAuthenticated: false,
  isSuperAdmin: false,
  isAdmin: false,
  login: async () => {},
  logout: () => {},
  hasModule: () => false,
})

const REFRESH_TOKEN_KEY = "laplace_docs_refresh_token"
const ACCESS_TOKEN_COOKIE = "laplace_docs_access_token"

function setAccessTokenCookie(token: string) {
  try {
    const payload = decodeJwt(token)
    const exp = payload.exp ? payload.exp * 1000 : Date.now() + 15 * 60 * 1000
    const maxAge = Math.floor((exp - Date.now()) / 1000)
    document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; samesite=lax`
  } catch {
    document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; path=/; max-age=900; samesite=lax`
  }
}

function clearAccessTokenCookie() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [modules, setModules] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRefreshingRef = useRef(false)

  const clearAuth = useCallback(() => {
    setUser(null)
    setModules([])
    setAccessToken(null)
    clearAccessTokenCookie()
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }

    try {
      const payload = decodeJwt(token)
      if (!payload.exp) return
      const refreshIn = payload.exp * 1000 - Date.now() - 60_000
      if (refreshIn <= 0) return

      refreshTimerRef.current = setTimeout(async () => {
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
        if (!storedRefreshToken) return

        try {
          const result = await authApi.refresh(storedRefreshToken)
          setAccessToken(result.access_token)
          setAccessTokenCookie(result.access_token)
          localStorage.setItem(REFRESH_TOKEN_KEY, result.refresh_token)
          scheduleRefresh(result.access_token)
        } catch {
          clearAuth()
        }
      }, refreshIn)
    } catch {
      // Silently fail
    }
  }, [clearAuth])

  const setAuthState = useCallback(
    (data: {
      access_token: string
      refresh_token: string
      user: AuthUser
      modules: string[]
    }) => {
      setUser(data.user)
      setModules(data.modules)
      setAccessToken(data.access_token)
      setAccessTokenCookie(data.access_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
      scheduleRefresh(data.access_token)
    },
    [scheduleRefresh]
  )

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!storedRefreshToken) {
        setIsLoading(false)
        return
      }

      try {
        isRefreshingRef.current = true
        const result = await authApi.refresh(storedRefreshToken)
        const meResult = await authApi.getMe(result.access_token)
        setAuthState({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          user: meResult.user,
          modules: meResult.modules,
        })
      } catch {
        clearAuth()
      } finally {
        isRefreshingRef.current = false
        setIsLoading(false)
      }
    }

    restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password)
      setAuthState({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        user: result.user,
        modules: result.modules,
      })
    },
    [setAuthState]
  )

  const logout = useCallback(() => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (storedRefreshToken && accessToken) {
      authApi.logout(storedRefreshToken, accessToken).catch(() => {})
    }
    clearAuth()
    window.location.href = "/login"
  }, [accessToken, clearAuth])

  const hasModule = useCallback(
    (moduleKey: string) => {
      if (!user) return false
      if (user.role === "super_admin" || user.role === "admin") return true
      return modules.includes(moduleKey)
    },
    [user, modules]
  )

  const value: AuthContextValue = {
    user,
    modules,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "super_admin",
    isAdmin: user?.role === "admin" || user?.role === "super_admin",
    login,
    logout,
    hasModule,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
