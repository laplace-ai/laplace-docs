import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--content-text-secondary)]" />
              )}
              {isLast ? (
                <span className="text-[var(--content-text-secondary)] truncate max-w-[200px]">
                  {item.title}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)] transition-colors truncate max-w-[200px]"
                >
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
