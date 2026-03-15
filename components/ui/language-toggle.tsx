"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { getLocaleLabel } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  const nextLocale = locale === "en" ? "pt-BR" as const : "en" as const;

  return (
    <button
      onClick={() => setLocale(nextLocale)}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5",
        "text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)]",
        "hover:bg-[var(--bg-surface)] transition-colors text-xs font-medium",
        className
      )}
      aria-label={`Switch language to ${nextLocale === "pt-BR" ? "Portuguese" : "English"}`}
      title={`Switch to ${nextLocale === "pt-BR" ? "Português" : "English"}`}
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{getLocaleLabel(locale)}</span>
    </button>
  );
}
