# Laplace Docs — Implementation Plan

> Comprehensive plan for building the Laplace product documentation platform.
> This document covers architecture, design system, component specs, content strategy,
> authentication, and phased implementation.

**Domain**: `docs.laplacelabs-digital-twin.xyz`
**Hosting**: Vercel (separate project from the main platform)
**Status**: Planning phase — not yet implemented

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack & Key Dependencies](#2-tech-stack--key-dependencies)
3. [Layout & Wireframes](#3-layout--wireframes)
4. [Design System](#4-design-system)
5. [Component Architecture](#5-component-architecture)
6. [Content Structure](#6-content-structure)
7. [Authentication & Module Scoping](#7-authentication--module-scoping)
8. [Search](#8-search)
9. [AI Assistant](#9-ai-assistant)
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [Feature Specifications](#11-feature-specifications)
12. [Implementation Phases](#12-implementation-phases)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Open Questions](#14-open-questions)

---

## 1. Architecture Overview

### High-Level Diagram

```
                                 Vercel (docs.laplacelabs-digital-twin.xyz)
                                 ┌─────────────────────────────────────────┐
                                 │            laplace-docs                 │
                                 │         Next.js App Router              │
                                 │                                         │
  ┌──────────────┐   shared      │  ┌──────────┐  ┌──────────┐  ┌───────┐ │
  │   laplace-   │   JWT cookie  │  │  MDX     │  │  Auth    │  │  AI   │ │
  │   platform   │ ◄────────────►│  │  Renderer│  │  Reader  │  │ Chat  │ │
  │  (www.*)     │  on parent    │  └──────────┘  └────┬─────┘  └───┬───┘ │
  └──────┬───────┘  domain       │                     │            │     │
         │                       │                     ▼            ▼     │
         │          ┌────────────┼──────────────────────────────────────┐  │
         ▼          │            │     laplace-platform-api             │  │
  ┌──────────────┐  │            │     GET /v1/auth/me                  │  │
  │  Login Page  │  │            │     GET /v1/admin/modules            │  │
  │  (www.*/     │  │            │     POST /v1/docs/ai-chat (future)   │  │
  │    login)    │  │            └──────────────────────────────────────┘  │
  └──────────────┘  │                                                     │
                    │  content/                                           │
                    │  ├─ v0.3.0/                                        │
                    │  │  ├─ modules.json                                │
                    │  │  ├─ getting-started/                            │
                    │  │  ├─ digital-twin/                               │
                    │  │  ├─ services/                                   │
                    │  │  └─ ...                                         │
                    │  └─ v0.4.0/                                        │
                    │     └─ ...                                         │
                    └─────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 16 (App Router) | Same as main platform; team familiarity; RSC for static MDX |
| **MDX engine** | `next-mdx-remote-client/rsc` | Better maintained fork; native RSC support; no serialize step |
| **Styling** | Tailwind CSS v4 + `@tailwindcss/typography` | Same as platform; `prose` class handles markdown typography |
| **Component base** | shadcn/ui (Radix primitives) | Same as platform; ensures consistent design language |
| **Hosting** | Vercel (separate project) | Independent deploys; subdomain routing; same provider |
| **Auth** | Shared JWT cookie on `.laplacelabs-digital-twin.xyz` | No separate login; SSO via parent domain cookie |
| **Content source** | MDX files in repo (`content/`) | Version-controlled; PR-based workflow; no CMS dependency |
| **Search** | Pagefind (build-time index) | Zero-cost; fast; no external service; works offline |
| **AI provider** | Vercel AI SDK + OpenAI (GPT-4o-mini) | Cost-effective; streaming; tenant budget tracking |
| **i18n** | `next-intl` | Same library as platform; shared locale config |

### Why Not Nextra or Fumadocs?

Both Nextra and Fumadocs were evaluated. They provide excellent out-of-the-box documentation experiences but were rejected for these reasons:

1. **Auth integration**: Neither supports reading shared JWT cookies or filtering sidebar items by tenant modules. We would need to fork/override core layout components extensively.
2. **Design system parity**: Both come with opinionated themes. Matching Laplace's design tokens (warm neutrals, neutral dark grays, blue-as-accent-only) would require overriding most of their styling.
3. **AI assistant panel**: Neither has a built-in right sidebar for an AI chat interface. Adding one would conflict with their existing layout systems.
4. **Full control**: Building from scratch with the same stack as the platform gives us complete control over layout, routing, and data fetching patterns.

We will, however, borrow specific patterns from these frameworks:
- From Nextra: Pagefind-based search, sidebar navigation structure
- From Fumadocs: MDX component patterns, breadcrumb generation

---

## 2. Tech Stack & Key Dependencies

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | `^16.1.0` | Framework (App Router, RSC) |
| `react` | `^19.2.0` | UI runtime |
| `tailwindcss` | `^4.2.0` | Utility-first CSS |
| `@tailwindcss/typography` | `^0.5.0` | `prose` classes for markdown content |
| `@tailwindcss/postcss` | `^4.2.0` | PostCSS integration |
| `typescript` | `^5.7.0` | Type safety |

### Content & MDX

| Package | Version | Purpose |
|---------|---------|---------|
| `next-mdx-remote-client` | `^1.0.0` | RSC-compatible MDX rendering |
| `@mdx-js/mdx` | `^3.0.0` | MDX compilation (peer dep) |
| `rehype-slug` | `^6.0.0` | Add `id` attributes to headings |
| `rehype-autolink-headings` | `^7.0.0` | Anchor links on headings |
| `rehype-pretty-code` | `^0.14.0` | Syntax highlighting via Shiki |
| `shiki` | `^1.0.0` | Code highlighter engine |
| `remark-gfm` | `^4.0.0` | GitHub Flavored Markdown (tables, strikethrough) |
| `gray-matter` | `^4.0.0` | YAML frontmatter parsing |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-collapsible` | `^1.1.0` | Sidebar sections |
| `@radix-ui/react-dialog` | `^1.1.0` | Search modal (Cmd+K) |
| `@radix-ui/react-scroll-area` | `^1.2.0` | Custom scrollbars |
| `@radix-ui/react-tooltip` | `^1.2.0` | Tooltips |
| `@radix-ui/react-tabs` | `^1.1.0` | Code block tabs |
| `cmdk` | `^1.1.0` | Command palette for search |
| `lucide-react` | `^0.564.0` | Icons (same as platform) |
| `class-variance-authority` | `^0.7.0` | Component variants |
| `clsx` | `^2.1.0` | Conditional classes |
| `tailwind-merge` | `^3.3.0` | Merge Tailwind classes |

### Auth & API

| Package | Version | Purpose |
|---------|---------|---------|
| `jose` | `^6.2.0` | JWT decoding (same as platform) |

### AI

| Package | Version | Purpose |
|---------|---------|---------|
| `ai` | `^4.0.0` | Vercel AI SDK (useChat hook) |
| `@ai-sdk/openai` | `^1.0.0` | OpenAI provider |

### i18n

| Package | Version | Purpose |
|---------|---------|---------|
| `next-intl` | `^4.8.0` | Same i18n lib as platform |

### Search

| Package | Version | Purpose |
|---------|---------|---------|
| `pagefind` | `^1.0.0` | Build-time search indexing |

### Dev / Build

| Package | Version | Purpose |
|---------|---------|---------|
| `next-themes` | `^0.4.0` | Dark/light mode |
| `tw-animate-css` | `^1.3.0` | Tailwind animation utilities |

---

## 3. Layout & Wireframes

### 3-Column Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  docs.laplacelabs-digital-twin.xyz                                              │
├───────────────────┬──────────────────────────────────────┬──────────────────────┤
│                   │                                      │                      │
│   LEFT SIDEBAR    │         MAIN CONTENT                 │   RIGHT SIDEBAR      │
│   (260px)         │         (flex-1, max-w-3xl)          │   (240px)            │
│                   │                                      │                      │
│  ┌─────────────┐  │  ┌────────────────────────────────┐  │  ┌────────────────┐  │
│  │ v0.3.0  ▼  │  │  │ Home > Services > Loss Pred.  │  │  │ On This Page   │  │
│  └─────────────┘  │  │                                │  │  │                │  │
│                   │  │  # Loss Prediction             │  │  │ ├─ Overview    │  │
│  ┌─────────────┐  │  │                                │  │  │ ├─ How it     │  │
│  │ 🔍 Search   │  │  │  Last updated: Mar 12, 2026   │  │  │ │   works      │  │
│  └─────────────┘  │  │                                │  │  │ ├─ Table      │  │
│                   │  │  Lorem ipsum dolor sit amet,   │  │  │ │   columns    │  │
│  ── Getting      │  │  consectetur adipiscing elit.   │  │  │ └─ FAQ        │  │
│     Started      │  │                                │  │  │                │  │
│    Overview      │  │  ## How it works               │  │  ├────────────────┤  │
│    Quickstart    │  │                                │  │  │                │  │
│                   │  │  > [!INFO]                     │  │  │ Was this page  │  │
│  ── Digital Twin │  │  > This service runs on every   │  │  │ helpful?       │  │
│    Overview      │  │  > new 455 data load.           │  │  │                │  │
│    Network Map   │  │                                │  │  │  👍    👎      │  │
│                   │  │  ```python                     │  │  │                │  │
│  ▼ Services      │  │  def predict(df):              │  │  ├────────────────┤  │
│    ▼ Loss Pred.  │  │      model.predict(df)         │  │  │                │  │
│      Overview    │  │  ```                            │  │  │ 🤖 AI Help    │  │
│   ●  Table View  │  │                                │  │  │                │  │
│      Collector   │  │  | Column | Type | Desc |      │  │  │ Ask me about  │  │
│      Dashboard   │  │  |--------|------|------|      │  │  │ this page...  │  │
│    Load Consol.  │  │  | risk   | float| 0-1  |      │  │  │                │  │
│                   │  │                                │  │  │ ┌────────────┐ │  │
│  ── Database     │  │  ## FAQ                        │  │  │ │            │ │  │
│                   │  │                                │  │  │ │  Chat...   │ │  │
│  ── Settings     │  │  ---                           │  │  │ │            │ │  │
│                   │  │                                │  │  │ └────────────┘ │  │
│  ── API          │  │  ┌──────────────────────────┐  │  │  │                │  │
│                   │  │  │ ← Previous    Next →     │  │  │  └────────────────┘  │
│  ── Changelog    │  │  └──────────────────────────┘  │  │                      │
│                   │  │                                │  │                      │
│  ┌─────────────┐  │  │  ┌──────┐ ┌──────┐ ┌──────┐  │  │                      │
│  │  Powered by │  │  │  │Card 1│ │Card 2│ │Card 3│  │  │                      │
│  │  Laplace    │  │  │  └──────┘ └──────┘ └──────┘  │  │                      │
│  └─────────────┘  │  └────────────────────────────────┘  │                      │
│                   │                                      │                      │
├───────────────────┴──────────────────────────────────────┴──────────────────────┤
│                              (footer / status bar)                              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Home / Landing Page Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                    ┌──────────────────────────────┐                             │
│                    │       [Laplace Logo]          │                             │
│                    │                               │                             │
│                    │   Hi, how can we help?        │                             │
│                    │                               │                             │
│                    │   ┌──────────────────────┐    │                             │
│                    │   │ 🔍 Search docs...    │    │                             │
│                    │   └──────────────────────┘    │                             │
│                    │                               │                             │
│                    │   Or ask the AI assistant →   │                             │
│                    └──────────────────────────────┘                             │
│                                                                                 │
│     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│     │  🌐          │  │  📦          │  │  📉          │  │  📡          │     │
│     │ Digital Twin │  │ Digital      │  │ Loss         │  │ Control      │     │
│     │              │  │ Model        │  │ Prediction   │  │ Tower        │     │
│     │ Real-time    │  │ Network      │  │ Predict      │  │ Monitor &    │     │
│     │ network      │  │ nodes &      │  │ cargo loss   │  │ control      │     │
│     │ visibility   │  │ topology     │  │ probability  │  │ operations   │     │
│     └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                                                 │
│     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│     │  📦          │  │  🗄️          │  │  ⚙️          │  │  🔌          │     │
│     │ Load         │  │ Database     │  │ Settings     │  │ API          │     │
│     │ Consol.      │  │              │  │              │  │ Reference    │     │
│     │ Optimize     │  │ Raw data     │  │ Users,       │  │ Auth,        │     │
│     │ shipment     │  │ access &     │  │ tenants,     │  │ endpoints,   │     │
│     │ grouping     │  │ queries      │  │ permissions  │  │ examples     │     │
│     └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                                                 │
│                       ┌───────────────────────┐                                │
│                       │ Getting Started Guide →│                                │
│                       └───────────────────────┘                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌──────────────────────────┐
│ ☰  Laplace Docs  v0.3.0 │
├──────────────────────────┤
│                          │
│ Home > Services > Loss   │
│                          │
│ # Loss Prediction        │
│ Last updated: Mar 12     │
│                          │
│ Lorem ipsum dolor sit    │
│ amet, consectetur...     │
│                          │
│ ## How it works          │
│                          │
│ ┌──────────────────────┐ │
│ │ INFO                 │ │
│ │ This service runs... │ │
│ └──────────────────────┘ │
│                          │
│ ```python                │
│ def predict(df):         │
│     model.predict(df)    │
│ ```                      │
│                          │
│ ┌────────┐ ┌────────┐   │
│ │← Prev  │ │ Next →│   │
│ └────────┘ └────────┘   │
│                          │
│ ─── On this page ───     │
│ Overview                 │
│ How it works             │
│ FAQ                      │
│                          │
│ Was this helpful? 👍 👎  │
│                          │
├──────────────────────────┤
│ 🤖 AI Assistant    [▲]  │
└──────────────────────────┘

Hamburger menu (☰) opens:
┌──────────────────────────┐
│ ✕  Close                 │
│                          │
│ ┌──────────────────────┐ │
│ │ v0.3.0           ▼  │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ 🔍 Search docs...   │ │
│ └──────────────────────┘ │
│                          │
│ Getting Started          │
│   Overview               │
│   Quickstart             │
│                          │
│ Digital Twin             │
│   Overview               │
│   Network Map            │
│                          │
│ ▼ Services               │
│   ▼ Loss Prediction      │
│     Overview             │
│  ●  Table View           │
│     Collector            │
│     Dashboard            │
│   Load Consolidation     │
│                          │
│ Database                 │
│ Settings                 │
│ API                      │
│ Changelog                │
│                          │
│ ── PT | EN ──            │
│ ── ☀️ | 🌙 ──            │
│                          │
│ Powered by Laplace       │
└──────────────────────────┘
```

### Collapsed Right Sidebar (< 1280px)

On screens between 768px and 1280px, the right sidebar collapses. "On this page" moves to a dropdown at the top of the content area. The AI assistant becomes a floating button in the bottom-right corner that opens a modal/drawer.

---

## 4. Design System

### Inherited from Platform

The docs site inherits the Laplace design system defined in `laplace-platform/docs/design-system.md`. Key principles:

1. **Blue is accent only** (`#3A8DFF`) — interactive elements, links, active states. Never backgrounds.
2. **Full mode consistency** — light/dark switch applies everywhere simultaneously.
3. **Light mode: warm neutrals** — Notion-inspired off-whites.
4. **Dark mode: neutral grays** — Zero blue tint (`#191919`, `#202020`, `#252525`, etc.).

### Color Tokens (reused from platform)

```css
/* Chrome & Layout */
--bg-base: #FFFFFF / #191919;
--bg-deep: #F7F6F3 / #202020;      /* sidebar, topbar */
--bg-surface: #EDEDEC / #2A2A2A;    /* interactive surfaces */
--bg-surface-hover: #E3E3E2 / #333333;

/* Content */
--content-bg: #FAFAF8 / #191919;
--content-bg-card: #FFFFFF / #202020;
--content-text-primary: #37352F / #E2E8F0;
--content-text-secondary: #6B7280 / #94A3B8;
--content-border: #E8E5E0 / #333333;

/* Accent */
--blue-primary: #3A8DFF;
--blue-glow: rgba(58,141,255,0.15);

/* Semantic / Callouts */
--info: #3A8DFF;              /* Info callout accent */
--success: #22C55E;           /* Tip callout accent */
--warning: #F59E0B;           /* Warning callout accent */
--error: #EF4444;             /* Danger callout accent */
```

### Typography

| Property | Value | Notes |
|----------|-------|-------|
| Font family | `Inter` | Same as platform |
| Mono font | `JetBrains Mono` | Code blocks, inline code |
| Base size | `16px` | Slightly larger than platform (14px) for reading comfort |
| Line height | `1.75` | Generous for long-form content |
| H1 | `2.25rem` (36px), `font-weight: 700` | Page titles |
| H2 | `1.5rem` (24px), `font-weight: 600` | Major sections |
| H3 | `1.25rem` (20px), `font-weight: 600` | Sub-sections |
| H4 | `1rem` (16px), `font-weight: 600` | Minor headings |
| Paragraph | `1rem` (16px), `font-weight: 400` | Body text |
| Border radius | `0.5rem` (8px) | Cards, code blocks, callouts |

### Docs-Specific Tokens

```css
/* Code blocks */
--code-bg: #1E1E1E;                    /* Always dark (both modes) */
--code-border: #333333;                /* Subtle border */
--code-header-bg: #252525;             /* Language label bar */
--code-header-text: #94A3B8;           /* Language label text */

/* Inline code */
--inline-code-bg-light: rgba(58,141,255,0.08);   /* Light blue tint */
--inline-code-bg-dark: rgba(58,141,255,0.12);
--inline-code-text-light: #37352F;
--inline-code-text-dark: #E2E8F0;

/* Callout backgrounds */
--callout-info-bg: rgba(58,141,255,0.06) / rgba(58,141,255,0.10);
--callout-info-border: rgba(58,141,255,0.3);
--callout-tip-bg: rgba(34,197,94,0.06) / rgba(34,197,94,0.10);
--callout-tip-border: rgba(34,197,94,0.3);
--callout-warning-bg: rgba(245,158,11,0.06) / rgba(245,158,11,0.10);
--callout-warning-border: rgba(245,158,11,0.3);
--callout-danger-bg: rgba(239,68,68,0.06) / rgba(239,68,68,0.10);
--callout-danger-border: rgba(239,68,68,0.3);

/* Sidebar (docs-specific) */
--sidebar-width: 260px;
--sidebar-width-collapsed: 0px;        /* Fully hidden on collapse */
--right-sidebar-width: 240px;

/* TOC */
--toc-active: #3A8DFF;
--toc-text: var(--content-text-secondary);
--toc-hover: var(--content-text-primary);
```

---

## 5. Component Architecture

### Component Tree

```
app/
├── layout.tsx                          # Root layout: providers, fonts
├── [locale]/
│   ├── layout.tsx                      # Locale layout: IntlProvider
│   ├── page.tsx                        # Home / landing page
│   └── docs/
│       └── [...slug]/
│           ├── page.tsx                # MDX page renderer
│           └── loading.tsx             # Skeleton loading state
│
components/
├── layout/
│   ├── docs-layout.tsx                 # 3-column grid container
│   ├── left-sidebar.tsx                # Navigation sidebar
│   ├── right-sidebar.tsx               # TOC + feedback + AI
│   ├── topbar.tsx                      # Mobile header bar
│   ├── mobile-nav-drawer.tsx           # Mobile sidebar overlay
│   └── breadcrumbs.tsx                 # Path breadcrumbs
│
├── content/
│   ├── mdx-renderer.tsx                # MDX hydration wrapper
│   ├── mdx-components.tsx              # Custom MDX component map
│   ├── prose-wrapper.tsx               # Typography wrapper (<article class="prose">)
│   ├── page-header.tsx                 # Title + last-updated + breadcrumbs
│   ├── page-footer.tsx                 # Prev/next navigation
│   └── related-cards.tsx               # Module cards at bottom
│
├── mdx/
│   ├── callout.tsx                     # Info/warning/tip/danger boxes
│   ├── code-block.tsx                  # Syntax-highlighted code with copy + label
│   ├── inline-code.tsx                 # Styled backtick code
│   ├── image-figure.tsx                # Image with rounded corners + caption
│   ├── table.tsx                       # Responsive table wrapper
│   ├── heading.tsx                     # H1-H6 with anchor links
│   ├── link.tsx                        # External link indicator + styling
│   ├── steps.tsx                       # Numbered step component
│   └── tabs.tsx                        # Tabbed content blocks
│
├── search/
│   ├── search-dialog.tsx               # Cmd+K modal (cmdk + Pagefind)
│   ├── search-trigger.tsx              # Search bar in sidebar
│   └── search-results.tsx              # Result list items
│
├── ai/
│   ├── ai-panel.tsx                    # Right sidebar chat panel
│   ├── ai-message.tsx                  # Chat message bubble
│   ├── ai-input.tsx                    # Text input with send button
│   └── ai-floating-button.tsx          # FAB for mobile/tablet
│
├── navigation/
│   ├── sidebar-section.tsx             # Collapsible nav section
│   ├── sidebar-item.tsx                # Nav link item
│   ├── version-selector.tsx            # Version dropdown
│   └── locale-switcher.tsx             # PT/EN toggle
│
├── feedback/
│   └── page-feedback.tsx               # Thumbs up/down UI
│
├── ui/
│   ├── skeleton.tsx                    # Shimmer skeleton primitive
│   ├── skeleton-page.tsx               # Full page skeleton layout
│   └── theme-toggle.tsx                # Dark/light mode switch
│
└── icons/
    └── module-icons.tsx                # Icon map for modules
```

### Component Dependency Diagram

```
                        ┌──────────────┐
                        │  RootLayout  │
                        │  (providers) │
                        └──────┬───────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
              ┌─────▼────┐ ┌──▼──────┐ ┌─▼──────────┐
              │LeftSidebar│ │MainArea │ │RightSidebar│
              └─────┬────┘ └──┬──────┘ └─┬──────────┘
                    │         │          │
         ┌──────────┤    ┌────┤     ┌────┤
         │          │    │    │     │    │
    ┌────▼───┐ ┌───▼──┐│┌──▼──┐┌──▼──┐│┌──────┐
    │Version │ │Search│││MDX  ││TOC  │││AI    │
    │Selector│ │Trigger│││Render│││    │││Panel │
    └────────┘ └──────┘│└──┬──┘│└─────┘│└──┬───┘
                       │   │   │       │   │
              ┌────────┤   │   │  ┌────┤   │
              │        │   │   │  │    │   │
         ┌───▼────┐┌──▼┐  │   │┌─▼──┐ │┌──▼──────┐
         │Section ││Item│  │   ││Feed│ ││AIMessage│
         │(collap)││    │  │   ││back│ ││AIInput  │
         └────────┘└────┘  │   │└────┘ │└─────────┘
                           │   │       │
                    ┌──────┤   │       │
                    │      │   │       │
               ┌───▼───┐┌─▼─┐ │       │
               │Callout││Code│ │       │
               │       ││Blk │ │       │
               └───────┘└────┘ │       │
                               │       │
                          ┌───▼────┐   │
                          │Prev/Nxt│   │
                          │Cards   │   │
                          └────────┘   │
```

### MDX Component Map

The `mdx-components.tsx` file maps HTML elements to custom React components:

```typescript
// components/content/mdx-components.tsx
const mdxComponents = {
  // Headings with anchor links
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,

  // Code
  pre: (props) => <CodeBlock {...props} />,
  code: (props) => <InlineCode {...props} />,

  // Media
  img: (props) => <ImageFigure {...props} />,

  // Tables
  table: (props) => <Table {...props} />,

  // Links
  a: (props) => <SmartLink {...props} />,

  // Custom components (used via MDX import)
  Callout,
  Steps,
  Tabs,
  Tab,
}
```

---

## 6. Content Structure

### Directory Layout

```
content/
├── v0.3.0/
│   ├── modules.json                    # Module registry for this version
│   ├── getting-started/
│   │   ├── _meta.json                  # Section metadata (title, icon, order)
│   │   ├── overview.mdx
│   │   └── quickstart.mdx
│   ├── digital-twin/
│   │   ├── _meta.json
│   │   ├── overview.mdx
│   │   └── network-map.mdx
│   ├── digital-model/
│   │   ├── _meta.json
│   │   ├── overview.mdx
│   │   └── units.mdx
│   ├── services/
│   │   ├── _meta.json
│   │   ├── loss-prediction/
│   │   │   ├── _meta.json
│   │   │   ├── overview.mdx
│   │   │   ├── table-view.mdx
│   │   │   ├── collector.mdx
│   │   │   └── dashboard.mdx
│   │   └── load-consolidation/
│   │       ├── _meta.json
│   │       └── overview.mdx
│   ├── database/
│   │   ├── _meta.json
│   │   └── overview.mdx
│   ├── settings/
│   │   ├── _meta.json
│   │   ├── users.mdx
│   │   └── tenants.mdx
│   ├── api/
│   │   ├── _meta.json
│   │   ├── authentication.mdx
│   │   ├── endpoints.mdx
│   │   └── examples.mdx
│   └── changelog.mdx
│
└── v0.4.0/
    └── ... (same structure, updated content)
```

### modules.json Schema

```json
{
  "version": "0.3.0",
  "modules": [
    {
      "key": "getting-started",
      "label": "Getting Started",
      "icon": "BookOpen",
      "required_module_key": null,
      "sort_order": 0
    },
    {
      "key": "digital-twin",
      "label": "Digital Twin",
      "icon": "Globe",
      "required_module_key": "digital_twin",
      "sort_order": 1
    },
    {
      "key": "digital-model",
      "label": "Digital Model",
      "icon": "Box",
      "required_module_key": "digital_model",
      "sort_order": 2
    },
    {
      "key": "services/loss-prediction",
      "label": "Loss Prediction",
      "icon": "TrendingDown",
      "required_module_key": "services.loss_prediction",
      "sort_order": 3
    },
    {
      "key": "services/load-consolidation",
      "label": "Load Consolidation",
      "icon": "Boxes",
      "required_module_key": "services.load_consolidation",
      "sort_order": 4
    },
    {
      "key": "database",
      "label": "Database",
      "icon": "Database",
      "required_module_key": "database",
      "sort_order": 5
    },
    {
      "key": "settings",
      "label": "Settings",
      "icon": "Settings",
      "required_module_key": null,
      "sort_order": 6
    },
    {
      "key": "api",
      "label": "API Reference",
      "icon": "Code",
      "required_module_key": null,
      "sort_order": 7
    }
  ]
}
```

### _meta.json Schema

```json
{
  "title": "Loss Prediction",
  "icon": "TrendingDown",
  "sort_order": 0,
  "pages": [
    { "slug": "overview", "title": "Overview" },
    { "slug": "table-view", "title": "Table View" },
    { "slug": "collector", "title": "Collector" },
    { "slug": "dashboard", "title": "Dashboard" }
  ]
}
```

### MDX Frontmatter Schema

```yaml
---
title: "Table View"
description: "View and filter loss predictions in a sortable table"
lastUpdated: "2026-03-10"
module: "services.loss_prediction"
tags: ["loss-prediction", "table", "ctrc"]
related:
  - slug: "collector"
    label: "Collector"
  - slug: "dashboard"
    label: "Dashboard"
---
```

### Bilingual Content Strategy

Each MDX file contains a single language. The locale is determined by the content directory variant:

```
content/
├── pt-BR/
│   └── v0.3.0/
│       └── ... (Portuguese content)
└── en-US/
    └── v0.3.0/
        └── ... (English content)
```

The `[locale]` route segment selects which content tree to read from. If a page is missing in the selected locale, it falls back to `pt-BR` (default).

---

## 7. Authentication & Module Scoping

### Shared Cookie Authentication

The docs site reads the JWT access token set by the main platform on the parent domain.

**Current platform behavior** (from `auth-context.tsx`):
- On login, the platform sets `laplace_access_token` cookie with `path=/; samesite=lax`.
- The cookie is set on the platform's domain (e.g., `www.laplacelabs-digital-twin.xyz`).

**Required change for cross-subdomain sharing**:
- The platform must change the cookie domain to `.laplacelabs-digital-twin.xyz` (note the leading dot).
- Cookie attributes: `path=/; domain=.laplacelabs-digital-twin.xyz; samesite=lax; secure`.
- This allows both `www.*` and `docs.*` to read the same cookie.

### Auth Flow

```
User visits docs.laplacelabs-digital-twin.xyz
       │
       ▼
┌─────────────────────────────┐
│ Middleware reads             │
│ `laplace_access_token`      │
│ cookie from request         │
└─────────┬───────────────────┘
          │
     ┌────▼────┐
     │ Cookie  │
     │ exists? │
     └────┬────┘
      Yes │        No
          │         │
     ┌────▼────┐    │
     │ Decode  │    ▼
     │ JWT     │  Show public docs only
     │ (jose)  │  (Getting Started, API Reference)
     └────┬────┘  Sidebar shows "Sign in →" link
          │       pointing to www.*/login
     ┌────▼────┐
     │ Expired?│
     └────┬────┘
      No  │     Yes
          │      │
     ┌────▼──┐   ▼
     │ Valid  │  Try refresh via API
     │ user   │  (using refresh_token from
     │ context│   localStorage — but localStorage
     └────┬──┘   is domain-scoped, so this
          │      won't work cross-subdomain)
          │
          ▼
     Fetch /v1/auth/me with access_token
     → Get user, modules, facilities
     → Filter sidebar by modules
```

### Cross-Subdomain Refresh Token Problem

The refresh token is stored in `localStorage` on `www.*`, which is not accessible from `docs.*`. Options:

| Option | Approach | Tradeoff |
|--------|----------|----------|
| **A. Short-lived access only** | Docs site only reads access_token cookie (15-min TTL). When expired, redirect to platform login. | Simplest. User re-auths every 15 min if staying on docs. |
| **B. Refresh token in cookie** | Move refresh_token from localStorage to an HttpOnly cookie on `.laplacelabs-digital-twin.xyz`. | More secure. Requires platform auth change. |
| **C. Silent iframe refresh** | Embed hidden iframe to `www.*/auth/silent-refresh` that posts back new access_token. | Complex. Fragile across browsers. |

**Recommendation**: Option B (refresh token in HttpOnly cookie). This is the most robust approach. The platform already stores the access token in a cookie; extending this pattern to the refresh token is straightforward. The refresh token cookie should be `HttpOnly` (JavaScript cannot read it) and sent only to the API proxy endpoint.

### Module Scoping Logic

```typescript
// lib/docs-auth.ts
interface DocsAuthContext {
  isAuthenticated: boolean
  user: AuthUser | null
  modules: string[]  // e.g., ["digital_twin", "services.loss_prediction", ...]
}

function shouldShowSection(
  sectionModuleKey: string | null,
  auth: DocsAuthContext
): boolean {
  // Public sections (Getting Started, API, Changelog)
  if (!sectionModuleKey) return true

  // Unauthenticated users only see public sections
  if (!auth.isAuthenticated) return false

  // Admins see everything
  if (auth.user?.role === 'super_admin' || auth.user?.role === 'admin') return true

  // Regular users: check module access
  return auth.modules.includes(sectionModuleKey)
}
```

The sidebar renders only sections the user has access to. The content pages also check access and show a "You don't have access to this module" message if the user navigates directly to a restricted URL.

---

## 8. Search

### Pagefind (Build-Time Search)

Pagefind indexes all MDX content at build time and generates a static search index. This provides:

- Zero runtime cost (no server-side search)
- Instant results (< 10ms per query)
- Works offline
- No external service dependency
- Automatic re-indexing on every deploy

### Integration

```
Build pipeline:
  1. Next.js build → generates static HTML for all MDX pages
  2. pagefind --site .next/server/app → indexes the HTML
  3. Search index is deployed as static assets alongside the site
```

### Search UI (Cmd+K)

The search dialog uses `cmdk` (same as the platform's command palette) combined with Pagefind's client-side search API:

```
┌────────────────────────────────────────┐
│ 🔍 Search documentation...        ⌘K  │
├────────────────────────────────────────┤
│                                        │
│  Getting Started                       │
│  ├─ Overview — Platform introduction   │
│  └─ Quickstart — First steps...        │
│                                        │
│  Loss Prediction                       │
│  ├─ Table View — View and filter...    │
│  └─ Collector — Mobile data...         │
│                                        │
│  ─── Recent searches ───               │
│  loss prediction table columns         │
│  API authentication                    │
│                                        │
│  [↑↓ Navigate] [↵ Open] [esc Close]   │
└────────────────────────────────────────┘
```

### Search Features

1. **Fuzzy matching**: Pagefind handles typos and partial matches.
2. **Section filtering**: Results grouped by module/section.
3. **Highlighted excerpts**: Matching text shown with highlighted keywords.
4. **Recent searches**: Last 5 searches stored in `localStorage`.
5. **Keyboard navigation**: Full keyboard support (up/down, enter, escape).
6. **Module scoping**: Results filtered by user's authorized modules (client-side).

---

## 9. AI Assistant

### Overview

The AI assistant lives in a collapsible panel on the right sidebar. It provides contextual help for the current documentation page.

### Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  AI Panel (UI)   │────▶│  /api/docs/chat   │────▶│  OpenAI API      │
│  useChat hook    │◀────│  Route Handler    │◀────│  GPT-4o-mini     │
│                  │     │                   │     │                  │
│  Sends:          │     │  Builds prompt:   │     │                  │
│  - user message  │     │  - system prompt  │     │                  │
│  - current page  │     │  - page content   │     │                  │
│  - conversation  │     │  - module context  │     │                  │
└──────────────────┘     │  - user message   │     └──────────────────┘
                         │                   │
                         │  Validates:       │
                         │  - auth token     │
                         │  - tenant budget  │
                         └──────────────────┘
```

### Context Strategy

| Page Type | Context Provided to AI |
|-----------|----------------------|
| Home/overview | Module descriptions from `modules.json` + general platform overview |
| Module overview | Full page content + related pages list |
| Specific page | Full page content + section headings + metadata |
| Search results | Search query + top 3 result summaries |

### Budget & Rate Limiting

Per the AI budget system planned in `laplace-overview#4`:

- Each tenant has a monthly AI token budget.
- The docs chat API tracks tokens consumed per tenant.
- When budget is exceeded, the chat shows a friendly message: "Your team's AI assistant budget has been reached for this month."
- Rate limiting: max 20 messages per user per hour.

### Implementation Details

- **Library**: Vercel AI SDK (`ai` package) with `useChat` hook for streaming.
- **Model**: `gpt-4o-mini` for cost efficiency. Upgrade path to `gpt-4o` for premium tenants.
- **Streaming**: Server-sent events for real-time response rendering.
- **Context window**: Page content injected as system prompt context. For large pages, the content is chunked and the most relevant section is selected based on the user's question.
- **Fallback**: If the AI cannot answer from the page context, it suggests searching the docs or contacting support.

### AI Panel UI

```
┌──────────────────────┐
│  🤖 AI Assistant  ▼  │  ← Collapse toggle
├──────────────────────┤
│                      │
│  ┌──────────────────┐│
│  │ Hi! I can help   ││  ← Initial greeting
│  │ you understand   ││     (context-aware)
│  │ this page. Ask   ││
│  │ me anything.     ││
│  └──────────────────┘│
│                      │
│  ┌──────────────────┐│
│  │ What columns are ││  ← User message
│  │ in the table?    ││
│  └──────────────────┘│
│                      │
│  ┌──────────────────┐│
│  │ The Loss Pred.   ││  ← AI response
│  │ table has these  ││     (streaming)
│  │ columns:         ││
│  │ - CTRC number    ││
│  │ - Risk score     ││
│  │ - Status         ││
│  │ - ...            ││
│  └──────────────────┘│
│                      │
├──────────────────────┤
│ ┌──────────────┐ [→] │  ← Input + send
│ │ Ask a question│     │
│ └──────────────┘     │
└──────────────────────┘
```

---

## 10. Internationalization (i18n)

### Approach

Reuse the same i18n strategy as the main platform:

| Aspect | Implementation |
|--------|---------------|
| Library | `next-intl` v4.8+ |
| Locales | `pt-BR` (default), `en-US` |
| Routing | `[locale]` route segment |
| Content | Separate content directories per locale |
| UI strings | JSON message files (`messages/pt-BR.json`, `messages/en-US.json`) |
| Detection | Cookie `laplace_locale` → browser `Accept-Language` → default `pt-BR` |

### Content Files

Documentation content is fully translated. Each locale has its own content tree:

```
content/
├── pt-BR/v0.3.0/services/loss-prediction/overview.mdx
└── en-US/v0.3.0/services/loss-prediction/overview.mdx
```

### Fallback

If a page doesn't exist in the selected locale, the system falls back to `pt-BR`. A notice banner appears: "This page is not yet available in English. Showing Portuguese version."

### UI Messages

```
messages/
├── pt-BR.json    # Sidebar labels, button text, search placeholder, etc.
└── en-US.json
```

### Locale Switcher

A toggle in the left sidebar footer switches between PT and EN. The preference is stored in a cookie (`laplace_locale`) on the parent domain so it persists across the platform and docs.

---

## 11. Feature Specifications

### 11.1 Dark/Light Mode

- Uses `next-themes` (same as platform).
- System preference detection on first visit.
- Toggle in left sidebar footer (sun/moon icon).
- Theme stored in cookie on parent domain (shared with platform).
- All transitions use `transition-colors duration-200`.

### 11.2 Skeleton/Shimmer Loading

Stripe-inspired rectangular skeleton placeholders. No circular spinners.

```
Loading state for a doc page:

┌──────────────────────────────────────┐
│ ░░░░░░░ > ░░░░░░░░ > ░░░░░░░░░     │  ← Breadcrumb skeleton
│                                      │
│ ░░░░░░░░░░░░░░░░░░░░░               │  ← H1 skeleton (60% width)
│ ░░░░░░░░░░░░                        │  ← "Last updated" skeleton
│                                      │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Paragraph line 1
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │  ← Paragraph line 2
│ ░░░░░░░░░░░░░░░░░░░░░░░░           │  ← Paragraph line 3 (shorter)
│                                      │
│ ░░░░░░░░░░░░░░░░                    │  ← H2 skeleton (40% width)
│                                      │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
│ ░░░░░░░░░░░░░░░░░░░░               │
│                                      │
│ ┌──────────────────────────────────┐ │  ← Code block skeleton
│ │ ░░░░░░░░                        │ │
│ │ ░░░░░░░░░░░░░░░░░░              │ │
│ │ ░░░░░░░░░░░░                    │ │
│ │ ░░░░░░░░░░░░░░░░                │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘

░░░ = shimmer animation (gradient sweep left → right, 1.5s ease-in-out infinite)
```

### 11.3 Code Blocks

Styled code blocks inspired by Tailwind CSS documentation:

```
┌─ python ──────────────────────── [📋] ┐
│                                       │
│  from lightgbm import LGBMClassifier  │
│                                       │
│  model = LGBMClassifier(              │
│      n_estimators=100,                │
│      learning_rate=0.1,               │
│  )                                    │
│  model.fit(X_train, y_train)          │
│                                       │
└───────────────────────────────────────┘

Features:
- Language label in header bar (top-left)
- Copy button (top-right) — shows "Copied!" for 2s after click
- Dark background in BOTH light and dark modes
- Syntax highlighting via Shiki (One Dark Pro theme)
- Horizontal scroll for long lines
- Line numbers (optional, toggled via meta string)
- Line highlighting (via meta string: ```python {3-5})
```

### 11.4 Callout / Hint Boxes

Four variants with consistent design:

```
┌─ ℹ INFO ──────────────────────────────┐
│                                       │
│  This service processes data from     │
│  the 455 base automatically.          │
│                                       │
└───────────────────────────────────────┘
  Border-left: 3px solid #3A8DFF
  Background: rgba(58,141,255,0.06)

┌─ 💡 TIP ──────────────────────────────┐
│                                       │
│  Use keyboard shortcuts to navigate   │
│  faster between table rows.           │
│                                       │
└───────────────────────────────────────┘
  Border-left: 3px solid #22C55E
  Background: rgba(34,197,94,0.06)

┌─ ⚠ WARNING ──────────────────────────┐
│                                       │
│  Changing the model version will      │
│  re-score all active CTRCs.           │
│                                       │
└───────────────────────────────────────┘
  Border-left: 3px solid #F59E0B
  Background: rgba(245,158,11,0.06)

┌─ 🚨 DANGER ─────────────────────────┐
│                                       │
│  This action cannot be undone.        │
│  All predictions will be deleted.     │
│                                       │
└───────────────────────────────────────┘
  Border-left: 3px solid #EF4444
  Background: rgba(239,68,68,0.06)
```

MDX usage:

```mdx
<Callout type="info">
  This service processes data from the 455 base automatically.
</Callout>

<Callout type="tip" title="Pro tip">
  Use keyboard shortcuts to navigate faster between table rows.
</Callout>
```

### 11.5 Images

All images rendered with:
- Rounded corners (`border-radius: 8px`)
- Subtle border (`1px solid var(--content-border)`)
- Optional caption below (from `alt` text or explicit `caption` prop)
- Click to expand in a lightbox modal
- Lazy loading (`loading="lazy"`)
- Next.js Image optimization

```mdx
![Loss prediction table showing risk scores for CTRCs](./images/table-view.png)

<!-- Renders as: -->
<figure>
  <img ... class="rounded-lg border" />
  <figcaption>Loss prediction table showing risk scores for CTRCs</figcaption>
</figure>
```

### 11.6 Table of Contents (Right Sidebar)

Auto-generated from H2 and H3 headings on the current page:

- Extracted at build time from the MDX AST.
- Active heading highlighted as user scrolls (Intersection Observer).
- Smooth scroll on click.
- Indented H3 items under their parent H2.

### 11.7 Page Feedback

Simple thumbs up/down UI. Phase 1 stores feedback locally (no backend). Phase 2 sends to API.

```
┌──────────────────────────┐
│  Was this page helpful?  │
│                          │
│    [👍 Yes]   [👎 No]    │
│                          │
│  (after click:)          │
│  Thanks for your         │
│  feedback!               │
└──────────────────────────┘
```

### 11.8 Version Selector

Dropdown at the top of the left sidebar, below the logo:

```
┌──────────────────────────┐
│  v0.3.0              ▼  │
├──────────────────────────┤
│  ● v0.3.0 (latest)      │
│    v0.2.0                │
│    v0.1.0                │
└──────────────────────────┘
```

- Stored in URL path: `/docs/v0.3.0/services/loss-prediction/table-view`.
- Version list derived from directories in `content/[locale]/`.
- "Latest" badge on the most recent version.
- When switching versions, navigates to the same page in the new version (or the version's home if the page doesn't exist).

### 11.9 Forward/Back Navigation

Bottom of every content page:

```
┌─────────────────────────────────────────┐
│                                         │
│  ← Previous                      Next → │
│  Overview                  Collector    │
│                                         │
└─────────────────────────────────────────┘
```

- Derived from `_meta.json` page ordering.
- Previous/Next wrap across sections (e.g., last page of "Digital Twin" links to first page of "Services").

### 11.10 Related Module Cards

Bottom of every content page, below the prev/next navigation:

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🌐       │ │ 📉       │ │ 🗄️       │
│ Digital  │ │ Loss     │ │ Database │
│ Twin     │ │ Predict. │ │          │
│          │ │          │ │ Query &  │
│ View the │ │ Risk     │ │ explore  │
│ network  │ │ scoring  │ │ raw data │
└──────────┘ └──────────┘ └──────────┘
```

- Shows 3 related modules from the `related` frontmatter field.
- If no explicit related modules, shows the parent section's siblings.
- Filtered by user's module access.

### 11.11 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| `>= 1280px` | Full 3-column layout |
| `768px - 1279px` | 2-column (left sidebar + content). Right sidebar collapses; TOC becomes dropdown. AI becomes floating button. |
| `< 768px` | Single column. Left sidebar becomes drawer. TOC inline below content. AI becomes bottom sheet. |

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal**: Repo setup, basic layout, MDX rendering, dark/light mode.

- [ ] Initialize Next.js 16 project with App Router and TypeScript
- [ ] Configure Tailwind CSS v4 with `@tailwindcss/typography`
- [ ] Set up design tokens (CSS custom properties from platform design system)
- [ ] Install and configure `next-themes` for dark/light mode
- [ ] Create root layout with font loading (Inter, JetBrains Mono)
- [ ] Build `DocsLayout` component (3-column grid)
- [ ] Implement basic left sidebar (static, no auth filtering)
- [ ] Implement basic right sidebar (static TOC placeholder)
- [ ] Set up MDX rendering pipeline:
  - Install `next-mdx-remote-client`, rehype/remark plugins
  - Create `mdx-components.tsx` with basic component mapping
  - Create `[...slug]/page.tsx` dynamic route for docs pages
- [ ] Build `ProseWrapper` with `@tailwindcss/typography` styling
- [ ] Create first content files (Getting Started overview + quickstart)
- [ ] Deploy to Vercel as `laplace-docs` project
- [ ] Configure subdomain `docs.laplacelabs-digital-twin.xyz`

**Deliverable**: Browsable docs site with basic navigation and MDX rendering.

### Phase 2: Navigation & Content Components (Week 3-4)

**Goal**: Full sidebar navigation, search, version selector, breadcrumbs, all MDX components.

- [ ] Build `SidebarSection` (collapsible with Radix Collapsible)
- [ ] Build `SidebarItem` (active state, indentation, icons)
- [ ] Build `VersionSelector` dropdown (reads content directory structure)
- [ ] Build `Breadcrumbs` component (derived from URL path + `_meta.json`)
- [ ] Implement `_meta.json` parsing for sidebar ordering
- [ ] Build search:
  - Configure Pagefind in build pipeline
  - Build `SearchDialog` with `cmdk`
  - Build `SearchTrigger` (sidebar search bar + Cmd+K shortcut)
- [ ] Build MDX components:
  - `Callout` (info, tip, warning, danger variants)
  - `CodeBlock` (Shiki highlighting, copy button, language label, line highlighting)
  - `InlineCode` (styled backtick code)
  - `ImageFigure` (rounded corners, caption, lightbox)
  - `Table` (responsive wrapper with horizontal scroll)
  - `Heading` (anchor links, scroll margin)
  - `SmartLink` (external link indicator)
  - `Steps` (numbered step component)
  - `Tabs` (tabbed content blocks)
- [ ] Build `PageHeader` (title, description, last-updated date)
- [ ] Build `PageFooter` (prev/next navigation)
- [ ] Build `RelatedCards` (module cards at bottom)

**Deliverable**: Fully navigable docs with rich content components.

### Phase 3: Auth & Module Scoping (Week 5)

**Goal**: Shared authentication, module-scoped sidebar filtering.

- [ ] Platform change: Update cookie domain to `.laplacelabs-digital-twin.xyz`
- [ ] Platform change: Move refresh token to HttpOnly cookie (Option B)
- [ ] Build middleware to read `laplace_access_token` from cookie
- [ ] Build `/api/proxy` route handler (proxy to platform API for /v1/auth/me)
- [ ] Create `DocsAuthProvider` context:
  - Decode JWT from cookie
  - Fetch user + modules from API
  - Provide `hasModule()` helper
- [ ] Filter sidebar sections by `required_module_key`
- [ ] Add "Sign in" link for unauthenticated users
- [ ] Add access-denied page for restricted modules
- [ ] Handle token refresh via HttpOnly cookie

**Deliverable**: Authenticated docs with module-scoped visibility.

### Phase 4: i18n & Polish (Week 6)

**Goal**: Bilingual support, skeleton loading, responsive design.

- [ ] Configure `next-intl` with `[locale]` routing
- [ ] Create `messages/pt-BR.json` and `messages/en-US.json`
- [ ] Build `LocaleSwitcher` component
- [ ] Set up bilingual content directories (`content/pt-BR/`, `content/en-US/`)
- [ ] Build fallback banner for missing translations
- [ ] Build `Skeleton` primitive component (shimmer animation)
- [ ] Build `SkeletonPage` (full page loading state)
- [ ] Add loading.tsx files for Suspense boundaries
- [ ] Implement responsive breakpoints:
  - Mobile nav drawer (< 768px)
  - Collapsed right sidebar (< 1280px)
  - TOC dropdown (tablet)
- [ ] Add keyboard navigation (arrow keys in sidebar, Escape to close dialogs)
- [ ] Add smooth scroll and scroll-margin for anchor links
- [ ] Add page transition animations

**Deliverable**: Production-ready, polished, bilingual docs site.

### Phase 5: AI Assistant (Week 7-8)

**Goal**: Context-aware AI chat in right sidebar.

- [ ] Set up Vercel AI SDK (`ai` package) with OpenAI provider
- [ ] Create `/api/docs/chat` route handler:
  - Validate auth token
  - Read page content from filesystem
  - Build system prompt with page context
  - Stream response via SSE
- [ ] Build `AIPanel` component:
  - Chat message list
  - Input field with send button
  - Streaming response rendering
  - Context-aware greeting
- [ ] Build `AIFloatingButton` for mobile/tablet
- [ ] Implement tenant budget tracking:
  - Token counting per request
  - Monthly budget check via API
  - Budget exceeded message
- [ ] Rate limiting (20 messages/user/hour)
- [ ] AI context strategy:
  - Overview pages: module descriptions
  - Specific pages: full page content
  - Large pages: relevant section extraction

**Deliverable**: Working AI assistant with per-page context.

### Phase 6: Content & Launch (Week 9-10)

**Goal**: Write initial documentation, test, and launch.

- [ ] Write documentation for all platform modules:
  - Getting Started (overview, quickstart)
  - Digital Twin (overview, network map)
  - Digital Model (overview, units)
  - Loss Prediction (overview, table view, collector, dashboard)
  - Load Consolidation (overview)
  - Database (overview)
  - Settings (users, tenants)
  - API (authentication, endpoints, examples)
  - Changelog
- [ ] Screenshot all platform features for docs images
- [ ] QA across browsers (Chrome, Firefox, Safari, Edge)
- [ ] QA responsive layouts (mobile, tablet, desktop)
- [ ] QA dark/light mode in all components
- [ ] QA module scoping with different user roles
- [ ] Performance audit (Lighthouse, Core Web Vitals)
- [ ] SEO setup (meta tags, Open Graph, sitemap.xml)
- [ ] Launch announcement

**Deliverable**: Public documentation site with comprehensive content.

---

## 13. Deployment & Infrastructure

### Vercel Configuration

| Setting | Value |
|---------|-------|
| Project name | `laplace-docs` |
| Framework | Next.js |
| Build command | `next build && npx pagefind --site .next/server/app` |
| Output directory | `.next` |
| Node.js version | 20.x |
| Domain | `docs.laplacelabs-digital-twin.xyz` |
| Environment variables | `OPENAI_API_KEY`, `NEXT_PUBLIC_API_URL`, `JWT_SECRET` |

### DNS

Add a CNAME record for `docs.laplacelabs-digital-twin.xyz` pointing to Vercel's DNS.

### Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `OPENAI_API_KEY` | OpenAI API key for AI assistant | Vercel env |
| `NEXT_PUBLIC_API_URL` | Platform API base URL | Vercel env |
| `JWT_SECRET` | JWT verification secret (shared with API) | Vercel env |
| `NEXT_PUBLIC_SITE_URL` | `https://docs.laplacelabs-digital-twin.xyz` | Vercel env |
| `NEXT_PUBLIC_PLATFORM_URL` | `https://www.laplacelabs-digital-twin.xyz` | Vercel env |

### Build Pipeline

```
1. Push to main branch
2. Vercel detects change
3. next build compiles all pages (MDX → HTML)
4. pagefind indexes the built HTML
5. Deploy to edge network
6. ~60-90s total build time (estimated)
```

---

## 14. Open Questions

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Should the docs be fully public or require auth for all pages? | A) All public, B) Auth for everything, C) Hybrid (some public, some auth-gated) | C — Getting Started and API docs are public; module-specific docs require auth |
| 2 | Should we support multiple versions from day 1 or add versioning later? | A) Day 1, B) After v0.4.0 | B — Start with a single version. Add versioning when we have a second version to display. |
| 3 | Should the AI assistant be available to unauthenticated users? | A) Yes (limited), B) No | B — AI requires auth to track tenant budget |
| 4 | How should we handle API documentation — manual MDX or auto-generated from OpenAPI? | A) Manual MDX, B) Auto-gen from OpenAPI spec, C) Hybrid | A for now — the API is small. Consider B when the API grows. |
| 5 | Should the docs site have its own analytics or share with the platform? | A) Separate Vercel Analytics, B) Shared Google Analytics | A — Separate Vercel Analytics project for clean data. |
| 6 | Content review workflow — should we require PR reviews for docs changes? | A) Any push to main, B) PR required | B — PR reviews ensure quality and catch errors. |
| 7 | Should we support a "draft" state for pages not ready for publication? | A) Yes (frontmatter `draft: true`), B) No | A — Draft pages are hidden from sidebar and search but accessible via direct URL in dev. |

