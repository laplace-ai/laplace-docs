"use client";

import { useEffect, useState } from "react";
import { Bot, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface RightSidebarProps {
  headings: TocItem[];
  className?: string;
}

export function RightSidebar({ headings, className }: RightSidebarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    // Observe all headings
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside
      className={cn(
        "hidden xl:flex flex-col w-[var(--right-sidebar-width)] shrink-0",
        className
      )}
    >
      <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto px-4 py-6">
        {/* Table of Contents */}
        <div className="mb-8">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--content-text-secondary)]">
            On this page
          </h4>
          <nav aria-label="Table of contents">
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(heading.id);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                        setActiveId(heading.id);
                      }
                    }}
                    className={cn(
                      "block text-sm py-1 transition-colors border-l-2",
                      heading.level === 2 && "pl-3",
                      heading.level === 3 && "pl-6",
                      heading.level === 4 && "pl-9",
                      activeId === heading.id
                        ? "border-[var(--toc-active)] text-[var(--toc-active)] font-medium"
                        : "border-transparent text-[var(--toc-text)] hover:text-[var(--toc-hover)]"
                    )}
                  >
                    {heading.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Feedback */}
        <div className="mb-8 rounded-lg border border-[var(--content-border)] p-4">
          {feedbackGiven ? (
            <p className="text-sm text-[var(--content-text-secondary)]">
              Thanks for your feedback!
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm font-medium text-[var(--content-text-primary)]">
                Was this page helpful?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedbackGiven(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--content-border)] px-3 py-1.5 text-sm text-[var(--content-text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--content-text-primary)] transition-colors"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Yes
                </button>
                <button
                  onClick={() => setFeedbackGiven(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--content-border)] px-3 py-1.5 text-sm text-[var(--content-text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--content-text-primary)] transition-colors"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  No
                </button>
              </div>
            </>
          )}
        </div>

        {/* AI Assistant placeholder */}
        <div className="rounded-lg border border-[var(--content-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-[var(--blue-primary)]" />
            <span className="text-sm font-medium text-[var(--content-text-primary)]">
              AI Help
            </span>
          </div>
          <p className="text-xs text-[var(--content-text-secondary)] mb-3">
            Ask me about this page...
          </p>
          <div className="flex items-center gap-2 rounded-md border border-[var(--content-border)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--content-text-secondary)] opacity-60 cursor-not-allowed">
            <span>Coming soon</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
