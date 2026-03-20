import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";
import { Steps, Step } from "@/components/mdx/steps";
import { Card } from "@/components/mdx/card";
import { SmartLink } from "@/components/mdx/smart-link";
import { MermaidDiagram } from "@/components/mdx/mermaid-diagram";
import React from "react";

/**
 * Recursively extract text content from React children.
 * Used to pull the raw mermaid code out of rehype-pretty-code's span structure.
 */
function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (!children) return "";

  if (Array.isArray(children)) {
    return children.map(extractText).join("");
  }

  if (React.isValidElement(children)) {
    const props = children.props as Record<string, unknown>;
    // Each [data-line] span from rehype-pretty-code is one line of code
    if (props["data-line"] !== undefined) {
      return extractText(props.children as React.ReactNode) + "\n";
    }
    return extractText(props.children as React.ReactNode);
  }

  return "";
}

/**
 * Check if a <pre> element wraps a mermaid code block.
 * rehype-pretty-code adds data-language="mermaid" to the code element.
 */
function isMermaidBlock(children: React.ReactNode): boolean {
  if (React.isValidElement(children)) {
    const props = children.props as Record<string, unknown>;
    if (props["data-language"] === "mermaid") return true;
  }
  return false;
}

function PreComponent(props: React.ComponentProps<"pre">) {
  const { children, ...rest } = props;

  if (isMermaidBlock(children)) {
    const chart = extractText(children);
    return <MermaidDiagram chart={chart} />;
  }

  return <pre {...rest}>{children}</pre>;
}

/**
 * MDX component map.
 * Maps standard HTML elements to custom React components,
 * and provides custom components available in MDX content.
 */
export function getMDXComponents(): MDXComponents {
  return {
    // Links
    a: (props: React.ComponentProps<"a">) => <SmartLink {...props} />,

    // Code blocks (intercepts mermaid diagrams)
    pre: PreComponent,

    // Custom components (used in MDX content directly)
    Callout,
    Steps,
    Step,
    Card,
  } as MDXComponents;
}
