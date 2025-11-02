# 📋 File Migration Completi - Copia e Incolla Pronto

## ⚠️ ATTENZIONE: Tabella `menu_items` NON ESISTE!

**Errore trovato con Playwright MCP:**
```
[ERROR] Failed to load resource: the server responded with a status of 404 
@ https://dphuttzgdcerexunebct.supabase.co/rest/v1/menu_items
```

**Diagnostica:**
- ✅ URL Supabase corretto: `dphuttzgdcerexunebct`
- ✅ ANON key configurata correttamente
- ✅ Client Supabase creato con successo
- ❌ **Tabella `menu_items` NON ESISTE nel database**

---

## 🚀 Soluzione Rapida

### Step 1: Apri Supabase Dashboard
1. Vai: https://supabase.com/dashboard
2. Login
3. Seleziona progetto: **dphuttzgdcerexunebct**

### Step 2: Esegui Migration 016

**File:** `supabase/migrations/016_add_menu_booking_fields.sql`

Copia TUTTO questo:

```sql
-- Migration: Add Menu Booking System Fields
-- Created: 2025-01-XX
-- Description: Adds fields for menu selection and dietary restrictions to booking_requests
--              Creates menu_items table for product management

-- =====================================================
-- 1. Aggiungi colonne a booking_requests
-- =====================================================

-- Tipologia di prenotazione
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) CHECK (booking_type IN ('tavolo', 'rinfresco_laurea'));

-- Menu selection (JSONB per flessibilità)
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS menu_selection JSONB;

-- Prezzi menu
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS menu_total_per_person NUMERIC(10, 2);

ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS menu_total_booking NUMERIC(10, 2);

-- Intolleranze alimentari
ALTER TABLE booking_requests 
  ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB;

-- Rendere event_type nullable (per retrocompatibilità durante transizione)
ALTER TABLE booking_requests 
  ALTER COLUMN event_type DROP NOT NULL;

-- =====================================================
-- 2. Crea tabella menu_items
-- =====================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dettagli prodotto
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('bevande', 'antipasti', 'fritti', 'primi', 'secondi')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  
  -- Opzione speciale "Bis di Primi"
  is_bis_option BOOLEAN DEFAULT FALSE,
  
  -- Ordinamento (per mantenere ordine all'interno della categoria)
  sort_order INTEGER DEFAULT 0
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(category, sort_order);

-- =====================================================
-- 3. RLS Policies per menu_items
-- =====================================================

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Chiunque può leggere i menu items (per il form pubblico)
CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  USING (true);

-- Solo admin possono modificare menu items
CREATE POLICY "Only admins can manage menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND admin_users.role IN ('admin', 'staff')
    )
  );
```

**Istruzioni:**
1. SQL Editor → **+ New Query**
2. **Incolla tutto il codice sopra**
3. **Run** (Ctrl+Enter)
4. Verifica: "Success. No rows returned"

---

### Step 3: Esegui Migration 017

**File:** `supabase/migrations/017_insert_default_menu_items.sql`

Copia TUTTO questo:

