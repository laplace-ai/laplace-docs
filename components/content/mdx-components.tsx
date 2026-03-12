import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";
import { Steps, Step } from "@/components/mdx/steps";
import { Card } from "@/components/mdx/card";
import { SmartLink } from "@/components/mdx/smart-link";

/**
 * MDX component map.
 * Maps standard HTML elements to custom React components,
 * and provides custom components available in MDX content.
 */
export function getMDXComponents(): MDXComponents {
  return {
    // Links
    a: (props: React.ComponentProps<"a">) => <SmartLink {...props} />,

    // Custom components (used in MDX content directly)
    Callout,
    Steps,
    Step,
    Card,
  } as MDXComponents;
}
