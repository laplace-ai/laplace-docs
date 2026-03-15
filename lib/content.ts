import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { defaultLocale, type Locale } from "./i18n";

function getContentDir(locale: Locale = defaultLocale): string {
  return path.join(process.cwd(), "content", locale, "v1");
}

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
 * Falls back to default locale if the file doesn't exist in the requested locale.
 */
function resolveFilePath(slug: string[], locale: Locale = defaultLocale): string | null {
  const contentDir = getContentDir(locale);
  const slugPath = slug.join("/");

  // Try direct file first
  const directPath = path.join(contentDir, `${slugPath}.mdx`);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // Try index file
  const indexPath = path.join(contentDir, slugPath, "index.mdx");
  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  // Fallback to default locale if requested locale doesn't have this page
  if (locale !== defaultLocale) {
    return resolveFilePath(slug, defaultLocale);
  }

  return null;
}

/**
 * Get document content by slug, with locale support.
 */
export function getDocBySlug(slug: string[], locale: Locale = defaultLocale): DocContent | null {
  const filePath = resolveFilePath(slug, locale);
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
 * Scans the default locale directory since all pages should exist there.
 */
export function getAllSlugs(): string[][] {
  const slugs: string[][] = [];
  const contentDir = getContentDir(defaultLocale);

  function walk(dir: string, prefix: string[] = []) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name]);
      } else if (entry.name.endsWith(".mdx")) {
        const name = entry.name.replace(".mdx", "");
        if (name === "index") {
          if (prefix.length > 0) {
            slugs.push(prefix);
          }
        } else {
          slugs.push([...prefix, name]);
        }
      }
    }
  }

  walk(contentDir);
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
