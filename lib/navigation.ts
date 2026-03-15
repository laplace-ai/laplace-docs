export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  items?: NavItem[];
  requiredModule?: string;
}

export interface NavSection {
  title: string;
  icon?: string;
  items: NavItem[];
  requiredRole?: "admin" | "super_admin";
}

/**
 * Sidebar navigation structure.
 * Matches the content/v1/ file system layout.
 */
export const navigation: NavSection[] = [
  {
    title: "Changelog",
    icon: "FileText",
    items: [{ title: "Changelog", href: "/docs/changelog" }],
  },
  {
    title: "Getting Started",
    icon: "BookOpen",
    items: [
      { title: "Overview", href: "/docs/getting-started" },
      { title: "Installation", href: "/docs/getting-started/installation" },
      { title: "First Steps", href: "/docs/getting-started/first-steps" },
    ],
  },
  {
    title: "Platform",
    icon: "LayoutDashboard",
    items: [
      { title: "Overview", href: "/docs/platform" },
      {
        title: "Digital Twin",
        href: "/docs/platform/digital-twin",
        requiredModule: "digital_twin",
        items: [
          { title: "Overview", href: "/docs/platform/digital-twin" },
          { title: "Map", href: "/docs/platform/digital-twin/map" },
          { title: "Units", href: "/docs/platform/digital-twin/units" },
        ],
      },
      {
        title: "Loss Prediction",
        href: "/docs/platform/loss-prediction",
        requiredModule: "loss_prediction",
        items: [
          { title: "Overview", href: "/docs/platform/loss-prediction" },
          { title: "Table", href: "/docs/platform/loss-prediction/table" },
        ],
      },
      {
        title: "Collector",
        href: "/docs/platform/collector",
        requiredModule: "collector",
        items: [
          { title: "Overview", href: "/docs/platform/collector" },
          {
            title: "Verification",
            href: "/docs/platform/collector/verification",
          },
        ],
      },
      {
        title: "Database Browser",
        href: "/docs/platform/database-browser",
        requiredModule: "database_browser",
      },
    ],
  },
  {
    title: "Authentication",
    icon: "Shield",
    items: [
      { title: "Overview", href: "/docs/authentication" },
      { title: "Login", href: "/docs/authentication/login" },
      { title: "Roles", href: "/docs/authentication/roles" },
      { title: "Invites", href: "/docs/authentication/invites" },
    ],
  },
  {
    title: "API Reference",
    icon: "Code",
    items: [
      { title: "Overview", href: "/docs/api" },
      { title: "Endpoints", href: "/docs/api/endpoints" },
    ],
  },
  {
    title: "Settings",
    icon: "Settings",
    requiredRole: "admin",
    items: [{ title: "Overview", href: "/docs/settings" }],
  },
];

/**
 * Get a flat list of all navigation items for prev/next navigation.
 */
export function getFlatNavItems(): NavItem[] {
  const flat: NavItem[] = [];

  function traverse(items: NavItem[]) {
    for (const item of items) {
      if (item.items && item.items.length > 0) {
        // Add child items but skip the parent if the first child has the same href
        if (item.items[0].href === item.href) {
          // Parent is also the first child — add it once, then skip in children
          flat.push(item.items[0]);
          for (let i = 1; i < item.items.length; i++) {
            traverse([item.items[i]]);
          }
        } else {
          flat.push(item);
          traverse(item.items);
        }
      } else {
        flat.push(item);
      }
    }
  }

  for (const section of navigation) {
    traverse(section.items);
  }

  return flat;
}

/**
 * Find previous and next pages relative to the current path.
 */
export function getPrevNextPages(currentPath: string) {
  const flat = getFlatNavItems();
  const index = flat.findIndex((item) => item.href === currentPath);

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}

/**
 * Generate breadcrumbs from a path.
 */
export function getBreadcrumbs(
  path: string
): { title: string; href: string }[] {
  const crumbs: { title: string; href: string }[] = [
    { title: "Docs", href: "/docs" },
  ];

  // Search navigation for matching sections
  const segments = path
    .replace("/docs/", "")
    .split("/")
    .filter(Boolean);
  let currentPath = "/docs";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Find in navigation
    const found = findNavItemByHref(currentPath);
    if (found) {
      crumbs.push({ title: found.title, href: found.href });
    } else {
      // Fallback: capitalize the segment
      crumbs.push({
        title: segment
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" "),
        href: currentPath,
      });
    }
  }

  return crumbs;
}

function findNavItemByHref(href: string): NavItem | null {
  for (const section of navigation) {
    // Check if the section's first item matches
    const found = searchItems(section.items, href);
    if (found) return found;
  }
  return null;
}

function searchItems(items: NavItem[], href: string): NavItem | null {
  for (const item of items) {
    if (item.href === href) return item;
    if (item.items) {
      const found = searchItems(item.items, href);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Find the parent section title for a given path.
 */
export function getSectionTitle(path: string): string | null {
  for (const section of navigation) {
    const found = searchItems(section.items, path);
    if (found) return section.title;
  }
  return null;
}
