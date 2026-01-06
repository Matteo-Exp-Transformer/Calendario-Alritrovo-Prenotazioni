# 📋 Planning & Tasks - Sistema Prenotazioni Al Ritrovo

**Progetto**: Booking System Al Ritrovo
**Obiettivo**: Sistema di gestione prenotazioni con calendario integrato
**Timeline**: ~21.5 ore di sviluppo (~18h completate = **84% complete**)
**Stack**: React + Vite + Supabase + Vercel + Resend

---

## 📊 **STATO ATTUALE PROGETTO** (Aggiornato: 27 Gennaio 2025)

### ✅ Fasi Completate (6/10)
- ✅ **Fase 1**: Setup Iniziale - COMPLETATO
- ✅ **Fase 2**: UI Components Base - COMPLETATO (+ 2h redesign)
- ✅ **Fase 3**: Autenticazione Admin - COMPLETATO
- ✅ **Fase 4**: Form Richiesta Pubblica - COMPLETATO
- ✅ **Fase 5**: Admin Dashboard - COMPLETATO (+ horizontal navbar redesign)
- ✅ **Fase 6**: Calendario Integrazione - COMPLETATO

### 🏃 Fasi In Corso (1/10)
- 🏃 **Fase 7**: Sistema Email - **70% completato**
  - ✅ Templates HTML creati
  - ✅ Edge Function implementata
  - ❌ **BLOCKER**: Secrets non configurati in Supabase
  - ❌ Database triggers non testati

### ⏳ Fasi Pendenti (3/10)
- ⏳ **Fase 8**: Security & GDPR - Pending
- ⏳ **Fase 9**: Testing & Polish - Pending
- ⏳ **Fase 10**: Deploy & Integrazione - Pending

### 🎨 Design Iterations (Extra 2h)
- **v1.0**: Bordeaux/Gold theme (PRD originale)
- **v2.0**: "Caldo & Legno" warm palette + glassmorphism ✅
- **v3.0**: Modern fonts (Inter/Merriweather/Poppins) ✅
- **v3.1**: Horizontal navbar dashboard (da sidebar) ✅
- **Pending**: Background photo on booking form page

### 🚨 Blocchi Critici
1. **Email Secrets**: Configurare in Supabase Dashboard
   - `RESEND_API_KEY=re_XoehnRJ5_...`
   - `SENDER_EMAIL=noreply@resend.dev`
2. **RLS Policies**: Workaround attivo, fix necessario
3. **TypeScript Types**: @ts-nocheck in alcuni hook

### 📁 Files Creati (82+ TypeScript files)
- Components: 25+
- Features: 15+
- Pages: 6
- Hooks: 12+
- Utils: 8+
- Database: 5 migration files

---

## 🗺️ Fase 1: Setup Iniziale (2h)

### Task 1.1: Inizializzazione Progetto React
**Tempo**: 30 min
**Priorità**: HIGH
**Status**: ✅ Completed  

```bash
# Comandi da eseguire
npm create vite@latest alritrovo-booking -- --template react-ts
cd alritrovo-booking
npm install
npm install @tanstack/react-query @supabase/supabase-js
npm install lucide-react date-fns
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/multimonth
npm install react-router-dom
npm install react-toastify
npm install resend @react-email/components  # Per email templates
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D @types/react @types/react-dom
```

**Files da creare**:
- `package.json` ✅
- `tailwind.config.js`
- `tsconfig.json`
- `vite.config.ts`
- `.gitignore`

---

### Task 1.2: Setup Supabase Database
**Tempo**: 45 min
**Priorità**: HIGH
**Status**: ✅ Completed  

