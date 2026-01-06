# 📋 Product Requirements Document - Sistema Prenotazioni Al Ritrovo

## 📊 Overview

Sistema di gestione prenotazioni per il ristorante **Al Ritrovo** di Bologna che permette ai clienti di richiedere prenotazioni online e agli admin di gestirle tramite dashboard e calendario integrato.

---

## 🎯 Obiettivi

### Per i Clienti
- Richiedere prenotazioni online in modo semplice
- Comunicare preferenze di data/ora e requisiti speciali
- Ricevere conferme automatiche via email

### Per Admin/Staff
- Visualizzare tutte le richieste in arrivo
- Approvare/rifiutare prenotazioni
- Gestire calendario prenotazioni confermate
- Modificare/cancellare prenotazioni esistenti
- Archiviare storico prenotazioni

---

## 🏗️ Architettura Sistema

### Stack Tecnologico
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Auth**: Supabase Auth
- **Email**: Resend (3000 email/mese gratuiti)
- **Deploy**: Subdomain gratuito Vercel + integrazione Wix

### Struttura Applicazione

```
URL Base: https://alritrovo-booking.vercel.app

├── /prenota           (Pubblico - Form richiesta)
├── /login             (Pubblico - Login admin)
└── /admin             (Protetto - Area admin)
    ├── Calendario
    ├── Prenotazioni Pendenti
    └── Archivio
```

---

## 👥 User Personas

### 1. Cliente Pubblico
**NOME**: "Mario" - Cliente che vuole prenotare  
**GOAL**: Prenotare tavolo per cena con amici  
**SCENARIO**: Apre `/prenota`, compila form, invia richiesta  
**NON VEDE**: Calendario, altre prenotazioni, dashboard admin

### 2. Admin Ristorante
**NOME**: "Paolo" - Proprietario/r manager  
**GOAL**: Gestire prenotazioni, visualizzare calendario  
**SCENARIO**: Login → Dashboard → Vede richieste pendenti → Approva → Va in calendario  
**VEDE**: Tutte le prenotazioni (pending/accepted/rejected), calendario completo

---

## 📱 Flussi Utente Dettagliati

### Flow Cliente - Richiesta Prenotazione

```
1. Cliente naviga su sito Wix Al Ritrovo
2. Clicca pulsante "PRENOTA IL TUO TAVOLO"
3. Viene reindirizzato a: https://alritrovo-booking.vercel.app/prenota
4. Vede form prenotazione:

┌────────────────────────────────────────┐
│  🍽️ Richiedi una Prenotazione Al Ritrovo│
├────────────────────────────────────────┤
│                                        │
│  Nome completo: [_____________]      │
│  Email: [______________]              │
│  Telefono: [________]                 │
│                                        │
│  Tipo evento: [Cena ▼]               │
│  Data desiderata: [📅 15/02/2025]     │
│  Orario desiderato: [⏰ 20:30]        │
│  Numero ospiti: [👥 4]               │
│                                        │
│  Note/Richieste speciali:            │
│  [___________________________________]│
│  [___________________________________]│
│                                        │
│           [📤 INVIA RICHIESTA]        │
└────────────────────────────────────────┘

5. Click "Invio" → Vede messaggio conferma
6. Riceve email automatica "Richiesta ricevuta" con riepilogo
```

**Dati inviati:**
- Nome cliente
- Email cliente
- Telefono cliente
- Tipo evento (cena/aperitivo/evento/laurea)
- Data desiderata
- Orario desiderato
- Numero ospiti
- Note/richieste speciali

---

### Flow Admin - Gestione Prenotazioni

#### A) Login Area Admin

```
1. Admin va su: https://alritrovo-booking.vercel.app/login
2. Inserisce:
   - Email admin
   - Password
3. Click "ACCEDI"
4. Se credenziali OK → Redirect a /admin/dashboard
5. Se credenziali KO → Messaggio errore
```

#### B) Dashboard Admin - 3 Sezioni

