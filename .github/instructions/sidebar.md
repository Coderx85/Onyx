# Sidebar Implementation Instructions for Copilot

## Overview

This document provides comprehensive instructions for implementing and extending the sidebar navigation system in the Next.js 16 application. The sidebar is a key UI component that provides navigation and user account management.

## Architecture & Design Patterns

### High-Level Goal

Create a responsive, accessible sidebar navigation system that:

- Adapts to mobile and desktop viewports
- Supports collapsible/expandable states
- Maintains state persistence across sessions
- Integrates with authentication
- Provides role-based navigation items

### Key Design Principles

1. **Component Composition**: Use small, focused components that can be composed together
2. **State Management**: Use React Context for sidebar state (open/closed, mobile)
3. **Accessibility**: Include ARIA labels, keyboard shortcuts, and semantic HTML
4. **Responsive Design**: Mobile-first approach with Tailwind CSS
5. **Type Safety**: Full TypeScript support with strict typing

## File Structure & Dependencies

### Core UI Components (components/ui/sidebar.tsx)

The foundation of the sidebar system. This is a **727-line file** with the following exports and functions:

#### **Types & Context**

- `SidebarContextProps`: Type definition for sidebar context containing:

  - `state`: "expanded" | "collapsed"
  - `open`: boolean (desktop state)
  - `setOpen`: function to set open state
  - `openMobile`: boolean (mobile state)
  - `setOpenMobile`: function to set mobile state
  - `isMobile`: boolean (responsive breakpoint)
  - `toggleSidebar`: function to toggle state

- `SidebarContext`: React Context created via `React.createContext<SidebarContextProps | null>(null)`

#### **Constants**

```
SIDEBAR_COOKIE_NAME = "sidebar_state"
SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 (7 days)
SIDEBAR_WIDTH = "16rem"
SIDEBAR_WIDTH_MOBILE = "18rem"
SIDEBAR_WIDTH_ICON = "3rem"
SIDEBAR_KEYBOARD_SHORTCUT = "b" (Cmd+B or Ctrl+B)
```

#### **Core Functions & Components**

1. **useSidebar() Hook**

   - Returns `SidebarContextProps` from context
   - Throws error if used outside `SidebarProvider`
   - Usage: Access state and toggle functions from any descendant component

2. **SidebarProvider Component**

   - Props: `defaultOpen` (boolean), `open` (controlled), `onOpenChange` (callback), `className`, `style`, `children`
   - Manages sidebar state with cookie persistence
   - Handles keyboard shortcut (Cmd/Ctrl+B to toggle)
   - Responsive: Different state for mobile vs desktop
   - Context Provider: Wraps children with `SidebarContext.Provider`
   - Returns: `<div>` wrapper with CSS variables for width and state

3. **Sidebar Component**

   - Props: `side` ("left" | "right"), `variant` ("sidebar" | "floating" | "inset"), `collapsible` ("offcanvas" | "icon" | "none"), `className`, `children`
   - Handles three collapsible modes:
     - `offcanvas`: Slides out of view (default)
     - `icon`: Shows only icons when collapsed
     - `none`: Always expanded
   - Mobile: Uses `Sheet` component for drawer UI
   - Desktop: Uses fixed positioning with CSS Grid
   - Exports data attributes: `data-state`, `data-collapsible`, `data-variant`, `data-side`

4. **SidebarTrigger Component**

   - Extends `Button` component
   - Calls `toggleSidebar()` on click
   - Props: `className`, `onClick`, standard button props

5. **SidebarRail Component**

   - Resizable element for drag-to-expand functionality
   - Props: `className`, standard button props
   - ARIA label: "Toggle Sidebar"

6. **SidebarInset Component**

   - Main content wrapper
   - Replaces `<main>` when used with sidebar
   - Props: `className`, standard div props

7. **SidebarInput Component**

   - Search/filter input styled for sidebar
   - Props: `className`, standard input props
   - Reduced height (h-8) with transparent background

8. **SidebarHeader Component**

   - Top section of sidebar (typically logo/branding)
   - Props: `className`, standard div props
   - Padding: p-2, gap: gap-2

9. **SidebarFooter Component**

   - Bottom section of sidebar (typically user menu)
   - Props: `className`, standard div props

