# BookingDetailsModal Bug Fixes - Design Document

**Date:** 2025-11-20
**Status:** Approved for Implementation

## Overview

This design addresses two critical bugs in the BookingDetailsModal component that affect user experience during booking editing.

## Bugs Identified

### Bug #1: Modal Closes During Text Selection

**Problem:**
When a user selects text in input fields or textareas and releases the mouse outside the modal bounds, the modal unexpectedly closes.

**Root Cause:**
The backdrop has `onClick={onClose}` at [BookingDetailsModal.tsx:616](../../src/features/booking/components/BookingDetailsModal.tsx#L616). When mouse down occurs inside modal content but mouse up occurs outside (during text selection), the click event fires on the backdrop.

**User Impact:**
- Cannot select text that spans beyond visible area
- Frustrating user experience when trying to copy/paste
- Accidental modal closure loses context

### Bug #2: Number of Guests Input Validation

**Problem:**
The numGuests input field at [DetailsTab.tsx:184](../../src/features/booking/components/DetailsTab.tsx#L184) uses `parseInt(e.target.value) || 1`, which immediately forces empty values to `1`. Users cannot clear the field to type a new number.

**Root Cause:**
```typescript
onChange={(e) => onFormDataChange('numGuests', parseInt(e.target.value) || 1)}
```
The `|| 1` coercion happens during `onChange`, preventing natural editing flow.

**User Impact:**
- Cannot backspace and type a new number naturally
- Have to select-all and overwrite instead of clearing
- Poor UX for a basic input field

## Design Solutions

### Solution #1: Text Selection Fix

**Approach:**
Track whether the mouse interaction started inside the modal content. Only close the modal if the click originated on the backdrop itself.

**Implementation:**

1. Add state to track interaction origin:
```typescript
const [mouseDownInsideModal, setMouseDownInsideModal] = useState(false)
```

2. Track mouse down on modal content:
```typescript
<div
  onMouseDown={() => setMouseDownInsideModal(true)}
  onClick={(e) => e.stopPropagation()}
>
  {/* Modal content */}
</div>
```

3. Modified backdrop click handler:
```typescript
<div
  onClick={() => {
    if (!mouseDownInsideModal) {
      onClose()
    }
    setMouseDownInsideModal(false) // Reset after click
  }}
>
```

4. Reset on mouse up (global listener):
```typescript
useEffect(() => {
  const handleMouseUp = () => setMouseDownInsideModal(false)
  document.addEventListener('mouseup', handleMouseUp)
  return () => document.removeEventListener('mouseup', handleMouseUp)
}, [])
```

**Logic Flow:**
1. User presses mouse inside modal → `mouseDownInsideModal = true`
2. User drags to select text
3. User releases mouse anywhere → Global listener resets `mouseDownInsideModal = false`
4. If backdrop receives click and `mouseDownInsideModal === false` → Close modal
5. If backdrop receives click but `mouseDownInsideModal === true` → Do NOT close

**Trade-offs:**
- **Pro:** Solves text selection issue completely
- **Pro:** Simple state machine, easy to understand
- **Pro:** No false positives
- **Con:** Adds one state variable and one event listener
- **Acceptable:** Minimal performance impact

### Solution #2: Number Input Validation

**Approach:**
Allow any value during editing (including 0 and empty). Validate only at save time with clear error message.

**Implementation:**

1. **During editing (onChange):**
```typescript
// In DetailsTab.tsx:184
onChange={(e) => {
  const value = e.target.value === '' ? 0 : parseInt(e.target.value)
  onFormDataChange('numGuests', value)
}}
```

2. **At save time (handleSave):**
```typescript
// In BookingDetailsModal.tsx:511
if (formData.numGuests < 1 || formData.numGuests > 110) {
  toast.error('Inserisci un numero valido di ospiti (minimo 1, massimo 110)')
  return
}
```

**Logic Flow:**
1. User can type any value, including clearing the field
2. Empty field → stores as `0` internally
3. User clicks "Salva"
4. Validation checks: if < 1 or > 110 → Show error
5. User corrects value → Save succeeds

**Trade-offs:**
- **Pro:** Natural editing experience
- **Pro:** Clear validation at save time
- **Pro:** Consistent with other form validations
- **Con:** User might not realize 0 is invalid until save
- **Acceptable:** Error message is clear and immediate

## Testing Strategy

### Bug #1: Text Selection Tests

**File:** `e2e/booking-details-text-selection.spec.ts`

**Test Cases:**

1. **"Should not close modal when selecting text in input fields"**
   - Open booking in modal
   - Enter edit mode
   - Simulate text selection in "Nome" field (mouse down inside, mouse up outside viewport)
   - Assert modal is still open

2. **"Should not close modal when selecting text in textarea"**
   - Enter edit mode
   - Simulate text selection in "Note Speciali" textarea
   - Assert modal is still open

3. **"Should close modal when clicking backdrop directly"**
   - Click backdrop directly (not after modal interaction)
   - Assert modal closes

### Bug #2: Number Input Tests

**File:** `e2e/booking-flow/04-modify-booking.spec.ts`

**Test Cases:**

1. **"Should allow clearing numGuests field during editing"**
   - Enter edit mode
   - Clear numGuests field completely
   - Assert field is empty (not forced to 1)

2. **"Should show error when saving with numGuests = 0"**
   - Enter edit mode
   - Set numGuests to 0
   - Click "Salva"
   - Assert toast error: "Inserisci un numero valido di ospiti (minimo 1, massimo 110)"
   - Assert modal is still open (save failed)

3. **"Should save successfully with valid numGuests"**
   - Set numGuests to 50
   - Click "Salva"
   - Assert success toast
   - Assert modal closes or edit mode exits

## Files to Modify

### 1. `src/features/booking/components/BookingDetailsModal.tsx`

**Changes:**
- Add `mouseDownInsideModal` state (after line 45)
- Add global `mouseup` listener in `useEffect` (after line 265)
- Add `onMouseDown` handler to modal content div (line 619)
- Modify backdrop `onClick` handler (line 616)
- Update `handleSave` validation message (line 511)

### 2. `src/features/booking/components/DetailsTab.tsx`

**Changes:**
- Modify numGuests `onChange` handler (line 184)
- Allow empty value or 0 during editing

### 3. `e2e/booking-details-text-selection.spec.ts` (NEW)

**Purpose:** Test text selection fix

### 4. `e2e/booking-flow/04-modify-booking.spec.ts` (MODIFY)

**Purpose:** Add numGuests validation tests

## Implementation Order

1. ✅ Write design document
2. Implement Bug #1 fix in BookingDetailsModal.tsx
3. Implement Bug #2 fix in DetailsTab.tsx + BookingDetailsModal.tsx
4. Write E2E test for Bug #1
5. Write E2E tests for Bug #2
6. Run all tests: `npm run test:e2e`
7. Run linter: `npm run lint`
8. Manual verification in browser

## Success Criteria

- ✅ Users can select text in any input/textarea without modal closing
- ✅ Users can clear numGuests field and type new value naturally
- ✅ Attempting to save with numGuests < 1 shows clear error
- ✅ Clicking backdrop directly still closes modal
- ✅ All E2E tests pass
- ✅ No linting errors
- ✅ No regression in existing functionality

## Risks and Mitigations

**Risk 1:** Global mouseup listener might interfere with other components
- **Mitigation:** Listener only sets state, doesn't prevent default or stop propagation
- **Mitigation:** Cleanup on unmount prevents memory leaks

**Risk 2:** Users might not understand why save fails with numGuests = 0
- **Mitigation:** Clear, specific error message in Italian
- **Mitigation:** Error appears immediately on save attempt

**Risk 3:** Breaking existing modal close behavior
- **Mitigation:** Comprehensive E2E tests cover all close scenarios
- **Mitigation:** Manual testing before merging

## Notes

- This design was validated through collaborative brainstorming
- Both bugs affect user experience but not data integrity
- Solutions are minimal, focused, and testable
- No changes to database schema or API contracts required
