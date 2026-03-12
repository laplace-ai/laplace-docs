"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";

interface SidebarItemProps {
  item: NavItem;
  depth?: number;
  onNavigate?: () => void;
}

export function SidebarItem({
  item,
  depth = 0,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasChildren = item.items && item.items.length > 0;

  // Check if any child is active
  const isChildActive = hasChildren
    ? item.items!.some(
        (child) =>
          pathname === child.href ||
          (child.items &&
            child.items.some((grandchild) => pathname === grandchild.href))
      )
    : false;

  const [isOpen, setIsOpen] = useState(isActive || isChildActive);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center w-full gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            "text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)]",
            "hover:bg-[var(--bg-surface)]",
            (isActive || isChildActive) &&
              "text-[var(--content-text-primary)] font-medium"
          )}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          <span className="truncate">{item.title}</span>
        </button>
        {isOpen && (
          <div className="mt-0.5">
            {item.items!.map((child) => (
              <SidebarItem
                key={child.href}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors",
        "text-[var(--content-text-secondary)] hover:text-[var(--content-text-primary)]",
        "hover:bg-[var(--bg-surface)]",
        isActive &&
          "bg-[var(--bg-surface)] text-[var(--blue-primary)] font-medium"
      )}
      style={{ paddingLeft: `${20 + depth * 12}px` }}
    >
      <span className="truncate">{item.title}</span>
    </Link>
  );
}
