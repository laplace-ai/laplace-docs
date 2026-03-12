import type { DocFrontmatter } from "@/lib/content";

interface PageHeaderProps {
  frontmatter: DocFrontmatter;
}

export function PageHeader({ frontmatter }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {frontmatter.description && (
        <p className="text-lg text-[var(--content-text-secondary)] mt-2">
          {frontmatter.description}
        </p>
      )}
      {frontmatter.lastUpdated && (
        <p className="mt-3 text-sm text-[var(--content-text-secondary)]">
          Last updated:{" "}
          {new Date(frontmatter.lastUpdated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
