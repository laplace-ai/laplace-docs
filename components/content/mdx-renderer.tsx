import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import { getMDXComponents } from "./mdx-components";

interface MDXRendererProps {
  source: string;
}

export function MDXRenderer({ source }: MDXRendererProps) {
  return (
    <article className="prose prose-lg max-w-none">
      <MDXRemote
        source={source}
        components={getMDXComponents()}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "wrap",
                  properties: {
                    className: ["anchor"],
                  },
                },
              ],
              [
                rehypePrettyCode,
                {
                  theme: "one-dark-pro",
                  keepBackground: true,
                  defaultLang: "plaintext",
                },
              ],
            ],
          },
        }}
      />
    </article>
  );
}
