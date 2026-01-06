# Report: Capacity Warning Modal - Problema di Visualizzazione

**Data**: 2025-01-27  
**Componente**: `CapacityWarningModal`  
**Problema**: Il modal viene renderizzato (log confermano) ma non è visibile all'utente

---

## 📋 Contesto

### Obiettivo
Implementare un sistema di controllo capienza che:
1. Mostra un warning in tempo reale quando si inserisce un numero di ospiti che supera la disponibilità
2. Apre un modal di conferma quando si clicca "Crea prenotazione" con capienza superata
3. Permette all'utente di procedere comunque o annullare

### Componenti Coinvolti
- `AdminBookingForm.tsx` - Form per creare prenotazioni da admin
- `AcceptBookingModal.tsx` - Modal per accettare prenotazioni pending
- `CapacityWarningModal.tsx` - Modal di warning per capienza superata
- `Modal.tsx` - Componente base per modali
- `useCapacityCheck.ts` - Hook per calcolare disponibilità

---

## 🔍 Problema Attuale

### Sintomi
- ✅ Il modal viene renderizzato (log console confermano)
- ✅ Lo stato `showCapacityWarning` è `true`
- ✅ I dati per il modal sono corretti
- ❌ **Il modal NON è visibile all'utente**

### Log Console
```
🔵 [AdminBookingForm] Capacity check failed: {isAvailable: false, ...}
⚠️ [AdminBookingForm] Opening capacity warning modal with exceeded slots
🔵 [AdminBookingForm] Rendering capacity warning modal, showCapacityWarning: true
✅ [AdminBookingForm] Using exceededSlots from capacityCheck: {...}
✅ [AdminBookingForm] Rendering CapacityWarningModal with: {...}
✅ [Modal] Rendering modal! {isOpen: true, position: "center", size: "md", ...}
```

Tutti i log indicano che il modal dovrebbe essere visibile, ma non lo è.

---

## 🔧 Modifiche Implementate

### 1. **Rimozione Limiti Hardcoded**
**File**: `AdminBookingForm.tsx`, `BookingRequestForm.tsx`, `AcceptBookingModal.tsx`
- Rimossi `max="75"` dagli input
- Rimossa validazione `num_guests > 75`
- Rimosso limite `value <= 75` in `handleNumGuestsChange`

### 2. **Aggiunta Warning in Tempo Reale**
**File**: `AdminBookingForm.tsx` (righe 554-569)
```tsx
{capacityCheck.errorMessage && formData.desired_date && formData.desired_time && formData.num_guests > 0 && (
  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mt-2 isolate">
    <div className="flex items-start gap-2">
      <span className="text-2xl">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-800 mb-1">
          Capacità insufficiente
        </p>
        <p className="text-sm text-red-700">
          {capacityCheck.errorMessage}
        </p>
      </div>
    </div>
  </div>
)}
```
✅ **Funziona correttamente** - Il warning appare in tempo reale

### 3. **Creazione CapacityWarningModal**
**File**: `src/features/booking/components/CapacityWarningModal.tsx`
- Componente creato con struttura completa
- Usa il componente `Modal` base
- Mostra dettagli su eccedenza, capienza, totale occupato
- Due pulsanti: "Annulla" e "Procedi Comunque"

### 4. **Integrazione in AdminBookingForm**
**File**: `AdminBookingForm.tsx`

#### A. Aggiunto stato per controllo modal
```tsx
const [showCapacityWarning, setShowCapacityWarning] = useState(false)
```

#### B. Modificato handleSubmit per aprire modal
```tsx
// Check capacity before submitting - show modal if capacity exceeded
if (!capacityCheck.isAvailable) {
  if (capacityCheck.exceededSlots && capacityCheck.exceededSlots.length > 0) {
    setShowCapacityWarning(true)
    return
  }
  // Fallback: calculate from slotsStatus if needed
}
```

#### C. Renderizzato modal fuori dal form
```tsx
{/* Capacity Warning Modal - Fuori dal form per evitare problemi di rendering */}
{showCapacityWarning && (() => {
  // Calcola exceededSlot da capacityCheck o slotsStatus
  // Renderizza CapacityWarningModal
})()}
```

### 5. **Miglioramenti useCapacityCheck**
**File**: `src/features/booking/hooks/useCapacityCheck.ts`
- Aggiunto campo `exceededSlots` a `AvailabilityCheck`
- Calcola eccedenza quando `totalOccupied > capacity`
- Restituisce informazioni dettagliate su slot superati

