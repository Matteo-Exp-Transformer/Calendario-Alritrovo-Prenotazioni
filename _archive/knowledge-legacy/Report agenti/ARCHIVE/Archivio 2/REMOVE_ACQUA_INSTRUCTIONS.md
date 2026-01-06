# Istruzioni per Rimuovere "Acqua" dal Database

## ✅ Modifiche al Codice Completate

1. ✅ Migration SQL creata: `supabase/migrations/019_remove_acqua_menu_item.sql`
2. ✅ Migration con policy temporanea: `supabase/migrations/020_remove_acqua_with_policy.sql`
3. ✅ Rimossa inserimento "Acqua" da `017_insert_default_menu_items.sql`
4. ✅ Rimossa logica auto-selezione da `BookingRequestForm.tsx`
5. ✅ Rimosso test e2e `test-acqua-auto-select.spec.ts`

## 🗄️ Rimozione dal Database

Poiché le RLS policies richiedono autenticazione admin per DELETE su `menu_items`, esegui manualmente dalla dashboard Supabase:

### Opzione 1: SQL Editor (Raccomandato)

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto: **dphuttzgdcerexunebct**
3. Vai su **SQL Editor** → **New Query**
4. Copia e incolla questo SQL:

```sql
-- Rimuovi "Acqua" dal database
DELETE FROM menu_items 
WHERE name = 'Acqua' AND category = 'bevande';
```

5. Clicca **Run** (o premi Ctrl+Enter)
6. Verifica che risulti: "Success. 1 row deleted" (o "0 rows" se già rimosso)

### Opzione 2: Table Editor (Alternativa)

1. Vai su **Table Editor** → `menu_items`
2. Cerca la riga con `name = 'Acqua'` e `category = 'bevande'`
3. Clicca sui tre puntini (...) sulla riga
4. Seleziona **Delete**
5. Conferma l'eliminazione

## ✅ Verifica

Dopo la rimozione:
1. Ricarica la pagina dell'app (`http://localhost:5175/prenota`)
2. Seleziona "Rinfresco di Laurea"
3. Verifica che "Acqua" NON appaia più nella sezione "Bevande"

## 📝 Note

- La migration `019_remove_acqua_menu_item.sql` è già pronta per essere applicata in futuro
- Se vuoi applicare automaticamente, usa la migration `020_remove_acqua_with_policy.sql` che crea una policy temporanea per permettere la DELETE anonima



