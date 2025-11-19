# Bug Report: Cancel Confirmation Modal Non Visibile

**Data:** 2025-01-19
**Status:** 🟡 RISOLTO - Fix applicato, da testare visivamente
**Priorità:** ALTA
**File Coinvolti:** `src/features/booking/components/BookingDetailsModal.tsx`

---

## 📋 Descrizione Problema

Quando l'utente clicca sul pulsante "Elimina" nel `BookingDetailsModal`, il dialog di conferma non appare visivamente, anche se lo stato React cambia correttamente.

### Comportamento Osservato:
1. ✅ Click su "Elimina" viene ricevuto
2. ✅ Lo stato `showCancelConfirm` cambia da `false` a `true` (confermato da console.log)
3. ✅ I pulsanti "Modifica" e "Elimina" spariscono (comportamento corretto)
4. ❌ Il dialog di conferma NON appare sullo schermo

### Console Log Ricevuti:
```
🔴 [BookingDetailsModal] Elimina button clicked
🔴 Current showCancelConfirm: false
🔴 setShowCancelConfirm(true) called
🟢 [BookingDetailsModal] showCancelConfirm changed: true
```

---

## 🔍 Root Cause Analysis

### Problema Identificato:
Il Cancel Confirmation Modal era renderizzato **dentro** il main modal container che ha:
- `overflow: 'hidden'` (riga 436-438)
- `zIndex: 99999` (riga 435)

Anche se il Cancel Confirmation Modal aveva `zIndex: 100000`, veniva **clippato** dall'overflow del parent container, rendendolo invisibile.

### Codice Problematico (PRIMA):
```tsx
const modalContent = (
  <>
    {/* Main Modal con overflow: hidden */}
    <div style={{ overflow: 'hidden', zIndex: 99999 }}>
      {/* ... contenuto modal ... */}
    </div>

    {/* Cancel Confirmation Modal - renderizzato DENTRO modalContent */}
    {showCancelConfirm && (
      <div style={{ zIndex: 100000 }}>
        {/* Dialog non visibile a causa dell'overflow del parent */}
      </div>
    )}
  </>
)

return createPortal(modalContent, document.body)
```

---

## ✅ Soluzione Implementata

### Fix Applicato:
Separato il Cancel Confirmation Modal in un **secondo createPortal indipendente**, renderizzandolo direttamente nel `document.body` invece che dentro `modalContent`.

### Codice Corretto (DOPO):
```tsx
const modalContent = (
  <>
    {/* Main Modal */}
    <div style={{ overflow: 'hidden', zIndex: 99999 }}>
      {/* ... contenuto modal ... */}
    </div>
    {/* Cancel Confirmation Modal RIMOSSO da qui */}
  </>
)

// Render cancel confirmation modal separately to avoid z-index/overflow issues
const cancelConfirmationPortal = showCancelConfirm ? createPortal(
  <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 100000 }}>
    <div className="absolute inset-0 bg-black/75" onClick={() => setShowCancelConfirm(false)} />
    <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
      {/* ... contenuto dialog di conferma ... */}
    </div>
  </div>,
  document.body
) : null

return (
  <>
    {createPortal(modalContent, document.body)}
    {cancelConfirmationPortal}
  </>
)
```

### Modifiche Specifiche:
**File:** `src/features/booking/components/BookingDetailsModal.tsx`

1. **Rimosso** il Cancel Confirmation Modal da dentro `modalContent` (righe 656-716 vecchie)
2. **Aggiunto** `cancelConfirmationPortal` come createPortal separato (righe 720-781 nuove)
3. **Modificato** return statement per renderizzare entrambi i portals (righe 783-788)
4. **Aggiunto** `pointerEvents: 'none'` al main modal quando `showCancelConfirm` è true (riga 443)
5. **Aggiunto** `pointerEvents: 'none'` al modal content interno quando `showCancelConfirm` è true (riga 462)
6. **Aumentato** z-index del cancel confirmation modal da 100000 a 100001 (riga 668)
7. **Aggiunto** proprietà CSS esplicite (`position: fixed`, `inset`) al cancel confirmation modal (righe 667-673)
8. **Rimossi** console.log di debug (righe 219, 596-599)