### 6. **Tentativi di Fix per Visibilità**

#### A. Z-Index Aumentato
**File**: `src/components/ui/Modal.tsx`
- Da `z-[10001]` a `z-[100000]`
- Overlay: `zIndex: 100000`
- Modal content: `zIndex: 100001`
- Più alto di `BookingDetailsModal` (99999)

#### B. React Portal
**File**: `src/components/ui/Modal.tsx`
```tsx
import { createPortal } from 'react-dom'

// Alla fine del componente:
return createPortal(modalContent, document.body)
```
- Modal renderizzato direttamente nel `body`
- Evita problemi di overflow/z-index dei container parent

#### C. Posizionamento Esplicito
- Aggiunto `position: 'fixed'` esplicito nello style
- Aggiunto `position: 'relative'` al contenuto modal

#### D. Log per Debug
- Aggiunti log dettagliati in ogni fase
- Verifica rendering, dati, apertura/chiusura

---

## 🐛 Problema Persistente

### Stato Attuale
- ✅ Modal viene renderizzato (log confermano)
- ✅ Dati corretti passati al modal
- ✅ `isOpen={true}` confermato
- ✅ React Portal attivo
- ✅ Z-index molto alto (100000)
- ❌ **Modal NON visibile**

### Possibili Cause

1. **CSS che nasconde il modal**
   - `display: none` da qualche parte
   - `opacity: 0` o `visibility: hidden`
   - `transform: scale(0)` o simili

2. **Overlay che copre tutto**
   - L'overlay potrebbe essere sopra il modal invece che dietro
   - Z-index dell'overlay potrebbe essere errato

3. **Container parent con overflow hidden**
   - Anche con portal, potrebbe esserci qualche problema
   - Verificare se ci sono `overflow: hidden` nel body o html

4. **Problema di stacking context**
   - Qualche elemento crea un nuovo stacking context
   - `isolation: isolate` o `transform` su parent

5. **Modal renderizzato fuori viewport**
   - `top`, `left`, `right`, `bottom` potrebbero essere errati
   - `transform` che sposta il modal fuori schermo

---

## 🔍 Debug da Fare

### 1. Verificare nel DevTools
```javascript
// In console del browser:
const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
console.log('Modal element:', modal)
console.log('Computed styles:', window.getComputedStyle(modal))
console.log('Position:', modal.getBoundingClientRect())
console.log('Z-index:', window.getComputedStyle(modal).zIndex)
console.log('Display:', window.getComputedStyle(modal).display)
console.log('Visibility:', window.getComputedStyle(modal).visibility)
console.log('Opacity:', window.getComputedStyle(modal).opacity)
```

### 2. Verificare Overlay
```javascript
const overlay = document.querySelector('[aria-hidden="true"]')
console.log('Overlay:', overlay)
console.log('Overlay z-index:', window.getComputedStyle(overlay).zIndex)
console.log('Overlay position:', overlay.getBoundingClientRect())
```

### 3. Verificare Body/HTML
```javascript
console.log('Body overflow:', window.getComputedStyle(document.body).overflow)
console.log('HTML overflow:', window.getComputedStyle(document.documentElement).overflow)
console.log('Body position:', window.getComputedStyle(document.body).position)
```

### 4. Verificare Stacking Context
- Cercare elementi con `isolation: isolate`
- Cercare elementi con `transform` che potrebbero creare stacking context
- Verificare se ci sono altri modali aperti che potrebbero interferire

---

## 💡 Soluzioni da Provare

### Soluzione 1: Verificare Ordine Overlay/Modal
Il modal potrebbe essere dietro l'overlay. Verificare che:
- Overlay abbia `z-index` minore del modal
- Modal sia renderizzato DOPO l'overlay nel DOM

### Soluzione 2: Rimuovere Overlay Temporaneamente
Per test, rimuovere l'overlay e vedere se il modal appare:
```tsx
{/* Overlay */}
{/* Commentato per test */}
{/* <div className="fixed inset-0 bg-black bg-opacity-50 ... /> */}
```

### Soluzione 3: Aggiungere !important agli Style
Forzare visibilità con `!important`:
```tsx
style={{ 
  display: 'block !important', 
  visibility: 'visible !important', 
  opacity: '1 !important',
  zIndex: '100000 !important'
}}
```