```
┌──────────────────────────────────────────────────┐
│  AL RITROVO - Area Admin  [👤 Admin] [Logout]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ 📅 CALENDARIO│  │ ⏳ PRENOTAZIONI│           │
│  │              │  │   PENDENTI    │           │
│  │  Visualizza  │  │               │           │
│  │  tutte le    │  │  Richieste    │           │
│  │  prenotazioni│  │  da approvare │           │
│  │  confermate  │  │  (3)          │           │
│  └──────────────┘  └──────────────┘           │
│                                                  │
│  ┌──────────────┐                              │
│  │ 📚 ARCHIVIO  │                              │
│  │ PRENOTAZIONI │                              │
│  │              │                              │
│  │  Tutte le    │                              │
│  │  prenotazioni│                              │
│  │  (accettate  │                              │
│  │   e rifiutate│                              │
│  └──────────────┘                              │
└──────────────────────────────────────────────────┘
```

---

#### C) Sezione 1: 📅 Calendario

**URL**: `/admin` (tab "Calendario")

**Contenuto**:
- FullCalendar con eventi prenotazioni status='accepted'
- Vista: Anno/Mese/Settimana/Giorno
- Eventi colorati per tipo (cena/aperitivo/evento)

**Interazione**:
- Click su evento → Apre `BookingModal`
- Click su slot vuoto → Opzionale: crea nuova prenotazione manuale
- Drag & Drop: Rischedulare eventi (opzionale)

**BookingModal - Modifica/Cancella**:
```
┌────────────────────────────────────┐
│  📅 Modifica Prenotazione         │
├────────────────────────────────────┤
│  👤 Cliente: Mario Rossi         │
│  📧 mario@example.com             │
│  📞 333 1234567                   │
│                                   │
│  📅 Data: [15/02/2025]           │
│  ⏰ Inizio: [20:00 ▼]            │
│  ⏰ Fine: [22:00 ▼]              │
│  👥 Ospiti: [4]                  │
│  🎉 Tipo: Cena                   │
│                                   │
│  📝 Note:                         │
│  [________________________________]│
│                                   │
│  [💾 SALVA MODIFICHE]            │
│  [🗑️ CANCELLA PRENOTAZIONE]      │
└───────────────────────────────────┘
```

**Azione Cancella**:
- Conferma "Sei sicuro di voler cancellare?"
- Se SI → Aggiorna booking.status = 'cancelled'
- Evento scompare dal calendario
- Viene inserito in Archivio con filtro "Rifiutate"

---

#### D) Sezione 2: ⏳ Prenotazioni Pendenti

**URL**: Tab "Prenotazioni Pendenti" in Dashboard

**Contenuto**:
- Lista richieste con `status='pending'`
- Per ogni richiesta: dati cliente completi
- Bottoni: ✅ ACCETTA | ❌ RIFIUTA

**Esempio Richiesta**:
```
┌──────────────────────────────────────────┐
│  ⏳ RICHIESTA PENDENTE                   │
├──────────────────────────────────────────┤
│  👤 Mario Rossi                         │
│  📧 mario@example.com                   │
│  📞 333 1234567                          │
│                                          │
│  📅 Data richiesta: 15 febbraio 2025    │
│  ⏰ Orario richiesto: 20:30              │
│  👥 Numero ospiti: 4                      │
│  🎉 Tipo: Cena                          │
│                                          │
│  📝 Note cliente:                        │
│  "Tavolo vicino finestra se possibile"  │
│                                          │
│  Status: ⏳ In attesa di approvazione    │
│                                          │
│  [✅ ACCETTA]  [❌ RIFIUTA]             │
└──────────────────────────────────────────┘
```

**Azione ACCETTA**:
1. Click "ACCETTA"
2. Si apre modal "Conferma Prenotazione"
3. Admin può modificare:
   - Data (se necessario)
   - Orario inizio (es: 20:00)
   - Orario fine (es: 22:00)
   - Conferma numero ospiti
   - Aggiungi note interne
4. Click "CONFERMA PRENOTAZIONE"
5. Sistema:
   - Aggiorna booking_requests.status = 'accepted'
   - Crea nuovo record in bookings
   - Evento appare nel Calendario
   - Evento appare in Archivio (tab "Accettate")
   - **Invia email automatica al cliente: "Prenotazione Confermata"**
