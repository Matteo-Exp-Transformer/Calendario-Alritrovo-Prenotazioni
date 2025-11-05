# Piano di Testing Completo: Prenotazione "Rinfresco di Laurea"

## 📋 Obiettivo
Verificare che il sistema di prenotazione "Rinfresco di Laurea" funzioni correttamente:
- Inserimento prenotazione con menu completo
- Calcolo corretto dei prezzi (per persona e totale)
- Visualizzazione dati in tutte le UI (card, modal, admin)
- Persistenza corretta nel database
- Gestione errori e validazioni

---

## 🧪 Test Cases

### Test 1: Inserimento Prenotazione Completa
**File:** `e2e/test-rinfresco-laurea-complete.spec.ts`

**Scopo:** Verificare inserimento corretto di una prenotazione "rinfresco di laurea" con menu completo.

**Steps:**
1. Navigare a `/prenota`
2. Selezionare "Rinfresco di Laurea"
3. Compilare dati personali (nome, email, telefono)
4. Compilare dettagli prenotazione (data, ora, numero ospiti)
5. Selezionare menu items da diverse categorie
6. Aggiungere intolleranze alimentari (opzionale)
7. Aggiungere note speciali (opzionale)
8. Accettare privacy policy
9. Inviare form
10. Verificare messaggio di successo

**Verifiche:**
- ✅ Menu section appare dopo selezione "Rinfresco di Laurea"
- ✅ Totale a persona calcolato correttamente (somma prezzi menu items)
- ✅ Totale prenotazione = totale a persona × numero ospiti
- ✅ Form viene inviato con successo
- ✅ Messaggio di conferma viene mostrato

**Dati Test:**
- Nome: Mario Rossi Test
- Email: mario.rossi.test@example.com
- Telefono: +39 333 1234567
- Data: +14 giorni da oggi
- Ora: 18:00
- Numero ospiti: 25
- Menu items: Caraffe/Drink (€5), Pizza Margherita (€8), Primo (€12), Secondo (€15)
- Totale atteso a persona: €40.00
- Totale atteso prenotazione: €1,000.00

---

### Test 2: Verifica Presenza in Admin - Prenotazioni Pendenti
**File:** `e2e/test-rinfresco-laurea-complete.spec.ts`

**Scopo:** Verificare che la prenotazione appaia correttamente nella pagina admin tra le prenotazioni pendenti.

**Steps:**
1. Login come admin
2. Navigare a `/admin`
3. Aprire tab "Prenotazioni Pendenti"
4. Cercare prenotazione di test (per nome cliente)

**Verifiche:**
- ✅ Prenotazione visibile nella lista
- ✅ Tipo booking mostra "Rinfresco di Laurea"
- ✅ Nome cliente corretto
- ✅ Prezzo a persona mostrato: €40.00/persona
- ✅ Prezzo totale mostrato: €1,000.00
- ✅ Menu items mostrati nella card
- ✅ Intolleranze mostrate (se presenti)

---

### Test 3: Verifica Dettagli Completi nel Modal
**File:** `e2e/test-rinfresco-laurea-complete.spec.ts`

**Scopo:** Verificare che tutti i dati siano corretti nel modal di dettaglio prenotazione.

**Steps:**
1. Login come admin
2. Navigare a `/admin`
3. Aprire tab "Prenotazioni Pendenti"
4. Cliccare sulla prenotazione di test
5. Verificare modal di dettaglio

**Verifiche:**
- ✅ Dati cliente corretti (nome, email, telefono)
- ✅ Dettagli evento corretti (data, ora, numero ospiti)
- ✅ Menu selection completa con tutti gli items
- ✅ Prezzo a persona: €40.00/persona
- ✅ Prezzo totale: €1,000.00
- ✅ Intolleranze alimentari mostrate correttamente
- ✅ Note speciali mostrate (se presenti)

---

### Test 4: Verifica Dati nel Database
**File:** `e2e/test-rinfresco-laurea-database-verification.spec.ts`

**Scopo:** Verificare che i dati siano corretti nel database tramite query SQL.

**Query SQL:**
```sql
SELECT 
  id,
  client_name,
  client_email,
  booking_type,
  num_guests,
  menu_selection,
  menu_total_per_person,
  menu_total_booking,
  dietary_restrictions,
  status
FROM booking_requests
WHERE client_email = 'mario.rossi.test@example.com'
  AND booking_type = 'rinfresco_laurea'
ORDER BY created_at DESC
LIMIT 1;
```

**Verifiche:**
- ✅ `booking_type` = 'rinfresco_laurea'
- ✅ `menu_selection` IS NOT NULL
- ✅ `menu_selection->'items'` è un array con elementi corretti
- ✅ `menu_total_per_person` = 40.00
- ✅ `menu_total_booking` = 1000.00
- ✅ `menu_total_booking` = `menu_total_per_person` × `num_guests`
- ✅ `dietary_restrictions` contiene le restrizioni corrette
- ✅ Tutti i campi richiesti sono presenti

