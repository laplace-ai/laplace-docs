"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { navigation } from "@/lib/navigation";
import { canAccessSection, canAccessItem } from "@/lib/access";
import { useAuth } from "@/lib/auth-context";
import { SidebarItem } from "@/components/navigation/sidebar-item";
import { VersionSelector } from "@/components/navigation/version-selector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutDashboard,
  Shield,
  Settings,
  Blocks,
  FileText,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  LayoutDashboard,
  Shield,
  Settings,
  Blocks,
  FileText,
};

interface LeftSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function LeftSidebar({ className, onNavigate }: LeftSidebarProps) {
  const { resolvedTheme } = useTheme();
  const { user, modules, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Filter navigation based on user access
  const filteredNavigation = navigation
    .filter((section) => canAccessSection(section, user, modules))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessItem(item, user, modules)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[var(--bg-deep)] border-r border-[var(--content-border)]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[var(--content-border)]">
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          onClick={onNavigate}
        >
          <Image
            src={mounted && resolvedTheme === "dark" ? "/images/logo-dark.png" : "/images/logo.png"}
            alt="Laplace Logistics"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="font-semibold text-[var(--content-text-primary)]">
            Laplace Docs
          </span>
        </Link>
      </div>

      {/* Version selector */}
      <div className="px-3 pt-3 pb-1">
        <VersionSelector />
      </div>

      {/* Search (placeholder) */}
      <div className="px-3 py-2">
        <button
          className="flex items-center gap-2 w-full rounded-md border border-[var(--content-border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--content-text-secondary)] hover:border-[var(--bg-surface-hover)] transition-colors"
          aria-label="Search documentation"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search docs...</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded border border-[var(--content-border)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--content-text-secondary)]">
            <span>Ctrl</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Documentation navigation">
        {isLoading ? (
          // Skeleton while auth loads
          <div className="animate-pulse space-y-4 px-2 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-[var(--bg-surface)]" />
                <div className="h-3 w-32 rounded bg-[var(--bg-surface)] ml-2" />
                <div className="h-3 w-28 rounded bg-[var(--bg-surface)] ml-2" />
              </div>
            ))}
          </div>
        ) : (
          filteredNavigation.map((section) => {
            const Icon = section.icon ? iconMap[section.icon] : null;
            return (
              <div key={section.title} className="mb-3">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--content-text-secondary)]">
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span>{section.title}</span>
                </div>
                <div className="mt-0.5">
                  {section.items.map((item) => (
                    <SidebarItem
                      key={item.href}
                      item={item}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </nav>

      {/* Footer — user info + theme toggle */}
      <div className="border-t border-[var(--content-border)] px-4 py-3">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--blue-primary)] text-[10px] font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--content-text-primary)]">
                  {user.name}
                </p>
                <p className="truncate text-[10px] text-[var(--content-text-secondary)]">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--content-text-secondary)]">
              Powered by Laplace Logistics
            </span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </aside>
  );
}
