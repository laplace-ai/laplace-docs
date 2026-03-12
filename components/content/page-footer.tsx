import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NavItem } from "@/lib/navigation";

interface PageFooterProps {
  prev: NavItem | null;
  next: NavItem | null;
}

export function PageFooter({ prev, next }: PageFooterProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Previous and next pages"
      className="mt-16 flex items-stretch gap-4 not-prose"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex-1 flex items-center gap-3 rounded-lg border border-[var(--content-border)] p-4 transition-all duration-200 hover:border-[var(--blue-primary)] hover:shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--content-text-secondary)] group-hover:text-[var(--blue-primary)] group-hover:-translate-x-0.5 transition-all" />
          <div className="text-right flex-1">
            <span className="block text-xs text-[var(--content-text-secondary)]">
              Previous
            </span>
            <span className="block text-sm font-medium text-[var(--content-text-primary)] group-hover:text-[var(--blue-primary)] transition-colors">
              {prev.title}
            </span>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex-1 flex items-center gap-3 rounded-lg border border-[var(--content-border)] p-4 transition-all duration-200 hover:border-[var(--blue-primary)] hover:shadow-sm"
        >
          <div className="flex-1">
            <span className="block text-xs text-[var(--content-text-secondary)]">
              Next
            </span>
            <span className="block text-sm font-medium text-[var(--content-text-primary)] group-hover:text-[var(--blue-primary)] transition-colors">
              {next.title}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--content-text-secondary)] group-hover:text-[var(--blue-primary)] group-hover:translate-x-0.5 transition-all" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
