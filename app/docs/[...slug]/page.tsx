import { notFound } from "next/navigation";
import { getDocBySlug, getAllSlugs, extractHeadings } from "@/lib/content";
import { getBreadcrumbs, getPrevNextPages } from "@/lib/navigation";
import { MDXRenderer } from "@/components/content/mdx-renderer";
import { PageHeader } from "@/components/content/page-header";
import { PageFooter } from "@/components/content/page-footer";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RightSidebar } from "@/components/layout/right-sidebar";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const currentPath = `/docs/${slug.join("/")}`;
  const breadcrumbs = getBreadcrumbs(currentPath);
  const { prev, next } = getPrevNextPages(currentPath);
  const headings = extractHeadings(doc.content);

  return (
    <div className="flex">
      {/* Main content */}
      <main className="flex-1 min-w-0 px-6 py-8 lg:px-12 lg:py-10 max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />
        <PageHeader frontmatter={doc.frontmatter} />
        <MDXRenderer source={doc.content} />
        <PageFooter prev={prev} next={next} />
      </main>

      {/* Right sidebar (TOC) */}
      <RightSidebar headings={headings} />
    </div>
  );
}
