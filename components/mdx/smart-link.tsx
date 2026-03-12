import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface SmartLinkProps {
  href?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export function SmartLink({ href, children, ...props }: SmartLinkProps) {
  if (!href) {
    return <span {...props}>{children}</span>;
  }

  const isExternal =
    href.startsWith("http://") || href.startsWith("https://");

  // Convert internal content paths /v1/foo -> /docs/foo
  const resolvedHref = !isExternal && href.startsWith("/v1/")
    ? `/docs/${href.slice(4)}`
    : href;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5"
        {...props}
      >
        {children}
        <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
      </a>
    );
  }

  return (
    <Link href={resolvedHref} {...props}>
      {children}
    </Link>
  );
}
