"use client";

import { useState, createContext, useContext } from "react";
import { LeftSidebar } from "./left-sidebar";
import { Topbar } from "./topbar";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutContextType {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  toggleLeftSidebar: () => {},
  toggleRightSidebar: () => {},
});

export function useLayoutContext() {
  return useContext(LayoutContext);
}

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  const toggleLeftSidebar = () => setLeftSidebarOpen((v) => !v);
  const toggleRightSidebar = () => setRightSidebarOpen((v) => !v);

  return (
    <LayoutContext.Provider
      value={{ leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar }}
    >
      <div className="min-h-screen bg-[var(--bg-base)]">
        {/* Mobile topbar */}
        <Topbar
          isMobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Mobile nav drawer */}
        <MobileNavDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex">
          {/* Desktop left sidebar */}
          <div
            className={cn(
              "hidden lg:block shrink-0 sticky top-0 h-screen transition-all duration-200 overflow-hidden",
              leftSidebarOpen ? "w-[var(--sidebar-width)]" : "w-0"
            )}
          >
            <LeftSidebar className="w-[var(--sidebar-width)]" />
          </div>

          {/* Main content area */}
          <div className="flex-1 min-w-0 relative">
            {/* Sidebar toggle buttons */}
            <div className="hidden lg:flex items-center gap-1 absolute top-3 left-3 z-10">
              <button
                onClick={toggleLeftSidebar}
                className="rounded-md p-1.5 text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                aria-label={leftSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                title={leftSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                {leftSidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="hidden xl:flex items-center gap-1 absolute top-3 right-3 z-10">
              <button
                onClick={toggleRightSidebar}
                className="rounded-md p-1.5 text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                aria-label={rightSidebarOpen ? "Hide table of contents" : "Show table of contents"}
                title={rightSidebarOpen ? "Hide table of contents" : "Show table of contents"}
              >
                {rightSidebarOpen ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
