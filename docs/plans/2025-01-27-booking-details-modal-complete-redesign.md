# Booking Details Modal - Complete Redesign

**Date:** 2025-01-27
**Status:** Approved - Ready for Implementation
**Type:** Feature Enhancement

## Overview

Complete redesign of `BookingDetailsModal` to display ALL booking data (menu selection, dietary restrictions, totals) with full edit capabilities for all fields including client information.

## Business Requirements

### Current Issues
1. Missing data display: menu items, dietary restrictions, booking totals
2. Client information not editable
3. booking_type not visible or editable
4. Poor mobile UX with limited space

### Goals
1. Show ALL booking data collected from BookingRequestForm
2. Make ALL relevant fields editable (client info, event details, menu, dietary restrictions, booking type)
3. Optimize layout for both desktop and mobile
4. Maintain consistency with existing UI patterns

## Design Decisions

### 1. Tab Navigation Structure

**Dynamic tabs based on booking_type:**

**For "tavolo" bookings:**
- Tab 1: "Dettagli" (client info + event details + special notes)

**For "rinfresco_laurea" bookings:**
- Tab 1: "Dettagli" (client info + event details)
- Tab 2: "Menu e Prezzi" (full menu selection + totals)
- Tab 3: "Intolleranze e Note" (dietary restrictions + special requests)

**Rationale:** Avoid empty tabs, keep UI relevant to booking type.

### 2. Single Edit Mode Button

**One "Modifica" button activates edit mode for entire modal.**

- View mode: [Modifica] [Elimina] buttons
- Edit mode: [Annulla] [Salva] buttons
- All editable fields become inputs simultaneously
- Single save operation for all changes

**Rationale:** Simpler UX, fewer clicks, consistent with user request.

### 3. Menu Display Approach

**View mode:**
- Full list of items always expanded (scroll to see all)
- Entire "Menu Selezionato" section is collapsible
- Summary always visible: item count, totals

**Edit mode:**
- Reuse existing `MenuSelection` component from BookingRequestForm
- All validation and calculations already implemented
- Section auto-expands when entering edit mode

**Rationale:** No code duplication, proven validation logic, familiar UX.

### 4. Mobile Layout

**Full screen modal on mobile (<640px):**
- 100vw x 100vh (not 70vh bottom sheet)
- Large, visible close button (44x44px touch target)
- Sticky tab bar below header
- Vertical scroll only

**Rationale:** Solves space constraints, better for complex content like menu editing.

### 5. Sticky Elements

**Layout structure:**
```
Header (60px)           - Sticky top
Tab Navigation (48px)   - Sticky below header
Content Area (dynamic)  - Scrollable
Footer Actions (72px)   - Sticky bottom
```

**Rationale:** Always accessible navigation and actions, clear visual hierarchy.

## Technical Architecture

### Component Structure

```
BookingDetailsModal.tsx (main)
├── Header (title + close button)
├── TabNavigation (dynamic tabs)
├── Content Area (scrollable)
│   ├── DetailsTab
│   │   ├── BookingTypeSection (editable)
│   │   ├── ClientInfoSection (editable)
│   │   ├── EventDetailsSection (editable)
│   │   └── SpecialNotesSection (editable, tavolo only)
│   ├──  (rinfresco_laurea only)
│   │   ├── PresetMenuBadge (if applicable)
│   │   └── CollapsibleMenuSection
│   │       ├── MenuSummary (always visible)
│   │       └── MenuItemsList (expandable)
│   │           └── MenuSelection (edit mode)
│   └── DietaryTab (rinfresco_laurea only)
│       ├── DietaryRestrictionsSection
│       └── SpecialNotesSection
└── FooterActions (edit/save/delete)
```

### State Management

