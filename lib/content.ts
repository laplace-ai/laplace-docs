import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "v1");

export interface DocFrontmatter {
  title: string;
  description?: string;
  lastUpdated?: string;
  module?: string;
  tags?: string[];
  related?: { slug: string; label: string }[];
}

export interface DocContent {
  frontmatter: DocFrontmatter;
  content: string;
  slug: string[];
}

/**
 * Resolve a slug array to an MDX file path.
 * Tries: slug.mdx, slug/index.mdx
 */
function resolveFilePath(slug: string[]): string | null {
  const slugPath = slug.join("/");

  // Try direct file first
  const directPath = path.join(CONTENT_DIR, `${slugPath}.mdx`);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // Try index file
  const indexPath = path.join(CONTENT_DIR, slugPath, "index.mdx");
  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  return null;
}

/**
 * Get document content by slug.
 */
export function getDocBySlug(slug: string[]): DocContent | null {
  const filePath = resolveFilePath(slug);
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    frontmatter: data as DocFrontmatter,
    content,
    slug,
  };
}

/**
 * Get all available slugs for static generation.
 */
export function getAllSlugs(): string[][] {
  const slugs: string[][] = [];

  function walk(dir: string, prefix: string[] = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name]);
      } else if (entry.name.endsWith(".mdx")) {
        const name = entry.name.replace(".mdx", "");
        if (name === "index") {
          // index.mdx -> use the directory as slug
          if (prefix.length > 0) {
            slugs.push(prefix);
          }
        } else {
          slugs.push([...prefix, name]);
        }
      }
    }
  }

  walk(CONTENT_DIR);
  return slugs;
}

/**
 * Extract headings from MDX content for table of contents.
 */
export function extractHeadings(
  content: string
): { id: string; title: string; level: number }[] {
  const headings: { id: string; title: string; level: number }[] = [];
  const regex = /^(#{2,4})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    headings.push({ id, title, level });
  }

  return headings;
}
