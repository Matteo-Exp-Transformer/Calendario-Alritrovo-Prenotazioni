# Auth & Form Developer Agent

**Specializzazione**: Fase 3-4 del PLANNING_TASKS.md
**Responsabilità**: Autenticazione admin e form pubblico prenotazioni

## Compiti Principali

### 1. Sistema Autenticazione (Fase 3 - 2h)
- Hook `useAdminAuth` con Supabase Auth
- Componente `AdminLoginPage`
- Componente `ProtectedRoute`
- Header admin con logout
- Gestione sessione (24h timeout)

### 2. Form Pubblico Prenotazioni (Fase 4 - 3h)
- Componente `BookingRequestForm` completo
- Validazione campi (email, data non passata, required)
- Hook `useBookingRequests` per CRUD
- Pagina `BookingRequestPage`
- Toast notifiche successo/errore
- **Privacy Policy checkbox** (GDPR - OBBLIGATORIO)

### 3. Privacy & GDPR
- Link a `/privacy` nel form
- Checkbox obbligatorio: "Accetto la Privacy Policy"
- Form non submit-tabile senza consenso

## Files da Creare

```
src/
├── features/
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useAdminAuth.ts
│   │   ├── components/
│   │   │   ├── AdminHeader.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── pages/
│   │       └── AdminLoginPage.tsx
│   └── booking/
│       ├── hooks/
│       │   └── useBookingRequests.ts
│       ├── components/
│       │   └── BookingRequestForm.tsx
│       └── pages/
│           └── BookingRequestPage.tsx
├── router.tsx (aggiorna)
└── App.tsx
```

## Dettagli Implementazione

### useAdminAuth Hook
```typescript
export const useAdminAuth = () => {
  // Login con Supabase Auth
  // Logout
  // Get current user
  // Session check
  return { user, login, logout, isLoading }
}
```

### BookingRequestForm
**Campi obbligatori**:
- Nome completo
- Email (con validazione regex)
- Telefono (opzionale)
- Tipo evento: dropdown ["Cena", "Aperitivo", "Evento", "Laurea"]
- Data desiderata (date picker, no passato)
- Orario desiderato (time picker)
- Numero ospiti: select 1-50
- Note (textarea, opzionale)
- **Checkbox Privacy Policy** (required!)

**Validazione**:
- Email formato valido
- Data >= oggi
- Tutti i campi required popolati
- Privacy checkbox checked

### Privacy Checkbox (CRITICO)
```tsx
<div className="flex items-start gap-2 mt-4">
  <input
    type="checkbox"
    id="privacy-consent"
    required
    checked={privacyAccepted}
    onChange={(e) => setPrivacyAccepted(e.target.checked)}
  />
  <label htmlFor="privacy-consent" className="text-sm">
    Accetto la <Link to="/privacy" target="_blank" className="underline text-blue-600">
      Privacy Policy
    </Link> *
  </label>
</div>

<button
  type="submit"
  disabled={!privacyAccepted || isSubmitting}
>
  Invia Richiesta
</button>
```

## Checklist Completamento

### Fase 3 (Auth)
- [ ] useAdminAuth funzionante con Supabase
- [ ] AdminLoginPage con form email/password
- [ ] Redirect a /admin dopo login
- [ ] ProtectedRoute blocca accesso non autenticati
- [ ] AdminHeader con nome e logout button
- [ ] Session timeout 24h configurato
- [ ] Gestione errori login (toast)

### Fase 4 (Form)
- [ ] BookingRequestForm con tutti i campi
- [ ] Validazione email funzionante
- [ ] Data picker blocca date passate
- [ ] useBookingRequests crea richieste in DB
- [ ] Toast successo dopo submit
- [ ] **Privacy checkbox obbligatorio implementato**
- [ ] Link a /privacy funzionante
- [ ] Form responsive (mobile/tablet/desktop)

## Note Importanti

- **NON** implementare ancora l'invio email (Fase 7)
- Il submit deve solo creare record in `booking_requests` con status='pending'
- Privacy checkbox è OBBLIGATORIO per GDPR
- Usa react-toastify per notifiche
- Test con dati reali: crea almeno 3 richieste di prova

## Quando Hai Finito

Aggiorna PLANNING_TASKS.md:
- Segna tutte le task Fase 3-4 come "✅ Completed"
- Segna milestone 2 come completato
- Crea 3-5 richieste di prova nel database
- Notifica completamento e passa a Dashboard Developer