**Query Verifica Calcolo:**
```sql
SELECT 
  id,
  num_guests,
  menu_total_per_person,
  menu_total_booking,
  menu_total_per_person * num_guests as calculated_total,
  CASE 
    WHEN menu_total_booking = (menu_total_per_person * num_guests) THEN '✅ CORRETTO'
    ELSE '❌ ERRORE'
  END as price_verification
FROM booking_requests
WHERE client_email = 'mario.rossi.test@example.com'
  AND booking_type = 'rinfresco_laurea'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Test 5: Validazione Menu Obbligatorio
**File:** `e2e/test-rinfresco-laurea-complete.spec.ts`

**Scopo:** Verificare che il menu sia obbligatorio per prenotazioni "rinfresco di laurea".

**Steps:**
1. Navigare a `/prenota`
2. Selezionare "Rinfresco di Laurea"
3. Compilare tutti i campi OBBLIGATORI (tranne menu)
4. Provare a inviare form senza selezionare menu items

**Verifiche:**
- ✅ Messaggio di errore mostra "Seleziona almeno un prodotto dal menù"
- ✅ Form non viene inviato
- ✅ Campo menu evidenziato come errore

---

### Test 6: Calcolo Prezzi Automatico
**File:** `e2e/test-rinfresco-laurea-complete.spec.ts`

**Scopo:** Verificare che i prezzi vengano calcolati automaticamente quando:
- Si selezionano/deselezionano menu items
- Si cambia il numero di ospiti

**Steps:**
1. Navigare a `/prenota`
2. Selezionare "Rinfresco di Laurea"
3. Impostare numero ospiti: 20
4. Selezionare menu items con prezzi noti
5. Verificare "Totale a Persona"
6. Cambiare numero ospiti a 30
7. Verificare che totale prenotazione si aggiorni

**Verifiche:**
- ✅ Totale a persona = somma prezzi menu items selezionati
- ✅ Totale prenotazione = totale a persona × numero ospiti
- ✅ Quando si cambia numero ospiti, totale prenotazione si aggiorna
- ✅ Quando si aggiunge/rimuove menu item, totale a persona si aggiorna

---

## 🔍 Verifiche UI

### BookingRequestCard (Card in lista admin)
- ✅ Tipo booking mostrato: "Rinfresco di Laurea"
- ✅ Prezzo a persona: €X.XX/persona
- ✅ Prezzo totale: (Totale: €X.XX)
- ✅ Lista menu items mostrata

### BookingDetailsModal (Modal dettagli)
- ✅ Sezione "Menu Selezionato" presente
- ✅ Prezzo a persona: €X.XX/persona
- ✅ Prezzo totale: Totale prenotazione: €X.XX
- ✅ Lista completa menu items con prezzi
- ✅ Sezione "Intolleranze Alimentari" (se presenti)

### BookingRequestForm (Form inserimento)
- ✅ Menu section visibile solo per "Rinfresco di Laurea"
- ✅ Totale a persona calcolato e mostrato
- ✅ Totale prenotazione calcolato automaticamente

---

## ❌ Test Casi di Errore

### Errore 1: Menu mancante
- **Input:** Booking type "rinfresco_laurea" senza menu items
- **Atteso:** Errore di validazione, form non inviato

### Errore 2: Numero ospiti = 0
- **Input:** Menu selezionato ma num_guests = 0
- **Atteso:** Errore "Numero ospiti obbligatorio (min 1)"

### Errore 3: Prezzi negativi (edge case)
- **Input:** Menu item con prezzo negativo nel database
- **Atteso:** Sistema gestisce correttamente (non dovrebbe accadere)

---

## 📊 Metriche di Successo

### Coverage
- ✅ Flusso inserimento completo: 100%
- ✅ Calcolo prezzi: 100%
- ✅ Visualizzazione UI: 100%
- ✅ Persistenza database: 100%
- ✅ Validazioni: 100%

### Performance
- ⏱️ Inserimento prenotazione: < 3s
- ⏱️ Calcolo prezzi real-time: < 100ms
- ⏱️ Caricamento lista admin: < 2s

---

## 🚀 Esecuzione Test

### Eseguire tutti i test:
```bash
npm run test:e2e test-rinfresco-laurea-complete
```

### Eseguire singolo test:
```bash
npx playwright test e2e/test-rinfresco-laurea-complete.spec.ts -g "1. Inserimento"
```

### Verifica database (manuale con MCP):
1. Usare MCP Supabase per eseguire query SQL
2. Verificare valori attesi
3. Documentare risultati

---

## 📝 Note

- I test usano dati di test con email univoca per identificare prenotazioni
- I menu items potrebbero avere nomi diversi nel database - adattare selettori
- Verificare che server di sviluppo sia in esecuzione (localhost:5175)
- Admin user deve esistere nel database per test admin

---

## ✅ Checklist Completamento

- [x] Test inserimento completo
- [x] Test verifica admin UI
- [x] Test verifica modal dettagli
- [x] Test verifica database (query SQL)
- [x] Test validazione menu obbligatorio
- [x] Test calcolo prezzi automatico
- [ ] Esecuzione test e fix errori
- [ ] Report risultati
- [ ] Documentazione bug trovati (se presenti)










