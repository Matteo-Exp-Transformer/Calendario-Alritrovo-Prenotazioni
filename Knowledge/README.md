# 📅 Calendario Backup - BHM v.2

## Descrizione

Questa cartella contiene una **copia standalone** dei file necessari per replicare il sistema Calendario + Form Inserimento Mansioni del progetto BHM v.2.

## 🎯 Obiettivo

Creare una versione standalone del calendario che funzioni **senza dipendenze da auth system** o altre feature dell'app originale.

---

## 📁 Struttura File

```
Calendarbackup/
├── src/
│   ├── features/
│   │   └── calendar/
│   │       ├── CalendarPage.tsx          # Pagina principale calendario
│   │       ├── Calendar.tsx               # Componente FullCalendar
│   │       ├── calendar-custom.css        # Stili personalizzati
│   │       ├── components/               # Componenti UI calendario
│   │       ├── hooks/                     # Custom hooks
│   │       └── utils/                     # Utility functions
│   ├── types/
│   │   ├── calendar.ts                    # Type definitions eventi
│   │   └── calendar-filters.ts            # Type definitions filtri
│   ├── components/
│   │   └── ui/                           # UI components condivisi
│   ├── hooks/                            # Base hooks
│   └── lib/
│       └── utils.ts                      # Utility functions
└── README.md
```

---

## 📋 File Contenuti

### Core Calendar Components
- ✅ `CalendarPage.tsx` - Pagina principale con stats e filtri
- ✅ `Calendar.tsx` - Componente FullCalendar integrato
- ✅ `calendar-custom.css` - Stili CSS personalizzati

### Form Inserimento Mansioni
- ✅ `components/GenericTaskForm.tsx` - Form per creare nuove mansioni

### Componenti di Supporto
- ✅ `components/ViewSelector.tsx` - Selettore vista (anno/mese/settimana/giorno)
- ✅ `components/NewCalendarFilters.tsx` - Filtri calendario moderni
- ✅ `components/MacroCategoryModal.tsx` - Modal attività per categoria
- ✅ `components/EventDetailsModal.tsx` - Modal dettagli evento
- ✅ `components/AlertModal.tsx` - Modal alert eventi urgenti
- ✅ `components/CalendarConfigModal.tsx` - Configurazione calendario
- ✅ `components/ProductExpiryModal.tsx` - Modal scadenze prodotti

### Hooks
- ✅ `hooks/useGenericTasks.ts` - Hook per gestire mansioni generiche
- ✅ `hooks/useAggregatedEvents.ts` - Hook per aggregare eventi
- ✅ `hooks/useFilteredEvents.ts` - Hook per filtrare eventi per ruolo
- ✅ `hooks/useCalendarAlerts.ts` - Hook per calcolare alert
- ✅ `hooks/useMacroCategoryEvents.ts` - Hook per eventi macro categoria

### Utilities
- ✅ `utils/eventTransform.ts` - Trasformazione eventi per FullCalendar
- ✅ `utils/recurrenceScheduler.ts` - Schedulazione ricorrenze
- ✅ `utils/colorUtils.ts` - Gestione colori eventi
- ✅ `utils/haccpDeadlineGenerator.ts` - Generatore scadenze HACCP
- ✅ `utils/temperatureCheckGenerator.ts` - Generatore controlli temperatura

### Types
- ✅ `types/calendar.ts` - Definizioni tipi eventi e configurazione
- ✅ `types/calendar-filters.ts` - Definizioni filtri e utilities

---

## ⚠️ File MANCANTI (da aggiungere per standalone)

Per creare una versione completamente standalone, dovrai anche copiare o riscrivere:

### 1. UI Components (da `src/components/ui/`)
```
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Label.tsx
src/components/ui/Textarea.tsx
src/components/ui/Select.tsx
src/components/ui/CollapsibleCard.tsx
src/components/ui/Modal.tsx
```

### 2. Base Hooks (da `src/hooks/`)
```
src/hooks/useAuth.ts (SEMPLIFICATO - senza company/multi-tenant)
src/hooks/useCalendarSettings.ts
```

### 3. Dipendenze da altre feature (da riscrivere senza dipendenze)
```
❌ src/features/management/hooks/useStaff.ts        # DIPENDENZA
❌ src/features/management/hooks/useDepartments.ts  # DIPENDENZA
❌ src/features/inventory/hooks/useProducts.ts      # DIPENDENZA
❌ src/features/conservation/hooks/useMaintenanceTasks.ts # DIPENDENZA
❌ src/features/conservation/hooks/useConservationPoints.ts # DIPENDENZA
```

