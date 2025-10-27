# 🎯 Next Steps - Per Auth Developer Agent

**Status Attuale**: Fase 1-2 COMPLETATA ✅
**Prossimo Agent**: Auth Developer Agent
**Prossima Fase**: Fase 3 - Autenticazione Admin
**Tempo Stimato**: 2 ore

---

## ⚠️ IMPORTANTE: Prima di Iniziare

### 1. Esegui Database Migration

**QUESTO STEP È OBBLIGATORIO!**

Il database Supabase è vuoto. Devi eseguire la migration prima di qualsiasi sviluppo.

**Istruzioni**:
1. Apri [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona progetto: **dphuttzgdcerexunebct**
3. Menu laterale: **SQL Editor**
4. Click **+ New Query**
5. Apri file: `c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\supabase\migrations\001_initial_schema.sql`
6. Copia TUTTO il contenuto
7. Incolla nel SQL Editor
8. Click **Run** (o Ctrl+Enter)
9. Verifica output: "Success. No rows returned"

**Verifica tabelle create**:
- Menu laterale: **Table Editor**
- Dovresti vedere 4 tabelle:
  - ✅ booking_requests
  - ✅ admin_users
  - ✅ email_logs
  - ✅ restaurant_settings

**Se vedi errori**:
- Consulta `supabase/SETUP_DATABASE.md` per troubleshooting

---

## 📋 Checklist Pre-Start

Prima di iniziare Fase 3, verifica:

- [ ] Database migration eseguita (vedi sopra)
- [ ] Dev server funzionante (`npm run dev`)
- [ ] Build produzione funzionante (`npm run build`)
- [ ] Variabili ambiente presenti in `.env.local`
- [ ] Letto `PHASE_1-2_COMPLETED.md` per contesto

---

## 🎯 Fase 3: Task da Completare

### Task 3.1: Hook useAdminAuth (45 min)

**File da creare**: `c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\src\features\booking\hooks\useAdminAuth.ts`

**Funzionalità richieste**:
```typescript
export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Login con email/password
  const login = async (email: string, password: string) => {
    // 1. Usa Supabase Auth per login
    // 2. Verifica che l'utente sia presente in admin_users table
    // 3. Controlla ruolo (admin/staff)
    // 4. Salva sessione
    // 5. Return success/error
  }

  // Logout
  const logout = async () => {
    // 1. Chiudi sessione Supabase
    // 2. Clear user state
    // 3. Redirect a /login
  }

  // Check sessione al mount
  useEffect(() => {
    // 1. Controlla se c'è sessione attiva
    // 2. Carica dati utente da admin_users
    // 3. setUser o null
    // 4. setIsLoading(false)
  }, [])

  return { user, login, logout, isLoading }
}
```

**Risorse disponibili**:
- Supabase client: `import { supabase } from '@/lib/supabase'`
- Types: `import { AdminUser } from '@/types/booking'`
- Helper: `isAdmin()` già implementato in `@/lib/supabase`

---

### Task 3.2: AdminLoginPage Completo (30 min)

**File da modificare**: `c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\src\pages\AdminLoginPage.tsx`

**Funzionalità richieste**:
1. Form con email + password
2. Validazione input (email format, required fields)
3. Submit handler che chiama `useAdminAuth().login()`
4. Loading state durante login
5. Error display (toast notification)
6. Redirect a `/admin` dopo login success
7. "Password dimenticata?" placeholder (TODO per dopo)

**UI Components disponibili**:
```jsx
import { Button, Input } from '@/components/ui'
import { toast } from 'react-toastify'

<Input
  label="Email"
  type="email"
  required
  error={errors.email}
/>

<Button
  variant="primary"
  fullWidth
  disabled={isLoading}
>
  {isLoading ? 'Login...' : 'Accedi'}
</Button>
```

---

### Task 3.3: ProtectedRoute Component (30 min)

**File da creare**: `c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\src\components\ProtectedRoute.tsx`

**Funzionalità**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAdminAuth()

  // Show loading spinner while checking auth
  if (isLoading) {
    return <div>Loading...</div> // TODO: Componente LoadingSpinner
  }

  // Redirect to /login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Render children if authenticated
  return <>{children}</>
}
```

**Uso in router.tsx**:
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

{
  path: '/admin',
  element: (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
```

---

### Task 3.4: AdminHeader Component (15 min)

**File da creare**: `c:\Users\matte.MIO\Documents\GitHub\Calendarbackup\src\features\admin\AdminHeader.tsx`

**Funzionalità**:
1. Logo/Nome ristorante
2. Nome admin loggato
3. Pulsante logout
4. Responsive design

```jsx
export const AdminHeader: React.FC = () => {
  const { user, logout } = useAdminAuth()

  return (
    <header className="bg-al-ritrovo-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Al Ritrovo - Admin</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm">
            Ciao, {user?.name || user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
```

**Uso in AdminDashboard.tsx**:
```jsx
import { AdminHeader } from '@/features/admin/AdminHeader'

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      {/* resto del dashboard */}
    </div>
  )
}
```

---

## 🔐 Supabase Auth Setup

### Configurazione Supabase Auth (se necessario)

1. **Dashboard Supabase** → **Authentication** → **Providers**
2. Abilita **Email provider** (dovrebbe essere già attivo)
3. **Configuration**:
   - Confirm email: OFF (per semplicità iniziale)
   - Secure password: ON (raccomandato)