---

## Appendix A: Design Inspiration References

| Aspect | Inspiration Source | What to Borrow |
|--------|--------------------|----------------|
| **Sidebar navigation** | GitBook | Collapsible sections, clean hierarchy, version selector placement |
| **Typography** | Notion | Generous whitespace, clear heading hierarchy, warm color palette |
| **Code blocks** | Tailwind CSS docs | Dark background in both modes, language label, copy button |
| **Callout boxes** | Mintlify | Clean colored left border, subtle background tint, icon+label |
| **Loading states** | Stripe docs | Rectangular skeleton placeholders with shimmer animation |
| **Right sidebar** | Vercel docs | "On this page" TOC, feedback widget |
| **Search** | Algolia DocSearch | Cmd+K modal, keyboard navigation, grouped results |
| **AI assistant** | Cursor | Sidebar chat panel, context-aware, collapsible |
| **Home page** | Notion Help Center | Greeting, search-first, module grid cards |
| **Dark mode** | Linear docs | Clean neutral grays, no blue tint, smooth transitions |

## Appendix B: File/Directory Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CodeBlock.tsx`, `AIPanel.tsx` |
| Component files | kebab-case | `code-block.tsx`, `ai-panel.tsx` |
| Content directories | kebab-case | `loss-prediction/`, `getting-started/` |
| MDX files | kebab-case | `table-view.mdx`, `network-map.mdx` |
| CSS/utility files | kebab-case | `docs-tokens.css` |
| Config files | kebab-case | `_meta.json`, `modules.json` |
| Route segments | kebab-case | `[...slug]/page.tsx` |
| i18n messages | camelCase keys | `{ "sidebar": { "searchPlaceholder": "..." } }` |

## Appendix C: Estimated Package Bundle Sizes

| Package | Minified + Gzipped | Notes |
|---------|-------------------|-------|
| `next-mdx-remote-client` | ~8 KB | RSC, no client bundle for rendering |
| `shiki` | ~0 KB client | Build-time only (SSR/SSG) |
| `pagefind` | ~10 KB | Client-side search runtime |
| `cmdk` | ~5 KB | Command palette |
| `lucide-react` (tree-shaken) | ~2 KB | Only imported icons |
| `ai` (Vercel AI SDK) | ~12 KB | useChat hook |
| `jose` | ~8 KB | JWT decoding |
| `next-intl` | ~6 KB | i18n runtime |
| **Estimated total client JS** | **~50-60 KB** | Excellent for docs site |