```typescript
// Navigation
const [activeTab, setActiveTab] = useState<'details' | 'menu' | 'dietary'>('details')

// Edit mode
const [isEditMode, setIsEditMode] = useState(false)

// Form data (expanded)
const [formData, setFormData] = useState({
  // Existing fields
  confirmed_start: booking.confirmed_start,
  confirmed_end: booking.confirmed_end,
  num_guests: booking.num_guests,
  special_requests: booking.special_requests,

  // NEW fields
  booking_type: booking.booking_type,
  client_name: booking.client_name,
  client_email: booking.client_email,
  client_phone: booking.client_phone,
  menu_selection: booking.menu_selection,
  dietary_restrictions: booking.dietary_restrictions,
  preset_menu: booking.preset_menu
})

// UI state
const [isMenuExpanded, setIsMenuExpanded] = useState(false)
const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false)
```

### Dynamic Tab Calculation

```typescript
const tabs = useMemo(() => {
  const baseTabs = [
    { id: 'details', label: 'Dettagli', icon: '📋' }
  ]

  if (formData.booking_type === 'rinfresco_laurea') {
    baseTabs.push(
      { id: 'menu', label: 'Menu e Prezzi', icon: '🍽️' },
      { id: 'dietary', label: 'Intolleranze e Note', icon: '⚠️' }
    )
  }

  return baseTabs
}, [formData.booking_type])

// Auto-reset active tab if no longer available
useEffect(() => {
  const tabExists = tabs.some(t => t.id === activeTab)
  if (!tabExists) {
    setActiveTab('details')
  }
}, [tabs, activeTab])
```

### Booking Type Change Handling

**Critical scenario: rinfresco_laurea → tavolo**

```typescript
const handleBookingTypeChange = (newType: 'tavolo' | 'rinfresco_laurea') => {
  if (formData.booking_type === 'rinfresco_laurea' && newType === 'tavolo') {
    // Show confirmation modal
    setShowTypeChangeWarning(true)
    setPendingBookingType(newType)
  } else {
    // Safe change
    setFormData(prev => ({ ...prev, booking_type: newType }))
  }
}

const confirmBookingTypeChange = () => {
  setFormData(prev => ({
    ...prev,
    booking_type: pendingBookingType,
    // Clear menu/dietary data
    menu_selection: undefined,
    dietary_restrictions: [],
    preset_menu: undefined
  }))
  setShowTypeChangeWarning(false)
  setActiveTab('details')
}
```

**Warning modal:**
```
⚠️ Attenzione!
Cambiando il tipo di prenotazione a "Tavolo",
i seguenti dati verranno rimossi:
• Menu selezionato
• Intolleranze e allergie

Sei sicuro di voler procedere?

[Annulla]  [Conferma]
```

## Detailed Tab Specifications

### Tab 1: Dettagli

**Always visible for all booking types.**

#### Sections (all non-collapsible):

**1. Tipo Prenotazione (Editable)**
- View: Badge "Tavolo" or "Rinfresco di Laurea"
- Edit: Select dropdown
- Colors: Blue for tavolo, Green for rinfresco_laurea
- Warning modal when changing from rinfresco to tavolo

**2. Informazioni Cliente (Editable)**
```
📋 Informazioni Cliente
─────────────────────────
Nome: [Text input]
Email: [Email input]
Telefono: [Text input - optional]
```
- Validation: valid email format, phone optional

**3. Dettagli Evento (Editable)**
```
📅 Dettagli Evento
─────────────────────────
Data: [Date picker]
Ora inizio: [Time picker]
Ora fine: [Time picker]
Numero ospiti: [Number input]
```
- Validation: future date, end > start, guests > 0 and ≤ capacity

**4. Note Speciali (Editable - tavolo only)**
```
📝 Note Speciali
─────────────────────────
[Textarea 4-5 rows]
```
- Only shown for booking_type = 'tavolo'
- For rinfresco_laurea, notes are in Tab 3

### Tab 2: Menu e Prezzi

**Only visible for rinfresco_laurea bookings.**

#### Preset Menu Badge (if applicable)
```
📋 Menu Predefinito: MENU 1
```

#### Collapsible Menu Section

**Header (always visible, clickable):**
```
🍽️ Menu Selezionato  [▼/▶]
────────────────────────────────
12 items selezionati
Totale a persona: €35.00
Totale prenotazione: €350.00 (10 ospiti)
```

