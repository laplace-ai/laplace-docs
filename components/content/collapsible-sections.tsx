"use client";

import { useRef, useEffect } from "react";

/**
 * Wraps MDX-rendered content and adds Notion-style collapse toggles to H1 and H2 headings.
 * When the toggle is clicked, all content between the heading and the next heading of the
 * same or higher level is collapsed/expanded.
 */
export function CollapsibleSections({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = container.querySelectorAll<HTMLElement>("h1, h2");

    headings.forEach((heading) => {
      // Skip if already has a toggle
      if (heading.querySelector(".collapsible-toggle")) return;

      const level = parseInt(heading.tagName[1]);

      // Create toggle button
      const btn = document.createElement("button");
      btn.className = "collapsible-toggle";
      btn.setAttribute("aria-label", "Toggle section");
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; transform: rotate(90deg);"><path d="m9 18 6-6-6-6"/></svg>`;

      // Style the button
      Object.assign(btn.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: "4px",
        padding: "2px",
        borderRadius: "4px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        verticalAlign: "middle",
        color: "var(--content-text-secondary)",
        flexShrink: "0",
      });

      btn.addEventListener("mouseenter", () => {
        btn.style.background = "var(--bg-surface)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "transparent";
      });

      let collapsed = false;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        collapsed = !collapsed;

        // Rotate the chevron
        const svg = btn.querySelector("svg");
        if (svg) {
          svg.style.transform = collapsed ? "rotate(0deg)" : "rotate(90deg)";
        }

        // Toggle visibility of all siblings until next same-or-higher-level heading
        let sibling = heading.nextElementSibling;
        while (sibling) {
          const tag = sibling.tagName;
          if (tag === "H1" || tag === "H2") {
            const sibLevel = parseInt(tag[1]);
            if (sibLevel <= level) break;
          }

          (sibling as HTMLElement).style.display = collapsed ? "none" : "";
          sibling = sibling.nextElementSibling;
        }
      });

      // Insert toggle as first child of the heading
      heading.insertBefore(btn, heading.firstChild);

      // Make heading flex to align toggle with text
      heading.style.display = "flex";
      heading.style.alignItems = "center";
    });

    // Cleanup
    return () => {
      const toggles = container.querySelectorAll(".collapsible-toggle");
      toggles.forEach((btn) => btn.remove());
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