6. Evento scompare da "Prenotazioni Pendenti"

**Azione RIFIUTA**:
1. Click "RIFIUTA"
2. Si apre modal "Rifiuta Prenotazione"
3. Campo opzionale: "Motivo rifiuto" (es: "Sala occupata", "Data non disponibile")
4. Click "RIFIUTA PRENOTAZIONE"
5. Sistema:
   - Aggiorna booking_requests.status = 'rejected'
   - Evento appare in Archivio (tab "Rifiutate")
   - **Invia email automatica al cliente: "Prenotazione Rifiutata" (con motivo se presente)**
6. Evento scompare da "Prenotazioni Pendenti"

---

#### E) Sezione 3: 📚 Archivio Prenotazioni

**URL**: Tab "Archivio" in Dashboard

**Contenuto**:
- Tutte le prenotazioni (accettate + rifiutate)
- Filtro dropdown: "Tutte" | "✅ Accettate" | "❌ Rifiutate"
- Lista cronologica (più recenti in alto)

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  📚 ARCHIVIO PRENOTAZIONI                       │
├─────────────────────────────────────────────────┤
│  Filtro: [Tutte ▼]                             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ Mario Rossi - 15 feb 2025 20:00-22:00      │
│     4 persone, Cena romantica                  │
│     [📅 Vedi in Calendario]                   │
│                                                  │
│  ✅ Evento Laurea - 20 feb 2025 19:00-23:00    │
│     8 persone                                  │
│     [📅 Vedi in Calendario]                   │
│                                                  │
│  ❌ Festa compleanno - 10 mar 2025             │
│     Rifiutata - Sala occupata                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tabella: booking_requests

```sql
CREATE TABLE booking_requests (
  -- ID e timestamps
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Dati cliente
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  
  -- Dati evento
  event_type VARCHAR(100) NOT NULL, -- 'cena', 'aperitivo', 'evento', 'laurea'
  desired_date DATE NOT NULL,
  desired_time TIME,
  num_guests INTEGER,
  special_requests TEXT,
  
  -- Status della richiesta
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  
  -- Dati confermati (se accettato)
  confirmed_start TIMESTAMP,
  confirmed_end TIMESTAMP,
  
  -- Motivo rifiuto (se rifiutato)
  rejection_reason TEXT
);

-- Indici per performance
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_date ON booking_requests(desired_date);
CREATE INDEX idx_booking_requests_created ON booking_requests(created_at DESC);
```

### Tabella: admins

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Hash con bcrypt/Supabase Auth
  role VARCHAR(50) DEFAULT 'admin', -- 'admin' o 'staff'
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Clienti possono solo creare richieste
CREATE POLICY "Anyone can create booking requests"
  ON booking_requests FOR INSERT
  WITH CHECK (true);

-- Solo admin possono vedere/modificare richieste
CREATE POLICY "Only admins can view all requests"
  ON booking_requests FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' 
    OR auth.jwt() ->> 'role' = 'staff'
  );

CREATE POLICY "Only admins can update requests"
  ON booking_requests FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Solo admin possono eliminare
CREATE POLICY "Only admins can delete"
  ON booking_requests FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Tabella: email_logs

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES booking_requests(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- 'request_received', 'confirmed', 'rejected', 'reminder_24h', 'admin_notification'
  recipient_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'failed', 'bounced'
  provider_response JSONB,
  error_message TEXT
);

CREATE INDEX idx_email_logs_booking ON email_logs(booking_id);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

### Tabella: restaurant_settings

```sql
CREATE TABLE restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Impostazioni iniziali
INSERT INTO restaurant_settings (setting_key, setting_value) VALUES
  ('opening_hours', '{"lunch": "12:00-15:00", "dinner": "19:00-23:00"}'),
  ('max_daily_bookings', '{"value": 50}'),
  ('email_notifications_enabled', '{"value": true}'),
  ('sender_email', '{"value": "noreply@resend.dev"}'), -- Fase A: dominio Resend
  ('restaurant_name', '{"value": "Al Ritrovo"}'),
  ('restaurant_address', '{"value": "Bologna, Italia"}');
```

### Modifiche booking_requests per email tracking