**Expanded content (view mode):**
```
🍹 BEVANDE (3 items) - €45.00
  • Acqua Naturale x2 - €6.00
  • Coca Cola x5 - €15.00
  • Birra Media x4 - €24.00

🍕 PIZZA (2 items) - €48.00
  • Margherita x3 - €21.00
  • Diavola x3 - €27.00

[... other categories ...]

🍰 DOLCI (1 item) - €80.00
  • Tiramisu 2.5 kg - €80.00
```

**Styling:**
- Category headers: emoji + UPPERCASE + bold
- Items: bullet points, quantity x#, price right-aligned
- Subtotal per category

**Edit mode:**
- Section auto-expands
- Full `MenuSelection` component integrated
- All controls: add/remove items, quantities, validation
- Totals auto-calculated

### Tab 3: Intolleranze e Note

**Only visible for rinfresco_laurea bookings.**

#### Section 1: Intolleranze e Allergie

**View mode:**
```
⚠️ Intolleranze e Allergie
─────────────────────────────────

• No Lattosio - 3 ospiti
• Vegetariano - 2 ospiti
• No Glutine - 1 ospite
  Note: Celiachia certificata

[Nessuna intolleranza segnalata]  <- if empty
```

**Edit mode:**
- Full `DietaryRestrictionsSection` component
- Checkboxes for each restriction type
- Guest count inputs
- Notes textarea for "Altro"

#### Section 2: Note Speciali

**View mode:**
```
📝 Note Speciali
─────────────────────────────────

[Text content with preserved line breaks]

[Nessuna nota aggiunta]  <- if empty
```

**Edit mode:**
```
📝 Note Speciali
─────────────────────────────────
[Textarea, 4-5 rows, expandable]
```

## Responsive Design

### Desktop (≥640px)

```
┌────────────────────────────────────┐
│ Header + Close Button              │ Sticky top
├────────────────────────────────────┤
│ [Tab 1] [Tab 2] [Tab 3]           │ Sticky below header
├────────────────────────────────────┤
│                                    │
│  Tab Content                       │ Scrollable
│  (max-width: 28rem)                │
│                                    │
├────────────────────────────────────┤
│ [Modifica]          [Elimina]      │ Sticky bottom
└────────────────────────────────────┘
```

**Layout:**
- Right sidebar (existing pattern)
- Max-width: 28rem (448px)
- Full height
- Positioned: `fixed right-0 top-0 bottom-0`

### Mobile (<640px)

```
┌────────────────────────────────────┐
│ Title                          [X] │ Sticky top (60px)
├────────────────────────────────────┤
│ [📋 Dettagli] [🍽️ Menu] [⚠️ Into] │ Sticky (48px)
├────────────────────────────────────┤
│                                    │
│                                    │
│  Tab Content                       │ Scrollable
│  (100vw x calc(100vh - 180px))     │
│                                    │
│                                    │
├────────────────────────────────────┤
│ [Annulla]              [Salva]     │ Sticky bottom (72px)
└────────────────────────────────────┘
```

**Layout:**
- Full screen: `fixed inset-0` (100vw x 100vh)
- Dark overlay behind: `bg-black/50`
- Close button: 44x44px touch target (top-right)
- Reduced padding: `px-3` instead of `px-6`

**Scroll behavior:**
- Smooth scrolling: `-webkit-overflow-scrolling: touch`
- Prevent body scroll: `overscroll-behavior: contain`

## Data Flow & Mutations

### Update Mutation

**File:** `src/features/booking/hooks/useBookingMutations.ts`

**Expand `useUpdateBooking` to handle all fields:**

