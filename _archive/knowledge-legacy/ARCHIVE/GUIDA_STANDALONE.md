# 🚀 Guida per Rendere il Calendario Standalone

## 📋 Checklist File Copiati

### ✅ File Calendar Core (2 files)
- `src/features/calendar/CalendarPage.tsx` ✅ COPIA COMPLETATA
- `src/features/calendar/Calendar.tsx` ✅ COPIA COMPLETATA
- `src/features/calendar/calendar-custom.css` ✅ COPIA COMPLETATA

### ✅ Form Inserimento Mansioni (1 file)
- `src/features/calendar/components/GenericTaskForm.tsx` ✅ COPIA COMPLETATA

### ✅ Componenti Supporto (17 files)
- `src/features/calendar/components/AlertModal.tsx` ✅
- `src/features/calendar/components/CalendarConfigModal.tsx` ✅
- `src/features/calendar/components/CalendarEventLegend.tsx` ✅
- `src/features/calendar/components/CalendarFilters.tsx` ✅
- `src/features/calendar/components/CalendarLegend.tsx` ✅
- `src/features/calendar/components/CategoryEventsModal.tsx` ✅
- `src/features/calendar/components/EventBadge.tsx` ✅
- `src/features/calendar/components/EventModal.tsx` ✅
- `src/features/calendar/components/FilterPanel.tsx` ✅
- `src/features/calendar/components/HorizontalCalendarFilters.tsx` ✅
- `src/features/calendar/components/index.ts` ✅
- `src/features/calendar/components/MacroCategoryModal.tsx` ✅
- `src/features/calendar/components/NewCalendarFilters.tsx` ✅
- `src/features/calendar/components/ProductExpiryModal.tsx` ✅
- `src/features/calendar/components/QuickActions.tsx` ✅
- `src/features/calendar/components/ViewSelector.tsx` ✅

### ✅ Hooks Calendar (7 files)
- `src/features/calendar/hooks/useGenericTasks.ts` ✅
- `src/features/calendar/hooks/useAggregatedEvents.ts` ✅
- `src/features/calendar/hooks/useCalendar.ts` ✅
- `src/features/calendar/hooks/useCalendarAlerts.ts` ✅
- `src/features/calendar/hooks/useCalendarEvents.ts` ✅
- `src/features/calendar/hooks/useFilteredEvents.ts` ✅
- `src/features/calendar/hooks/useMacroCategoryEvents.ts` ✅

### ✅ Utilities (5 files)
- `src/features/calendar/utils/colorUtils.ts` ✅
- `src/features/calendar/utils/eventTransform.ts` ✅
- `src/features/calendar/utils/haccpDeadlineGenerator.ts` ✅
- `src/features/calendar/utils/recurrenceScheduler.ts` ✅
- `src/features/calendar/utils/temperatureCheckGenerator.ts` ✅

### ✅ Types (2 files)
- `src/types/calendar.ts` ✅
- `src/types/calendar-filters.ts` ✅

---

## 🔧 Modifiche Necessarie per Standalone

### 1. CalendarPage.tsx - Rimuovi Dipendenze da Altre Feature

**File:** `src/features/calendar/CalendarPage.tsx`

**RIGHE 27-29** - Rimuovere:
```typescript
import { useStaff } from '@/features/management/hooks/useStaff'
import { useDepartments } from '@/features/management/hooks/useDepartments'
import { useProducts } from '@/features/inventory/hooks/useProducts'
```

**RIGHE 62-64** - Sostituire con:
```typescript
// const { staff } = useStaff()
// const { departments } = useDepartments()
// const { products } = useProducts()

// ✅ MOCK DATA PER STANDALONE
const staff = []
const departments = []
const products = []
```

**DIPENDENZA useCalendarSettings** - Creare versione simplificata:
```typescript
// Sostituire:
const { settings: calendarSettings, isLoading: settingsLoading, isConfigured } = useCalendarSettings()

// Con:
const calendarSettings = null // O caricare da localStorage
const settingsLoading = false
const isConfigured = () => true // Per ora sempre configurato
```

**RIGHE 313-376** - `handleProductExpiryComplete` - OPZIONALE
Questo gestisce scadenze prodotti. Puoi rimuoverlo se non serve.

---