```sql
-- Aggiungi campi per tracciamento cancellazioni
ALTER TABLE booking_requests
  ADD COLUMN cancellation_reason TEXT,
  ADD COLUMN cancelled_at TIMESTAMP,
  ADD COLUMN cancelled_by UUID; -- riferimento admin_users.id
```

---

## 📧 Sistema Notifiche Email

### Provider: Resend

**Piano Implementazione a Fasi:**

#### 🆓 **FASE A - Setup Iniziale (GRATIS - Attuale)**

**Configurazione:**
- Account Resend gratuito (3000 email/mese)
- Email inviate da: `noreply@resend.dev`
- Nessuna verifica DNS richiesta
- Deploy immediato

**Limitazioni:**
- ⚠️ Email mittente: `noreply@resend.dev` (meno professionale)
- ⚠️ Maggior rischio spam per alcuni provider
- ✅ Perfetto per TEST e SVILUPPO

**Quando usarla:**
- Durante sviluppo e test
- Prime settimane di produzione
- Fino a quando admin acquista dominio custom

---

#### 💼 **FASE B - Produzione con Dominio Custom (Quando Pronto)**

**Configurazione:**
- Dominio custom acquistato (es: `alritrovo.com`)
- Email inviate da: `prenotazioni@alritrovo.com`
- Verifica DNS richiesta (15 min setup)

**Vantaggi:**
- ✅ Email professionali con nome ristorante
- ✅ Meno rischio spam
- ✅ Brand identity forte
- ✅ Fiducia maggiore clienti

**Costo:**
- Dominio: ~10-15€/anno (unico costo)
- Resend: sempre gratuito (3000 email/mese)

**Setup richiesto:**
```bash
# 1. Acquista dominio (Aruba, GoDaddy, Namecheap, etc.)
# 2. Aggiungi record DNS forniti da Resend
# 3. Aggiorna variabile ambiente in Vercel:
SENDER_EMAIL=prenotazioni@alritrovo.com
# 4. Deploy → Email automaticamente da dominio custom
```

**Guida verifica DNS:** Fornita quando admin sarà pronto per Fase B

---

### Flow Email Automatiche

#### 1️⃣ **Email Cliente - Richiesta Ricevuta**
**Trigger:** Submit form prenotazione
**Mittente:** `noreply@resend.dev` (Fase A) o `prenotazioni@alritrovo.com` (Fase B)
**Oggetto:** "Richiesta Prenotazione Ricevuta - Al Ritrovo"

**Contenuto:**
```
Ciao [Nome Cliente],

Grazie per aver scelto Al Ritrovo!

Abbiamo ricevuto la tua richiesta di prenotazione:

📅 Data: [Data Richiesta]
⏰ Orario: [Orario Richiesto]
👥 Numero ospiti: [N]
🎉 Tipo: [Tipo Evento]

La tua richiesta è in attesa di conferma.
Ti contatteremo presto per confermare la disponibilità.

A presto,
Il Team di Al Ritrovo
```

---

#### 2️⃣ **Email Cliente - Prenotazione Confermata**
**Trigger:** Admin accetta richiesta
**Oggetto:** "🎉 Prenotazione Confermata - Al Ritrovo"

**Contenuto:**
```
Ciao [Nome Cliente],

Ottima notizia! La tua prenotazione è stata CONFERMATA! 🎉

📅 Data: [Data Confermata]
⏰ Orario: [Orario Inizio] - [Orario Fine]
👥 Numero ospiti: [N]
📍 Indirizzo: [Indirizzo Ristorante]

[PULSANTE: Come Raggiungerci (Google Maps)]

Non vediamo l'ora di accoglierti!

A presto,
Il Team di Al Ritrovo
```

---

#### 3️⃣ **Email Cliente - Prenotazione Rifiutata**
**Trigger:** Admin rifiuta richiesta
**Oggetto:** "Richiesta Prenotazione - Al Ritrovo"