10. **SidebarSeparator Component**

    - Visual divider using `Separator` component
    - Props: `className`, standard Separator props

11. **SidebarContent Component**

    - Main scrollable content area
    - Props: `className`, standard div props
    - Flexbox with auto overflow

12. **SidebarGroup Component**

    - Groups related menu items
    - Props: `className`, standard div props
    - Example: One group for main nav, another for secondary

13. **SidebarGroupLabel Component**

    - Label for a group of menu items
    - Props: `className`, `asChild`, standard div props
    - Typically displays above a menu group

14. **SidebarGroupAction Component**

    - Action button within a group (e.g., "Add new")
    - Props: `className`, `asChild`, standard button props

15. **SidebarGroupContent Component**

    - Container for menu items within a group
    - Props: `className`, standard div props

16. **SidebarMenu Component** (`<ul>`)

    - Unordered list for menu items
    - Props: `className`, standard ul props

17. **SidebarMenuItem Component** (`<li>`)

    - Individual menu item
    - Props: `className`, standard li props

18. **SidebarMenuButton Component**

    - Button/link for a menu item
    - Props: `asChild`, `isActive`, `tooltip`, `size` ("sm" | "md" | "lg" | "default"), `className`, standard props
    - Features: Tooltip on hover, active state styling, keyboard focus
    - When `asChild=true`: renders child as-is (usually a `<Link>`)

19. **SidebarMenuAction Component**

    - Secondary action in a menu item (e.g., More options)
    - Props: `className`, `asChild`, `showOnHover`, standard button props
    - Shows on hover by default if `showOnHover=true`

20. **SidebarMenuBadge Component**

    - Badge/label showing count or status
    - Props: `className`, standard div props
    - Example: Display notification count

21. **SidebarMenuSkeleton Component**

    - Loading placeholder for menu items
    - Props: `className`, `showIcon`, standard div props
    - Creates shimmer effect while loading

22. **SidebarMenuSub Component** (`<ul>`)

    - Nested submenu list
    - Props: `className`, standard ul props

23. **SidebarMenuSubItem Component** (`<li>`)

    - Submenu item
    - Props: `className`, standard li props

24. **SidebarMenuSubButton Component** (`<a>`)
    - Submenu item button/link
    - Props: `asChild`, `size` ("sm" | "md"), `isActive`, `className`, standard link props

#### **Exported Items**

All components and utilities are exported as a named export object including the `useSidebar` hook.

---

### Navigation Components

#### **components/app-sidebar.tsx** (Client Component)

Main application sidebar wrapper. Structure:

- `AppSidebar()` - Functional component that accepts `Sidebar` component props
- Renders:
  - `SidebarHeader`: Contains logo/branding
    - `SidebarMenu` with `SidebarMenuItem`
    - `SidebarMenuButton` with `Link` to "/dashboard"
    - Icon: `LayoutDashboard` from lucide-react
    - Text: "Onyx." (2xl font-bold)
  - `SidebarSeparator`: Visual divider
  - `SidebarContent`: Main navigation area
    - `NavMain`: Main navigation items (dashboard, analytics, projects)
    - `NavSecondary`: Secondary items (settings, help, search) with `mt-auto`
  - `SidebarFooter`: User profile dropdown
    - `NavUser`: User account management component

#### **components/nav-main.tsx** (Client Component)

Primary navigation items component. Contains:

- `NavMain()` - Accepts `items` prop with array of navigation items
- Item type: `{ title: string; url: string; icon: LucideIcon; }`
- Features:
  - Maps items to `SidebarMenuItem` components
  - Uses `usePathname()` from next/navigation to determine active link
  - Uses `useRouter()` for navigation
  - Links are `Next/Link` components with click handlers
  - Active styling applied via `isActive` prop on `SidebarMenuButton`
  - Each item shows icon and title
  - Tooltip displays on hover
  - Size set to "lg" with px-3 padding

#### **components/nav-secondary.tsx** (Client Component)

Secondary/utility navigation items. Contains:

- `NavSecondary()` - Accepts `items` prop array and spreads `SidebarGroup` props
- Item type: `{ title: string; url: string; icon: LucideIcon; }`
- Renders items similar to `NavMain` but:
  - Links are `<a>` tags instead of `Next/Link`
  - No active state styling
  - Typically positioned at bottom with `mt-auto`

