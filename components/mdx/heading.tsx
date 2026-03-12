import { Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  level: 1 | 2 | 3 | 4;
  id?: string;
  children: React.ReactNode;
}

export function Heading({ level, id, children, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;

  // Generate id from children text content if not provided
  const headingId =
    id ||
    (typeof children === "string"
      ? children
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      : undefined);

  if (level === 1) {
    return (
      <Tag id={headingId} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag id={headingId} className="group scroll-mt-20" {...props}>
      {children}
      {headingId && (
        <a
          href={`#${headingId}`}
          className={cn(
            "ml-2 inline-flex opacity-0 group-hover:opacity-100 transition-opacity",
            "text-[var(--content-text-secondary)] hover:text-[var(--blue-primary)]"
          )}
          aria-label={`Link to ${typeof children === "string" ? children : "heading"}`}
        >
          <LinkIcon className="h-4 w-4" />
        </a>
      )}
    </Tag>
  );
}
