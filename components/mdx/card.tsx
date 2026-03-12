import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CardProps {
  title: string;
  href: string;
  children: React.ReactNode;
}

export function Card({ title, href, children }: CardProps) {
  // Convert content paths like /v1/foo to /docs/foo
  const resolvedHref = href.startsWith("/v1/")
    ? `/docs/${href.slice(4)}`
    : href;

  return (
    <Link
      href={resolvedHref}
      className="group block my-4 rounded-lg border border-[var(--content-border)] bg-[var(--content-bg-card)] p-5 no-underline transition-all duration-200 hover:border-[var(--blue-primary)] hover:shadow-sm not-prose"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--content-text-primary)] group-hover:text-[var(--blue-primary)] transition-colors mb-1.5">
            {title}
          </h3>
          <div className="text-sm text-[var(--content-text-secondary)] line-clamp-2">
            {children}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-[var(--content-text-secondary)] group-hover:text-[var(--blue-primary)] group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
