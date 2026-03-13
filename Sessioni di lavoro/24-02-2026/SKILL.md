---
name: dashboard-layout-system
description: Use when modifying AdminDashboard layout, header, stat cards, nav tabs, CollapsibleCard styling, or tab content wrappers - provides component map, Tailwind class inventory, safe modification zones, conflict prevention rules, and professional design patterns for a commercial booking dashboard
---

# Dashboard Layout System

## Overview

Complete guide for modifying the AdminDashboard of "Al Ritrovo" booking system. Maps every visual element to its Tailwind classes, defines safe modification zones, and provides professional design patterns aligned with commercial SaaS booking products.

**Core principle:** Modify only via Tailwind utility classes. Never add custom CSS to `index.css` for dashboard elements. Preserve HTML structure and accessibility attributes.

**REQUIRED BACKGROUND:** You MUST understand the Tailwind-CSS-design skill before applying layout changes. That skill defines advanced utilities (container queries, ARIA variants, safe alignment) used here.

## When to Use

**Use when:**
- Changing header, stat cards, nav tabs, or CollapsibleCard appearance
- Aligning spacing/padding across dashboard sections
- Replacing inline `style={{}}` or `onMouseEnter`/`onMouseLeave` with Tailwind
- Making the dashboard more professional, commercial-grade
- Improving responsive behavior of dashboard elements

**Don't use when:**
- Modifying BookingCalendar content, PendingRequestsTab content, or ArchiveTab content
- Changing business logic, state management, or data fetching
- Working on components outside AdminDashboard page

## Verification before declaring complete

**Obbligatorio:** prima di dichiarare le modifiche completate, controverificare con lo schermo che il risultato visivo corrisponda al codice.

1. **Login autonomo (agente):** eseguire il test Playwright che fa login e salva lo screenshot della dashboard:
   - Avviare l’app in dev (`npm run dev`) in un terminale.
   - In un altro terminale: `npm run test:admin-login`.
   - Il test legge le credenziali da **`ADMIN-LOGIN.md`** (in questa cartella), apre `/login`, compila email/password, accede a `/admin` e salva lo screenshot in **`Sessioni di lavoro/24-02-2026/admin-verification.png`**.
   - L’agente può poi aprire `admin-verification.png` per controverificare colori/tab senza usare il browser MCP.
2. **Controllare a schermo** (screenshot salvato o browser) che colori, bordi, ombre, spacing e stati (attivo, hover) siano quelli intesi (es. tab attivo blu e non grigio/nero).
3. **Se qualcosa non rispecchia il lavoro descritto** (es. interfaccia ancora monocromatica), non dichiarare il lavoro completo: verificare Tailwind (safelist se classi dinamiche), eventuali override in `index.css` o `:root`, e rifare il controllo a schermo dopo le correzioni.
4. **Solo dopo la verifica visiva** considerare la modifica pronta e comunicarla come completata.

## Architecture: Component Hierarchy

```
AdminDashboard.tsx
├── <header>                          ← MODIFIABLE (classes only)
│   ├── Top Bar (logo + user badge)   ← MODIFIABLE
│   ├── Stats Grid (4 cards)          ← MODIFIABLE
│   └── Nav Tabs (NavItem x3)         ← MODIFIABLE (priority: remove inline styles)
├── <main>
│   ├── CollapsibleCard               ← MODIFIABLE (via props + component classes)
│   │   └── AdminBookingForm          ← DO NOT TOUCH
│   └── Tab Content Wrapper           ← MODIFIABLE (wrapper only, not content)
│       ├── BookingCalendarTab        ← DO NOT TOUCH
│       ├── PendingRequestsTab        ← DO NOT TOUCH
│       └── ArchiveTab                ← DO NOT TOUCH
└── <footer>                          ← MODIFIABLE (minor alignment)
```

## File Map

| File | What to modify | What NOT to modify |
|------|---------------|-------------------|
| `src/pages/AdminDashboard.tsx` | All layout classes, NavItem styles, stat card classes | Tab content rendering logic, state management |
| `src/components/ui/CollapsibleCard.tsx` | Header/content class defaults, chevron rotation | HTML structure, ARIA attributes, state logic (LOCKED: 57 tests) |
| `tailwind.config.js` | Add tokens under `theme.extend` | Don't remove existing tokens used elsewhere |
| `src/index.css` | Read only (reference `--theme-*` values) | Don't add new CSS for dashboard elements |

## Element Inventory

### 1. Page Root
```
div.min-h-screen.bg-gray-50
```
**Safe to change:** `bg-gray-50` to any background (e.g., `bg-slate-50`, gradient)

### 2. Header
```tsx
<header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
```
**Spacing rule:** `px-4 md:px-6` must match `<main>` and `<footer>` for visual alignment.

### 3. Top Bar (Logo + User Badge)
```tsx
// Container
<div className="flex items-center justify-between mb-4">

// Logo
<h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
<p className="text-gray-600 text-sm mt-1">

// User Badge
<div className="bg-white rounded-modern border-2 border-gray-400 shadow-md
     hover:shadow-lg hover:border-purple-500 transition-all px-3 py-2.5">
```

