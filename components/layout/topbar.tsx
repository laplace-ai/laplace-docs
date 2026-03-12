"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface TopbarProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function Topbar({ isMobileMenuOpen, onToggleMobileMenu }: TopbarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 h-14 px-4",
        "bg-[var(--bg-deep)] border-b border-[var(--content-border)]",
        "lg:hidden"
      )}
    >
      <button
        onClick={onToggleMobileMenu}
        className="inline-flex items-center justify-center rounded-md p-2 text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      <Link href="/" className="flex items-center gap-2">
        <Image
          src={mounted && resolvedTheme === "dark" ? "/images/logo-dark.png" : "/images/logo.png"}
          alt="Laplace Logistics"
          width={24}
          height={24}
          className="rounded-md"
        />
        <span className="font-semibold text-sm text-[var(--content-text-primary)]">
          Laplace Docs
        </span>
      </Link>

      <span className="ml-auto text-xs text-[var(--content-text-secondary)]">
        v0.3.0
      </span>
    </header>
  );
}