**Contenuto:**
```
Ciao [Nome Cliente],

Grazie per il tuo interesse in Al Ritrovo.

Purtroppo non possiamo accettare la tua richiesta per:

📅 Data: [Data Richiesta]
⏰ Orario: [Orario Richiesto]

[SE PRESENTE MOTIVO:]
Motivo: [Motivo Rifiuto]

Ti invitiamo a contattarci per trovare una data alternativa.

[PULSANTE: Richiedi Nuova Prenotazione]

Grazie per la comprensione,
Il Team di Al Ritrovo
```

---

#### 4️⃣ **Email Cliente - Reminder 24h Prima** (Opzionale - Fase 2)
**Trigger:** Cron job giornaliero
**Oggetto:** "Reminder: Prenotazione Domani - Al Ritrovo"

**Contenuto:**
```
Ciao [Nome Cliente],

Ti ricordiamo la tua prenotazione DOMANI:

📅 Data: [Data]
⏰ Orario: [Orario]
👥 Ospiti: [N]
📍 Al Ritrovo, [Indirizzo]

Non vediamo l'ora di vederti!

Se hai bisogno di modifiche, contattaci al [Telefono].

A domani,
Il Team di Al Ritrovo
```

---

#### 5️⃣ **Email Admin - Nuova Richiesta** (Opzionale)
**Trigger:** Submit form prenotazione
**Destinatario:** Email admin
**Oggetto:** "🔔 Nuova Richiesta Prenotazione"

**Contenuto:**
```
Nuova richiesta di prenotazione ricevuta:

👤 Cliente: [Nome]
📧 Email: [Email]
📞 Telefono: [Telefono]
📅 Data: [Data]
⏰ Orario: [Orario]
👥 Ospiti: [N]

[PULSANTE: Vai alla Dashboard]
```

---

### Implementazione Tecnica

#### A) Supabase Edge Function

