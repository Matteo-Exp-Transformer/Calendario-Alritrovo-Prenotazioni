# Handoff: Problema Input Numero Ospiti - Valore "1" Non Cancellabile

## 📋 Problema Originale

L'utente ha segnalato che negli input per il numero ospiti (`num_guests`/`numGuests`) appare sempre il valore "1" e non è possibile cancellarlo completamente per inserire un nuovo numero. L'utente deve tenersi "1" nella casella e non può eliminare il contenuto per riscriverlo.

### Elemento HTML Problematico
```html
<input type="number" class="flex rounded-full border bg-white shadow-sm transition-all" 
       min="1" value="1" 
       style="border-color: rgba(0, 0, 0, 0.2); max-width: 600px; height: 56px; padding: 16px; 
              font-size: 16px; font-weight: 700; background-color: rgba(255, 255, 255, 0.85); 
              backdrop-filter: blur(1px); color: black;">
```

**Requisito**: L'elemento deve risultare vuoto senza numeri inseriti, in modo da permettere all'utente di inserire numeri da zero.

---

## 🔍 Analisi del Problema

### File Coinvolti Identificati

1. **`src/features/booking/components/BookingRequestForm.tsx`**
   - Input principale per creazione prenotazioni utenti
   - Riga ~901: Input `num_guests`

2. **`src/features/booking/components/AdminBookingForm.tsx`**
   - Input per creazione prenotazioni admin
   - Riga ~581: Input `num_guests`

3. **`src/features/booking/components/DetailsTab.tsx`**
   - Input per modifica prenotazioni esistenti
   - Riga ~191: Input `numGuests`

4. **`src/features/booking/components/AcceptBookingModal.tsx`**
   - Input per accettazione prenotazioni
   - Riga ~235: Input `numGuests`

### Problemi Identificati

1. **Attributo `min="1"` su input `type="number"`**
   - Gli input HTML5 con `type="number"` e `min="1"` impediscono di inserire valori vuoti o inferiori a 1
   - Il browser forza automaticamente il valore minimo quando l'utente prova a cancellare

2. **Valore iniziale non vuoto**
   - Alcuni input potrebbero avere un valore iniziale di 1 invece di 0 o stringa vuota

3. **Gestione del valore 0**
   - Il rendering `value={formData.num_guests || ''}` potrebbe mostrare "0" invece di stringa vuota quando il valore è 0

---

## ✅ Modifiche Tentate

### 1. Rimozione Attributo `min="1"`

**File modificati:**
- `BookingRequestForm.tsx`
- `AdminBookingForm.tsx`
- `DetailsTab.tsx`
- `AcceptBookingModal.tsx`

**Modifica:**
```tsx
// PRIMA
<Input
  type="text"
  min="1"  // ❌ Rimosso
  value={formData.num_guests || ''}
  ...
/>

// DOPO
<Input
  type="text"
  value={formData.num_guests || ''}
  ...
/>
```

### 2. Cambio da `type="number"` a `type="text"` con `inputMode="numeric"`

**File modificati:**
- `DetailsTab.tsx`
- `AcceptBookingModal.tsx`

**Modifica:**
```tsx
// PRIMA
<input
  type="number"
  min="1"
  value={formData.numGuests}
  ...
/>

// DOPO
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={formData.numGuests > 0 ? formData.numGuests.toString() : ''}
  ...
/>
```

### 3. Miglioramento Rendering Valore Vuoto

**File modificati:**
- Tutti i file sopra

**Modifica:**
```tsx
// PRIMA
value={formData.num_guests || ''}

// DOPO
value={formData.num_guests > 0 ? formData.num_guests.toString() : ''}
```

Questo assicura che quando il valore è 0, venga mostrata una stringa vuota invece di "0".

### 4. Miglioramento Handler `onChange`

**File modificati:**
- `BookingRequestForm.tsx`
- `AdminBookingForm.tsx`

