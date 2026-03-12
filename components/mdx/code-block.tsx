"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  return (
    <div className="relative group">
      <pre {...props}>{children}</pre>
      <CopyButton getCode={() => {
        // Extract text content from the pre element
        const el = document.querySelector('[data-copy-target]');
        return el?.textContent || '';
      }} />
    </div>
  );
}

export function CopyButton({ getCode }: { getCode: () => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Get code from the nearest pre element
      const text = getCode();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "absolute right-3 top-3 inline-flex items-center justify-center rounded-md p-1.5",
        "bg-[var(--code-header-bg)] border border-[var(--code-border)]",
        "text-[var(--code-header-text)] hover:text-white",
        "opacity-0 group-hover:opacity-100 transition-all"
      )}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[var(--success)]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
