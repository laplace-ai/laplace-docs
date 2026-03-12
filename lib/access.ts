import type { AuthUser } from "@/lib/auth-api"
import { navigation, type NavSection, type NavItem } from "@/lib/navigation"

/**
 * Check if a user can access a navigation section.
 */
export function canAccessSection(
  section: NavSection,
  user: AuthUser | null,
  modules: string[]
): boolean {
  if (!user) return false
  if (!section.requiredRole) return true
  return meetsRoleRequirement(user.role, section.requiredRole)
}

/**
 * Check if a user can access a navigation item.
 */
export function canAccessItem(
  item: NavItem,
  user: AuthUser | null,
  modules: string[]
): boolean {
  if (!user) return false
  if (!item.requiredModule) return true
  // Admins and super_admins can see all modules
  if (user.role === "super_admin" || user.role === "admin") return true
  return modules.includes(item.requiredModule)
}

/**
 * Check if a user can access a given docs path.
 * Used by the AuthGate component for page-level protection.
 */
export function canAccessPath(
  path: string,
  user: AuthUser | null,
  modules: string[]
): boolean {
  if (!user) return false

  // Find which section and item this path belongs to
  for (const section of navigation) {
    // Check if any item in this section matches the path
    const item = findItemByPath(section.items, path)
    if (item) {
      // Check section-level access first
      if (!canAccessSection(section, user, modules)) return false
      // Check item-level access (walk up to find requiredModule on parent)
      const moduleItem = findModuleRequirement(section.items, path)
      if (moduleItem?.requiredModule) {
        if (user.role === "super_admin" || user.role === "admin") return true
        return modules.includes(moduleItem.requiredModule)
      }
      return true
    }
  }

  // Path not in navigation — allow if authenticated (could be a valid unlisted page)
  return true
}

function meetsRoleRequirement(
  userRole: string,
  requiredRole: "admin" | "super_admin"
): boolean {
  if (requiredRole === "super_admin") return userRole === "super_admin"
  if (requiredRole === "admin") return userRole === "admin" || userRole === "super_admin"
  return true
}

function findItemByPath(items: NavItem[], path: string): NavItem | null {
  for (const item of items) {
    if (item.href === path) return item
    if (path.startsWith(item.href + "/")) return item
    if (item.items) {
      const found = findItemByPath(item.items, path)
      if (found) return found
    }
  }
  return null
}

/**
 * Walk the nav tree to find the nearest item with a requiredModule
 * that contains the given path.
 */
function findModuleRequirement(items: NavItem[], path: string): NavItem | null {
  for (const item of items) {
    if (item.href === path || path.startsWith(item.href + "/")) {
      // Check children first for more specific match
      if (item.items) {
        const childMatch = findModuleRequirement(item.items, path)
        if (childMatch?.requiredModule) return childMatch
      }
      if (item.requiredModule) return item
    }
  }
  return null
}
