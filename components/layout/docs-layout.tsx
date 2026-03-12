"use client";

import { useState } from "react";
import { LeftSidebar } from "./left-sidebar";
import { Topbar } from "./topbar";
import { MobileNavDrawer } from "./mobile-nav-drawer";

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
        <div className="hidden lg:block w-[var(--sidebar-width)] shrink-0 sticky top-0 h-screen">
          <LeftSidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
