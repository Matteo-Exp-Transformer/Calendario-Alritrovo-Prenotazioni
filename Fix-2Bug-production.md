# Fix 2 Bug Production

## Cosa succedeva
- Dopo il deploy su Vercel le prenotazioni accettate mostravano un orario sfalsato di +1h.
- In "Prenotazioni pendenti" comparivano doppie richieste anche se il cliente ne aveva inviata una sola.

## Perche' accadeva solo in production
- Nel database live esistono richieste accettate senza `desired_time`: il calendario tornava a leggere `confirmed_start` (salvato in UTC) e l'orario risultava spostato.
- La tabella `booking_requests` non aveva un blocco server-side: qualsiasi doppio click o retry della mutation generava righe duplicate.

## Come abbiamo risolto
1. `useBookingMutations` ora salva/aggiorna sempre `desired_time` quando l'admin conferma o modifica una prenotazione, cosi' il calendario legge l'orario corretto.
2. Aggiunta migration `20251105_fix_desired_time_and_duplicates.sql` che:
   - ricostruisce `desired_time` usando `confirmed_start` per i record gia' esistenti,
   - elimina i duplicati pendenti lasciando la prima richiesta,
   - aggiunge trigger e indice univoco per impedire nuovi duplicati.
3. Aggiornata `BookingDetailsModal` per passare l'orario desiderato ai salvataggi manuali.

## Procedura dopo il deploy
- Eseguire la migration su Supabase (`supabase db push` oppure `psql -f supabase/migrations/20251105_fix_desired_time_and_duplicates.sql`).
- Verificare su production con una prenotazione di test: l'ora deve restare identica e non devono piu' apparire doppie richieste.
