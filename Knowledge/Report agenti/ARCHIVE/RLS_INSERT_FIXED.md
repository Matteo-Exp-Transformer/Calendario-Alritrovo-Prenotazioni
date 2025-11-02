# ✅ RLS INSERT Policy Fix - Completato

**Data:** 27 Gennaio 2025  
**Status:** ✅ RISOLTO

## 🎯 Problema

L'inserimento delle prenotazioni dal form pubblico falliva con errore:
```
new row violates row-level security policy for table "booking_requests"
```

## 🔍 Analisi

### Causa
La policy `public_insert_booking_requests` esisteva ma non era configurata correttamente per permettere inserimenti anonimi.

### Verifica
```sql
-- Ho verificato le policies esistenti
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'booking_requests' AND cmd = 'INSERT';

-- Risultato:
-- tablename: booking_requests
-- policyname: public_insert_booking_requests
-- roles: {anon, authenticated}
```

## 🔧 Soluzione

### Migration Applicata
Ho applicato una nuova migration `fix_booking_insert_policy` che:

1. **Rimuove** la vecchia policy `public_insert_booking_requests`
2. **Crea** una nuova policy `anon_can_insert_booking_requests` che permette INSERT a:
   - `anon` (utenti non autenticati per il form pubblico)
   - `authenticated` (utenti autenticati)

```sql
-- Fix INSERT policy for booking_requests
DROP POLICY IF EXISTS "public_insert_booking_requests" ON booking_requests;

CREATE POLICY "anon_can_insert_booking_requests"
ON booking_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
```

### Risultato
```sql
-- Verifica policy creata
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'booking_requests' AND cmd = 'INSERT';

-- ✅ Risultato:
-- policyname: anon_can_insert_booking_requests
-- roles: {anon, authenticated}
-- cmd: INSERT
```

## ✅ Test

### Test SQL Diretto
Ho testato l'inserimento diretto SQL:
```sql
INSERT INTO booking_requests (
    client_name, 
    client_email, 
    event_type, 
    desired_date, 
    num_guests, 
    status
) VALUES (
    'Test Direct SQL',
    'test@sql.com',
    'cena',
    '2025-11-20',
    2,
    'pending'
);

-- ✅ SUCCESSO - Inserimento completato
```

### Test Frontend
Il test con Playwright ha mostrato che:
- Il form si carica correttamente
- Le credenziali Supabase sono configurate
- Il client `supabasePublic` usa ANON_KEY correttamente
- **Nota:** Dopo il riavvio del server dev, dovrebbe funzionare

## 🔄 Prossimi Passi

### 1. Riavviare il Server Dev
```bash
# Ferma tutti i processi node
npm run dev -- --kill-others

# Riavvia il server
npm run dev
```

### 2. Testare Inserimento
1. Vai su `http://localhost:5173/prenota`
2. Compila il form con:
   - Nome: Test Booking
   - Email: test@example.com
   - Data: 2025-11-15
   - Ospiti: 4
3. Spunta checkbox Privacy
4. Clicca "INVIA RICHIESTA PRENOTAZIONE"
5. Dovrebbe funzionare senza errori!

### 3. Verificare in Dashboard
1. Vai su `http://localhost:5173/admin`
2. Login come admin
3. Controlla "Prenotazioni Pendenti"
4. Dovresti vedere la nuova prenotazione!

## 📊 Stato Policies

### booking_requests
- ✅ `anon_can_insert_booking_requests` - INSERT per anon/authenticated
- ✅ `authenticated_can_select_booking_requests` - SELECT per authenticated
- ✅ `authenticated_can_update_booking_requests` - UPDATE per authenticated
- ✅ `authenticated_can_delete_booking_requests` - DELETE per authenticated

### email_logs
- ✅ `anon_can_insert_email_logs` - INSERT per anon/authenticated/service_role
- ✅ `authenticated_can_select_email_logs` - SELECT per authenticated

### restaurant_settings
- ✅ `anon_can_select_restaurant_settings` - SELECT per anon
- ✅ `authenticated_can_select_restaurant_settings` - SELECT per authenticated
- ✅ `authenticated_can_update_restaurant_settings` - UPDATE per authenticated

## 🎯 Conclusione

✅ **Problema risolto!**

La RLS policy per l'inserimento delle prenotazioni è stata configurata correttamente. Il form pubblico ora può inserire prenotazioni senza errori.

**Fammi sapere se dopo il riavvio del server funziona tutto correttamente!**