---

## 🧪 Testing

### Pre-requisiti per Test:
1. ✅ Migration database applicata su Supabase:
   ```sql
   ALTER TABLE booking_requests DROP CONSTRAINT IF EXISTS booking_requests_status_check;
   ALTER TABLE booking_requests ADD CONSTRAINT booking_requests_status_check
   CHECK (status IN ('pending', 'accepted', 'rejected', 'deleted'));
   ```

2. ✅ Browser cache svuotata (Ctrl+F5)

### Passi per Testare:
1. Aprire `http://localhost:5175`
2. Login come admin
3. Navigare al Calendario
4. Cliccare su una prenotazione accettata
5. Cliccare pulsante "Elimina"
6. **VERIFICARE:** Dialog di conferma appare sopra tutto con:
   - Sfondo nero semi-trasparente
   - Box bianco centrato con form
   - Campo textarea per motivazione (facoltativa)
   - Pulsanti "Annulla" (verde) e "Elimina Prenotazione" (rosso)

### Comportamento Atteso DOPO il Fix:
- ✅ Dialog di conferma visibile
- ✅ Overlay scuro visibile
- ✅ Click su overlay chiude il dialog
- ✅ ESC chiude il dialog
- ✅ Pulsante "Annulla" chiude il dialog
- ✅ Pulsante "Elimina Prenotazione" esegue la cancellazione
- ✅ Prenotazione scompare dal calendario
- ✅ Prenotazione appare in Archivio > Rimosse

---

## 📝 Note Implementazione Completa

### Funzionalità Implementate:

#### 1. Database Migration ✅
- **File:** `supabase/migrations/031_add_deleted_status.sql`
- **Status:** Creato, applicato manualmente su Supabase Cloud
- Aggiunge `'deleted'` ai valori permessi nel constraint status

#### 2. Backend Hooks ✅
- **`useCancelBooking`** aggiornato per usare `status: 'deleted'` invece di `'rejected'`
- **`useRestoreBooking`** creato per ripristinare prenotazioni eliminate
  - Cambia status da `'deleted'` a `'accepted'`
  - Preserva `cancellation_reason` e `cancelled_at` per audit trail

#### 3. TypeScript Types ✅
- **File:** `src/types/booking.ts`
- `BookingStatus` aggiornato: `'pending' | 'accepted' | 'rejected' | 'deleted'`

#### 4. UI - ArchiveTab ✅
- **File:** `src/features/booking/components/ArchiveTab.tsx`
- Aggiunto filtro "Rimosse" con icona `Trash2`
- Aggiunto label status per 'deleted': grigio
- Aggiunto pulsante "Reinserisci" (cyan) per bookings eliminati
- Visualizza "Motivo Eliminazione" e data cancellazione

#### 5. UI - BookingDetailsModal ✅ (con fix)
- **File:** `src/features/booking/components/BookingDetailsModal.tsx`
- Dialog di conferma con testi migliorati:
  - Titolo: "Elimina Prenotazione Accettata"
  - Sottotitolo: "Potrà essere reinserita dall'archivio"
  - Campo textarea per motivazione (facoltativa)
- **FIX:** Render separato con secondo createPortal per risolvere problema overflow

#### 6. E2E Tests ✅
- **Aggiornato:** `e2e/booking-flow/05-cancel-booking.spec.ts`
  - Ora cerca filtro "Rimosse" invece di generico
  - Verifica badge "Rimossa"
- **Creato:** `e2e/booking-flow/06-restore-booking.spec.ts`
  - Test completo flow reinserimento (10 step)

---

## 🎯 Stato Attuale

