# 🧪 User Flow Test Guide - Al Ritrovo Booking System

## 🎯 Scenario Completo di Test

### **STEP 1: Invia Richiesta Come Cliente** (2 minuti)

1. **Apri browser**: `http://localhost:5173/prenota`
   
2. **Compila il form**:
   ```
   Nome: Mario Rossi
   Email: mario.rossi@example.com
   Telefono: 333 1234567
   Tipo Evento: 🍽️ Cena
   Data: Seleziona un giorno della prossima settimana
   Orario: 20:30
   Numero Ospiti: 4
   Note: "Tavolo vicino alla finestra, prego"
   ☑️ Privacy Policy
   ```

3. **Click**: [Invia Richiesta]
   
4. **Risultato atteso**:
   - ✅ Toast: "Richiesta inviata con successo! Ti contatteremo a breve."
   - Form si resetta
   - **NON** ricevi email (ancora in pending)

---

### **STEP 2: Accedi Come Admin** (30 secondi)

1. **Apri nuova tab**: `http://localhost:5173/login`
   
2. **Login**:
   ```
   Email: 0cavuz0@gmail.com
   Password: Cavallaro94
   ```

3. **Click**: [Accedi]
   
4. **Risultato atteso**:
   - ✅ Redirect automatico a `/admin`
   - Header mostra "Ciao, 0cavuz0@gmail.com"
   - Dashboard con 3 tab e statistiche

---

### **STEP 3: Dashboard - Verifica Statistiche** (30 secondi)

**Risultato atteso in header**:
```
┌────────────────────────────────────────────────┐
│ Al Ritrovo - Admin                  Ciao, ... │
│                                          Logout│
└────────────────────────────────────────────────┘

Statistiche Cards:
┌─────────────┬─────────────┬─────────────┐
│ ⏳ Pendenti │ ✅ Accettate│ 📊 Totale   │
│      1      │      0      │      1      │
│ ← SHOULD BE 1                               │
└─────────────┴─────────────┴─────────────┘

Tabs Navigation:
┌───────────────┬──────────────┬─────────────┐
│ 📅 Calendario │ ⏳ Pendenti 1 │ 📚 Archivio │
│    (active)    │ (badge: 1)   │             │
└───────────────┴──────────────┴─────────────┘
```

---

### **STEP 4: Verifica Richiesta Pending** (1 minuto)

1. **Click tab**: "⏳ Prenotazioni Pendenti" (badge: 1)

2. **Risultato atteso**:
```html
┌────────────────────────────────────────┐
│ 📋 Richieste in Attesa (1)             │
│                                        │
│ ┌───────────────────────────────────┐ │
│ │ 👤 Mario Rossi                     │ │
│ │ 📧 mario.rossi@example.com         │ │
│ │ 📞 333 1234567                      │ │
│ │ 📅 Data richiesta: 3 novembre 2025 │ │
│ │ ⏰ Orario richiesto: 20:30         │ │
│ │ 🎉 Tipo evento: 🍽️ Cena            │ │
│ │ 👥 Ospiti: 4                       │ │
│ │ 📝 Note: "Tavolo finestra..."      │ │
│ │                                     │ │
│ │ [✅ ACCETTA] [❌ RIFIUTA]          │ │
│ └───────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

### **STEP 5: Accetta Prenotazione** (2 minuti)

1. **Click**: [✅ ACCETTA]

2. **Modale "Accetta Prenotazione" si apre**:
```
┌──────────────────────────────────────┐
│ Accetta Prenotazione              [X]│
├──────────────────────────────────────┤
│ ℹ️ Cliente: Mario Rossi           │
│    Evento: 🍽️ Cena                  │
│    Data richiesta: 03/11/2025        │
├──────────────────────────────────────┤
│ Data confermata: [03/11/2025]      │
│ Orario inizio: [20:00] ← Auto-filled │
│ Orario fine:   [22:00] ← Auto-filled │
│ Ospiti:        [4]                   │
│                                     │
│ [Annulla]  [✅ Conferma Prenotazione]│
└──────────────────────────────────────┘
```

3. **Modifica orario fine a 22:30** (puoi cambiare)

4. **Click**: [✅ Conferma Prenotazione]

5. **Risultato atteso**:
   - ✅ Toast: "Prenotazione accettata con successo!"
   - Modale si chiude
   - Richiesta **scompare** dalla tab "Pendenti"
   - Statistiche si aggiornano automaticamente:
     - ⏳ Pendenti: 1 → **0** ✅
     - ✅ Accettate: 0 → **1** ✅
   - **Email inviata automaticamente a mario.rossi@example.com** 📧

---

### **STEP 6: Verifica Email (Opzionale)** (30 secondi)

1. **Controlla email** di `mario.rossi@example.com`
   
2. **Risultato atteso**:
```
Subject: ✅ Prenotazione Confermata - Al Ritrovo

