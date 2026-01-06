# 🏗️ Architettura Corretta RLS - Completa

**Data**: 27 Gennaio 2025  
**Status**: ✅ CONFIGURAZIONE FINALE

---

## 📊 Client Configuration

### 1. **Form Pubblico (`/prenota`)**

**File**: `src/lib/supabasePublic.ts`

```typescript
export const supabasePublic = createClient<Database>(
  supabaseUrl,
  VITE_SUPABASE_SERVICE_ROLE_KEY, // ← SERVICE ROLE KEY
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)
```

**Uso**: 
- INSERT booking_requests
- Bypassa RLS completamente
- Solo per form pubblico

**Hook**: `useCreateBookingRequest()`

---

### 2. **Admin Dashboard (`/admin`)**

**File**: `src/lib/supabase.ts`

```typescript
export const supabase = createClient<Database>(
  supabaseUrl,
  VITE_SUPABASE_ANON_KEY, // ← ANON KEY
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
```

**Uso**:
- SELECT booking_requests (query)
- UPDATE booking_requests (accept/reject)
- DELETE booking_requests (cancel)
- Con RLS policies applicate

**Hooks**:
- `usePendingBookings()`
- `useBookingStats()`
- `useAcceptedBookings()`
- `useAllBookings()`
- `useAcceptBooking()`
- `useRejectBooking()`
- `useUpdateBooking()`
- `useCancelBooking()`

---

## 🔒 RLS Policies Configuration

### Policy: INSERT (Form Pubblico)

```sql
CREATE POLICY "Allow anonymous insert for booking requests"
  ON public.booking_requests FOR INSERT
  TO anon
  WITH CHECK (true);
```

**Permette**: Utenti anonimi possono inserire prenotazioni  
**Usa**: `supabasePublic` (SERVICE_ROLE_KEY) bypassa comunque

---

### Policy: SELECT (Admin Dashboard)

```sql
CREATE POLICY "Allow authenticated select for booking requests"
  ON public.booking_requests FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');
```

**Permette**: Solo admin autenticati possono leggere prenotazioni  
**Usa**: `supabase` (ANON_KEY autenticato)

---

### Policy: UPDATE (Admin Dashboard)

```sql
CREATE POLICY "Allow authenticated update for booking requests"
  ON public.booking_requests FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

**Permette**: Solo admin autenticati possono modificare prenotazioni  
**Usa**: `supabase` (ANON_KEY autenticato)

---

### Policy: DELETE (Admin Dashboard)

```sql
CREATE POLICY "Allow authenticated delete for booking requests"
  ON public.booking_requests FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');
```

**Permette**: Solo admin autenticati possono cancellare prenotazioni  
**Usa**: `supabase` (ANON_KEY autenticato)

---

## 🎯 Flussi di Lavoro

### Flusso 1: Cliente Richiede Prenotazione

```
CLIENTE (anon)
  ↓
/prenota (public)
  ↓
BookingRequestForm
  ↓
useCreateBookingRequest()
  ↓
supabasePublic.insert()
  ↓
✅ INSERT bypassa RLS (SERVICE_ROLE_KEY)
  ↓
booking_requests table
```

**Client**: `supabasePublic`  
**RLS**: Bypassato (SERVICE_ROLE_KEY)

---

### Flusso 2: Admin Accede al Dashboard

```
ADMIN (authenticated)
  ↓
/login → Supabase Auth
  ↓
/admin dashboard
  ↓
useBookingStats() / usePendingBookings()
  ↓
supabase.from('booking_requests').select()
  ↓
✅ SELECT passa RLS (authenticated)
  ↓
Mostra statistiche e prenotazioni
```

**Client**: `supabase`  
**RLS**: `auth.role() = 'authenticated'` ✅

---

### Flusso 3: Admin Accetta Prenotazione

```
ADMIN (authenticated)
  ↓
/admin/pending → ACCETTA
  ↓
useAcceptBooking()
  ↓
supabase.from('booking_requests').update()
  ↓
✅ UPDATE passa RLS (authenticated)
  ↓
status = 'accepted'
confirmed_start, confirmed_end
```

**Client**: `supabase`  
**RLS**: `auth.role() = 'authenticated'` ✅

---

## 🧪 Test Scenari

### ✅ Test 1: Form Pubblico Inserts

```typescript
// In BookingRequestForm.tsx
const { mutate } = useCreateBookingRequest()
mutate({ client_name, client_email, ... })

// Viene usato supabasePublic
// RLS bypassato → ✅ Success
```

**Risultato**: Prenotazione creata

---

### ✅ Test 2: Admin Dashboard Reads

```typescript
// In AdminDashboard.tsx
const { data: stats } = useBookingStats()

// Viene usato supabase
// Admin autenticato → ✅ Passa RLS
```

**Risultato**: Statistiche mostrate

---

### ✅ Test 3: Admin Accepts Booking

```typescript
// In PendingRequestsTab.tsx
const acceptMutation = useAcceptBooking()
acceptMutation.mutate({ bookingId, confirmedStart, confirmedEnd })

// Viene usato supabase
// Admin autenticato → ✅ Passa RLS UPDATE
```

**Risultato**: Prenotazione accettata

---

### ❌ Test 4: Anon User Reads (BLOCKED)

```typescript
// Qualsiasi utente anonimo
supabase.from('booking_requests').select()

// Non autenticato → ❌ RLS BLOCKS
// Policy: auth.role() = 'authenticated'
```

**Risultato**: Permission denied

---

## 📝 Summary

| Operazione | Ruolo | Client | RLS Policy | Status |
|------------|-------|--------|------------|--------|
| Insert booking (form) | anon | supabasePublic | Bypassato | ✅ |
| Select bookings | authenticated | supabase | authenticated | ✅ |
| Update booking | authenticated | supabase | authenticated | ✅ |
| Delete booking | authenticated | supabase | authenticated | ✅ |
| Select bookings | anon | supabase | authenticated | ❌ BLOCKED |

---

**Migrazione**: `004_fix_rls_select_policy.sql`  
**Status**: ✅ APPLICATA  
**Architettura**: ✅ CORRETTA