```sql
-- Migration: Insert Default Menu Items
-- Created: 2025-01-XX
-- Description: Inserts all default menu items with prices as specified

-- =====================================================
-- BEVANDE
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Acqua', 'bevande', 0.50, '1 litro x 2 persone', 1),
  ('Caraffe / Drink', 'bevande', 6.50, '0,5 l x Persona (Vino - Birra - Spritz inclusi)', 2),
  ('Caraffe / Drink Premium', 'bevande', 8.00, '0,5l x persona / 1 drink per persona (Gin Tonic - Negroni - Moscow mule inclusi)', 3),
  ('Caffè', 'bevande', 1.00, NULL, 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ANTIPASTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Pizza Margherita', 'antipasti', 4.50, '2 tranci a persona', 1),
  ('Pizza rossa', 'antipasti', 4.00, '2 tranci a persona', 2),
  ('Focaccia Rosmarino', 'antipasti', 4.00, '2 tranci a persona', 3),
  ('Farinata', 'antipasti', 1.50, '3 pz. a persona', 4),
  ('Salumi con piadina', 'antipasti', 6.00, '3 tipi salumi 2 fette a persona + piadina', 5),
  ('Caprese', 'antipasti', 4.00, '1 pomodoro 1 mozzarella', 6)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FRITTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Olive Ascolana', 'fritti', 1.00, '2 pz a persona', 1),
  ('Anelli di Cipolla', 'fritti', 1.00, '2 pz a persona', 2),
  ('Patatine fritte', 'fritti', 1.50, NULL, 3),
  ('Camembert', 'fritti', 2.00, '2 pz a persona', 4),
  ('Nachos con cheddar', 'fritti', 2.00, '2 pz a persona', 5),
  ('Jalapeños con formaggio', 'fritti', 2.00, '2 pz a persona', 6),
  ('Pulled Pork', 'fritti', 2.50, 'Bite panati di Pulled Pork 2 pz a persona', 7),
  ('Panelle (Farina di Ceci fritta, Specialità Siciliana)', 'fritti', 2.00, '2 pz a persona', 8),
  ('Falafel', 'fritti', 2.00, '2 pz a persona', 9),
  ('Polpette vegane di Lenticchie', 'fritti', 3.00, '2 pz a persona', 10),
  ('Verdure Pastellate', 'fritti', 2.00, NULL, 11)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRIMI PIATTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Lasagne Ragù', 'primi', 8.00, NULL, 1),
  ('Cannelloni Ricotta e Spinaci', 'primi', 7.00, NULL, 2),
  ('Gramigna Panna e Salsiccia', 'primi', 8.00, NULL, 3),
  ('Rigatoni Al Ragù', 'primi', 8.00, NULL, 4)
ON CONFLICT DO NOTHING;

-- Opzione speciale "Bis di Primi" (da selezionare come checkbox separata)
-- Non viene inserita qui perché è un'opzione speciale, non un prodotto

-- =====================================================
-- SECONDI PIATTI
-- =====================================================

INSERT INTO menu_items (name, category, price, description, sort_order) VALUES
  ('Polpette di carne', 'secondi', 6.00, '4 pz a persona', 1),
  ('Polpette di melanzane', 'secondi', 6.00, '4 pz a persona', 2),
  ('Polpette Patate e Mortadella', 'secondi', 6.00, '4 pz a persona', 3),
  ('Polpette Salsiccia e friarielli', 'secondi', 6.00, '4 pz a persona', 4),
  ('Polpette Vegane di Lenticchie e Curry', 'secondi', 6.00, '4 pz a persona', 5),
  ('Cotoletta Vegana', 'secondi', 7.00, '1 pz a persona', 6)
ON CONFLICT DO NOTHING;
```

**Istruzioni:**
1. SQL Editor → **+ New Query** (nuova query)
2. **Incolla tutto il codice sopra**
3. **Run** (Ctrl+Enter)
4. Verifica: "Success. INSERT eseguiti"

---

### Step 4: Verifica

**Table Editor:**
1. Table Editor → cerca **menu_items**
2. Dovrebbe avere **33 righe** (4+6+11+4+6+2=33 prodotti)

**Test App:**
1. Ricarica http://localhost:5173/prenota
2. Seleziona "Rinfresco di Laurea"
3. **Il menu con checkbox dovrebbe apparire!**

---

## 📊 Riepilogo Diagnostica

**Tools usati:**
- ✅ MCP Playwright: testato app in browser
- ✅ MCP Supabase: tentato (nessun permesso DDL)
- ✅ Console errors: identificato 404 su `menu_items`
- ✅ Code inspection: verificato `useMenuItems` query corretta

**Problema root cause:**
- Database schema non aggiornato
- Migration 016/017 non eseguite
- Tabella `menu_items` non esiste

**Fix richiesto:**
- Eseguire migration manualmente da Supabase Dashboard
- ~2 minuti di lavoro manuale

---

## ✅ Checklist Post-Migration

- [ ] Migration 016 eseguita con successo
- [ ] Migration 017 eseguita con successo
- [ ] Table Editor mostra 33 righe in `menu_items`
- [ ] App ricaricata
- [ ] Test: selezionare "Rinfresco di Laurea"
- [ ] Menu appare con checkbox visibili
- [ ] Selezionare alcuni prodotti
- [ ] Totale a persona si aggiorna
- [ ] Testare "Intolleranze Alimentari"






