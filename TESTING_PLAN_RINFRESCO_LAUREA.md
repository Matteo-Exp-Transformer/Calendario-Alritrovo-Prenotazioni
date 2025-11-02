# Piano di Testing Completo - Sistema Prenotazione "Rinfresco di Laurea"

**Data**: 27 Gennaio 2025  
**Sviluppatore**: AI Agent  
**Obiettivo**: Verificare il corretto inserimento di prenotazioni "rinfresco di laurea" con menu, prezzi e visualizzazione admin

---

## 📊 Stato Attuale del Sistema

### ✅ Componenti Funzionanti
1. **Form Pubblico** (`/prenota`) - Form rendering corretto
2. **Dropdown Selezione Tipo** - "Prenota un Tavolo" / "Rinfresco di Laurea" funzionante
3. **Menu Selection Component** - Caricamento menu items dal database
4. **Login Admin** - Autenticazione funzionante
5. **Dashboard Admin** - Visualizzazione prenotazioni pendenti
6. **Database Schema** - Tabelle configurate correttamente

### ⚠️ Problemi Identificati

#### 1. **BUG CRITICO - Calcolo Prezzo A Persona**
**Problema**: Il test mostra `€0.50` invece di `€40.00` come totale a persona
**Severità**: 🔴 CRITICA
**Log Test**:
```
💰 Prezzo atteso a persona: €40.00
💰 Prezzo totale atteso: €1000.00
✅ Selected item from category secondi: Polpette di carne€6.004 pz a persona
💰 Totale a persona mostrato: €0.50
```

**Possibili Cause**:
- Selezione menu items non completa
- Bug nel callback `onMenuChange`
- Problema parsing prezzi dal database
- Race condition tra selezioni

---

## 🎯 Piano di Testing Strutturato

Seguendo le **skills di testing** (`superpowers-main/skills/testing-skills-with-subagents/SKILL.md`):

### Fase RED: Baseline Testing (Watch it Fail)

**Obiettivo**: Identificare tutti i problemi esistenti prima di iniziare fix

#### Test Suite 1: E2E Completo Flusso Prenotazione
**File**: `e2e/test-rinfresco-laurea-complete-final.spec.ts` (da creare)

**Test Cases**:

1. **Test 1.1: Inserimento Completo - Happy Path**
   - Navigare a `/prenota`
   - Selezionare "Rinfresco di Laurea"
   - Compilare tutti i campi obbligatori:
     - Nome: "Test Rinfresco Laurea"
     - Email: "test.rinfresco@example.com"
     - Telefono: "+39 333 1234567"
     - Data: +14 giorni da oggi
     - Ora: 18:00
     - Numero ospiti: 25
   - **Selezionare menu completo**:
     - Bevande: "Caraffe / Drink" (€6.50)
     - Antipasti: "Pizza Margherita" (€4.50)
     - Primi: "Lasagne Ragù" (€8.00)
     - Secondi: "Polpette di carne" (€6.00)
   - **Verificare calcolo prezzi**:
     - Totale atteso a persona: €25.00
     - Totale atteso booking: €625.00 (25 ospiti × €25.00)
   - Aggiungere intolleranze (Glutine: 2 ospiti)
   - Accettare privacy
   - Submit form
   - Verificare success message

2. **Test 1.2: Verifica Database con MCP Supabase**
   - Query booking appena creato
   - Verificare:
     - `booking_type = 'rinfresco_laurea'`
     - `menu_selection.items` contiene 4 items
     - `menu_total_per_person = 25.00`
     - `menu_total_booking = 625.00`
     - `dietary_restrictions` contiene 1 restrizione
     - `num_guests = 25`

3. **Test 1.3: Verifica UI Admin - Scheda Pendenti**
   - Login admin
   - Navigare a `/admin`
   - Tab "Prenotazioni Pendenti"
   - Cercare "Test Rinfresco Laurea"
   - Verificare card mostra:
     - Nome cliente
     - Tipo: "Rinfresco di Laurea"
     - Numero ospiti: 25
     - **Prezzo a persona: €25.00**
     - **Prezzo totale: €625.00**
     - Menu items selezionati

4. **Test 1.4: Verifica UI Admin - Modal Dettagli**
   - Click su card per aprire modal
   - Verificare sezione "Menu":
     - Lista completa items selezionati
     - Prezzo per ogni item
     - Totale a persona visibile
     - Totale booking visibile
   - Verificare intolleranze mostrate

5. **Test 1.5: Validazione Menu Obbligatorio**
   - Selezione "Rinfresco di Laurea"
   - Compilare tutti i campi **SENZA** selezionare menu
   - Tentare submit
   - Verificare errore: "Seleziona almeno un prodotto dal menù"

