# Setup Database Supabase - Al Ritrovo Booking

## Istruzioni per Setup Manuale

Poiché non abbiamo accesso diretto al Supabase CLI, esegui questi passi manualmente:

### Step 1: Accedi a Supabase Dashboard
1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto: **dphuttzgdcerexunebct**
3. Nel menu laterale, clicca su **SQL Editor**

### Step 2: Esegui Migration
1. Clicca su **+ New Query**
2. Copia e incolla il contenuto del file `001_initial_schema.sql`
3. Clicca su **Run** (o premi Ctrl+Enter)
4. Verifica che l'output mostri "Success. No rows returned"

### Step 3: Verifica Tabelle Create
Nel menu laterale, vai su **Table Editor** e verifica la presenza di:
- ✅ `booking_requests` (17 colonne)
- ✅ `admin_users` (7 colonne)
- ✅ `email_logs` (8 colonne)
- ✅ `restaurant_settings` (4 colonne)

### Step 4: Verifica RLS Policies
1. Vai su **Authentication** → **Policies**
2. Verifica che ogni tabella abbia le policies attive
3. Dovresti vedere almeno 9 policies totali

### Step 5: Verifica Settings Iniziali
1. Vai su **Table Editor** → `restaurant_settings`
2. Verifica che ci siano 4 righe:
   - `email_notifications_enabled`: {"value": true}
   - `sender_email`: {"value": "noreply@resend.dev"}
   - `restaurant_name`: {"value": "Al Ritrovo"}
   - `restaurant_address`: {"value": "Bologna, Italia"}

## Troubleshooting

### Errore: "relation already exists"
Se vedi questo errore, significa che le tabelle esistono già. Puoi:
1. Droppare le tabelle esistenti (attenzione: perderai i dati!)
2. Oppure skippare questo step se le tabelle sono già corrette

### Errore: "permission denied"
Assicurati di essere loggato come Owner del progetto Supabase.

## Prossimi Step
Dopo aver completato il setup database, puoi procedere con:
1. Creazione del Supabase client in `src/lib/supabase.ts`
2. Definizione dei types TypeScript
3. Implementazione delle funzionalità