#### **components/nav-user.tsx** (Client Component)

User account dropdown menu. Complex component with:

- `NavUser()` - No props, uses session and context
- Features:
  - Uses `useSession()` hook from auth library to get user data
  - Uses `useSidebar()` hook to check if mobile view
  - Uses `useRouter()` for navigation
  - Displays user avatar with fallback to Gravatar
  - User name and email from session
  - Dropdown menu with options:
    - Profile/Settings
    - Billing
    - Notifications
    - Sign out (calls `authClient.signOut()`)
  - Icons from lucide-react: `UserCircleIcon`, `BellIcon`, `CreditCardIcon`, `LogOutIcon`, `MoreVerticalIcon`
  - Avatar component from `@/components/ui/avatar`
  - DropdownMenu component with trigger, content, items, separators, labels

#### **components/nav-documents.tsx** (Client Component)

Documents/resources navigation (currently commented out). Contains:

- `NavDocuments()` - Accepts `items` prop with array
- Item type: `{ name: string; url: string; icon: LucideIcon; }`
- Features:
  - Dropdown menu per item with Share/Open actions
  - Uses `useSidebar()` for mobile detection
  - "More" button at end
  - Conditional display: `group-data-[collapsible=icon]:hidden`

---

### Data & Configuration

#### **constant/sidebar-items.ts**

Centralized navigation data. Exports `data` object with:

```typescript
{
  user: {
    name: string;
    email: string;
    avatar: string;
  },
  navMain: [
    { title: string; url: string; icon: LucideIcon; }
  ],
  navClouds: [
    {
      title: string;
      icon: LucideIcon;
      isActive: boolean;
      url: string;
      items: [{ title: string; url: string; }]
    }
  ],
  navSecondary: [
    { title: string; url: string; icon: LucideIcon; }
  ],
  documents: [
    { name: string; url: string; icon: LucideIcon; }
  ]
}
```

**Current items:**

- `navMain`: Dashboard, Analytics, Projects
- `navSecondary`: Settings, Get Help, Search
- `documents`: Data Library, Reports, Word Assistant

---

### Layout Integration

#### **app/(dashboard)/layout.tsx**

Integration point for sidebar in dashboard routes. Structure:

- Imports: `SidebarProvider`, `SidebarInset`, `AppSidebar`, `SiteHeader`
- Renders:
  - `SidebarProvider` (context wrapper)
  - `AppSidebar` with `variant="inset"`
  - `SidebarInset` (main content area)
    - `SiteHeader` component
    - Main content wrapped in `<main>` with padding

#### **app/layout.tsx**

Root layout. Contains:

- Theme provider setup
- Font configuration (Geist Sans and Mono)
- Tailwind CSS integration
- HTML and body markup

---

## Implementation Guidelines for Copilot

### When Creating New Sidebar Features

1. **Adding New Navigation Items**

   - Add to `constant/sidebar-items.ts` data object
   - Structure must follow existing item type interface
   - Icons must be imported from `lucide-react`
   - Use kebab-case URLs

2. **Creating New Navigation Components**

   - Make them "use client" components
   - Accept items as props with typed arrays
   - Use sidebar primitive components from `components/ui/sidebar.tsx`
   - Implement proper navigation using `useRouter()` and `usePathname()`
   - Add active state styling where appropriate

3. **Modifying Sidebar Behavior**

   - State management: Use `useSidebar()` hook to access context
   - Responsive logic: Check `isMobile` from hook
   - Persistence: Handled automatically by `SidebarProvider` via cookies

4. **Styling**

   - Use Tailwind CSS utility classes
   - Data attributes: `data-sidebar`, `data-slot`, `data-state`, etc.
   - Key classes: `group-data-[collapsible=icon]:...`, `data-state`
   - Responsive: Use `md:` prefix for desktop-only styles

5. **Accessibility**

   - Include `aria-label` attributes
   - Use semantic HTML (`<nav>`, `<ul>`, `<li>`)
   - Keyboard shortcuts support (Cmd/Ctrl+B)
   - Tooltip components for icons in collapsed view

6. **Type Safety**
   - Define item interfaces before rendering
   - Use TypeScript for all component props
   - Import `LucideIcon` type from lucide-react for icon typing

