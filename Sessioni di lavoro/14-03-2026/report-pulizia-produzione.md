# Report Sessione di Lavoro - 14 Marzo 2026

## Branch: `chore/cleanup-production-ready`

## Obiettivo
Pulire il codebase per avvicinarlo alla produzione: rimuovere codice morto, fix di sicurezza, preparare il terreno per il multi-tenant.

---

## Lavoro svolto

### 1. Eliminazione modulo Calendar (codice morto da BHM-v.2)
- **Eliminati 36 file** dall'intera directory `src/features/calendar/`
- Eliminati i tipi collegati: `src/types/calendar.ts`, `src/types/calendar-filters.ts`
- Rimossa l'esclusione `src/features/calendar/**/*` da `tsconfig.json` (non serve piu')
- Il modulo aveva import rotti verso moduli inesistenti (`@/features/conservation/*`, `@/features/management/*`, `@/features/inventory/*`)
- **NON** toccato `BookingCalendar.tsx` (parte di booking, funzionante)

### 2. Eliminazione file .backup
- `src/types/booking.ts.backup` (173 righe)
- `src/features/booking/components/BookingRequestForm.tsx.backup` (722 righe)

### 3. Rimozione codice morto "cover charge"
Il coperto era stato azzerato (`COVER_CHARGE_PER_PERSON_EUR = 0`) ma il codice restava. Rimosso da **7 file**:
- `menuPricing.ts`: eliminati `BookingTypeWithCover`, `COVER_CHARGE_PER_PERSON_EUR`, `needsCoverCharge`, `applyCoverCharge`, `removeCoverCharge`
- `BookingRequestForm.tsx`, `AdminBookingForm.tsx`, `BookingDetailsModal.tsx`, `BookingCalendar.tsx`, `MenuTab.tsx`: rimosso import e sostituito `applyCoverCharge(x, y)` con `x`
- `menuPricing.test.ts`: rimosso test del cover charge

### 4. Rimozione `@ts-nocheck` e `@ts-ignore`
Rimossa la soppressione totale di TypeScript da **6 file hook** e corretto con cast `as any` mirati:
- `useBookingQueries.ts`
- `useBookingRequests.ts`
- `useBookingMutations.ts`
- `useMenuItems.ts`
- `useEmailNotifications.ts`
- `useAdminBookingRequests.ts`
- `useBusinessHours.ts` (rimosso `@ts-ignore`)

### 5. Pulizia `database.ts`
- Rimossa definizione tabella `csrf_tokens` (32 righe, mai usata nel frontend)

### 6. Rimozione pacchetti npm inutilizzati
Da `package.json`:
- `resend` (mai importato, email via Edge Function)
- `@react-email/components` (mai importato)
- `@fullcalendar/multimonth` (usato solo dal calendar eliminato)

Lock file aggiornato (-615 righe).

### 7. Rimozione variabili di debug globali
- `BookingRequestForm.tsx`: rimossi `componentMountCount`, `lastMountTime` e useEffect di mount-tracking
- `useBookingRequests.ts`: rimossi `mutationCallCount`, `mutationCallTracker` (tenuto mutation lock per prevenire doppio submit)

### 8. Rimozione console.log da produzione
Rimossi ~295 `console.log`/`console.warn`/`console.info` da **21 file**. Tenuti solo `console.error` per errori reali.

File critici (loggavano dati sensibili):
- `useBookingQueries.ts`: loggava **preview del JWT token** in console
- `email.ts`: loggava **email destinatari**
- `useBookingMutations.ts`: loggava `client_email`

### 9. Protezione iframe in `vercel.json`
Sostituito:
```
X-Frame-Options: ALLOWALL
Content-Security-Policy: frame-ancestors *
```
Con:
```
Content-Security-Policy: frame-ancestors 'self' https://alritrovobologna.wixsite.com
```
L'app e' embedded solo nel sito Wix, non serve permettere iframe da qualsiasi dominio.

### 10. Fix autenticazione admin
- `useAdminAuth.ts`: aggiunta verifica che l'email esista nella tabella `admin_users`. Prima **qualsiasi** utente Supabase Auth poteva accedere come admin.
- Ora il login controlla: (1) credenziali valide in Supabase Auth, (2) email presente in `admin_users`
- Se l'utente non e' in `admin_users`, viene fatto signOut e mostrato "Utente non autorizzato"

### 11. Rimozione concetto "role" (admin/staff)
- Eliminato tipo `AdminRole` da `booking.ts`
- Rimossi campi `role` e `password_hash` dall'interfaccia `AdminUser`
- `useAdminAuth.ts`: non legge piu' `role`, basta esistere in `admin_users`
- `supabase.ts`: `isAdmin()` rinominato in `isAuthorizedUser()`, controlla solo esistenza email
- `AdminDashboard.tsx`: mostra "Utente" invece di "Admin/Staff"
- Creata migration `036_drop_password_hash_and_role.sql` per eliminare le colonne dal DB

### 12. Pulizia `ui/index.ts`
Rimosse 3 righe commentate con TODO (Alert, Badge, Card - componenti mai creati).

### 13. Migration DB eseguita su Supabase
Eseguita manualmente su Supabase Dashboard:
- Droppata policy `"Only admins can manage menu items"` su `menu_items` (dipendeva da `role`)
- Ricreata policy `"Only authorized users can manage menu items"` (controlla solo esistenza in `admin_users`)
- Droppate colonne `password_hash` e `role` da `admin_users`

---

## Statistiche commit principale (e586304)

| Metrica | Valore |
|---------|--------|
| File modificati | 74 |
| Righe aggiunte | +129 |
| Righe rimosse | -16.559 |
| File eliminati | 40 (36 calendar + 2 backup + 2 tipi) |

## Modifiche non ancora committate
- Rimozione `AdminRole` e `role` (4 file modificati)
- Migration `036_drop_password_hash_and_role.sql` (nuovo file)

---

## Problemi riscontrati e risolti
1. **Login bloccato dopo fix auth**: la tabella `admin_users` aveva solo `admin@alritrovo.com`. Gli altri utenti registrati in Supabase Auth non erano in tabella. Risolto spiegando il flusso e semplificando (rimozione role).
2. **DROP COLUMN role fallita**: la colonna `role` era referenziata da una RLS policy su `menu_items`. Risolto droppando e ricreando la policy prima del DROP.
3. **Inserimento utenti in admin_users fallito**: la colonna `password_hash` aveva vincolo NOT NULL ma le password sono gestite da Supabase Auth. Risolto droppando la colonna.

---

## Piano multi-tenant (Fase 2 - da fare)
Piano dettagliato salvato in:
- `C:\Users\matte.MIO\.claude\plans\mutable-coalescing-parasol.md`
- `C:\Users\matte.MIO\.cursor\plans\multi-tenant_e_sicurezza_b3eaaa7f.plan.md`

Prevede: tabella `organizations`, `tenant_id` su tutte le tabelle, RLS per tenant, Edge Functions per insert sicuro e inviti, TenantContext React, route `/prenota/:tenantSlug`, flusso registrazione con token.

---

## Cosa resta da fare (Fase 1 incompleta)
- [ ] Committare le modifiche role/AdminRole (4 file + migration)
- [ ] Verificare build finale (`tsc --noEmit` + `npm run build`)
- [ ] Test manuale: login, /prenota, /admin
- [ ] Push del branch