**Modifica:**
```tsx
// PRIMA
const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = e.target.value
  if (inputValue === '') {
    setFormData({ ...formData, num_guests: 0 })
  } else if (/^\d+$/.test(inputValue)) {
    const value = parseInt(inputValue, 10)
    if (value >= 1 && value <= 110) {
      setFormData({ ...formData, num_guests: value })
    }
  }
}

// DOPO
const handleNumGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = e.target.value.trim()
  
  if (inputValue === '') {
    const tiramisuTotal = formData.menu_selection?.tiramisu_total || 0
    const newFormData = { ...formData, num_guests: 0, menu_total_booking: tiramisuTotal }
    setFormData(newFormData)
    setErrors({ ...errors, num_guests: '' })
    return
  }
  
  if (/^\d+$/.test(inputValue)) {
    const value = parseInt(inputValue, 10)
    if (!isNaN(value) && value >= 1 && value <= 110) {
      // ... gestione valore valido
    } else if (value === 0) {
      // Explicitly handle 0 to show empty
      const tiramisuTotal = formData.menu_selection?.tiramisu_total || 0
      const newFormData = { ...formData, num_guests: 0, menu_total_booking: tiramisuTotal }
      setFormData(newFormData)
    }
  }
}
```

---

## ⚠️ Problemi Persistenti

### Problema 1: Valore "1" Ancora Visibile

**Sintomo**: L'utente riferisce che dopo le modifiche, il valore "1" è ancora presente dappertutto e non può essere cancellato.

**Possibili Cause:**

1. **Cache del Browser**
   - Il browser potrebbe aver cachato la versione precedente del componente
   - **Soluzione suggerita**: Hard refresh (Ctrl+Shift+R o Cmd+Shift+R)

2. **Valore Iniziale da Database/Props**
   - Quando viene caricata una prenotazione esistente, il valore potrebbe venire dal database
   - **File da verificare**: 
     - `AcceptBookingModal.tsx` riga 69: `numGuests: booking.num_guests`
     - `BookingDetailsModal.tsx` riga 131: `numGuests: booking.num_guests || 0`

3. **Validazione HTML5 Residua**
   - Potrebbero esserci altri input con `type="number"` e `min="1"` non ancora modificati
   - **Verifica necessaria**: Cercare tutti gli input con `type="number"` e `min="1"`

4. **Componente Input Wrapper**
   - Il componente `Input` in `src/components/ui/Input.tsx` potrebbe applicare valori di default
   - **Verifica necessaria**: Controllare se il componente Input applica `defaultValue` o `value` di default

5. **React StrictMode**
   - In sviluppo, React StrictMode può causare doppi render che potrebbero mostrare valori intermedi
   - **Nota**: Già presente logging per debug in `BookingRequestForm.tsx`

---

## 🔧 Fix Aggiuntivi Necessari

### Fix 1: Verificare Inizializzazione da Booking Esistente

**File**: `AcceptBookingModal.tsx`, `BookingDetailsModal.tsx`

**Problema**: Quando viene caricato un booking esistente, il valore viene preso direttamente dal database.

**Fix suggerito**:
```tsx
// In AcceptBookingModal.tsx, riga 69
setFormData({
  date: date,
  startTime,
  endTime,
  numGuests: booking.num_guests > 0 ? booking.num_guests : 0, // Assicura che sia 0 se non valido
})
```

### Fix 2: Verificare Tutti gli Input Number

**Comando per ricerca**:
```bash
grep -r "type=\"number\"" src/features/booking
grep -r "type='number'" src/features/booking
grep -r "min=\"1\"" src/features/booking
```

**File da verificare manualmente**:
- `src/features/booking/components/DietaryTab.tsx` (riga 130-133)
- `src/features/booking/components/DietaryRestrictionsSection.tsx` (riga 197-200)
- Altri input per guest_count nelle intolleranze

### Fix 3: Verificare Componente Input

**File**: `src/components/ui/Input.tsx`

**Verifica necessaria**: 
- Il componente non applica `defaultValue="1"` o valori di default
- Il componente passa correttamente tutti i props all'input nativo

### Fix 4: Aggiungere Logging per Debug

**Suggerimento**: Aggiungere console.log temporanei per vedere il valore effettivo durante il rendering:

```tsx
// In BookingRequestForm.tsx, prima del return dell'Input
console.log('[DEBUG] num_guests value:', formData.num_guests, 'rendered as:', formData.num_guests > 0 ? formData.num_guests.toString() : '')
```

---

## 📝 Checklist per Risoluzione Completa

- [ ] Verificare che tutti gli input `num_guests`/`numGuests` abbiano `type="text"` invece di `type="number"`
- [ ] Verificare che tutti gli input non abbiano l'attributo `min="1"`
- [ ] Verificare che il valore iniziale sia sempre `0` o stringa vuota, mai `1`
- [ ] Verificare che quando viene caricato un booking esistente, il valore venga gestito correttamente
- [ ] Verificare che il rendering mostri stringa vuota quando il valore è `0`
- [ ] Testare la cancellazione completa del campo (Backspace/Delete fino a vuoto)
- [ ] Testare su browser diversi (Chrome, Firefox, Safari, Edge)
- [ ] Testare su mobile (iOS Safari, Chrome Mobile)
- [ ] Verificare che non ci siano altri input con `type="number"` e `min="1"` in altri componenti
- [ ] Eseguire hard refresh del browser dopo le modifiche