### 2. useAggregatedEvents.ts - Semplificare

**File:** `src/features/calendar/hooks/useAggregatedEvents.ts`

**RIGHE 42-47** - Rimuovere:
```typescript
const { maintenanceTasks, isLoading: maintenanceLoading } = useMaintenanceTasks()
const { conservationPoints, isLoading: pointsLoading } = useConservationPoints()
const { staff, isLoading: staffLoading } = useStaff()
const { products, isLoading: productsLoading } = useProducts()
```

**RIGHE 48-49** - Mantenere SOLO:
```typescript
const { tasks: genericTasks, isLoading: genericTasksLoading } = useGenericTasks()
```

**RIGHE 101-116** - Sostituire `maintenanceEvents`:
```typescript
const maintenanceEvents = useMemo(() => {
  return [] // Empty per standalone
}, [])
```

**RIGHE 118-131** - Sostituire `haccpExpiryEvents`:
```typescript
const haccpExpiryEvents = useMemo(() => {
  return [] // Empty per standalone
}, [])
```

**RIGHE 153-167** - Sostituire `productExpiryEvents`:
```typescript
const productExpiryEvents = useMemo(() => {
  return [] // Empty per standalone
}, [])
```

**RIGHE 169-172** - Sostituire `haccpDeadlineEvents`:
```typescript
const haccpDeadlineEvents = useMemo(() => {
  return [] // Empty per standalone
}, [])
```

**RIGHE 174-181** - Sostituire `temperatureEvents`:
```typescript
const temperatureEvents = useMemo(() => {
  return [] // Empty per standalone
}, [])
```

**RIMUOVERE le funzioni di conversione:**
- `convertMaintenanceTaskToEvent()` ❌
- `convertHaccpExpiryToEvent()` ❌
- `convertProductExpiryToEvent()` ❌

**MANTENERE SOLO: `expandRecurringTask()` e `convertGenericTaskToEvent()`

---

### 3. useFilteredEvents.ts - Semplificare

**File:** `src/features/calendar/hooks/useFilteredEvents.ts`

**RIGHE 23-31** - Sostituire con:
```typescript
const isLoading = false

const userStaffMember = null // Per standalone: mostra tutto
```

**RIGHE 62-104** - Semplificare `filteredEvents`:
```typescript
const filteredEvents = useMemo(() => {
  // Per standalone: restituisci tutti gli eventi
  return events || []
}, [events])
```

---

### 4. useGenericTasks.ts - Sostituire Supabase

**File:** `src/features/calendar/hooks/useGenericTasks.ts`

**RIGHE 2-4** - Sostituire imports:
```typescript
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { supabase } from '@/lib/supabase/client'
// import { useAuth } from '@/hooks/useAuth'

// Con:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Mock localStorage client
const localStorageClient = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
}
```

**RIGHE 136-184** - Sostituire `queryFn` con localStorage:
```typescript
queryFn: async (): Promise<GenericTask[]> => {
  const stored = localStorage.getItem('generic-tasks')
  return stored ? JSON.parse(stored) : []
}
```

**RIGHE 187-251** - Sostituire `createTaskMutation`:
```typescript
mutationFn: async (input: CreateGenericTaskInput) => {
  const tasks = JSON.parse(localStorage.getItem('generic-tasks') || '[]')
  const newTask = {
    id: crypto.randomUUID(),
    ...input,
    created_at: new Date(),
    updated_at: new Date(),
    status: 'pending',
    priority: input.priority || 'medium',
  }
  
  tasks.push(newTask)
  localStorage.setItem('generic-tasks', JSON.stringify(tasks))
  
  return newTask
}
```

**RIGHE 254-282** - Sostituire `deleteTaskMutation`:
```typescript
mutationFn: async (taskId: string) => {
  const tasks = JSON.parse(localStorage.getItem('generic-tasks') || '[]')
  const filtered = tasks.filter((t: GenericTask) => t.id !== taskId)
  localStorage.setItem('generic-tasks', JSON.stringify(filtered))
}
```