**File:** `supabase/functions/send-booking-email/index.ts`

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { type, booking } = await req.json()

    // Template selector
    const emailContent = generateEmailContent(type, booking)

    const { data, error } = await resend.emails.send({
      from: Deno.env.get('SENDER_EMAIL') || 'noreply@resend.dev',
      to: booking.client_email,
      subject: emailContent.subject,
      html: emailContent.html
    })

    // Log email in database
    await logEmail(booking.id, type, booking.client_email, error ? 'failed' : 'sent', data, error)

    return new Response(JSON.stringify({ success: !error, data, error }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

function generateEmailContent(type: string, booking: any) {
  // Templates per ogni tipo di email
  switch(type) {
    case 'request_received':
      return {
        subject: 'Richiesta Prenotazione Ricevuta - Al Ritrovo',
        html: `...template HTML...`
      }
    case 'booking_confirmed':
      return {
        subject: '🎉 Prenotazione Confermata - Al Ritrovo',
        html: `...template HTML...`
      }
    // ... altri casi
  }
}
```

---

#### B) Database Triggers

**File:** `supabase/migrations/003_email_triggers.sql`

```sql
-- Trigger: Invia email quando cambia status
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status diventa 'accepted'
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://[YOUR-PROJECT].supabase.co/functions/v1/send-booking-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON-KEY]"}'::jsonb,
      body := json_build_object(
        'type', 'booking_confirmed',
        'booking', row_to_json(NEW)
      )::jsonb
    );
  END IF;

  -- Se status diventa 'rejected'
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://[YOUR-PROJECT].supabase.co/functions/v1/send-booking-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON-KEY]"}'::jsonb,
      body := json_build_object(
        'type', 'booking_rejected',
        'booking', row_to_json(NEW)
      )::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_status_change();

-- Trigger: Invia email "richiesta ricevuta" all'inserimento
CREATE OR REPLACE FUNCTION notify_new_booking_request()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://[YOUR-PROJECT].supabase.co/functions/v1/send-booking-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [ANON-KEY]"}'::jsonb,
    body := json_build_object(
      'type', 'request_received',
      'booking', row_to_json(NEW)
    )::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_booking_request
  AFTER INSERT ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_booking_request();
```

---

#### C) Variabili Ambiente

**File:** `.env` e Vercel Environment Variables

```bash
# Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email mittente (cambia in Fase B)
SENDER_EMAIL=noreply@resend.dev  # Fase A
# SENDER_EMAIL=prenotazioni@alritrovo.com  # Fase B (quando dominio verificato)

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 🔗 Strategia Integrazione Sito Esistente

### Fase Attuale: Standalone

**Setup:**
- App React deploy su Vercel: `alritrovo-booking.vercel.app`
- Link dal sito Wix principale
- Branding consistente ma tecnicamente separato

---

### Fase Futura: Integrazione con Sito Esistente

**Quando disponibile codice sito esistente:**

#### **Opzione 1: Link Diretto** ⭐ (più semplice)
```html
<!-- Nel menu del sito principale -->
<a href="https://alritrovo-booking.vercel.app/prenota" target="_blank">
  Prenota Tavolo
</a>
```

**Pro:** Setup immediato (2 minuti)
**Contro:** Cliente "esce" dal sito principale

---

#### **Opzione 2: Iframe Embedded**
```html
<!-- Pagina dedicata nel sito -->
<iframe
  src="https://alritrovo-booking.vercel.app/prenota?embedded=true"
  style="width: 100%; height: 100vh; border: none;"
></iframe>
```

**Pro:** Cliente resta sul dominio principale
**Contro:** Richiede parametro `embedded=true` per nascondere header/footer

---

#### **Opzione 3: Integrazione Completa**
Se sito principale è React/Next.js:
```bash
# Esportare come package npm
npm install @alritrovo/booking-system

# Importare nel sito
import { BookingForm } from '@alritrovo/booking-system'
```

**Pro:** Integrazione seamless
**Contro:** Richiede refactoring codebase

---

### Preparazione per Integrazione Futura

#### CSS Namespacing (già implementato)
```css
/* Tutti gli stili wrappati in namespace */
.alritrovo-booking {
  /* Stili isolati per evitare conflitti */
}
```

#### Configurazione Mode Embedded
```typescript
// src/config/appConfig.ts
export const appConfig = {
  mode: import.meta.env.VITE_APP_MODE || 'standalone',
  showNavigation: mode === 'standalone',
  showFooter: mode === 'standalone'
}

// URL con parametro: ?embedded=true → nasconde header/footer
```

---

## 🔐 Security & Privacy

### GDPR Compliance

#### Privacy Policy
- Pagina dedicata: `/privacy`
- Contenuto:
  - Dati raccolti (nome, email, telefono, preferenze prenotazione)
  - Finalità utilizzo (gestione prenotazioni)
  - Conservazione dati (2 anni poi auto-delete)
  - Diritti utente (accesso, cancellazione, modifica)

#### Consenso Esplicito
```html
<!-- Nel form prenotazione -->
<label>
  <input type="checkbox" required />
  Accetto la <a href="/privacy">Privacy Policy</a> *
</label>
```

#### Right to Deletion (GDPR Art. 17)
- Link in email: "Richiedi cancellazione dati"
- Form dedicato per richiesta cancellazione
- Admin può eliminare manualmente da dashboard

#### Data Retention
```sql
-- Auto-delete prenotazioni vecchie (2+ anni)
CREATE OR REPLACE FUNCTION delete_old_bookings()
RETURNS void AS $$
BEGIN
  DELETE FROM booking_requests
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Cron job settimanale (via Supabase pg_cron)
SELECT cron.schedule('delete-old-bookings', '0 2 * * 0', 'SELECT delete_old_bookings()');
```

---

### Rate Limiting

**Form Pubblico: Max 3 richieste/ora per IP**

#### Implementazione: Supabase Edge Function

**File:** `supabase/functions/submit-booking/index.ts`

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'

// Simple in-memory rate limiter (per demo)
const requestCounts = new Map()

serve(async (req) => {
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const hourAgo = now - 3600000 // 1 ora

  // Pulisci vecchi record
  for (const [ip, timestamps] of requestCounts) {
    requestCounts.set(ip, timestamps.filter(t => t > hourAgo))
  }

  // Check rate limit
  const ipRequests = requestCounts.get(clientIP) || []
  if (ipRequests.length >= 3) {
    return new Response(
      JSON.stringify({
        error: 'Troppe richieste. Riprova tra 1 ora.'
      }),
      { status: 429 }
    )
  }

  // Aggiungi timestamp
  ipRequests.push(now)
  requestCounts.set(clientIP, ipRequests)

  // Processa richiesta normalmente
  const bookingData = await req.json()
  // ... inserisci in database

  return new Response(JSON.stringify({ success: true }))
})
```

**Nota:** Per produzione, usare Redis o Upstash per rate limiting persistente

---

### Captcha Anti-Spam (Opzionale)

**hCaptcha Invisibile (Gratis)**

```tsx
// Nel form prenotazione
import HCaptcha from '@hcaptcha/react-hcaptcha'

<form onSubmit={handleSubmit}>
  {/* Form fields */}

  <HCaptcha
    sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
    onVerify={token => setCaptchaToken(token)}
  />

  <button disabled={!captchaToken}>Invia Richiesta</button>
</form>
```

**Quando attivarlo:**
- Se ricevete spam frequente
- Prima del lancio pubblico

---

### Admin Security

#### Password Hashing
- Gestito da Supabase Auth (bcrypt default)
- Password policy: min 8 caratteri

#### Session Management
- Session timeout: 24 ore
- Auto-logout dopo inattività

#### 2FA (Opzionale - Fase 2)
```sql
-- Abilitare MFA su Supabase Dashboard
-- User admin può attivare da profilo
```

#### Audit Log (Future)
```sql
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100), -- 'accept_booking', 'reject_booking', 'delete_booking'
  booking_id UUID,
  timestamp TIMESTAMP DEFAULT NOW(),
  details JSONB
);
```

---

## 🎨 Design & UI

### Schema Colori (Al Ritrovo Brand)
```css
/* Colori principali */
--primary: #8B0000;        /* Bordeaux/Red */
--primary-dark: #6B0000;
--primary-light: #A52A2A;