**Database Tables**:
```sql
-- 1. Tabella booking_requests
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  event_type VARCHAR(100) NOT NULL,
  desired_date DATE NOT NULL,
  desired_time TIME,
  num_guests INTEGER,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  confirmed_start TIMESTAMP,
  confirmed_end TIMESTAMP,
  rejection_reason TEXT
);

-- 2. Tabella admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabella email_logs (tracking email)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES booking_requests(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent',
  provider_response JSONB,
  error_message TEXT
);

-- 4. Tabella restaurant_settings (configurazione)
CREATE TABLE restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserisci settings iniziali
INSERT INTO restaurant_settings (setting_key, setting_value) VALUES
  ('email_notifications_enabled', '{"value": true}'),
  ('sender_email', '{"value": "noreply@resend.dev"}'),
  ('restaurant_name', '{"value": "Al Ritrovo"}'),
  ('restaurant_address', '{"value": "Bologna, Italia"}');

-- 5. Modifiche booking_requests (cancellazione tracking)
ALTER TABLE booking_requests
  ADD COLUMN cancellation_reason TEXT,
  ADD COLUMN cancelled_at TIMESTAMP,
  ADD COLUMN cancelled_by UUID;

-- 6. Indici
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_date ON booking_requests(desired_date);
CREATE INDEX idx_booking_requests_created ON booking_requests(created_at DESC);
CREATE INDEX idx_email_logs_booking ON email_logs(booking_id);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
```

**RLS Policies**:
```sql
-- Policy per booking_requests
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert booking requests"
  ON booking_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view all requests"
  ON booking_requests FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' 
    OR auth.jwt() ->> 'role' = 'staff'
  );

CREATE POLICY "Only admins can update requests"
  ON booking_requests FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');
```

**Files da creare**:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_email_triggers.sql` (email automation)
- `.env.local` (chiavi Supabase + Resend)

---

### Task 1.3: Configurazione Vercel Deploy
**Tempo**: 30 min
**Priorità**: HIGH
**Status**: 🏃 In Progress (Variables configured, deploy pending)  

**Steps**:
1. Push codice su GitHub
2. Connetti GitHub a Vercel
3. Importa progetto
4. Setup variabili ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY` (per Edge Functions)
   - `SENDER_EMAIL=noreply@resend.dev` (Fase A)
5. Deploy automatico

**URL risultante**: `https://alritrovo-booking.vercel.app`

---

### Task 1.4: Setup Supabase Client
**Tempo**: 15 min
**Priorità**: HIGH
**Status**: ✅ Completed  

**File**: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🎨 Fase 2: UI Components Base (2h) - ✅ COMPLETED

### Task 2.1: Copiare Componenti UI Esistenti
**Tempo**: 30 min
**Priorità**: MEDIUM
**Status**: ✅ Completed  

**Files da copiare da progetto esistente**:
```bash
# Da Calendarbackup/src/components/ui/
Button.tsx → src/components/ui/Button.tsx
Input.tsx → src/components/ui/Input.tsx
Label.tsx → src/components/ui/Label.tsx
Textarea.tsx → src/components/ui/Textarea.tsx
Select.tsx → src/components/ui/Select.tsx
Modal.tsx → src/components/ui/Modal.tsx
CollapsibleCard.tsx → src/components/ui/CollapsibleCard.tsx
index.ts → src/components/ui/index.ts
```

---

### Task 2.2: Setup Router
**Tempo**: 20 min
**Priorità**: HIGH
**Status**: ✅ Completed  

**File**: `src/router.tsx`
```typescript
import { createBrowserRouter } from 'react-router-dom'
import { BookingRequestPage } from './pages/BookingRequestPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminDashboard } from './pages/AdminDashboard'

export const router = createBrowserRouter([
  {
    path: '/prenota',
    element: <BookingRequestPage />
  },
  {
    path: '/login',
    element: <AdminLoginPage />
  },
  {
    path: '/admin',
    element: <AdminDashboard />
  }
])
```

---

### Task 2.3: Types & Interfaces
**Tempo**: 30 min
**Priorità**: MEDIUM
**Status**: ✅ Completed  

**File**: `src/types/booking.ts`
```typescript
export interface BookingRequest {
  id: string
  client_name: string
  client_email: string
  client_phone?: string
  event_type: 'cena' | 'aperitivo' | 'evento' | 'laurea'
  desired_date: string
  desired_time?: string
  num_guests: number
  special_requests?: string
  status: 'pending' | 'accepted' | 'rejected'
  confirmed_start?: string
  confirmed_end?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'staff'
  name?: string
}
```

---

### Task 2.4: Theme Al Ritrovo
**Tempo**: 40 min (+ 2h redesign iterations)
**Priorità**: LOW
**Status**: ✅ Completed (3 major design iterations - see DESIGN_CHANGELOG.md)  

