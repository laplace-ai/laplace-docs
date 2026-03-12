"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await login(email, password)
      router.push("/docs/getting-started")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src={mounted && resolvedTheme === "dark" ? "/images/logo-dark.png" : "/images/logo.png"}
            alt="Laplace Logistics"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-[var(--content-text-primary)]">
              Laplace Docs
            </h1>
            <p className="mt-1 text-sm text-[var(--content-text-secondary)]">
              Sign in to access documentation
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[var(--content-text-primary)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-[var(--content-border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--content-text-primary)] placeholder:text-[var(--content-text-secondary)] focus:border-[var(--blue-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-primary)]"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[var(--content-text-primary)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-[var(--content-border)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--content-text-primary)] placeholder:text-[var(--content-text-secondary)] focus:border-[var(--blue-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--blue-primary)]"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="rounded-md bg-[var(--callout-danger-bg)] px-3 py-2 text-sm text-[var(--error)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--blue-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--content-text-secondary)]">
          Powered by Laplace Logistics
        </p>
      </div>
    </div>
  )
}
