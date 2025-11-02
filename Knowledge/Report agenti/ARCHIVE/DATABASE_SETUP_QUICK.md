# 🗄️ Setup Database Supabase - Guida Rapida (2 minuti)

## Metodo 1: Supabase Dashboard (Raccomandato)

### Passo 1: Apri SQL Editor
1. Vai su: https://supabase.com/dashboard/project/dphuttzgdcerexunebct
2. Menu laterale → **SQL Editor**
3. Click **"New Query"**

### Passo 2: Esegui Migration
1. Apri questo file: `supabase/migrations/001_initial_schema.sql`
2. **COPIA TUTTO** il contenuto (Ctrl+A, Ctrl+C)
3. **INCOLLA** nel SQL Editor di Supabase
4. Click **"Run"** (bottone blu in basso a destra)
5. Attendi ~5 secondi

### Passo 3: Verifica
1. Dovresti vedere: ✅ "Success. No rows returned"
2. Menu laterale → **Table Editor**
3. Verifica che ci siano **4 tabelle**:
   - ✅ `booking_requests`
   - ✅ `admin_users`
   - ✅ `email_logs`
   - ✅ `restaurant_settings`

4. Click su `restaurant_settings` → Verifica **4 righe** di settings iniziali

---

## Metodo 2: Supabase CLI (Alternativo)

Se hai Supabase CLI installato:

```bash
cd "c:\Users\matte.MIO\Documents\GitHub\Calendarbackup"

# Link progetto
npx supabase link --project-ref dphuttzgdcerexunebct

# Push migration
npx supabase db push
```

---

## ✅ Quando Hai Finito

Torna qui e scrivi: **"✅ Database creato"**

Procederemo immediatamente con la **Fase 3** (Auth Developer)!

---

## ⚠️ Problemi?

### Errore: "relation already exists"
- Normale se hai già eseguito la migration prima
- Ignora e vai avanti

### Errore: "permission denied"
- Verifica di essere loggato con l'account corretto
- Riprova

### Non vedi le tabelle
- Refresh la pagina (F5)
- Controlla di essere nel progetto corretto (ID: dphuttzgdcerexunebct)
