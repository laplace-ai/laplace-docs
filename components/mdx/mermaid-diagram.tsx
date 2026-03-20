"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { Maximize2, Minimize2 } from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
}

function initMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    securityLevel: "loose",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    themeVariables: isDark
      ? {
          primaryColor: "#3A8DFF",
          primaryTextColor: "#E2E8F0",
          primaryBorderColor: "#4A6FA5",
          lineColor: "#94A3B8",
          secondaryColor: "#2A2A2A",
          tertiaryColor: "#333333",
          background: "#191919",
          mainBkg: "#2A2A2A",
          nodeBorder: "#4A6FA5",
          clusterBkg: "#20202080",
          clusterBorder: "#333333",
          titleColor: "#E2E8F0",
          edgeLabelBackground: "#2A2A2A",
          nodeTextColor: "#E2E8F0",
        }
      : {
          primaryColor: "#3A8DFF",
          primaryTextColor: "#37352F",
          primaryBorderColor: "#93B8E8",
          lineColor: "#6B7280",
          secondaryColor: "#F7F6F3",
          tertiaryColor: "#EDEDEC",
          background: "#FFFFFF",
          mainBkg: "#EBF3FF",
          nodeBorder: "#93B8E8",
          clusterBkg: "#F7F6F380",
          clusterBorder: "#E8E5E0",
          titleColor: "#37352F",
          edgeLabelBackground: "#FFFFFF",
          nodeTextColor: "#37352F",
        },
  });
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        initMermaid(isDark);

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, chart.trim());

        if (!cancelled) {
          setSvg(rendered);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setSvg("");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, isDark]);

  // Close on ESC
  useEffect(() => {
    if (!expanded) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (error) {
    return (
      <div className="mermaid-error">
        <p className="text-sm text-[var(--error)]">Failed to render diagram</p>
        <pre className="mt-2 text-xs opacity-60 overflow-x-auto">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-loading">
        <div className="h-32 flex items-center justify-center text-sm text-[var(--content-text-secondary)]">
          Loading diagram...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inline diagram */}
      <div ref={containerRef} className="mermaid-diagram">
        <button
          onClick={toggleExpanded}
          className="mermaid-expand-btn"
          title="Expand diagram"
          aria-label="Expand diagram to fullscreen"
        >
          <Maximize2 size={16} />
        </button>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      {/* Fullscreen overlay */}
      {expanded && (
        <div className="mermaid-overlay" onClick={toggleExpanded}>
          <div
            className="mermaid-overlay-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={toggleExpanded}
              className="mermaid-collapse-btn"
              title="Close"
              aria-label="Close fullscreen diagram"
            >
              <Minimize2 size={20} />
            </button>
            <div
              className="mermaid-overlay-diagram"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  );
}
