"use client"

import { useAuth } from "@/lib/auth-context"
import { canAccessPath } from "@/lib/access"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AuthGateProps {
  children: React.ReactNode
  slug: string[]
}

export function AuthGate({ children, slug }: AuthGateProps) {
  const { user, modules, isLoading, isAuthenticated } = useAuth()

  // Loading state — show skeleton
  if (isLoading) {
    return (
      <div className="flex-1 min-w-0 px-6 py-8 lg:px-12 lg:py-10 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 rounded bg-[var(--bg-surface)]" />
          <div className="h-8 w-96 rounded bg-[var(--bg-surface)]" />
          <div className="h-4 w-72 rounded bg-[var(--bg-surface)]" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full rounded bg-[var(--bg-surface)]" />
            <div className="h-4 w-5/6 rounded bg-[var(--bg-surface)]" />
            <div className="h-4 w-4/6 rounded bg-[var(--bg-surface)]" />
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated — middleware should have caught this, but defense-in-depth
  if (!isAuthenticated) {
    return null
  }

  // Check page-level access
  const path = `/docs/${slug.join("/")}`
  if (!canAccessPath(path, user, modules)) {
    return (
      <div className="flex-1 min-w-0 px-6 py-8 lg:px-12 lg:py-10 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--callout-warning-bg)]">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--content-text-primary)]">
            Access Restricted
          </h1>
          <p className="mt-2 max-w-md text-sm text-[var(--content-text-secondary)]">
            You don&apos;t have permission to view this section. Contact your administrator
            if you need access.
          </p>
          <Link
            href="/docs/getting-started"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--blue-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Getting Started
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