### Soluzione 4: Verificare Condizione isOpen
Aggiungere log per verificare che `isOpen` sia effettivamente `true` quando il modal viene renderizzato:
```tsx
useEffect(() => {
  console.log('🔵 [CapacityWarningModal] isOpen changed:', isOpen)
  if (isOpen) {
    console.log('✅ [CapacityWarningModal] Modal should be visible')
  }
}, [isOpen])
```

### Soluzione 5: Renderizzare Modal Direttamente (Senza Componente Modal)
Come test, provare a renderizzare il modal direttamente senza usare il componente `Modal`:
```tsx
{showCapacityWarning && (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 100000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 100001
    }}>
      {/* Contenuto modal */}
    </div>
  </div>
)}
```

### Soluzione 6: Verificare React StrictMode
Se React StrictMode è attivo, potrebbe causare doppi render. Verificare se il modal viene renderizzato due volte.

### Soluzione 7: Verificare Altri Modali Aperti
Se ci sono altri modali aperti (es. `BookingDetailsModal` con z-index 99999), potrebbero interferire. Verificare se chiudere altri modali risolve il problema.

---

## 📁 File Modificati

1. `src/features/booking/components/AdminBookingForm.tsx`
   - Aggiunto stato `showCapacityWarning`
   - Modificato `handleSubmit` per aprire modal
   - Aggiunto rendering modal fuori dal form
   - Aggiunto warning in tempo reale

2. `src/features/booking/components/AcceptBookingModal.tsx`
   - Stesse modifiche di `AdminBookingForm`

3. `src/features/booking/components/CapacityWarningModal.tsx`
   - **NUOVO FILE** - Componente modal di warning

4. `src/features/booking/hooks/useCapacityCheck.ts`
   - Aggiunto campo `exceededSlots` a `AvailabilityCheck`
   - Calcolo eccedenza quando superata

5. `src/types/booking.ts`
   - Aggiornato tipo `AvailabilityCheck` con `exceededSlots`

6. `src/components/ui/Modal.tsx`
   - Aggiunto React Portal
   - Aumentato z-index a 100000
   - Aggiunto posizionamento esplicito

7. `src/features/booking/constants/capacity.ts`
   - Cambiato capienza da 100 a 75 per tutte le fasce

8. `src/features/booking/components/BookingRequestForm.tsx`
   - Rimossi limiti hardcoded (ma NO controllo capienza - come richiesto)

---

## 🎯 Stato Attuale

### ✅ Funziona
- Warning in tempo reale quando si inserisce numero ospiti
- Calcolo corretto della capienza
- Rilevamento quando si supera la capienza
- Log che confermano rendering del modal
- Dati corretti passati al modal

### ❌ Non Funziona
- **Modal non visibile all'utente** (problema principale)

---

## 🔄 Prossimi Passi

1. **Eseguire debug nel browser** usando i comandi JavaScript sopra
2. **Provare soluzioni alternative** elencate sopra
3. **Verificare se ci sono altri modali aperti** che interferiscono
4. **Testare con modal renderizzato direttamente** (senza componente Modal)
5. **Verificare CSS globali** che potrebbero nascondere il modal

---

## 📝 Note Aggiuntive

- Il componente `Modal` è stato testato (39 test passati) e funziona per altri modali
- `BookingDetailsModal` usa z-index 99999 e funziona
- Il problema potrebbe essere specifico di questo modal o del contesto in cui viene renderizzato
- React Portal dovrebbe risolvere problemi di container parent, ma potrebbe non essere sufficiente

---

## 🆘 Comandi Utili per Debug

### Verificare se modal esiste nel DOM
```javascript
document.querySelectorAll('[role="dialog"]').forEach((el, i) => {
  console.log(`Modal ${i}:`, el, {
    visible: window.getComputedStyle(el).display !== 'none',
    zIndex: window.getComputedStyle(el).zIndex,
    rect: el.getBoundingClientRect()
  })
})
```

### Forzare visibilità (test)
```javascript
const modal = document.querySelector('[aria-labelledby="modal-title"]')
if (modal) {
  modal.style.display = 'block'
  modal.style.visibility = 'visible'
  modal.style.opacity = '1'
  modal.style.zIndex = '100000'
}
```

---

**Ultimo aggiornamento**: 2025-01-27  
**Status**: 🔴 **PROBLEMA APERTO** - Modal renderizzato ma non visibile