HTML Email:
- Header rosso "Al Ritrovo"
- Badge verde "PRENOTAZIONE CONFERMATA"
- Dettagli: Nome, Data, Evento, Ospiti
- Note personali incluse
- Footer: "Al Ritrovo - Bologna, Italia"
```

---

### **STEP 7: Verifica Calendario** (1 minuto)

1. **Click tab**: "📅 Calendario"

2. **Risultato atteso**:
```
┌────────────────────────────────────────┐
│ 📅 Calendario Prenotazioni    [1]      │
├────────────────────────────────────────┤
│  [←]  Ottobre 2025  [→]                │
│  Today                              │
├────────────────────────────────────────┤
│  [FullCalendar Component]               │
│  - Evento rosso #8B0000 (Cena)        │
│  - Title: "Mario Rossi - 4 ospiti"   │
│  - Data: 3 novembre, ore 20:00-22:30 │
└────────────────────────────────────────┘

Legenda:
🍽️ Cena      #8B0000
🥂 Aperitivo #DAA520
🎉 Evento    #9370DB
🎓 Laurea    #20B2AA
```

3. **Click sull'evento nel calendario**

4. **Modale "Dettagli Prenotazione" si apre**:
```
┌──────────────────────────────────────┐
│ Dettagli Prenotazione            [X]│
├──────────────────────────────────────┤
│ 👤 Informazioni Cliente             │
│    Mario Rossi                       │
│    mario.rossi@example.com          │
│    333 1234567                       │
├──────────────────────────────────────┤
│ 📅 Dettagli Evento                   │
│    Tipo: 🍽️ Cena                    │
│    Data/Ora: 3 nov 2025 20:00       │
│    Fine: 3 nov 2025 22:30           │
│    Ospiti: 4                         │
│    Note: "Tavolo finestra..."        │
│                                       │
│    [✏️ Modifica] [🗑️ Cancella]      │
└──────────────────────────────────────┘
```

5. **Click**: [✏️ Modifica]
   - Cambia orario fine a **23:00**
   - Click: [💾 Salva Modifiche]
   - ✅ Toast: "Prenotazione aggiornata!"

---

### **STEP 8: Verifica Archivio** (1 minuto)

1. **Click tab**: "📚 Archivio"

2. **Filtri disponibili**:
   - 📚 Tutte
   - ✅ Accettate
   - ❌ Rifiutate

3. **Risultato atteso**:
```html
┌────────────────────────────────────────┐
│ Filtra per status:                     │
│ [📚 Tutte]  [✅ Accettate] [❌ Rifiuta]│
├────────────────────────────────────────┤
│ Mostrando 1 prenotazioni               │
│                                        │
│ ┌───────────────────────────────────┐ │
│ │ Cliente: Mario Rossi              │ │
│ │      📧 mario.rossi@example.com   │ │
│ │ Dettagli: 🍽️ Cena                 │ │
│ │      4 ospiti                     │ │
│ │      📅 3 nov 2025 20:00         │ │
│ │                                    │ │
│ │ Status: [✅ Accettata]            │ │
│ │ Data: 03 nov 2025 20:00          │ │
│ └───────────────────────────────────┘ │
└────────────────────────────────────────┘
```

4. **Seleziona filtro**: "❌ Rifiutate"
   - ✅ **Lista vuota** (Nessuna prenotazione rifiutata)

---

### **STEP 9: Test Rifiuto Prenotazione** (2 minuti)

1. **Invia altra richiesta**: Vai su `/prenota`
   - Nome: "Test Reject"
   - Email: "test@example.com"
   - Ospiti: 2
   - Data: Prossima settimana

2. **Admin: Vai su tab "Pendenti"**
   - Verrai informato che ci sono **2 richieste**

3. **Click**: [❌ RIFIUTA] sulla nuova richiesta

4. **Modale "Rifiuta Prenotazione"**:
```
┌──────────────────────────────────────┐
│ Rifiuta Prenotazione             [X]│
├──────────────────────────────────────┤
│ ⚠️ Attenzione: Stai per rifiutare... │
│                                       │
│ Motivo rifiuto (opzionale):        │
│ [Textarea]                           │
│ "Sala già prenotata in quella data" │
│                                       │
│ [Annulla]  [❌ Rifiuta Prenotazione] │
└──────────────────────────────────────┘
```

5. **Click**: [❌ Rifiuta Prenotazione]

6. **Risultato atteso**:
   - ✅ Toast: "Prenotazione rifiutata"
   - Richiesta scompare da "Pendenti"
   - Compare in "Archivio" → **Filtro "Rifiutate"**
   - Statistiche aggiornate:
     - ⏳ Pendenti: 1 → **0** ✅
   - **Email inviata a test@example.com** 📧 (notifica rifiuto)

---

### **STEP 10: Verifica Report Email** (Opzionale)

1. **Controlla la console del browser** (F12)
   
2. **Cerca logs**:
```
[Email] Sent successfully: {id: '...', ...}
[Email] Error logging to database: (se errore)
```

3. **Verifica database Supabase**:
   - Table: `email_logs`
   - Dovresti vedere 2 righe:
     - `booking_accepted` → mario.rossi@example.com
     - `booking_rejected` → test@example.com

---

## ✅ Checklist Completo Test

### Funzionalità Pubbliche
- [ ] Form `/prenota` mostra tutti i campi
- [ ] Validazione email funziona
- [ ] Validazione data nel passato bloccata
- [ ] Privacy checkbox obbligatorio
- [ ] Submit crea record in Supabase
- [ ] Toast successo appare
- [ ] Form si resetta

### Autenticazione
- [ ] Login funziona
- [ ] Redirect a `/admin` dopo login
- [ ] Logout funziona
- [ ] Session persiste dopo refresh
- [ ] Tentativo accesso `/admin` senza login → redirect

### Dashboard
- [ ] 3 Tab navigation funziona
- [ ] Statistiche real-time funzionano
- [ ] Badge count su tab "Pendenti"
- [ ] Loading states durante fetch

### Tab Pendenti
- [ ] Lista mostra richieste pending
- [ ] Card mostra tutti i dati cliente
- [ ] Modale ACCETTA si apre
- [ ] Modale ACCETTA salva modifiche
- [ ] Dopo ACCETTA → scompare da pendenti
- [ ] Modale RIFIUTA si apre
- [ ] Modale RIFIUTA salva con motivo

### Tab Calendario
- [ ] FullCalendar caricato
- [ ] Viste Mese/Settimana/Giorno/Lista funzionano
- [ ] Eventi accettati appaiono nel calendario
- [ ] Colori corretti per tipo evento
- [ ] Click evento apre modale dettagli
- [ ] Modifica funziona
- [ ] Cancellazione funziona (con conferma)

### Tab Archivio
- [ ] Filtri Tutte/Accettate/Rifiutate funzionano
- [ ] Lista mostra tutte le prenotazioni
- [ ] Status badge colorati corretti
- [ ] Motivo rifiuto mostrato se presente

### Email Automatiche
- [ ] Email ACCETTA viene inviata
- [ ] Email RIFIUTA viene inviata
- [ ] Email CANCELLA viene inviata (se testato)
- [ ] Email loggata in database

### Statistiche
- [ ] Contatore pendenti aggiornato
- [ ] Contatore accettate aggiornato
- [ ] Contatore totale aggiornato

---

## 🐛 Possibili Problemi

### Se Email non viene inviata:
- ✅ Verifica `.env.local` ha `RESEND_API_KEY`
- ✅ Verifica console browser per errori
- ✅ Email potrebbe essere in spam

### Se Statistiche non si aggiornano:
- ✅ Attendi 30 secondi (refetch interval)
- ✅ Refresh tab per forzare refetch
- ✅ Verifica console per errori React Query

### Se Modale non si apre:
- ✅ Verifica console per errori JavaScript
- ✅ Verifica che Modal componente sia esportato

---

## 📊 Risultati Attesi

Dopo il test completo, dovresti avere:
- ✅ 1 prenotazione ACCETTATA (Mario Rossi)
- ✅ 1 prenotazione RIFIUTATA (Test Reject)
- ✅ 2 email inviate (verificate in console/inbox)
- ✅ 2 log email in database
- ✅ Calendario mostra 1 evento rosso
- ✅ Archivio mostra 2 prenotazioni totali