```typescript
export const useUpdateBooking = () => {
  return useMutation({
    mutationFn: async (data: {
      id: string
      // Existing fields
      confirmed_start?: string
      confirmed_end?: string
      num_guests?: number
      special_requests?: string

      // NEW fields
      booking_type?: 'tavolo' | 'rinfresco_laurea'
      client_name?: string
      client_email?: string
      client_phone?: string
      menu_selection?: {
        items: SelectedMenuItem[]
        tiramisu_total?: number
        tiramisu_kg?: number
      }
      menu_total_per_person?: number
      menu_total_booking?: number
      dietary_restrictions?: Array<{
        restriction: string
        guest_count: number
        notes?: string
      }>
      preset_menu?: string
    }) => {
      const { id, ...updates } = data

      // Calculate totals if menu changed
      if (updates.menu_selection) {
        const totals = calculateMenuTotals(
          updates.menu_selection,
          updates.num_guests
        )
        updates.menu_total_per_person = totals.perPerson
        updates.menu_total_booking = totals.total
      }

      const { data: updated, error } = await supabase
        .from('booking_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings'])
      toast.success('Prenotazione aggiornata')
    }
  })
}
```

### Validation Rules

**Client Information:**
- client_name: required, min 2 chars
- client_email: required, valid email format
- client_phone: optional, valid phone format if provided

**Event Details:**
- desired_date: required, must be future date
- desired_time: required, must be during business hours
- confirmed_end: must be after confirmed_start
- num_guests: required, > 0, ≤ restaurant capacity

**Menu (rinfresco_laurea only):**
- Validated by MenuSelection component
- Minimum items per category (e.g., 2 pizzas)
- Valid quantities and prices

**Dietary Restrictions:**
- If checked, guest_count must be > 0
- Guest count ≤ total num_guests

## Components to Reuse

### From BookingRequestForm

**1. MenuSelection Component**
- Path: `src/features/booking/components/MenuSelection.tsx`
- Props: `value`, `onChange`, `numGuests`
- Handles: item selection, quantities, validation, totals calculation

**2. DietaryRestrictionsSection Component**
- Path: `src/features/booking/components/DietaryRestrictionsSection.tsx`
- Props: `value`, `onChange`, `numGuests`
- Handles: restriction checkboxes, guest counts, notes

### New Sub-Components to Create

**1. CollapsibleSection**
```typescript
interface CollapsibleSectionProps {
  title: string
  icon: string
  summary: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}
```

**2. DetailsTab**
- Contains: BookingType, ClientInfo, EventDetails, SpecialNotes sections
- Manages: section-specific edit states

**3. **
- Contains: PresetMenuBadge, CollapsibleMenuSection
- Manages: menu expansion state

**4. DietaryTab**
- Contains: DietaryRestrictionsSection, SpecialNotesSection
- Manages: dietary data display/edit

## Testing Strategy

### E2E Tests (Playwright)

**File:** `e2e/booking-details-modal.spec.ts`

**Critical test cases:**

1. **Tab visibility based on booking type**
   - tavolo: only 1 tab
   - rinfresco_laurea: 3 tabs

2. **Data display completeness**
   - All fields from database visible
   - Menu items grouped by category
   - Dietary restrictions listed
   - Totals calculated correctly

3. **Edit functionality**
   - All fields become editable
   - Client info can be modified
   - Menu can be edited via MenuSelection
   - Dietary restrictions can be modified
   - booking_type change triggers warning

4. **Responsive behavior**
   - Mobile: full screen, large close button
   - Desktop: sidebar layout
   - Tabs are touch-friendly (44px height)
   - Content scrolls correctly

5. **Save/Cancel behavior**
   - Save: updates database, shows success toast
   - Cancel: discards changes, restores original values
   - Validation errors prevent save

6. **Menu collapsible section**
   - Click to expand/collapse
   - Summary always visible
   - Auto-expands in edit mode

### Visual Regression Tests

**Screenshots:**
- `booking-modal-desktop-view.png`
- `booking-modal-mobile-view.png`
- `booking-modal-edit-mode.png`
- `booking-modal-menu-expanded.png`

## Performance Optimizations

