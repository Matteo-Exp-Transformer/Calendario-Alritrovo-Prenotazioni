# Commercial Dashboard Patterns — Booking SaaS Reference

Reference file for agents implementing professional layout improvements. These patterns are derived from leading booking/reservation SaaS products (Resy, OpenTable, SevenRooms, TheFork Manager, Calendly).

## 1. Layout Structure Benchmarks

### Header Pattern (SaaS Standard)
```
┌─────────────────────────────────────────────────────────┐
│ [Logo]              [Search?]        [Notifications] [Avatar] │
│─────────────────────────────────────────────────────────│
│ [Tab1]  [Tab2]  [Tab3]          [Date/Filter controls]  │
└─────────────────────────────────────────────────────────┘
```
**Key traits:**
- Logo + nav on same bar OR separate sticky bars
- Tabs are pill-shaped or underlined, never both
- User avatar is minimal (circle + dropdown)
- Stats are below header or in sidebar, NOT inline with nav

### Stats Cards Pattern
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  ▲ 12%   │ │  ▼ 3%    │ │  ● 0%    │ │  ▲ 8%    │
│   247    │ │    18    │ │   1,024  │ │    5     │
│ This Week │ │  Today   │ │ This Month│ │ Declined │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```
**Key traits:**
- Number is largest element (text-3xl or larger)
- Label below number (not above) in commercial products
- Optional trend indicator (arrow + percentage)
- Subtle background tint matching border color (5-10% opacity)
- Consistent card height (no content-dependent sizing)

### Current vs Ideal Stats Card
```
CURRENT (Al Ritrovo):              IDEAL (Commercial):
┌──────────────┐                   ┌──────────────────┐
│  SETTIMANA   │ ← label on top   │   icon   ▲ 12%   │ ← icon + trend
│     24       │                   │     24           │ ← number prominent
└──────────────┘                   │   Settimana      │ ← label below
                                   └──────────────────┘
```

## 2. Tailwind Class Recipes

### Professional Card
```tsx
className="bg-white rounded-xl border border-gray-200 shadow-sm
  hover:shadow-md hover:border-gray-300 transition-all duration-200
  p-4 md:p-5"
```

### Active Tab (Pill Style)
```tsx
className="bg-gray-900 text-white border-transparent shadow-sm
  rounded-lg px-4 py-2.5 font-medium text-sm"
```

### Inactive Tab (Pill Style)
```tsx
className="bg-transparent text-gray-600 border-transparent
  hover:bg-gray-100 hover:text-gray-900
  rounded-lg px-4 py-2.5 font-medium text-sm transition-colors"
```

### Stat Card with Tint
```tsx
className={`rounded-xl border-2 p-4 transition-all duration-200
  hover:shadow-md ${colorClasses}`}
// Where colorClasses varies:
// violet: "border-violet-200 bg-violet-50/50 hover:border-violet-300"
// cyan:   "border-cyan-200 bg-cyan-50/50 hover:border-cyan-300"
// blue:   "border-blue-200 bg-blue-50/50 hover:border-blue-300"
// rose:   "border-rose-200 bg-rose-50/50 hover:border-rose-300"
```

### User Avatar Badge (Compact)
```tsx
className="flex items-center gap-2.5 px-3 py-2 rounded-xl
  border border-gray-200 bg-white shadow-sm
  hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
```

## 3. Spacing System

Commercial dashboards use a strict 4px grid:

| Scale | Tailwind | Use |
|-------|----------|-----|
| 4px | `gap-1`, `p-1` | Icon padding, tight spacing |
| 8px | `gap-2`, `p-2` | Badge padding, inline gaps |
| 12px | `gap-3`, `p-3` | Card inner padding (compact) |
| 16px | `gap-4`, `p-4` | Card padding, section gaps |
| 24px | `gap-6`, `p-6` | Major section separation |
| 32px | `gap-8`, `p-8` | Page section separation |

**Rule:** Header internal → 16px rhythm. Main sections → 24px rhythm. Never mix.

## 4. Color Refinement Guide

### Current Issues
1. **Stat cards:** `border-2` with 400-level colors is visually heavy for a professional app
2. **User badge:** `border-2 border-gray-400` looks heavy; `hover:border-purple-500` is arbitrary
3. **`rounded-modern` (24px)** is too rounded for cards in a professional context (16px max)

### Professional Adjustments
```
Border weight:   border-2 → border (1px) for cards at rest
Border color:    400-level → 200-level at rest, 300-level on hover
Background:      pure white → subtle tint matching border (50-level at 50% opacity)
Rounded:         24px → 12px (rounded-xl) for cards, 8px (rounded-lg) for buttons
Shadow:          shadow-md at rest is too heavy → shadow-sm at rest, shadow-md on hover
```

## 5. Responsive Breakpoints Strategy

| Breakpoint | Stats Grid | Nav Tabs | Content Padding |
|-----------|-----------|----------|-----------------|
| Mobile (<640px) | `grid-cols-2` | `flex-wrap` stacked | `p-4` |
| Tablet (md: 768px) | `grid-cols-2` | `flex-wrap` | `p-6` |
| Desktop (lg: 1024px) | `grid-cols-4` | single row | `p-8` |

## 6. Implementation Priority Matrix

| Change | Visual Impact | Risk | Effort | Priority |
|--------|-------------|------|--------|----------|
| NavItem → pure Tailwind | High | Low | Medium | **P0** |
| Stats card refinement (borders, bg tint) | High | Low | Low | **P1** |
| `rounded-modern` → `rounded-xl` | Medium | Medium | Medium | **P2** |
| Spacing rhythm alignment | Medium | Low | Low | **P2** |
| User badge refinement | Low | Low | Low | **P3** |
| Footer padding fix | Low | None | Trivial | **P3** |

## 7. Accessibility Checklist

- [ ] All interactive elements have `min-h-[44px]` (WCAG 2.5.8 target size)
- [ ] NavItem maintains `aria-selected` after refactor
- [ ] CollapsibleCard keeps `aria-expanded`, `aria-controls`, `role="button"`
- [ ] Focus visible on all buttons (`focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`)
- [ ] Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI components
- [ ] Tab order follows visual order (no `tabindex` hacks)
- [ ] `motion-safe:` wrapper on any new animations