**File**: `tailwind.config.js`
```javascript
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'al-ritrovo': {
          primary: '#8B0000',
          'primary-dark': '#6B0000',
          'primary-light': '#A52A2A',
          accent: '#DAA520',
        },
        booking: {
          cena: '#8B0000',
          aperitivo: '#DAA520',
          evento: '#9370DB',
          laurea: '#20B2AA',
        },
        status: {
          pending: '#FFD700',
          accepted: '#32CD32',
          rejected: '#DC143C',
        }
      }
    }
  }
}
```

---

## 🔐 Fase 3: Autenticazione Admin (2h) - ✅ COMPLETED

### Task 3.1: Hook useAdminAuth
**Tempo**: 45 min
**Priorità**: HIGH
**Status**: ✅ Completed  

**File**: `src/features/booking/hooks/useAdminAuth.ts`
```typescript
export const useAdminAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = async (email: string, password: string) => {
    // Implementazione login Supabase
  }

  const logout = async () => {
    // Logout
  }

  return { user, login, logout, isLoading }
}
```

---

### Task 3.2: AdminLoginPage
**Tempo**: 30 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/pages/AdminLoginPage.tsx`
- Form login con email/password
- Validazione input
- Gestione errori
- Redirect a /admin dopo successo

---

### Task 3.3: ProtectedRoute Component
**Tempo**: 30 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/components/ProtectedRoute.tsx`
```typescript
export const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAdminAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  
  return children
}
```

---

### Task 3.4: Admin Header Component
**Tempo**: 15 min  
**Priorità**: MEDIUM  
**Status**: ⏳ Pending  

**File**: `src/features/admin/AdminHeader.tsx`
- Nome admin
- Pulsante logout
- Logo Al Ritrovo

---

## 📝 Fase 4: Form Richiesta Pubblica (3h)

### Task 4.1: BookingRequestForm Component
**Tempo**: 1h  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/components/BookingRequestForm.tsx`

**Campi**:
- Nome completo (obbligatorio)
- Email (obbligatorio, validation)
- Telefono (opzionale)
- Tipo evento: dropdown ['Cena', 'Aperitivo', 'Evento', 'Laurea']
- Data desiderata: date picker
- Orario desiderato: time picker
- Numero ospiti: select 1-50
- Note: textarea

**Validazione**:
- Email formato valido
- Data non nel passato
- Campi obbligatori

---

### Task 4.2: Hook useBookingRequests
**Tempo**: 45 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/hooks/useBookingRequests.ts`
```typescript
export const useBookingRequests = () => {
  const createRequest = async (data: BookingRequestInput) => {
    // Insert in Supabase
  }

  const getAllRequests = (status?: string) => {
    // Query con filtro status
  }

  return { createRequest, getAllRequests }
}
```

---

### Task 4.3: BookingRequestPage
**Tempo**: 30 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/pages/BookingRequestPage.tsx`
- Wrapper per form
- Gestione submit
- Toast di successo
- Redirect messaggio

---

---

## 🎛️ Fase 5: Admin Dashboard (3h)

### Task 5.1: AdminDashboard Layout
**Tempo**: 45 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/pages/AdminDashboard.tsx`
- Layout con 3 tab buttons
- Routing interno
- State management

---

### Task 5.2: Calendario Tab
**Tempo**: 1h  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/calendar/BookingCalendar.tsx`
- Reutilizzo componente Calendar.tsx esistente
- Carica prenotazioni status='accepted'
- Gestione click evento → BookingModal

---

### Task 5.3: BookingModal per Modifica/Cancella
**Tempo**: 1h  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/components/BookingModal.tsx`
- Form modifica prenotazione
- Campi: Cliente, Data, Ora inizio/fine, Ospiti, Note
- Bottoni: Salva, Cancella prenotazione
- Confirmation dialog per cancellazione

---