--accent: #DAA520;         /* Golden rod */

/* Tipi prenotazione */
--cena: #8B0000;           /* Rosso scuro */
--aperitivo: #DAA520;      /* Oro */
--evento: #9370DB;         /* Viola */
--laurea: #20B2AA;         /* Acquamarina */

/* Stato */
--pending: #FFD700;        /* Oro - in attesa */
--accepted: #32CD32;       /* Verde - confermato */
--rejected: #DC143C;        /* Rosso - rifiutato */
```

### Layout Responsive
- **Mobile**: Stack verticale per tab
- **Tablet**: 2 colonne per tab
- **Desktop**: 3 colonne per tab

---

## 🔄 Integrazione Wix

### Opzione Scelta: Iframe/Link

Nel sito Wix esistente (`alritrovobologna.wixsite.com`):

```html
<!-- Nel menu principale -->
<a href="https://alritrovo-booking.vercel.app/prenota" target="_blank">
  PRENOTA IL TUO TAVOLO
</a>

<!-- O se preferisci iframe -->
<iframe 
  src="https://alritrovo-booking.vercel.app/prenota"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

**URL pubblici**:
- Form pubblica: `alritrovo-booking.vercel.app/prenota`
- Admin login: `alritrovo-booking.vercel.app/login`
- Admin dashboard: `alritrovo-booking.vercel.app/admin`

---

## 🧪 Use Cases Specifici

### UC1: Cliente richiede prenotazione
1. Apre link Wix → naviga a `/prenota`
2. Compila form con:
   - Nome: "Mario Rossi"
   - Email: "mario@example.com"
   - Telefono: "333 1234567"
   - Tipo: Cena
   - Data: 15/02/2025
   - Ora: 20:30
   - Ospiti: 4
   - Note: "Tavolo finestra"
3. Submit
4. Vede: "✅ Grazie! La tua richiesta è stata inviata. Ti contatteremo presto."
5. Admin riceve richiesta in pending

### UC2: Admin approva prenotazione
1. Login admin
2. Dashboard → Tab "Prenotazioni Pendenti"
3. Vede richiesta "Mario Rossi - 15 feb 20:30"
4. Click "✅ ACCETTA"
5. Modal apre:
   - Conferma data: 15/02/2025
   - Orario: 20:00-22:00 (modificabile)
   - Ospiti: 4
