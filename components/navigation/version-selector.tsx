"use client";

import { ChevronDown } from "lucide-react";

export function VersionSelector() {
  return (
    <button
      className="flex items-center gap-1.5 rounded-md border border-[var(--content-border)] bg-[var(--bg-base)] px-3 py-1.5 text-sm text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)] hover:border-[var(--bg-surface-hover)] transition-colors w-full"
      aria-label="Select version"
    >
      <span className="font-medium">v1</span>
      <span className="ml-1 text-xs text-[var(--success)]">(latest)</span>
      <ChevronDown className="ml-auto h-3.5 w-3.5" />
    </button>
  );
}