**RIGHE 285-413** - Sostituire `completeTaskMutation`:
```typescript
mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
  const completions = JSON.parse(localStorage.getItem('task-completions') || '[]')
  const newCompletion = {
    id: crypto.randomUUID(),
    task_id: taskId,
    completed_at: new Date(),
    notes,
    created_at: new Date(),
    updated_at: new Date(),
  }
  
  completions.push(newCompletion)
  localStorage.setItem('task-completions', JSON.stringify(completions))
  
  return newCompletion
}
```

**RIGHE 477-504** - Sostituire `fetchCompletions`:
```typescript
const fetchCompletions = async (taskId: string): Promise<TaskCompletion[]> => {
  const completions = JSON.parse(localStorage.getItem('task-completions') || '[]')
  return completions.filter((c: TaskCompletion) => c.task_id === taskId)
}
```

**RIMUOVERE righe 365-386** - Activity tracking (opzionale per standalone)

---

### 5. Authentication Hook - Creare Mock

**Crea:** `src/hooks/useAuth.ts` (SEMPLIFICATO)

```typescript
export const useAuth = () => {
  return {
    user: { id: 'mock-user-id' },
    companyId: 'mock-company-id',
    sessionId: 'mock-session-id',
    userProfile: {
      staff_id: 'mock-staff-id',
      role: 'admin' as const,
      category: 'all',
    },
    userRole: 'admin' as const,
    isLoading: false,
  }
}
```

---

### 6. Calendar Settings Hook - Creare Mock

**Crea:** `src/hooks/useCalendarSettings.ts` (SEMPLIFICATO)

```typescript
export const useCalendarSettings = () => {
  const settings = {
    is_configured: true,
    fiscal_year_start: '2025-01-01',
    fiscal_year_end: '2025-12-31',
    open_weekdays: [1, 2, 3, 4, 5, 6],
    closure_dates: [],
    business_hours: {
      '1': [{ open: '09:00', close: '22:00' }],
      '2': [{ open: '09:00', close: '22:00' }],
      '3': [{ open: '09:00', close: '22:00' }],
      '4': [{ open: '09:00', close: '22:00' }],
      '5': [{ open: '09:00', close: '22:00' }],
      '6': [{ open: '09:00', close: '22:00' }],
    },
  }

  const saveSettings = (config: any) => {
    localStorage.setItem('calendar-settings', JSON.stringify(config))
  }

  return {
    settings,
    isLoading: false,
    isConfigured: () => settings.is_configured,
    saveSettings,
    isSaving: false,
  }
}
```

---

### 7. UI Components - Copiare

Devi copiare anche questi file da `src/components/ui/`:

```bash
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Label.tsx
src/components/ui/Textarea.tsx
src/components/ui/Select.tsx
src/components/ui/CollapsibleCard.tsx
src/components/ui/Modal.tsx
src/components/ui/index.ts
```

---

### 8. Utils - Copiare

Crea file: `src/lib/utils.ts`

```typescript
// Utility function per la funzione cn (classnames)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
```

---

### 9. Dipendenze - Rimuovere da package.json

Rimuovi queste dipendenze (non necessarie per standalone):
```json
{
  "@supabase/supabase-js": "^...",
  // Altre dipendenze specifiche di BHM
}
```

Mantieni solo:
- React + React DOM
- FullCalendar plugins
- React Query
- Lucide icons
- Date-fns
- Tailwind CSS
- React-toastify

---

## 🎯 Test Standalone

Dopo aver applicato tutte le modifiche, testa che:

1. ✅ Il calendario si carica correttamente
2. ✅ Il form `GenericTaskForm` funziona
3. ✅ Puoi creare nuove mansioni
4. ✅ Gli eventi vengono visualizzati nel calendario
5. ✅ Puoi filtrare gli eventi
6. ✅ Puoi completare le mansioni
7. ✅ Le statistiche si aggiornano

---

## 📦 Backup Completo

Totale file copiati: **~33 files**

- Calendar Core: 3 files
- Components: 17 files
- Hooks: 7 files
- Utils: 5 files
- Types: 2 files

---

## ⚠️ WARNING

Questa versione standalone:
- ❌ **NON ha persistenza database** - usa localStorage
- ❌ **NON ha multi-tenant** - dati locali solo
- ❌ **NON ha autenticazione** - mock data
- ❌ **NON ha dipendenze da altre feature** - solo calendario + mansioni

Per un sistema completo, devi riscrivere o adattare i file elencati sopra.