### Creazione Primo Admin User

**Opzione 1: Manualmente via SQL**
```sql
-- In Supabase SQL Editor
INSERT INTO admin_users (email, password_hash, role, name)
VALUES (
  'admin@alritrovo.com',
  'TODO_HASH_PASSWORD', -- Usa bcrypt o Supabase Auth
  'admin',
  'Admin Principale'
);
```

**Opzione 2: Via Supabase Auth Dashboard**
1. **Authentication** → **Users** → **Add User**
2. Email: `admin@alritrovo.com`
3. Password: (scegli una password sicura)
4. Poi inserisci nella tabella `admin_users` manualmente

**Opzione 3: Programmaticamente (raccomandato)**
Crea un seed script che:
1. Usa Supabase Auth signup
2. Inserisce record in admin_users
3. Verifica tutto funzioni

---

## 📦 Risorse Disponibili

### Files già creati (da usare):

**Supabase Client**:
```typescript
import { supabase } from '@/lib/supabase'

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Logout
await supabase.auth.signOut()
```

**Types**:
```typescript
import type { AdminUser, AdminRole } from '@/types/booking'
```

**UI Components**:
```typescript
import { Button, Input, Label } from '@/components/ui'
import { toast } from 'react-toastify'
```

**Router**:
```typescript
import { useNavigate, Navigate } from 'react-router-dom'
```

---

## 🧪 Testing Checklist Fase 3

Dopo aver completato tutti i task, testa:

- [ ] Login con credenziali valide → redirect a /admin
- [ ] Login con credenziali invalide → mostra errore
- [ ] Accesso a /admin senza login → redirect a /login
- [ ] Logout → redirect a /login
- [ ] Sessione persiste dopo refresh pagina
- [ ] Loading state mostrato correttamente
- [ ] Error messages chiari e user-friendly
- [ ] AdminHeader mostra nome utente corretto

---

## 📝 Note Importanti

### Password Hashing

**NON salvare password in chiaro!**

Usa Supabase Auth che gestisce automaticamente l'hashing:
```typescript
// Supabase gestisce l'hashing automaticamente
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123' // Verrà hashata automaticamente
})
```

### Session Management

Supabase gestisce automaticamente:
- Session storage (localStorage)
- Token refresh
- Expiration handling

Basta configurare in `src/lib/supabase.ts` (già fatto):
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

---

## 🚨 Problemi Comuni & Soluzioni

### Errore: "User not found"
**Causa**: Utente non esiste in admin_users table
**Soluzione**: Crea prima un admin user (vedi sezione sopra)

### Errore: "Invalid login credentials"
**Causa**: Password o email sbagliata
**Soluzione**: Controlla che l'utente sia stato creato in Supabase Auth

### Errore: "Session expired"
**Causa**: Token scaduto
**Soluzione**: Supabase auto-refresh dovrebbe gestirlo. Verifica config.

### Errore: "RLS policy violation"
**Causa**: Policies troppo restrittive
**Soluzione**: Verifica che la migration sia stata eseguita correttamente

---

## 📚 Riferimenti Utili

**Supabase Auth Docs**:
- [Auth Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Auth with Password](https://supabase.com/docs/guides/auth/auth-email)
- [Managing Sessions](https://supabase.com/docs/guides/auth/sessions)

**React Query per Auth**:
```typescript
const { data: session, isLoading } = useQuery({
  queryKey: ['session'],
  queryFn: async () => {
    const { data } = await supabase.auth.getSession()
    return data.session
  }
})
```

---

## ✅ Deliverables Fase 3

Al termine della Fase 3, dovrai consegnare:

1. **File creati**:
   - `src/features/booking/hooks/useAdminAuth.ts` ✅
   - `src/components/ProtectedRoute.tsx` ✅
   - `src/features/admin/AdminHeader.tsx` ✅

2. **File modificati**:
   - `src/pages/AdminLoginPage.tsx` ✅
   - `src/pages/AdminDashboard.tsx` ✅
   - `src/router.tsx` ✅ (aggiungi ProtectedRoute)

3. **Testing**:
   - Login flow funzionante ✅
   - Protected routes funzionanti ✅
   - Session persistence funzionante ✅

4. **Documentazione**:
   - `PHASE_3_COMPLETED.md` (simile a PHASE_1-2_COMPLETED.md)

---

## 🎯 Success Criteria

La Fase 3 è completata quando:

- ✅ Admin può fare login con email/password
- ✅ Dashboard è accessibile solo dopo login
- ✅ Logout funziona e redirect a /login
- ✅ Sessione persiste dopo refresh
- ✅ Errori mostrati chiaramente all'utente
- ✅ Loading states implementati
- ✅ Build produzione funzionante (npm run build)
- ✅ Zero errori TypeScript

---

## 📞 In Caso di Problemi

Se incontri difficoltà:

1. **Controlla i log**: Browser DevTools Console
2. **Verifica database**: Supabase Table Editor
3. **Leggi docs**: `PHASE_1-2_COMPLETED.md`, `SETUP_REPORT.md`
4. **Controlla examples**: Supabase ha esempi React + Auth

---

**Buon lavoro, Auth Developer Agent! 🚀**

**Pronto per iniziare Fase 3!**