6. Click "CONFERMA"
7. Prenotazione:
   - Appare nel Calendario
   - Scompare da Pending
   - Appare in Archivio (Accettate)

### UC3: Admin modifica prenotazione in calendario
1. Admin in Calendario
2. Click evento "Mario Rossi - 20:00-22:00"
3. Si apre BookingModal
4. Modifica: Ora fine da 22:00 a 23:00
5. Click "💾 SALVA"
6. Calendario si aggiorna

### UC4: Admin rifiuta prenotazione
1. Admin in "Prenotazioni Pendenti"
2. Vede richiesta "Evento 10 persone"
3. Click "❌ RIFIUTA"
4. Inserisce motivo: "Sala non disponibile"
5. Conferma rifiuto
6. Evento appare in Archivio (Rifiutate)

---

## 🚨 Edge Cases & Validazione

### Validazione Form Cliente
- Email valida (regex)
- Telefono almeno 8 cifre
- Data non nel passato
- Numero ospiti: 1-50 (dropdown)
- Campi obbligatori: nome, email, data

### Validazione Admin
- Solo 1 prenotazione per slot temporale (opzionale)
- Orario fine > orario inizio
- Data non nel passato (se modifica)

### Security
- RLS policies su database
- Admin login con password hashed
- HTTPS only (Vercel fornito)
- Input sanitization

---

## 📊 Metriche Successo (Future)

- Richieste ricevute/mese
- Tasso conversione pending → accepted
- Prenotazioni più richieste (cena vs aperitivo)
- Fascia oraria più popolare
- Media ospiti per prenotazione

---

## 🗓️ Timeline

**Fase 1: Setup** (2h)
- Crea progetto React
- Setup Supabase database
- Configura Vercel deploy

**Fase 2: UI Components** (2h)
- Form richiesta pubblica
- Layout base admin

**Fase 3: Autenticazione** (2h)
- Login admin
- Protected routes
- Session management

**Fase 4: Form Pubblico** (3h)
- Form completo prenotazione
- Validazione campi
- Submit a Supabase

**Fase 5: Dashboard Admin** (3h)
- Lista prenotazioni pending
- Modali accept/reject
- Filtri e ricerca

**Fase 6: Calendario** (2h)
- Integrazione FullCalendar
- Eventi da database
- Modifica/cancella

**Fase 7: Sistema Email** (3h) 🆕
- Setup Resend account
- Supabase Edge Function
- Email templates (HTML)
- Database triggers automatici

**Fase 8: Security & GDPR** (1.5h) 🆕
- Rate limiting (3 req/ora)
- Privacy Policy page
- Checkbox consenso
- Data retention policy

**Fase 9: Testing** (2h)
- Test funzionalità
- Test responsive
- Fix bugs

**Fase 10: Deploy** (1h)
- Deploy Vercel
- Setup variabili ambiente
- Test produzione

**TOTALE**: ~21.5 ore di sviluppo

**Note:**
- Fase Email usa inizialmente `noreply@resend.dev` (Fase A)
- Quando admin acquista dominio → Switch a Fase B (15 min cambio config)

---

## 🎯 Success Criteria

✅ Cliente può richiedere prenotazione online
✅ Admin può vedere tutte le richieste
✅ Admin può approvare/rifiutare
✅ Calendario mostra prenotazioni confermate
✅ Admin può modificare/cancellare prenotazioni
✅ Archivio storico completo
✅ UI responsive e brand-consistent
✅ Integrazione Wix funzionante
✅ **Email automatiche su richiesta/conferma/rifiuto** 🆕
✅ **Rate limiting anti-spam (3 richieste/ora)** 🆕
✅ **GDPR compliant con Privacy Policy** 🆕
✅ **Preparato per integrazione futura sito esistente** 🆕

---

**Versione**: 2.0
**Data**: Gennaio 2025
**Owner**: Al Ritrovo - Bologna

**Changelog v2.0:**
- Aggiunto sistema email automatico con Resend
- Implementato rate limiting (3 req/ora)
- Aggiunta GDPR compliance (Privacy Policy, consenso, data retention)
- Preparato CSS namespacing per integrazione futura
- Documentato piano migrazione dominio (Fase A → Fase B)