### 4. Dipendenze Globali
```
❌ src/lib/supabase/client.ts         # Database client
❌ src/lib/utils.ts                    # Utility functions
❌ package.json                        # Dependencies
```

---

## 🔧 Come Rendere Standalone

### Step 1: Rimuovi Dipendenze da Altre Feature

Nel file `CalendarPage.tsx`, le seguenti righe devono essere rimosse o sostituite:

```typescript
// ❌ RIMUOVERE:
import { useStaff } from '@/features/management/hooks/useStaff'
import { useDepartments } from '@/features/management/hooks/useDepartments'
import { useProducts } from '@/features/inventory/hooks/useProducts'

// ❌ SOSTITUIRE con:
const staff = []
const departments = []
const products = []
```

### Step 2: Semplifica `useAggregatedEvents.ts`

Rimuovi tutte le dipendenze da:
- `useMaintenanceTasks` (conservation)
- `useConservationPoints` (conservation)
- `useProducts` (inventory)

Mantieni SOLO:
- `useGenericTasks` (gestione mansioni generiche)

### Step 3: Semplifica Autenticazione

Sostituisci `useAuth` con un hook mock che restituisce solo dati di base necessari.

### Step 4: Rimuovi Dipendenze Database

Il file `useGenericTasks.ts` usa Supabase. Per standalone, dovrai:
- Sostituire `supabase` con storage locale (localStorage/IndexedDB)
- Rimuovere tutte le query/mutation
- Implementare data persistence local

---

## 📦 Stack Tecnologico Richiesto

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@fullcalendar/react": "^6.1.10",
    "@fullcalendar/daygrid": "^6.1.10",
    "@fullcalendar/timegrid": "^6.1.10",
    "@fullcalendar/interaction": "^6.1.10",
    "@fullcalendar/list": "^6.1.10",
    "@fullcalendar/multimonth": "^6.1.10",
    "@tanstack/react-query": "^5.62.2",
    "react-toastify": "^10.x",
    "lucide-react": "^0.263.x",
    "date-fns": "^2.30.0",
    "tailwindcss": "^3.4.17"
  }
}
```

---

## 🎨 Funzionalità Clonate

### ✅ Calendario
- [x] Visualizzazione Anno/Mese/Settimana/Giorno
- [x] Sistema filtri (per reparto, stato, tipo)
- [x] Statistiche e dashboard
- [x] Alert eventi urgenti
- [x] Configurazione calendario

### ✅ Inserimento Mansioni
- [x] Form completo con tutti i campi
- [x] Gestione frequenza (giornaliera, settimanale, mensile, annuale, custom)
- [x] Assegnazione per ruolo/categoria/dipendente specifico
- [x] Gestione orari attività (fascia oraria, start/end time)
- [x] Validazione form
- [x] Creazione task ricorrenti

### ✅ Gestione Eventi
- [x] MacroCategory modal per visualizzare attività del giorno
- [x] Completamento/ripristino attività
- [x] EventDetails modal per dettagli completo
- [x] Alert modal per eventi urgenti

### ✅ Sistema Ricorrenze
- [x] Generazione automatica occorrenze multiple
- [x] Calcolo periodo di completamento
- [x] Tracking completamenti

---

## 🚀 Prossimi Passi

1. **Rimuovi dipendenze** da management/inventory/conservation
2. **Semplifica autenticazione** - usa localStorage o mock
3. **Sostituisci Supabase** - usa localStorage/IndexedDB per data persistence
4. **Rimuovi filtri staff/departments** - o implementa mock data
5. **Testa standalone** - verifica che tutto funzioni senza app

---

## 📝 Note

### File Blindati (🔒 Locked)
Alcuni file hanno commenti `LOCKED` che indicano test completi e funzionalità verificate:
- `CalendarPage.tsx` - Test coverage: 100%
- `Calendar.tsx` - Test coverage: 100%
- `CalendarConfigModal.tsx` - 25 test completati
- `EventDetailsModal.tsx` - 12 test completati

**⚠️ Non modificare questi file senza permesso esplicito.**

### Drag and Drop Disabilitato
Il sistema drag and drop è commentato. Per riabilitarlo, consulta i commenti nei file `CalendarPage.tsx` e `Calendar.tsx`.

---

## 📞 Supporto

Per domande sulla struttura o implementazione standalone, consulta:
- Documentazione originale in `Production/Prompt_Context/`
- File README.md principale del progetto
- Commenti nei file sorgente

