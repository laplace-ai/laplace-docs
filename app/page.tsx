"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import {
  Globe,
  TrendingDown,
  Smartphone,
  Database,
  Settings,
  Shield,
  Blocks,
  FileText,
  BookOpen,
  ArrowRight,
  Search,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SectionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredModule?: string;
  requiredRole?: "admin" | "super_admin";
}

const sections: SectionCard[] = [
  {
    title: "Getting Started",
    description:
      "New to Laplace? Start here for a guided introduction to the platform.",
    href: "/docs/getting-started",
    icon: BookOpen,
  },
  {
    title: "Digital Twin",
    description:
      "Interactive logistics network map with unit markers and route visualization.",
    href: "/docs/platform/digital-twin",
    icon: Globe,
    requiredModule: "digital_twin",
  },
  {
    title: "Loss Prediction",
    description:
      "ML-powered cargo loss risk scoring for every shipment at emission time.",
    href: "/docs/platform/loss-prediction",
    icon: TrendingDown,
    requiredModule: "loss_prediction",
  },
  {
    title: "Collector",
    description:
      "Mobile-optimized field verification for high-risk cargo with photo evidence.",
    href: "/docs/platform/collector",
    icon: Smartphone,
    requiredModule: "collector",
  },
  {
    title: "Database Browser",
    description:
      "Browse raw data tables — CTRCs, predictions, units, and links.",
    href: "/docs/platform/database-browser",
    icon: Database,
    requiredModule: "database_browser",
  },
  {
    title: "Authentication",
    description:
      "Login, user roles, invitations, and tenant management.",
    href: "/docs/authentication",
    icon: Shield,
  },
  {
    title: "Settings",
    description:
      "Configure users, tenants, and platform preferences.",
    href: "/docs/settings",
    icon: Settings,
    requiredRole: "admin",
  },
  {
    title: "Architecture",
    description:
      "Technical overview of the platform stack, infrastructure, and data pipeline.",
    href: "/docs/architecture",
    icon: Blocks,
    requiredRole: "super_admin",
  },
  {
    title: "Changelog",
    description: "Release notes and version history for the Laplace Platform.",
    href: "/docs/changelog",
    icon: FileText,
  },
];

export default function HomePage() {
  const { user, modules, isLoading, logout } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Filter sections based on user access
  const filteredSections = sections.filter((section) => {
    if (!user) return true; // show all while loading (middleware will redirect if no auth)
    if (section.requiredRole) {
      if (section.requiredRole === "super_admin" && user.role !== "super_admin") return false;
      if (section.requiredRole === "admin" && user.role !== "admin" && user.role !== "super_admin") return false;
    }
    if (section.requiredModule) {
      if (user.role === "super_admin" || user.role === "admin") return true;
      return modules.includes(section.requiredModule);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--content-border)] bg-[var(--bg-deep)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={mounted && resolvedTheme === "dark" ? "/images/logo-dark.png" : "/images/logo.png"}
              alt="Laplace Logistics"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-lg text-[var(--content-text-primary)]">
              Laplace Docs
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-[var(--content-text-secondary)]">
                {user.name}
              </span>
            )}
            <ThemeToggle />
            {user && (
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--content-text-primary)] sm:text-5xl">
            Laplace Documentation
          </h1>
          <p className="mt-4 text-lg text-[var(--content-text-secondary)] max-w-2xl mx-auto">
            Everything you need to know about the Laplace Digital Twin platform
            — from getting started to advanced architecture and API reference.
          </p>

          {/* Search placeholder */}
          <div className="mt-8 mx-auto max-w-md">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--content-border)] bg-[var(--content-bg-card)] px-4 py-3 text-[var(--content-text-secondary)] shadow-sm">
              <Search className="h-4 w-4" />
              <span className="text-sm">Search documentation...</span>
              <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--content-border)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Getting started CTA */}
          <div className="mt-8">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--blue-primary)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section cards grid */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg border border-[var(--content-border)] bg-[var(--content-bg-card)] p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-[var(--bg-surface)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-[var(--bg-surface)]" />
                      <div className="h-3 w-full rounded bg-[var(--bg-surface)]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    className="group rounded-lg border border-[var(--content-border)] bg-[var(--content-bg-card)] p-6 transition-all duration-200 hover:border-[var(--blue-primary)] hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface)] group-hover:bg-[var(--blue-glow)] transition-colors">
                        <Icon className="h-5 w-5 text-[var(--content-text-secondary)] group-hover:text-[var(--blue-primary)] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--content-text-primary)] group-hover:text-[var(--blue-primary)] transition-colors">
                          {section.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--content-text-secondary)] line-clamp-2">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--content-border)] bg-[var(--bg-deep)] py-8 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <span className="text-sm text-[var(--content-text-secondary)]">
            Powered by Laplace Logistics
          </span>
          <span className="text-sm text-[var(--content-text-secondary)]">
            v0.3.0
          </span>
        </div>
      </footer>
    </div>
  );
}
