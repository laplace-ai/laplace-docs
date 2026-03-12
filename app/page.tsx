import Link from "next/link";
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
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const sections = [
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
  },
  {
    title: "Loss Prediction",
    description:
      "ML-powered cargo loss risk scoring for every shipment at emission time.",
    href: "/docs/platform/loss-prediction",
    icon: TrendingDown,
  },
  {
    title: "Collector",
    description:
      "Mobile-optimized field verification for high-risk cargo with photo evidence.",
    href: "/docs/platform/collector",
    icon: Smartphone,
  },
  {
    title: "Database Browser",
    description:
      "Browse raw data tables — CTRCs, predictions, units, and links.",
    href: "/docs/platform/database-browser",
    icon: Database,
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
  },
  {
    title: "Architecture",
    description:
      "Technical overview of the platform stack, infrastructure, and data pipeline.",
    href: "/docs/architecture",
    icon: Blocks,
  },
  {
    title: "Changelog",
    description: "Release notes and version history for the Laplace Platform.",
    href: "/docs/changelog",
    icon: FileText,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--content-border)] bg-[var(--bg-deep)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--blue-primary)]">
              <span className="text-sm font-bold text-white">L</span>
            </div>
            <span className="font-semibold text-lg text-[var(--content-text-primary)]">
              Laplace Docs
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => {
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--content-border)] bg-[var(--bg-deep)] py-8 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <span className="text-sm text-[var(--content-text-secondary)]">
            Powered by Laplace
          </span>
          <span className="text-sm text-[var(--content-text-secondary)]">
            v1
          </span>
        </div>
      </footer>
    </div>
  );
}
