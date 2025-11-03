# 🔧 Istruzioni Migration Sistema Menu

## IMPORTANTE: Eseguire queste migration prima di testare il sistema menu!

Le nuove funzionalità di menu richiedono l'applicazione di due nuove migration al database Supabase.

### Step 1: Accedi a Supabase Dashboard
1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto: **dphuttzgdcerexunebct**
3. Nel menu laterale, clicca su **SQL Editor**

### Step 2: Esegui Migration 016 - Campi Menu
1. Clicca su **+ New Query**
2. Copia e incolla il contenuto del file `supabase/migrations/016_add_menu_booking_fields.sql`
3. Clicca su **Run** (o premi Ctrl+Enter)
4. Verifica che l'output mostri "Success. No rows returned"

### Step 3: Esegui Migration 017 - Prodotti Predefiniti
1. Clicca su **+ New Query** (nuova query)
2. Copia e incolla il contenuto del file `supabase/migrations/017_insert_default_menu_items.sql`
3. Clicca su **Run** (o premi Ctrl+Enter)
4. Verifica che l'output mostri "Success. INSERT inserite correttamente"

### Step 4: Verifica Tabelle e Dati
Nel menu laterale, vai su **Table Editor** e verifica:

1. **Tabella `menu_items`**:
   - ✅ Deve esistere con colonne: id, name, category, price, description, is_bis_option, sort_order
   - ✅ Deve contenere 33 prodotti totali:
     - 4 Bevande
     - 6 Antipasti
     - 11 Fritti
     - 4 Primi Piatti
     - 6 Secondi Piatti

2. **Tabella `booking_requests`**:
   - ✅ Deve avere le nuove colonne:
     - `booking_type` (varchar, nullable)
     - `menu_selection` (jsonb, nullable)
     - `menu_total_per_person` (numeric, nullable)
     - `menu_total_booking` (numeric, nullable)
     - `dietary_restrictions` (jsonb, nullable)
   - ✅ `event_type` deve essere nullable

### Step 5: Verifica RLS Policies
1. Vai su **Table Editor** → `menu_items`
2. Clicca su **Policies** nella parte superiore
3. Verifica che ci siano 2 policies:
   - ✅ "Anyone can view menu items" (SELECT - true)
   - ✅ "Only admins can manage menu items" (ALL operations - role check)

## ⚠️ Troubleshooting

### Errore: "table menu_items does not exist"
- Esegui prima la migration 016

### Errore: "duplicate key value violates unique constraint"
- I prodotti sono già stati inseriti. Puoi skippare la migration 017

### Errore: "column already exists" su booking_requests
- I campi esistono già. Puoi skippare la parte ALTER TABLE della migration 016

### Menu non compare nell'app
- Verifica che la migration 016 sia stata completata
- Controlla che la tabella `menu_items` esista
- Apri la console del browser e verifica errori 404/500
- Assicurati che il dev server sia riavviato dopo le migration

## ✅ Dopo le Migration

Una volta completate le migration, dovresti essere in grado di:
1. ✅ Vedere il menu quando selezioni "Rinfresco di Laurea"
2. ✅ Aggiungere/modificare prodotti dalla dashboard admin (Pulsante "Prezzi Menu")
3. ✅ Selezionare prodotti e vedere il totale in tempo reale
4. ✅ Aggiungere intolleranze alimentari
5. ✅ Salvare una prenotazione con menu completo








