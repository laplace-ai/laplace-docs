"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { navigation } from "@/lib/navigation";
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
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--blue-primary)]">
            <span className="text-sm font-bold text-white">L</span>
          </div>
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
        {navigation.map((section) => {
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
        })}
      </nav>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--content-border)] px-4 py-3">
        <span className="text-xs text-[var(--content-text-secondary)]">
          Powered by Laplace
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