---

## 🧪 Test da Eseguire

1. **Test Cancellazione Completa**
   - Aprire il form
   - Verificare che il campo sia vuoto (non mostri "1")
   - Inserire un numero (es. "5")
   - Cancellare completamente con Backspace/Delete
   - Verificare che il campo risulti vuoto (non mostri "1" o "0")

2. **Test Valore Iniziale**
   - Aprire il form per nuova prenotazione
   - Verificare che `num_guests` sia `0` nello stato
   - Verificare che l'input mostri stringa vuota

3. **Test Caricamento Booking Esistente**
   - Aprire modal di modifica per booking esistente
   - Verificare che se il booking ha `num_guests: 1`, l'input mostri "1"
   - Verificare che sia possibile cancellare e riscrivere

4. **Test Validazione**
   - Lasciare il campo vuoto
   - Tentare submit
   - Verificare che la validazione funzioni correttamente (deve richiedere minimo 1)

---

## 🔗 File Modificati

1. `src/features/booking/components/BookingRequestForm.tsx`
   - Rimosso `min="1"` dall'Input
   - Modificato rendering valore: `value={formData.num_guests > 0 ? formData.num_guests.toString() : ''}`
   - Migliorato `handleNumGuestsChange` per gestire meglio il valore vuoto

2. `src/features/booking/components/AdminBookingForm.tsx`
   - Rimosso `min="1"` dall'Input
   - Modificato rendering valore: `value={formData.num_guests > 0 ? formData.num_guests.toString() : ''}`
   - Migliorato `handleNumGuestsChange` per gestire meglio il valore vuoto

3. `src/features/booking/components/DetailsTab.tsx`
   - Cambiato da `type="number"` a `type="text"` con `inputMode="numeric"`
   - Rimosso `min="1"`
   - Modificato rendering valore: `value={formData.numGuests > 0 ? formData.numGuests.toString() : ''}`

4. `src/features/booking/components/AcceptBookingModal.tsx`
   - Cambiato da `type="number"` a `type="text"` con `inputMode="numeric"`
   - Rimosso `min="1"`
   - Modificato rendering valore: `value={formData.numGuests > 0 ? formData.numGuests.toString() : ''}`

---

## 💡 Note Aggiuntive

1. **Validazione**: La validazione del minimo 1 ospite viene gestita nel codice JavaScript (funzione `validate()`), non più tramite attributi HTML. Questo è corretto e permette maggiore flessibilità.

2. **Compatibilità Mobile**: L'uso di `inputMode="numeric"` invece di `type="number"` è preferibile su mobile perché mostra la tastiera numerica senza i problemi di validazione HTML5.

3. **Pattern**: L'attributo `pattern="[0-9]*"` aiuta i browser mobile a mostrare la tastiera numerica.

4. **Gestione Stato**: Il valore nello stato rimane un `number` (0 quando vuoto), ma il rendering mostra una stringa vuota quando è 0. Questo è corretto per l'UX.

---

## 🚨 Azioni Immediate Richieste

1. **Verificare Hard Refresh**: Chiedere all'utente di eseguire un hard refresh del browser (Ctrl+Shift+R / Cmd+Shift+R)

2. **Verificare Console Browser**: Controllare se ci sono errori JavaScript che potrebbero interferire

3. **Verificare Altri Input**: Cercare altri input `type="number"` con `min="1"` che potrebbero non essere stati modificati

4. **Test Manuale**: Eseguire i test sopra descritti per identificare dove persiste il problema

5. **Debug Logging**: Aggiungere logging temporaneo per vedere il valore effettivo durante il rendering

---

## 📅 Data Creazione

**Data**: 2025-01-XX  
**Autore**: AI Assistant  
**Stato**: ⚠️ Parzialmente Risolto - Richiede Verifica e Test

---

## 🔄 Prossimi Passi

1. Eseguire hard refresh e testare
2. Se il problema persiste, aggiungere logging per debug
3. Verificare tutti gli input number nel codebase
4. Testare su browser diversi
5. Verificare se ci sono altri componenti che potrebbero interferire