### Example: Adding a New Navigation Group

When adding a new navigation group to the sidebar:

1. Update data in `constant/sidebar-items.ts`
2. Create a new component in `components/nav-*.tsx` (e.g., `nav-teams.tsx`)
3. Follow pattern of `NavMain` or `NavSecondary`
4. Import and add to `AppSidebar` in `components/app-sidebar.tsx`
5. Add to imports in `app/(dashboard)/layout.tsx` if needed

---

## Dependencies & Imports

### Key Packages

- `react`: Hooks (useState, useContext, useCallback, useEffect, useMemo)
- `next`: useRouter, usePathname from next/navigation
- `next-themes`: Theme provider integration
- `lucide-react`: Icon components and LucideIcon type
- `@radix-ui/react-*`: Underlying components (Slot, Dialog, Sheet, Dropdown, etc.)
- `class-variance-authority`: Component variant styling
- `clsx`: Class name utilities

### Import Paths

```typescript
// Sidebar components
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarSeparator,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

// Navigation components
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { NavDocuments } from "@/components/nav-documents";
import { AppSidebar } from "@/components/app-sidebar";

// Data
import { data } from "@/constant/sidebar-items";

// Utilities
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
```

---

## Best Practices for Copilot Prompts

Based on GitHub Copilot best practices, when working with sidebar implementation:

### Set the Stage

- Clearly specify: "Add a new navigation item to the sidebar for..."
- Provide the complete context about where the item should appear
- Include the data structure and types

### Be Specific and Simple

- Break requests into discrete steps
- Example: "First, update the data in sidebar-items.ts. Then, update the NavMain component to handle the new item."
- Avoid asking for multiple features in one prompt

### Provide Examples

- Show existing similar items in the codebase
- Include the expected data structure
- Provide markup examples for new components

### Keep Relevant Tabs Open

- Have `components/ui/sidebar.tsx` open for reference
- Keep `components/app-sidebar.tsx` visible
- Have `constant/sidebar-items.ts` accessible

### Use Good Naming

- Components: PascalCase (e.g., `NavTeams`, `NavProjects`)
- Functions: camelCase (e.g., `toggleSidebar`, `handleNavClick`)
- Constants: UPPER_SNAKE_CASE (e.g., `SIDEBAR_WIDTH`)

---

## Common Tasks & Patterns

### Task: Add a new main navigation item

1. Add item to `data.navMain` array in `sidebar-items.ts`
2. Ensure icon is imported from lucide-react
3. NavMain component will automatically render it
4. Verify routing URL matches actual routes in app directory

### Task: Add a collapsible menu group with subitems

1. Create new component following `NavMain` pattern
2. Use `SidebarMenuSub` and `SidebarMenuSubItem` for nested items
3. Manage expand/collapse state with `useState`
4. Add to `AppSidebar` component

### Task: Modify sidebar width or spacing

1. Update CSS variables in `Sidebar` component
2. Modify `SIDEBAR_WIDTH` or `SIDEBAR_WIDTH_ICON` constants
3. Tailwind breakpoints already configured for responsive behavior

### Task: Add active state styling

1. Use `usePathname()` hook to get current route
2. Compare against item's `url` prop
3. Pass `isActive={pathname === item.url}` to `SidebarMenuButton`

---

## Testing Considerations

- Responsive behavior: Test mobile (< 768px) and desktop views
- Keyboard shortcuts: Cmd/Ctrl+B to toggle sidebar
- State persistence: Check browser cookies for `sidebar_state`
- Active routes: Verify active styling updates on navigation
- Theme switching: Sidebar should respect dark/light mode
- Accessibility: Screen reader compatibility and keyboard navigation

---

## Performance Notes

- Sidebar state is memoized in context to prevent unnecessary rerenders
- Components use proper React.ComponentProps typing for prop spread
- Images/avatars use Next.js Image component where appropriate
- Icons from lucide-react are optimized SVGs
- CSS variables minimize style recalculations on state changes

---

## Version Information

- Next.js: 16.0.7
- React: 19.2.0
- Tailwind CSS: Latest (from dependencies)
- TypeScript: Strict mode enabled
- Radix UI: Latest primitives for accessibility
