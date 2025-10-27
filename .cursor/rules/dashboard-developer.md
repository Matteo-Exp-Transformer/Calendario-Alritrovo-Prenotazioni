# Dashboard & Calendar Developer Agent

**Specializzazione**: Fase 5-6 del PLANNING_TASKS.md
**Responsabilità**: Dashboard admin e calendario integrato

## Compiti Principali

### 1. Admin Dashboard (Fase 5 - 3h)
- Layout dashboard con 3 tab
- Tab "Prenotazioni Pendenti" con lista richieste
- Modali Accept/Reject
- Tab "Archivio" con filtri
- Gestione stato prenotazioni

### 2. Calendario (Fase 6 - 2h)
- Integrazione FullCalendar
- Visualizzazione prenotazioni accepted
- Modal modifica/cancella
- Colorazione per tipo evento
- Click handler eventi

## Files da Creare

```
src/
├── features/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── PendingRequestsTab.tsx
│   │   │   ├── ArchiveTab.tsx
│   │   │   ├── AcceptRequestModal.tsx
│   │   │   ├── RejectRequestModal.tsx
│   │   │   └── BookingModal.tsx
│   │   └── pages/
│   │       └── AdminDashboardPage.tsx
│   ├── calendar/
│   │   ├── Calendar.tsx (copiato da esistente)
│   │   ├── BookingCalendar.tsx
│   │   ├── calendar-custom.css
│   │   └── utils/
│   │       └── bookingEventTransform.ts
│   └── booking/
│       └── hooks/
│           └── useBookingMutations.ts (accept/reject/update/delete)
```

## Dettagli Implementazione

### AdminDashboard Layout
```tsx
// 3 Tab Navigation
- Tab 1: 📅 Calendario (default)
- Tab 2: ⏳ Prenotazioni Pendenti (badge con count)
- Tab 3: 📚 Archivio

// Ogni tab è un componente separato
```

### PendingRequestsTab
**Mostra**:
- Tutte le richieste con `status='pending'`
- Card per ogni richiesta con tutti i dati cliente
- Bottoni: ✅ ACCETTA | ❌ RIFIUTA
- Ordinamento: più recenti in alto

**Card Richiesta**:
```tsx
┌────────────────────────────────┐
│ 👤 Nome Cliente               │
│ 📧 email@example.com          │
│ 📞 333 1234567                │
│ 📅 15 febbraio 2025 20:30    │
│ 👥 4 ospiti                   │
│ 🎉 Tipo: Cena                │
│ 📝 Note: "Tavolo finestra"   │
│                                │
│ [✅ ACCETTA] [❌ RIFIUTA]     │
└────────────────────────────────┘
```

### AcceptRequestModal
**Campi modificabili**:
- Data (default: quella richiesta)
- Orario inizio (default: orario richiesto)
- Orario fine (default: +2h)
- Numero ospiti (default: richiesto)
- Note interne (opzionale)

**Azione**:
```typescript
// Al submit:
1. UPDATE booking_requests SET
   status='accepted',
   confirmed_start='2025-02-15 20:00',
   confirmed_end='2025-02-15 22:00'
2. Evento appare in Calendario
3. Evento appare in Archivio (filtro "Accettate")
4. Scompare da Pending

// NON inviare ancora email (Fase 7)
```

### RejectRequestModal
**Campi**:
- Motivo rifiuto (textarea, opzionale)

**Azione**:
```typescript
// Al submit:
1. UPDATE booking_requests SET
   status='rejected',
   rejection_reason='Sala occupata'
2. Evento appare in Archivio (filtro "Rifiutate")
3. Scompare da Pending

// NON inviare ancora email (Fase 7)
```

### ArchiveTab
**Filtri dropdown**:
- Tutte
- ✅ Accettate (status='accepted')
- ❌ Rifiutate (status='rejected')

**Visualizzazione**:
- Lista cronologica (più recenti in alto)
- Per accepted: link "📅 Vedi in Calendario" (scroll to event)
- Per rejected: mostra motivo se presente

### BookingCalendar
**Integrazione FullCalendar**:
- Copia `Calendar.tsx` dal progetto esistente
- Modifica per usare `booking_requests` invece di shifts
- Eventi: solo status='accepted'

**Transform Eventi**:
```typescript
const transformBookingToEvent = (booking: BookingRequest) => ({
  id: booking.id,
  title: `${booking.client_name} - ${booking.num_guests} ospiti`,
  start: new Date(booking.confirmed_start),
  end: new Date(booking.confirmed_end),
  backgroundColor: getColorByType(booking.event_type),
  extendedProps: { ...booking }
})

// Colori
cena: #8B0000 (bordeaux)
aperitivo: #DAA520 (oro)
evento: #9370DB (viola)
laurea: #20B2AA (acquamarina)
```

**Click Evento**:
- Apre `BookingModal`
- Permette modifica data/ora/ospiti
- Bottone "Cancella Prenotazione" (conferma dialog)

### BookingModal (Modifica)
**Campi**:
- Cliente (readonly)
- Email (readonly)
- Telefono (readonly)
- Data (modificabile)
- Ora inizio (modificabile)
- Ora fine (modificabile)
- Ospiti (modificabile)
- Note (modificabile)

**Azioni**:
- 💾 SALVA MODIFICHE → UPDATE in DB
- 🗑️ CANCELLA PRENOTAZIONE → Conferma + UPDATE status='cancelled'

## Checklist Completamento

### Fase 5 (Dashboard)
- [ ] Layout 3 tab funzionante
- [ ] PendingRequestsTab mostra richieste pending
- [ ] AcceptRequestModal funzionante (update status, confirmed_start/end)
- [ ] RejectRequestModal funzionante (update status, rejection_reason)
- [ ] ArchiveTab con filtri Tutte/Accettate/Rifiutate
- [ ] Badge count su tab Pending
- [ ] Responsive mobile/tablet

### Fase 6 (Calendario)
- [ ] Calendar.tsx copiato e adattato
- [ ] BookingCalendar mostra eventi accepted
- [ ] Eventi colorati per tipo
- [ ] Click evento apre BookingModal
- [ ] BookingModal permette modifica
- [ ] Cancellazione prenotazione funziona
- [ ] Vista Mese/Settimana/Giorno/Anno

## Test Cases

Prima di completare, testa:

1. **Accept Flow**:
   - Accetta richiesta pending
   - Modifica orario fine
   - Verifica appare in calendario
   - Verifica appare in archivio (filtro Accettate)
   - Verifica scompare da pending

2. **Reject Flow**:
   - Rifiuta richiesta pending con motivo
   - Verifica appare in archivio (filtro Rifiutate)
   - Verifica motivo mostrato
   - Verifica scompare da pending

3. **Calendar Flow**:
   - Click evento nel calendario
   - Modifica data/ora
   - Salva → verifica update in calendario
   - Cancella prenotazione → verifica scompare

4. **Edge Cases**:
   - Orario fine < orario inizio → errore
   - Data nel passato → errore
   - Ospiti < 1 o > 50 → errore

## Note Importanti

- **NON** implementare ancora invio email (Fase 7)
- Usa i componenti UI già esistenti (Button, Modal, Input, etc.)
- Gestisci loading states (skeleton mentre carica)
- Gestisci empty states ("Nessuna richiesta pending")
- Conferma sempre prima di cancellare

## Quando Hai Finito

Aggiorna PLANNING_TASKS.md:
- Segna Fase 5-6 come "✅ Completed"
- Segna milestone 3 come completato
- Crea screenshot dashboard/calendario
- Testa tutti i flow (accept/reject/modify/delete)
- Notifica completamento e passa a Email Developer