**`rounded-modern`** = 24px (defined in `index.css` with `!important`). If replacing, search ALL occurrences:
- User badge (header)
- 4 stat cards (header)
- Booking cards in BookingCalendar

### 4. Stats Grid (4 Cards)

```tsx
// Grid container
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">

// Each card (same structure, different border color)
<div className="bg-white rounded-modern border-2 border-{color}-400
     shadow-md hover:shadow-lg hover:border-{color}-500
     transition-all p-3 flex flex-col items-center justify-center">
  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">
  <p className="text-2xl font-black text-gray-900 leading-none text-center">
```

| Card | Border | Hover |
|------|--------|-------|
| Settimana | `border-violet-400` | `hover:border-violet-500` |
| Oggi | `border-cyan-400` | `hover:border-cyan-500` |
| Mese | `border-blue-400` | `hover:border-blue-500` |
| Rifiutate | `border-rose-400` | `hover:border-rose-500` |

**Rule:** Keep 4 distinct color personalities on border/hover only. Unify everything else.

### 5. NavItem (Tab Buttons) — PRIORITY REFACTOR TARGET

**Current problems:**
- Uses `style={{}}` for active/inactive/hover states
- Uses `onMouseEnter`/`onMouseLeave` JavaScript for hover
- Mixes CSS variables with Tailwind classes

**Current Tailwind classes (keep these):**
```
relative flex items-center gap-3 px-4 md:px-6 py-3 rounded-lg
transition-all duration-200 border-2 cursor-pointer min-h-[44px] active:scale-[0.98]
```

**CSS variable → Tailwind mapping:**

| Variable | Current Value | Tailwind Replacement |
|----------|--------------|---------------------|
| `--theme-surface-nav-active` | `#f3f4f6` | `bg-gray-100` |
| `--theme-surface-nav-inactive` | `#ffffff` | `bg-white` |
| `--theme-surface-hover` | `#f3f4f6` | `hover:bg-gray-100` |
| `--theme-border-nav-active` | `#3b82f6` | `border-blue-500` |
| `--theme-border-nav-inactive` | `#e5e7eb` | `border-gray-200` |
| `--theme-border-strong` | `#d1d5db` | `hover:border-gray-300` |
| `--theme-text-nav-active` | `#3b82f6` | `text-blue-600` |
| `--theme-text-nav-inactive` | `#4b5563` | `text-gray-600` |
| `--theme-accent-primary` | `#3b82f6` | `bg-blue-500` |
| `--theme-shadow-sm` | `0 1px 2px...` | `shadow-sm` |

**Refactored NavItem pattern:**
```tsx
<button
  onClick={onClick}
  className={`relative flex items-center gap-3 px-4 md:px-6 py-3 rounded-lg
    transition-all duration-200 border-2 cursor-pointer min-h-[44px] active:scale-[0.98]
    ${active
      ? 'bg-gray-100 border-blue-500 text-blue-600 font-semibold shadow-sm'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
    }`}
  aria-selected={active}
>
  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
    ${active ? 'bg-blue-500/10' : 'bg-gray-100'}`}>
    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
  </div>
  <span className="text-sm md:text-base font-medium">{label}</span>
  {badge > 0 && (
    <span className="ml-auto inline-flex items-center justify-center min-w-[24px]
      h-6 text-xs font-semibold px-2 rounded-full bg-blue-500 text-white">
      {badge}
    </span>
  )}
</button>
```

**What to remove:** All `style={{}}`, `onMouseEnter`, `onMouseLeave` on the NavItem button.
**What to keep:** `min-h-[44px]` (a11y touch target), `active:scale-[0.98]`, `aria-selected`.

### 6. Main Content Area

```tsx
<main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
  // CollapsibleCard wrapper
  <div className="space-y-4 mb-8">
  // Tab content wrapper
  <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 min-h-[600px] border border-gray-200">
```

### 7. CollapsibleCard (Dashboard Instance)

**Props you control from AdminDashboard:**
```tsx
headerClassName="bg-al-ritrovo-primary/5 hover:bg-al-ritrovo-primary/10
                 border-b border-al-ritrovo-primary/20"
```

**Component defaults (in CollapsibleCard.tsx):**
- Root: `bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`
- Header fallback: `bg-gray-50 hover:bg-gray-100 border-b border-gray-200`
- Chevron: inline `transform: rotate(Xdeg)` → can migrate to `className={isExpanded ? 'rotate-180' : 'rotate-0'}`

**WARNING:** CollapsibleCard is shared (used in BookingCalendar time slots too). Changing defaults affects ALL instances.

### 8. Footer
```tsx
<footer className="max-w-7xl mx-auto px-6 py-6">
  <div className="text-center text-sm text-warm-wood/60">
