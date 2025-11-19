# Verifica Database: Prenotazioni Rinfresco di Laurea

## 🔍 Query SQL per Verifica Manuale

Dopo aver ripristinato MCP, eseguire queste query tramite MCP Supabase o direttamente nel database.

---

## Query 1: Lista Prenotazioni Rinfresco di Laurea

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
  status,
  created_at
FROM booking_requests
WHERE booking_type = 'rinfresco_laurea'
ORDER BY created_at DESC
LIMIT 10;
```

**Verifiche:**
- ✅ `booking_type = 'rinfresco_laurea'`
- ✅ `menu_selection IS NOT NULL`
- ✅ `menu_total_per_person IS NOT NULL`
- ✅ `menu_total_booking IS NOT NULL`
- ✅ `dietary_restrictions` presente (se applicabile)

---

## Query 2: Verifica Calcolo Prezzi

```sql
SELECT 
  id,
  client_name,
  num_guests,
  menu_total_per_person,
  menu_total_booking,
  menu_total_per_person * num_guests as calculated_total,
  CASE 
    WHEN menu_total_booking = (menu_total_per_person * num_guests) THEN '✅ CORRETTO'
    ELSE '❌ ERRORE - Differenza: ' || (menu_total_booking - (menu_total_per_person * num_guests))
  END as price_verification,
  jsonb_array_length(menu_selection->'items') as num_menu_items
FROM booking_requests
WHERE booking_type = 'rinfresco_laurea'
  AND menu_total_per_person IS NOT NULL
ORDER BY created_at DESC;
```

**Verifiche:**
- ✅ `price_verification = '✅ CORRETTO'` per tutte le righe
- ✅ `num_menu_items > 0` per tutte le prenotazioni

---

## Query 3: Verifica Menu Selection

```sql
SELECT 
  id,
  client_name,
  jsonb_pretty(menu_selection) as menu_selection_formatted,
  menu_selection->'items' as items_array,
  jsonb_array_length(menu_selection->'items') as items_count,
  (
    SELECT SUM((item->>'price')::numeric)
    FROM jsonb_array_elements(menu_selection->'items') as item
  ) as manual_price_sum,
  menu_total_per_person,
  CASE 
    WHEN (
      SELECT SUM((item->>'price')::numeric)
      FROM jsonb_array_elements(menu_selection->'items') as item
    ) = menu_total_per_person THEN '✅ CORRETTO'
    ELSE '❌ ERRORE'
  END as menu_price_verification
FROM booking_requests
WHERE booking_type = 'rinfresco_laurea'
  AND menu_selection IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Verifiche:**
- ✅ `items_count >= 1` (almeno un item selezionato)
- ✅ `manual_price_sum = menu_total_per_person`
- ✅ `menu_price_verification = '✅ CORRETTO'`
- ✅ Struttura JSON corretta: `{"items": [{"id": "...", "name": "...", "price": X, "category": "..."}]}`

---

## Query 4: Statistiche Generali

```sql
SELECT 
  COUNT(*) as total_rinfresco_laurea,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
  COUNT(CASE WHEN menu_selection IS NOT NULL THEN 1 END) as with_menu_count,
  COUNT(CASE WHEN menu_total_per_person IS NOT NULL THEN 1 END) as with_price_per_person_count,
  COUNT(CASE WHEN menu_total_booking IS NOT NULL THEN 1 END) as with_total_price_count,
  COUNT(CASE WHEN menu_total_booking = (menu_total_per_person * num_guests) THEN 1 END) as correct_price_calculation_count,
  ROUND(AVG(menu_total_per_person), 2) as avg_price_per_person,
  ROUND(AVG(menu_total_booking), 2) as avg_total_booking,
  ROUND(AVG(num_guests), 0) as avg_num_guests
FROM booking_requests
WHERE booking_type = 'rinfresco_laurea';
```

**Verifiche:**
- ✅ `with_menu_count = total_rinfresco_laurea` (tutte hanno menu)
- ✅ `with_price_per_person_count = total_rinfresco_laurea` (tutte hanno prezzo a persona)
- ✅ `with_total_price_count = total_rinfresco_laurea` (tutte hanno prezzo totale)
- ✅ `correct_price_calculation_count = total_rinfresco_laurea` (tutti i calcoli sono corretti)

---

## Query 5: Verifica Intolleranze Alimentari

```sql
SELECT 
  id,
  client_name,
  dietary_restrictions,
  jsonb_pretty(dietary_restrictions) as dietary_restrictions_formatted,
  jsonb_array_length(dietary_restrictions) as restrictions_count
FROM booking_requests
WHERE booking_type = 'rinfresco_laurea'
  AND dietary_restrictions IS NOT NULL
ORDER BY created_at DESC;
```

**Verifiche:**
- ✅ Struttura JSON corretta: `[{"restriction": "...", "guest_count": X, "notes": "..."}]`
- ✅ `restrictions_count > 0`

---

## 🚨 Problemi Comuni e Soluzioni

### Errore: "You do not have permission"
**Causa:** RLS (Row Level Security) policy blocca l'accesso

**Soluzione:**
1. Verificare che MCP Supabase sia configurato con la chiave corretta
2. Verificare policy RLS sulla tabella `booking_requests`
3. Usare chiave service_role per query di verifica (solo per test)

### Errore: "menu_selection is null"
**Causa:** Prenotazione creata prima dell'implementazione menu

**Soluzione:**
- Verificare che `created_at` sia dopo la migration `016_add_menu_booking_fields.sql`
- Verificare che il form invii correttamente `menu_selection`

### Errore: "menu_total_booking ≠ menu_total_per_person * num_guests"
**Causa:** Calcolo non eseguito correttamente

**Soluzione:**
- Verificare logica in `BookingRequestForm.tsx` (riga ~413)
- Verificare che `handleNumGuestsChange` aggiorni `menu_total_booking`

---

## ✅ Checklist Verifica Completa

- [ ] Query 1: Prenotazioni presenti nel database
- [ ] Query 2: Tutti i calcoli prezzi sono corretti
- [ ] Query 3: Menu selection strutturato correttamente
- [ ] Query 4: Statistiche generali senza anomalie
- [ ] Query 5: Intolleranze alimentari salvate correttamente
- [ ] Verifica UI: Dati mostrati correttamente in admin
- [ ] Test E2E: Tutti i test passano

---

## 📊 Report Template

Dopo esecuzione query, compilare:

```
📊 REPORT VERIFICA DATABASE - RINFRESCO DI LAUREA
Data: ___________

Query 1: Prenotazioni trovate: ___
Query 2: Calcoli corretti: ___ / ___
Query 3: Menu selection corretto: ___ / ___
Query 4: Totale prenotazioni: ___
  - Con menu: ___
  - Con prezzi: ___
  - Calcoli corretti: ___
Query 5: Con intolleranze: ___

Problemi trovati:
[ ]

Note:
[ ]
```