### 1. Memoization
```typescript
const menuTotals = useMemo(() =>
  calculateMenuTotals(formData.menu_selection, formData.num_guests),
  [formData.menu_selection, formData.num_guests]
)

const groupedMenuItems = useMemo(() =>
  groupItemsByCategory(formData.menu_selection?.items),
  [formData.menu_selection]
)
```

### 2. Lazy Tab Rendering
- Only render active tab content
- Avoid rendering all 3 tabs simultaneously

### 3. Debounced Calculations
- Debounce menu total calculations (300ms)
- Prevent excessive recalculations on quantity changes

## Accessibility

**ARIA attributes:**
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tabs: `role="tablist"`, `role="tab"`, `aria-selected`
- Close button: `aria-label="Chiudi dettagli prenotazione"`

**Keyboard navigation:**
- Tab: navigate between form fields
- Escape: close modal
- Enter on Save: submit form

**Focus management:**
- On open: focus close button
- In edit mode: focus first editable field
- After save: return focus to calendar

## Implementation Phases

### Phase 1: Tab Structure & Navigation (Core)
1. Implement dynamic tab calculation based on booking_type
2. Create TabNavigation component with sticky positioning
3. Create shell for DetailsTab, , DietaryTab
4. Implement tab switching logic
5. Test tab visibility for both booking types

### Phase 2: DetailsTab Implementation
1. Create BookingType section with select (edit mode)
2. Implement booking_type change warning modal
3. Create ClientInfo section with inputs (edit mode)
4. Create EventDetails section with date/time pickers (edit mode)
5. Create SpecialNotes section (conditional based on booking_type)

### Phase 3:  Implementation
1. Create CollapsibleSection component
2. Implement menu display grouped by category (view mode)
3. Add menu summary (item count, totals)
4. Integrate MenuSelection component (edit mode)
5. Implement auto-expand on edit mode
6. Add preset_menu badge display

### Phase 4: DietaryTab Implementation
1. Create dietary restrictions display (view mode)
2. Integrate DietaryRestrictionsSection (edit mode)
3. Create special notes section
4. Handle empty states

### Phase 5: Edit Mode & Mutations
1. Implement single Edit button toggle
2. Update footer buttons (edit/save/cancel/delete)
3. Expand useUpdateBooking mutation for all new fields
4. Add validation logic
5. Handle save success/error states
6. Implement cancel (discard changes)

### Phase 6: Mobile Optimization
1. Implement full-screen layout for mobile
2. Add dark overlay
3. Create large close button (44x44px)
4. Adjust padding for mobile (px-3)
5. Test scroll behavior and sticky elements
6. Test touch interactions

### Phase 7: Testing & Polish
1. Write E2E tests for all scenarios
2. Visual regression tests
3. Test on real mobile devices
4. Performance optimization (memoization, lazy rendering)
5. Accessibility audit
6. Code review

## Success Criteria

- [ ] All booking data visible (menu, dietary, totals)
- [ ] All relevant fields editable (including client info and booking_type)
- [ ] Tab navigation works correctly for both booking types
- [ ] Menu section is collapsible
- [ ] Edit mode works with single button
- [ ] booking_type change shows warning and clears data appropriately
- [ ] Mobile: full screen layout (100vh)
- [ ] Mobile: large, visible close button
- [ ] Tab bar sticky on scroll
- [ ] All E2E tests pass
- [ ] No visual regressions
- [ ] Accessible (ARIA, keyboard navigation)

## Files to Modify

1. `src/features/booking/components/BookingDetailsModal.tsx` - Complete rewrite
2. `src/features/booking/hooks/useBookingMutations.ts` - Expand useUpdateBooking
3. `e2e/booking-details-modal.spec.ts` - New comprehensive test file

## Files to Create

1. `src/features/booking/components/DetailsTab.tsx` - Tab 1 content
2. `src/features/booking/components/.tsx` - Tab 2 content
3. `src/features/booking/components/DietaryTab.tsx` - Tab 3 content
4. `src/features/booking/components/CollapsibleSection.tsx` - Reusable collapsible UI

---

**Design approved:** 2025-01-27
**Ready for implementation:** ✅
