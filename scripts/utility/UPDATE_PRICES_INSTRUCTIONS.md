# Istruzioni per aggiornare i prezzi di Anelli di Cipolla e Olive Ascolana

## 📋 Modifiche richieste

Aggiornare i prezzi da **1.00 EUR** a **1.50 EUR** per:
- Anelli di Cipolla
- Olive Ascolana

---

## 🔧 File modificati nel codice

### ✅ File già aggiornati:
1. `supabase/migrations/017_insert_default_menu_items.sql` - Migration iniziale aggiornata
2. `MIGRATION_FILES_COMPLETE.md` - Documentazione aggiornata
3. `supabase/migrations/029_update_onion_rings_olives_price.sql` - Nuova migration per aggiornare il DB
4. `scripts/utility/update-menu-prices.sql` - Script SQL standalone

---

## 🚀 Come applicare la modifica al database

### Metodo 1: Usando la Migration Supabase (consigliato)

1. Apri Supabase Dashboard: https://supabase.com/dashboard
2. Seleziona il progetto: **dphuttzgdcerexunebct**
3. Vai su **SQL Editor** → **+ New Query**
4. Copia il contenuto di `supabase/migrations/029_update_onion_rings_olives_price.sql`
5. Esegui la query (**Run** o Ctrl+Enter)
6. Verifica che il risultato mostri 2 righe con `price = 1.50`

### Metodo 2: Script SQL Standalone

1. Apri Supabase Dashboard → **SQL Editor**
2. Copia il contenuto di `scripts/utility/update-menu-prices.sql`
3. Esegui la query
4. Verifica il risultato

---

## ✅ Verifica

Dopo l'esecuzione, esegui questa query per verificare:

```sql
SELECT name, category, price, description, updated_at 
FROM menu_items 
WHERE name IN ('Anelli di Cipolla', 'Olive Ascolana')
ORDER BY name;
```

**Risultato atteso:**
- Anelli di Cipolla - fritti - 1.50 EUR
- Olive Ascolana - fritti - 1.50 EUR

---

## 📝 Note

- I prezzi vengono caricati dinamicamente dal database
- Non ci sono prezzi hardcoded nel codice React
- La modifica è immediatamente visibile nella app dopo l'aggiornamento del DB
- Le prenotazioni esistenti manterranno i vecchi prezzi (solo per storico)

---

## 🧪 Test

1. Ricarica l'app: http://localhost:5173/prenota
2. Seleziona tipo prenotazione: "Rinfresco di Laurea"
3. Nella sezione "Fritti", verifica che:
   - Anelli di Cipolla mostri **€1.50**
   - Olive Ascolana mostri **€1.50**
4. Seleziona entrambi gli item
5. Verifica che il totale a persona sia calcolato correttamente

---

**Data creazione:** 2025-01-XX  
**Aggiornato da:** Sistema di prenotazioni Al Ritrovo