6. **Test 1.6: Validazione Limiti Categoria**
   - Test antipasti max 3
   - Test primi mutual exclusion
   - Test fritti max 3
   - Test secondi max 3
   - Test bevande mutual exclusion (Standard vs Premium)

7. **Test 1.7: Aggiornamento Dinamico Prezzi**
   - Selezionare menu: totale = €10.00/persona
   - Cambiare numero ospiti da 10 a 20
   - Verificare totale booking aggiornato da €100 a €200

### Fase GREEN: Verify Fixes (Make it Pass)

**Test da eseguire DOPO aver fixato i bug identificati in Fase RED**

### Fase REFACTOR: Edge Cases & Error Handling

#### Test Suite 2: Edge Cases
**File**: `e2e/test-rinfresco-laurea-edge-cases.spec.ts`

**Test Cases**:

1. **Test 2.1: Prezzo Zero**
   - Cosa succede se tutti i prezzi sono 0? (Dovrebbe essere bloccato)

2. **Test 2.2: Numero Ospiti Molto Alto**
   - 110 ospiti (max consentito)
   - Verificare calcolo corretto

3. **Test 2.3: Menu Items Disabilitati**
   - Cosa succede se un item viene rimosso dal database?

4. **Test 2.4: Browser Close During Submit**
   - Submit form, chiudere browser immediatamente
   - Verificare che booking non sia stato creato duplicato

---

## 🔧 Script Esecuzione Test

### Pre-requisiti
```bash
# Dev server deve essere in esecuzione
npm run dev

# In un altro terminale
npm run test:e2e e2e/test-rinfresco-laurea-complete-final.spec.ts
```

### MCP Supabase Verification
```bash
# Query manuale da eseguire con MCP
SELECT 
  id, client_name, client_email, booking_type,
  num_guests, menu_selection, menu_total_per_person, 
  menu_total_booking, dietary_restrictions, status
FROM booking_requests
WHERE booking_type = 'rinfresco_laurea'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 📋 Checklist Completamento

### RED Phase
- [ ] Creare test file completo
- [ ] Eseguire test senza fix
- [ ] Documentare tutti i failure
- [ ] Screenshots dei problemi

### Investigation Phase
- [ ] Verificare database menu_items
- [ ] Verificare logica calcolo prezzi
- [ ] Verificare callback onMenuChange
- [ ] Verificare JSONB structure menu_selection

### GREEN Phase
- [ ] Fixare bug identificati
- [ ] Re-eseguire test RED
- [ ] Tutti i test devono passare

### REFACTOR Phase
- [ ] Test edge cases
- [ ] Verificare error handling
- [ ] Performance testing

---

## 🐛 Bug Investigation - Calcolo Prezzo €0.50

### Hypotesis
1. **Selezione menu incompleta**: Test non seleziona tutti gli items
2. **Race condition**: Menu items selezionati prima che totalPerPerson calcoli correttamente
3. **Parsing error**: Prezzi menu items sono stringhe invece di numbers
4. **Callback bug**: `onMenuChange` non aggiorna totalPerPerson correttamente

### Investigation Steps
1. Aggiungere console.log in `MenuSelection.tsx`:
   ```typescript
   console.log('🔍 Selected items:', selectedItems)
   console.log('🔍 Total calculated:', totalPerPerson)
   ```

2. Verificare database menu_items:
   ```sql
   SELECT name, category, price FROM menu_items ORDER BY category, sort_order;
   ```

3. Check callback in `BookingRequestForm.tsx`:
   ```typescript
   console.log('🔍 onMenuChange called:', { items, totalPerPerson, numGuests })
   ```

---

## 📊 Metriche Successo

### Test Coverage
- [ ] 100% flusso happy path
- [ ] 100% validazioni
- [ ] 100% calcoli prezzi
- [ ] 100% UI admin
- [ ] 80% edge cases

### Acceptance Criteria
✅ Prenotazione "rinfresco di laurea" inserita correttamente  
✅ Tutti i dati persistiti nel database  
✅ Prezzi calcolati correttamente (a persona + totale)  
✅ Menu items mostrati correttamente  
✅ Intolleranze mostrate correttamente  
✅ Visibility in admin (pendenti + archivio)  
✅ Modal dettagli mostra tutti i dati  

---

## 🚀 Next Steps Immediati

1. **Ora**: Eseguire investigation del bug €0.50
2. **Poi**: Creare test file completo seguendo RED-GREEN-REFACTOR
3. **Quindi**: Eseguire test suite completa
4. **Finale**: Fix bugs e re-verificare

---

**Status**: ⚠️ IN PROGRESS  
**Priority**: 🔴 HIGH