```
**Issue:** Footer uses `px-6` while header/main use `px-4 md:px-6`. Align to `px-4 md:px-6`.

## Design Tokens

**Existing tokens in `tailwind.config.js`:**

| Token | Value | Usage |
|-------|-------|-------|
| `warm-wood` | `rgb(139 69 19)` | Brand primary, footer text |
| `al-ritrovo.primary` | `#8B4513` | CollapsibleCard header, spinners |
| `warm-beige` | `rgb(245 222 179)` | Calendar card borders |
| Font sans | Inter | Body text |
| Font serif | Merriweather | Titles (h1 "Al Ritrovo") |

**Suggested new tokens** (add to `theme.extend` without breaking existing):
```js
dashboard: {
  card: { radius: '1.5rem' },  // replaces rounded-modern (24px)
  spacing: { gap: '0.75rem' }, // grid gap-3
}
```

## Conflict Prevention Rules

| Risk | What to check | Mitigation |
|------|--------------|------------|
| `rounded-modern` change | Used in badge, stat cards, BookingCalendar booking cards | Replace ALL occurrences or keep CSS class |
| `--theme-*` removal | Used by ThemeToggle and other components | Only remove from NavItem; keep vars in `:root` |
| `headerClassName` override | Affects only this CollapsibleCard instance | Never use `!important`; only Tailwind classes |
| Padding inconsistency | Header `px-4 md:px-6` vs main vs footer | Use identical values on all `max-w-7xl` containers |
| `al-ritrovo-primary` change | Used in CollapsibleCard, modals, spinners | Change in config affects everything |
| CollapsibleCard defaults | Shared across BookingCalendar time slots | Modify via props, not component defaults |

## Recommended Subtask Order

1. **NavItem refactor** — Remove inline styles/JS hover → pure Tailwind (highest impact, lowest risk)
2. **Stats cards** — Unify spacing, shadows, borders with Tailwind utilities
3. **Header alignment** — Match padding rhythm across header/main/footer
4. **Footer fix** — Align `px-4 md:px-6` to match header/main
5. **CollapsibleCard chevron** — Replace inline `transform` with Tailwind `rotate-*` classes
6. **Verify** — Responsive (mobile/desktop), keyboard focus, screen reader

## Professional Design Patterns (Commercial SaaS Reference)

### Spacing Rhythm
Use consistent spacing scale: `gap-3` (12px) for tight groups, `gap-4` (16px) for sections, `gap-6` (24px) for major sections. Never mix arbitrarily.

### Shadow Hierarchy
```
Cards at rest:     shadow-sm
Cards on hover:    shadow-md  (one step up)
Modals/overlays:   shadow-lg
Floating elements: shadow-xl
```

### Border Radius Consistency
Pick ONE radius for cards: `rounded-xl` (12px) or `rounded-2xl` (16px). Apply to: stat cards, CollapsibleCard, tab content wrapper. Use `rounded-lg` (8px) for buttons/badges.

### Color System
- **Neutrals:** gray-50 through gray-900 for backgrounds, text, borders
- **Brand accent:** `al-ritrovo-primary` / `warm-wood` for CTAs and highlights
- **Semantic colors:** blue for active/info, green for success, yellow for warning, red for error/rejected
- **Card personalities:** Keep violet/cyan/blue/rose on stat card borders ONLY

### Typography Scale
```
Page title:   text-2xl md:text-3xl font-serif font-bold
Section head: text-lg font-semibold
Body:         text-sm md:text-base
Caption:      text-xs text-gray-500
Micro:        text-[10px] uppercase tracking-wider (stat labels)
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Adding `style={{}}` for colors/spacing | Use Tailwind classes with conditional `className` |
| Adding JS hover handlers for visual effects | Use `hover:` variants |
| Changing CollapsibleCard defaults without checking all instances | Modify via props from parent, or verify all 4+ usages |
| Using `!important` in `headerClassName` | Tailwind specificity is sufficient; restructure if needed |
| Misaligned padding across sections | Use same `px-4 md:px-6` on all `max-w-7xl` wrappers |
| Removing `--theme-*` vars from `index.css` | Only stop using them in NavItem; other components may need them |
| Removing `min-h-[44px]` from NavItem | Required for WCAG touch target size |
| Removing `aria-selected`, `role`, `aria-expanded` | These are accessibility requirements |

## Quick Reference: What to Change vs Preserve

| Element | Change | Preserve |
|---------|--------|----------|
| NavItem | Replace `style`, `onMouse*` → Tailwind | `min-h-[44px]`, `active:scale-[0.98]`, `aria-selected` |
| Stat cards | `gap-*`, `p-*`, `shadow-*`, `rounded-*` | 4 color personalities (border only) |
| Header wrapper | `py-*`, `px-*` | `max-w-7xl mx-auto` |
| CollapsibleCard | `headerClassName` prop, chevron rotation | HTML structure, ARIA, state logic |
| Tab wrapper | `p-*`, `rounded-*`, `shadow-*`, `min-h-*` | Conditional rendering logic |
| Footer | `px-*` alignment | Content text |