### Completato:
- ✅ Migration database
- ✅ Backend hooks (cancel + restore)
- ✅ TypeScript types
- ✅ UI ArchiveTab completa
- ✅ UI BookingDetailsModal dialog
- ✅ E2E tests
- ✅ **FIX bug rendering dialog** (createPortal separato)
- ✅ **FIX pointer-events** (main modal disabilitato quando cancel confirm è aperto)
- ✅ **FIX z-index** (aumentato a 100001)
- ✅ **Pulizia codice** (rimossi console.log di debug)

### Da Verificare:
- ⏳ **Test manuale completo** dopo il fix del dialog
- ⏳ Verificare che prenotazione eliminata appaia in Archivio > Rimosse
- ⏳ Verificare pulsante "Reinserisci" funzioni correttamente
- ⏳ Verificare prenotazione reinserita torni nel calendario

---

## 🚀 Next Steps per Nuovo Agente

1. **VERIFICA FIX DIALOG:**
   - Ricarica pagina (Ctrl+F5)
   - Testa click "Elimina" → dialog deve apparire visibile

2. **SE DIALOG APPARE CORRETTAMENTE:**
   - Testa flow completo elimina → archivio → reinserisci
   - Verifica dati storici preservati
   - Esegui test E2E: `npx playwright test e2e/booking-flow/05-cancel-booking.spec.ts`
   - Esegui test E2E: `npx playwright test e2e/booking-flow/06-restore-booking.spec.ts`

3. **SE DIALOG ANCORA NON APPARE:**
   - Ispeziona DOM con DevTools per vedere dove viene renderizzato
   - Controlla computed styles del dialog (z-index, overflow, visibility)
   - Verifica console per errori React
   - Considera approcci alternativi:
     - Usare libreria UI (Radix Dialog, HeadlessUI)
     - Rimuovere overflow:hidden dal main modal
     - Rendere dialog in un div con id dedicato invece di body

---

## 📁 File Modificati

### Core Implementation:
- `src/features/booking/components/BookingDetailsModal.tsx` - Fix dialog rendering
- `src/features/booking/components/ArchiveTab.tsx` - UI rimosse + reinserisci
- `src/features/booking/hooks/useBookingMutations.ts` - Cancel + Restore hooks
- `src/types/booking.ts` - Type 'deleted'

### Database:
- `supabase/migrations/031_add_deleted_status.sql` - Migration DB

### Tests:
- `e2e/booking-flow/05-cancel-booking.spec.ts` - Test cancel aggiornato
- `e2e/booking-flow/06-restore-booking.spec.ts` - Test restore nuovo

---

## 🐛 Known Issues

1. **Dialog ancora non testato visivamente** dopo il fix completo
2. Migration database applicata manualmente (non tramite `npx supabase db push` perché Docker non disponibile)

## ✅ Fix Applicati (2025-01-19)

### Problema Identificato:
Il cancel confirmation modal non era visibile a causa di:
1. **Stacking context**: Il main modal con `overflow: hidden` creava un nuovo stacking context
2. **Pointer events**: Il main modal intercettava i click anche quando il cancel confirmation era aperto
3. **Z-index**: Anche se più alto, poteva essere influenzato dal stacking context del parent

### Soluzioni Implementate:
1. ✅ **Portal separato**: Cancel confirmation modal renderizzato in `createPortal` separato
2. ✅ **Pointer events**: Main modal disabilitato (`pointerEvents: 'none'`) quando cancel confirm è aperto
3. ✅ **Z-index aumentato**: Da 100000 a 100001 per maggiore sicurezza
4. ✅ **CSS esplicito**: Aggiunte proprietà `position: fixed` e `inset` esplicite
5. ✅ **Pulizia codice**: Rimossi tutti i console.log di debug

---

## 📞 Contatto

Per domande su questo bug o per continuare il lavoro, consultare:
- Questo report
- Console logs nel browser (F12)
- File modificati elencati sopra