### Task 5.4: Prenotazioni Pendenti Tab
**Tempo**: 1h  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/components/PendingRequestsTab.tsx`
- Lista richieste status='pending'
- Card per ogni richiesta
- Bottoni ACCETTA/RIFIUTA

---

### Task 5.5: AcceptRequestModal
**Tempo**: 45 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/components/AcceptRequestModal.tsx`
- Modal conferma accettazione
- Campi modificabili: data, ora inizio/fine
- Submit → cambia status a 'accepted'

---

### Task 5.6: RejectRequestModal
**Tempo**: 30 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/components/RejectRequestModal.tsx`
- Modal rifiuto prenotazione
- Campo "Motivo rifiuto" (opzionale)
- Submit → cambia status a 'rejected'

---

### Task 5.7: Archivio Tab
**Tempo**: 1h  
**Priorità**: MEDIUM  
**Status**: ⏳ Pending  

**File**: `src/features/booking/components/ArchiveTab.tsx`
- Lista tutte prenotazioni
- Filtro: Tutte | Accettate | Rifiutate
- Visualizzazione cronologica
- Link "Vedi in Calendario" per accepted

---

## 🎨 Fase 6: Calendario Integrazione (2h)

### Task 6.1: Copiare Calendar.tsx
**Tempo**: 15 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/calendar/Calendar.tsx`
- Copiare da progetto esistente
- Nessuna modifica

---

### Task 6.2: Copiare calendar-custom.css
**Tempo**: 15 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/calendar/calendar-custom.css`
- Copiare da progetto esistente
- Modificare colori per prenotazioni

---

### Task 6.3: Adattare Event Transform
**Tempo**: 45 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/utils/bookingEventTransform.ts`
```typescript
export const transformBookingToCalendarEvent = (booking: Booking) => ({
  id: booking.id,
  title: `${booking.client_name} - ${booking.num_guests} ospiti`,
  start: new Date(booking.confirmed_start),
  end: new Date(booking.confirmed_end),
  backgroundColor: getEventColor(booking.event_type),
  borderColor: getEventBorderColor(booking.event_type),
  extendedProps: {
    ...booking
  }
})

const getEventColor = (type: string) => {
  const colors = {
    cena: '#8B0000',
    aperitivo: '#DAA520',
    evento: '#9370DB',
    laurea: '#20B2AA'
  }
  return colors[type] || '#8B0000'
}
```

---

### Task 6.4: Implementare Event Click Handler
**Tempo**: 45 min  
**Priorità**: HIGH  
**Status**: ⏳ Pending  

**File**: `src/features/booking/calendar/BookingCalendar.tsx`
- Handle click evento calendario
- Apri BookingModal con dati prenotazione
- Gestione modifica/cancella

---

## 📧 Fase 7: Sistema Email (3h) 🆕

### Task 7.1: Setup Account Resend
**Tempo**: 15 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Steps**:
1. Registrati su [resend.com](https://resend.com) (gratis)
2. Ottieni API Key
3. Aggiungi a `.env.local`:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   SENDER_EMAIL=noreply@resend.dev  # Fase A (temporaneo)
   ```
4. Aggiungi anche su Vercel Environment Variables

**Note**: Per ora usiamo `noreply@resend.dev` (Fase A). Quando admin compra dominio custom, passiamo a Fase B.

---

### Task 7.2: Email Templates (HTML)
**Tempo**: 1h 15min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Files da creare**:

**1) `src/emails/templates/requestReceived.ts`**
```typescript
export const requestReceivedTemplate = (booking: BookingRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B0000; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .details { background: white; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Al Ritrovo</h1>
    </div>
    <div class="content">
      <h2>Ciao ${booking.client_name},</h2>
      <p>Grazie per aver scelto <strong>Al Ritrovo</strong>!</p>
      <p>Abbiamo ricevuto la tua richiesta di prenotazione:</p>

      <div class="details">
        <p><strong>📅 Data:</strong> ${new Date(booking.desired_date).toLocaleDateString('it-IT')}</p>
        <p><strong>⏰ Orario:</strong> ${booking.desired_time || 'Non specificato'}</p>
        <p><strong>👥 Numero ospiti:</strong> ${booking.num_guests}</p>
        <p><strong>🎉 Tipo:</strong> ${booking.event_type}</p>
      </div>

      <p>La tua richiesta è <strong>in attesa di conferma</strong>.</p>
      <p>Ti contatteremo presto per confermare la disponibilità.</p>

      <p>A presto,<br><strong>Il Team di Al Ritrovo</strong></p>
    </div>
    <div class="footer">
      Al Ritrovo - Bologna, Italia
    </div>
  </div>
</body>
</html>
`
```

**2) `src/emails/templates/bookingConfirmed.ts`**
- Template conferma prenotazione
- Include data/ora confermata, numero ospiti
- Link Google Maps per indicazioni

**3) `src/emails/templates/bookingRejected.ts`**
- Template rifiuto
- Include motivo se presente
- Link per nuova richiesta

---

### Task 7.3: Supabase Edge Function - Send Email
**Tempo**: 1h
**Priorità**: HIGH
**Status**: ⏳ Pending

**File**: `supabase/functions/send-booking-email/index.ts`

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { type, booking } = await req.json()

    // Ottieni API key Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@resend.dev'

    // Seleziona template in base a tipo
    const { subject, html } = getEmailTemplate(type, booking)

    // Invia email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Al Ritrovo <${SENDER_EMAIL}>`,
        to: booking.client_email,
        subject: subject,
        html: html
      })
    })

    const result = await response.json()

    // Log in database (email_logs table)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    await supabase.from('email_logs').insert({
      booking_id: booking.id,
      email_type: type,
      recipient_email: booking.client_email,
      status: response.ok ? 'sent' : 'failed',
      provider_response: result,
      error_message: response.ok ? null : result.message
    })

    return new Response(JSON.stringify({ success: response.ok, result }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

function getEmailTemplate(type: string, booking: any) {
  // Import templates e return {subject, html}
  // Implementazione dettagliata
}
```

**Deploy:**
```bash
supabase functions deploy send-booking-email
```

---

### Task 7.4: Database Triggers per Email Automatiche
**Tempo**: 30 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**File**: `supabase/migrations/002_email_triggers.sql`

```sql
-- Trigger: Email quando cambia status
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Email conferma se accettato
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-booking-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.anon_key')
      ),
      body := jsonb_build_object(
        'type', 'booking_confirmed',
        'booking', row_to_json(NEW)
      )
    );
  END IF;

  -- Email rifiuto se rifiutato
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-booking-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.anon_key')
      ),
      body := jsonb_build_object(
        'type', 'booking_rejected',
        'booking', row_to_json(NEW)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_status_change();

-- Trigger: Email "richiesta ricevuta" quando inserita
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-booking-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key')
    ),
    body := jsonb_build_object(
      'type', 'request_received',
      'booking', row_to_json(NEW)
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_booking
  AFTER INSERT ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_booking();
```

**Note**: Sostituisci `YOUR_PROJECT` con ID progetto Supabase reale.

---

## 🔐 Fase 8: Security & GDPR (1.5h) 🆕

### Task 8.1: Rate Limiting Form Pubblico
**Tempo**: 30 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Implementazione**: Supabase Edge Function con rate limit

**File**: `supabase/functions/submit-booking/index.ts`

```typescript
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>()

serve(async (req) => {
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const oneHourAgo = now - 3600000

  // Pulisci vecchi timestamp
  if (rateLimitMap.has(clientIP)) {
    const timestamps = rateLimitMap.get(clientIP)!.filter(t => t > oneHourAgo)
    rateLimitMap.set(clientIP, timestamps)

    // Check limit (3 richieste/ora)
    if (timestamps.length >= 3) {
      return new Response(
        JSON.stringify({
          error: 'Troppe richieste. Riprova tra 1 ora.',
          retryAfter: 3600
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  // Aggiungi timestamp corrente
  const timestamps = rateLimitMap.get(clientIP) || []
  timestamps.push(now)
  rateLimitMap.set(clientIP, timestamps)

  // Processa richiesta normalmente
  const bookingData = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase
    .from('booking_requests')
    .insert(bookingData)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Note**: Per produzione seria, usare Redis/Upstash per rate limiting persistente.

---

### Task 8.2: Privacy Policy Page
**Tempo**: 45 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**File**: `src/pages/PrivacyPolicyPage.tsx`

**Contenuto minimo GDPR-compliant**:
```tsx
export const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>Privacy Policy - Al Ritrovo</h1>

      <section>
        <h2>1. Dati Raccolti</h2>
        <p>Raccogliamo: nome, email, telefono, preferenze prenotazione.</p>
      </section>

      <section>
        <h2>2. Finalità Utilizzo</h2>
        <p>I dati sono usati esclusivamente per gestire le prenotazioni.</p>
      </section>

      <section>
        <h2>3. Conservazione Dati</h2>
        <p>I dati sono conservati per 2 anni, poi cancellati automaticamente.</p>
      </section>

      <section>
        <h2>4. Diritti Utente (GDPR Art. 15-21)</h2>
        <ul>
          <li>Diritto di accesso ai propri dati</li>
          <li>Diritto di cancellazione (Art. 17)</li>
          <li>Diritto di modifica</li>
          <li>Diritto di opposizione al trattamento</li>
        </ul>
        <p>Per esercitare i tuoi diritti: <a href="mailto:privacy@alritrovo.com">privacy@alritrovo.com</a></p>
      </section>

      <section>
        <h2>5. Titolare del Trattamento</h2>
        <p>Al Ritrovo - Bologna, Italia</p>
      </section>
    </div>
  )
}
```

**Router update**:
```typescript
{
  path: '/privacy',
  element: <PrivacyPolicyPage />
}
```

---

### Task 8.3: Checkbox Consenso Privacy nel Form
**Tempo**: 15 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**File**: `src/features/booking/components/BookingRequestForm.tsx`

**Aggiungi prima del bottone submit**:
```tsx
<div className="flex items-start gap-2 mt-4">
  <input
    type="checkbox"
    id="privacy-consent"
    required
    className="mt-1"
  />
  <label htmlFor="privacy-consent" className="text-sm">
    Accetto la <Link to="/privacy" className="underline text-blue-600" target="_blank">
      Privacy Policy
    </Link> *
  </label>
</div>
```

---

## 🧪 Fase 9: Testing & Polish (2h)

### Task 9.1: Testing Form Pubblico
**Tempo**: 20 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Test Cases**:
- ✅ Submit con dati validi
- ✅ Validazione campi obbligatori
- ✅ Validazione email
- ✅ Checkbox privacy obbligatorio
- ✅ Rate limiting (3 richieste/ora)
- ✅ Email "richiesta ricevuta" inviata
- ✅ Toast di successo
- ✅ Richiesta salvata in DB

---

### Task 9.2: Testing Login Admin
**Tempo**: 15 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Test Cases**:
- ✅ Login con credenziali valide
- ✅ Redirect a dashboard
- ✅ Login con credenziali invalide
- ✅ Logout

---

### Task 9.3: Testing Dashboard Admin
**Tempo**: 30 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Test Cases**:
- ✅ Vedi prenotazioni pendenti
- ✅ Approva prenotazione → appare in calendario
- ✅ Email "conferma" inviata al cliente
- ✅ Rifiuta prenotazione → appare in archivio
- ✅ Email "rifiuto" inviata al cliente
- ✅ Modifica prenotazione in calendario
- ✅ Cancella prenotazione

---

### Task 9.4: Testing Calendario
**Tempo**: 20 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Test Cases**:
- ✅ Eventi mostrati correttamente
- ✅ Click evento apre modal
- ✅ Cambio vista (mese/settimana/giorno)
- ✅ Colori per tipo evento

---

### Task 9.5: Testing Email System
**Tempo**: 15 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Test Cases**:
- ✅ Email "richiesta ricevuta" arriva
- ✅ Email "conferma" arriva con dati corretti
- ✅ Email "rifiuto" arriva con motivo
- ✅ Email loggata in email_logs table
- ✅ Mittente corretto (noreply@resend.dev)

---

### Task 9.6: UI Polish & Responsive
**Tempo**: 20 min
**Priorità**: MEDIUM
**Status**: ⏳ Pending

**Task**:
- Mobile responsive
- Tablet responsive
- Loading states
- Error states
- Animazioni smooth

---

## 🚀 Fase 10: Deploy & Integrazione (1h)

### Task 10.1: Deploy Supabase Edge Functions
**Tempo**: 20 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Steps**:
```bash
# Deploy email function
supabase functions deploy send-booking-email --project-ref YOUR_PROJECT_ID

# Deploy rate limiting function
supabase functions deploy submit-booking --project-ref YOUR_PROJECT_ID

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set SENDER_EMAIL=noreply@resend.dev
```

---

### Task 10.2: Final Vercel Deploy
**Tempo**: 15 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Steps**:
- Push finale su GitHub
- Verifica deploy automatico
- Test URL pubblici: `alritrovo-booking.vercel.app`
- Verifica variabili ambiente (RESEND_API_KEY, SENDER_EMAIL)

---

### Task 10.3: Integrazione Link Wix
**Tempo**: 15 min
**Priorità**: HIGH
**Status**: ⏳ Pending

**Steps**:
- Aggiungere link nel menu Wix: "Prenota Tavolo"
- Target URL: `https://alritrovo-booking.vercel.app/prenota`
- Test click → verifica redirect
- (Opzionale) Test apertura in iframe

---

### Task 10.4: Documentazione & Guida Fase B
**Tempo**: 10 min
**Priorità**: MEDIUM
**Status**: ⏳ Pending

**File**: `README.md`

**Includere**:
- Setup instructions
- Environment variables
- Deploy guide
- Admin credentials
- **Guida migrazione Fase A → Fase B**:
  ```markdown
  ## Migrazione a Dominio Custom (Fase B)

  Quando admin acquista dominio (es: alritrovo.com):

  1. Accedi a Resend Dashboard
  2. Aggiungi dominio custom
  3. Copia 3 record DNS forniti
  4. Aggiungi record nel provider dominio (Aruba/GoDaddy)
  5. Attendi verifica (5-10 minuti)
  6. Aggiorna variabile su Vercel:
     SENDER_EMAIL=prenotazioni@alritrovo.com
  7. Redeploy automatico → Email da dominio custom!
  ```

---

## 📊 Tracking Progress

### Summary - AGGIORNATO
- **Totale Fasi**: 10 (era 8)
- **Totale Task**: ~52 (era ~35)
- **Tempo Stimato**: 21.5 ore (era 16h)
- **Priorità HIGH**: ~40 task
- **Priorità MEDIUM**: ~10 task
- **Priorità LOW**: ~2 task

### Nuove Funzionalità v2.0
- ✅ Sistema email automatico (Resend)
- ✅ Rate limiting 3 richieste/ora
- ✅ GDPR compliance (Privacy Policy)
- ✅ Email tracking (email_logs table)
- ✅ Piano migrazione dominio (Fase A → B)

### Status Track
- ⏳ Pending
- 🏃 In Progress
- ✅ Completed
- ❌ Blocked

---

## 🎯 Milestones

1. ✅ **Fase 1-2 Complete**: Setup + UI base funzionante (+ 2h redesign)
2. ✅ **Fase 3-4 Complete**: Auth + Form pubblico funzionante
3. ✅ **Fase 5-6 Complete**: Dashboard + Calendario integrato
4. 🏃 **Fase 7-8 Complete**: Email System 70% + Security pending
5. ⏳ **Fase 9-10 Complete**: Testing + Deploy live con email automatiche

---

## 🔄 Piano Migrazione Dominio

### Fase A (Iniziale - GRATIS)
- Email mittente: `noreply@resend.dev`
- Deploy immediato
- Nessuna verifica DNS
- Ideale per: Sviluppo, Test, Prime settimane produzione

### Fase B (Quando pronto - 12€/anno)
- Email mittente: `prenotazioni@alritrovo.com`
- Dominio custom acquistato
- Verifica DNS (15 min setup)
- Ideale per: Produzione finale, Clienti reali

**Tempo migrazione A→B**: 20 minuti
**Costo aggiuntivo**: Solo dominio (~12€/anno)

---

**Versione**: 2.0
**Ultimo Aggiornamento**: Gennaio 2025
**Changelog v2.0**:
- Aggiunto sistema email completo (3h sviluppo)
- Aggiunto rate limiting e GDPR (1.5h sviluppo)
- Documentato piano dominio Fase A→B
- Timeline totale: 21.5h (da 16h)

