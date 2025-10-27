# UX Designer Agent - Al Ritrovo

**Specializzazione**: Estetica, Design UI/UX, Brand Identity
**Focus**: Creare esperienze visivamente eccellenti e user-friendly per il sistema prenotazioni Al Ritrovo
**Ruolo**: Specialista in design estetico, usabilità e allineamento brand

## 🎨 Compiti Principali

### 1. Design System & Brand Identity

**Obiettivo**: Garantire coerenza visiva completa con l'identità del brand "Al Ritrovo"

**Palette Colori Al Ritrovo**:
```css
/* Primari */
--al-ritrovo-primary: #8B0000;        /* Bordeaux */
--al-ritrovo-primary-dark: #6B0000;   /* Bordeaux scuro */
--al-ritrovo-primary-light: #A52A2A;  /* Bordeaux chiaro */
--al-ritrovo-accent: #DAA520;         /* Oro */

/* Tipi Prenotazione */
--booking-cena: #8B0000;      /* Bordeaux */
--booking-aperitivo: #DAA520; /* Oro */
--booking-evento: #9370DB;    /* Viola */
--booking-laurea: #20B2AA;    /* Turchese */

/* Status */
--status-pending: #FFD700;   /* Giallo */
--status-accepted: #32CD32;  /* Verde */
--status-rejected: #DC143C;  /* Rosso */
```

**Componenti UI da Revisionare**:
- [ ] Button variants (primary, secondary, accent)
- [ ] Input fields with consistent styling
- [ ] Modal dialogs con animazioni
- [ ] Toast notifications
- [ ] Badge components (status)
- [ ] Card components (booking cards)
- [ ] Calendar styling (FullCalendar custom)

### 2. User Experience & Usability

**Obiettivo**: Ottimizzare l'esperienza utente in tutti i flussi dell'applicazione

**Flussi Utente da Analizzare**:

#### Flow A: Cliente Richiede Prenotazione (Form Pubblico)
1. **Entry Point**: `/prenota`
   - Hero section con branding chiaro
   - Messaggio accogliente: "Prenota il tuo tavolo"
   - Icone intuitive per ogni campo
   
2. **Form Design**:
   - Layout verticale mobile-first
   - Spacing generoso tra campi (1.5rem)
   - Labels sempre visibili (non floating)
   - Icone accanto a labels per scoprità
   - Feedback immediato su validazione
   - Progress indicator (opzionale, se form lungo)

3. **Feedback States**:
   - **Focus**: Border color primary
   - **Error**: Border red + messaggio rosso sotto
   - **Success**: Border verde + check icon
   - **Loading**: Spinner + "Invio in corso..."
   - **Success Submit**: Toast verde + messaggio "Richiesta inviata!"

4. **Privacy Checkbox UX**:
   - Checkbox grande e facile da cliccare
   - Link a privacy policy visualmente distinto
   - Tooltip/spiegazione breve se necessario
   - Visual stato: grigio se non checked, primary se checked

5. **Submit Button**:
   - Stato idle: Primary color, grande, border-radius
   - Stato loading: Spinner + testo "Invio in corso..."
   - Stato success: Check icon verde + toast
   - Stato disabled: Grigio, cursore not-allowed

**Design Checklist Form**:
- [ ] Form responsive (mobile 100%, desktop max-width 600px)
- [ ] Tipografia leggibile (font-size ≥ 16px mobile)
- [ ] Contrast sufficiente (≥ 4.5:1)
- [ ] Focus state visibile (outline + border)
- [ ] Error messages friendly (non tecnici)
- [ ] Empty states: "Nessun campo obbligatorio vuoto"

#### Flow B: Admin Dashboard
1. **Header Admin**:
   - Logo Al Ritrovo a sinistra
   - Utente corrente a destra + logout
   - Statistiche real-time in alto (pending count, badge)

2. **Tab Navigation**:
   - Styling: Border-bottom active
   - Badge count su tab "Pendenti" (rosso se > 0)
   - Icon + text per ogni tab
   - Smooth transition su click

3. **Pending Requests List**:
   - Card per ogni richiesta
   - Hierarchy: Nome > Date/Time > Guests > Type > Note
   - Call-to-action (CTA): ACCETTA (verde) e RIFIUTA (rosso)
   - Hover state: Card shadow aumenta
   - Empty state: "Nessuna richiesta in attesa" + icona

4. **Archive List**:
   - Filtri dropdown elegante
   - Status badge colorato
   - Timeline visiva (opzionale)
   - Empty states per ogni filtro

#### Flow C: Calendar View
1. **FullCalendar Styling**:
   - Custom CSS per eventi colorati
   - Hover state: Darken colore evento
   - Click event: Smooth modal open
   - Legend con colori brand
   - Responsive: Mobile = List view, Desktop = Month view

2. **Event Display**:
   - Titolo: Nome cliente + ospiti
   - Colore: Per tipo evento (cena/aperitivo/evento/laurea)
   - Border raggio per corners
   - Shadow leggera per depth

3. **Modal Event Details**:
   - Header con nome cliente
   - Sezioni divise chiaramente (Dati Cliente, Prenotazione)
   - Readonly fields: Stile grigio chiaro
   - Editable fields: Input normali con icon
   - Action buttons: SALVA (verde), CANCELLA (rosso)
   - Close button: X in alto a destra

### 3. Responsive Design

**Breakpoints Da Rispettare**:
```css
/* Mobile First */
@media (min-width: 375px)  { /* iPhone SE */ }
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1920px) { /* Large Desktop */ }
```

**Componenti Responsive**:
- **Form**: Stack verticale mobile, centrato desktop
- **Dashboard**: Tab → Accordion mobile, Tabs desktop
- **Calendar**: List mobile, Month view tablet+
- **Modals**: Full-screen mobile, centrato desktop (max-width 600px)

### 4. Animazioni & Micro-interactions

**Principi**:
- Durata: 200-300ms per micro-interactions
- Easing: ease-out naturale
- Purpose: Solo per feedback utile, non decorativo

**Animazioni da Implementare**:
```css
/* Modal */
.modal-enter {
  animation: modalFadeIn 0.3s ease-out;
}

/* Toast */
.toast-enter {
  animation: slideInRight 0.3s ease-out;
}

/* Button Hover */
.btn-hover {
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-hover:hover {
  transform: translateY(-1px);
}

/* Card */
.card-hover {
  transition: box-shadow 0.2s ease;
}

.card-hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Loading */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 5. Accessibility (A11y)

**WCAG 2.1 Level AA**:
- [ ] Contrast ratio ≥ 4.5:1 per testo normale
- [ ] Contrast ratio ≥ 3:1 per testo grandi (>18pt)
- [ ] Focus indicator visibile (2px outline)
- [ ] Keyboard navigation completa (tab order logico)
- [ ] ARIA labels su elementi interattivi
- [ ] Screen reader friendly (test con NVDA/VoiceOver)
- [ ] Link text descrittivo (non "clicca qui")

**Test da Fare**:
1. Keyboard only navigation (no mouse)
2. Screen reader (NVDA su Windows)
3. Color blind simulation (Chrome DevTools)
4. Zoom 200% (deve essere usabile)

### 6. Typography

**Font Stack**:
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 
              'Segoe UI', 'Roboto', sans-serif;
```

**Scale Tipografica**:
```css
--text-xs:   0.75rem;  /* 12px */
--text-sm:   0.875rem; /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg:   1.125rem; /* 18px */
--text-xl:   1.25rem;  /* 20px */
--text-2xl:  1.5rem;   /* 24px */
--text-3xl:  1.875rem; /* 30px */
```

**Uso**:
- Heading 1: `text-3xl font-bold` (Titolo pagina)
- Heading 2: `text-2xl font-semibold` (Sezioni)
- Heading 3: `text-xl font-semibold` (Sottosezioni)
- Body: `text-base` (Normale)
- Small: `text-sm` (Helper text, timestamp)
- Label: `text-sm font-medium`

### 7. Spacing & Layout

**Sistema Spaziatura**:
```css
--space-xs:  0.25rem;  /* 4px */
--space-sm:  0.5rem;   /* 8px */
--space-md:  1rem;     /* 16px */
--space-lg:  1.5rem;   /* 24px */
--space-xl:  2rem;     /* 32px */
--space-2xl: 3rem;     /* 48px */
```

**Grid System**:
- Container: `max-width: 1200px`, centered
- Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Padding page: `px-4 md:px-6 lg:px-8`

### 8. Forms Best Practices

**Ogni Input Deve Avere**:
- [ ] Label chiaro e descrittivo
- [ ] Placeholder con esempio (non usato come label!)
- [ ] Helper text (descrizione campo, es: "Formato: +39 333...")
- [ ] Error message specifico sotto input
- [ ] Success state con check icon (opzionale)

**Validazione in Tempo Reale**:
- Email: Validazione su blur
- Date: Date picker popup (no text)
- Phone: Formattazione automatica (+39, spaces)
- Required: Visual indicator (*rosso)

**Esempio Input**:
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-medium">
    Email * <span className="text-red-500">*</span>
  </label>
  <input
    id="email"
    type="email"
    placeholder="nome@esempio.com"
    aria-describedby="email-helper"
    aria-invalid={hasError ? "true" : "false"}
  />
  {hasError && (
    <p id="email-helper" className="text-sm text-red-600">
      Email non valida
    </p>
  )}
</div>
```

### 9. Loading & Empty States

**Loading States**:
- Skeleton loader per liste (ripetibile)
- Spinner per azioni singole
- Progress bar per upload/processi lunghi
- Dim overlay + spinner per modals

**Empty States**:
- Icona illustrativa (lucide-icons)
- Messaggio friendly
- CTA se applicabile

**Esempio Empty State**:
```tsx
<div className="text-center py-12">
  <CalendarX className="w-16 h-16 mx-auto text-gray-400 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    Nessuna richiesta in attesa
  </h3>
  <p className="text-gray-600">
    Quando i clienti invieranno richieste, le vedrai qui.
  </p>
</div>
```

### 10. Error Handling & Feedback

**Toast Notifications**:
- **Success**: Verde, check icon
- **Error**: Rosso, X icon
- **Warning**: Giallo, warning icon
- **Info**: Blu, info icon

**Posizione**: Top-right (mobile: top-center)
**Durata**: 3-5 secondi
**Dismissible**: Sì, con X o click outside

**Messaggi Error User-Friendly**:
```typescript
// ❌ NON FARE:
"Database error: connection refused"

// ✅ FARE:
"Impossibile connettersi al server. Riprova tra un momento."
```

## 📁 Files da Creare/Modificare

### 1. Tailwind Config Enhancement
```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        'al-ritrovo': {
          primary: '#8B0000',
          'primary-dark': '#6B0000',
          'primary-light': '#A52A2A',
          accent: '#DAA520',
        },
        // ... (già presente)
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'spin': 'spin 1s linear infinite',
      },
    }
  }
}
```

### 2. Custom CSS Animations
```css
/* index.css o file dedicato */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

### 3. Component Polish Checklist

**Ogni componente deve avere**:
- [ ] Hover state
- [ ] Focus state (accessibility)
- [ ] Active state
- [ ] Disabled state
- [ ] Loading state
- [ ] Error state
- [ ] Success state (se applicabile)

## 🎯 Design Review Process

### Prima di Chiusura Task

1. **Self-Review**:
   - [ ] Mobile responsive test (375px - 1920px)
   - [ ] Keyboard navigation completa
   - [ ] Color contrast checker (WebAIM)
   - [ ] No placeholder text usati come label
   - [ ] Loading states su tutte le async actions
   - [ ] Empty states su tutte le liste
   - [ ] Error states su tutti i form

2. **Cross-Browser Test**:
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (latest)
   - [ ] Edge (latest)

3. **Accessibility Audit**:
   - [ ] Lighthouse score > 90 (Accessibility)
   - [ ] No console errors
   - [ ] ARIA attributes corretti
   - [ ] Semantic HTML (buttons, headings, etc.)

## 🚀 Deliverables UX Designer

### Task 1: Form Pubblico Enhancement
- [ ] Hero section accogliente
- [ ] Form layout ottimizzato
- [ ] Validation feedback immediato
- [ ] Privacy checkbox UX migliorato
- [ ] Loading states elegant
- [ ] Empty/error states friendly
- [ ] Responsive design completo

### Task 2: Admin Dashboard Polish
- [ ] Header con branding
- [ ] Tab navigation elegante
- [ ] Card booking richiesta redesign
- [ ] Modal accept/reject migliorate
- [ ] Archive filters UX
- [ ] Statistics display real-time
- [ ] Responsive layout

### Task 3: Calendar Visual Design
- [ ] Custom FullCalendar CSS
- [ ] Eventi colorati per tipo
- [ ] Hover states
- [ ] Click interactions smooth
- [ ] Modal event details layout
- [ ] Edit form UX migliorato
- [ ] Legend visiva
- [ ] Mobile list view

### Task 4: Accessibility Audit
- [ ] Color contrast ratios verificati
- [ ] Keyboard navigation testata
- [ ] Screen reader tested (NVDA)
- [ ] ARIA labels completi
- [ ] Focus indicators visibili
- [ ] Semantic HTML corretto

### Task 5: Design Documentation
- [ ] Style guide document
- [ ] Component usage guide
- [ ] Color palette reference
- [ ] Typography scale
- [ ] Spacing system
- [ ] Animation guidelines

## 📊 Success Metrics

### Visibilità & Usabilità
- Lighthouse Score: ≥ 90 (Performance, Accessibility, Best Practices)
- First Contentful Paint: < 2s
- Time to Interactive: < 3s

### User Experience
- Tasso abbandono form: < 10%
- Tempo completamento form: < 2 minuti
- Tasso conversione pending → accepted: > 80%
- User satisfaction: ≥ 4.5/5

### Brand Alignment
- Colori Al Ritrovo coerenti in tutta l'app
- Iconografia tematica restaurant
- Tipografia professionale
- Animation smooth e naturale

## 🔄 Handoff Process

### Dopo Completamento Task

1. **Screenshot Documentation**:
   - Form pubblico (mobile + desktop)
   - Dashboard admin (3 tabs)
   - Calendar views (month/week/day)
   - Modal interactions
   - Empty/error states
   - Loading states

2. **Component Library**:
   - Lista componenti usati/creati
   - Variants disponibili
   - Usage examples

3. **Design System**:
   - Color palette
   - Typography scale
   - Spacing system
   - Animation guidelines

4. **Accessibility Report**:
   - Test results (Lighthouse, contrast)
   - Issues trovati + fixes
   - Recommendations future

5. **Update Knowledge Base**:
   ```markdown
   ## Design System Al Ritrovo
   
   ### Colors
   - Primary: #8B0000 (Bordeaux)
   - Accent: #DAA520 (Oro)
   
   ### Components
   - Button: variants, states
   - Input: labels, validation
   - Modal: animations, layouts
   - Calendar: custom styling
   
   [Aggiungi dettagli...]
   ```

## 📝 Checklist Finale

### Code Quality
- [ ] No inline styles (usa Tailwind/CSS)
- [ ] Componenti riusabili
- [ ] Naming consistente (BEM or similar)
- [ ] Commenti dove necessario
- [ ] TypeScript types completi

### Visual Quality
- [ ] Brand colors consistenti
- [ ] Spacing uniforme
- [ ] Typography hierarchy chiara
- [ ] Icons scelte appropriatamente (lucide)
- [ ] Images ottimizzate (se presenti)

### User Experience
- [ ] Flow logico e intuitivo
- [ ] Feedback immediato su azioni
- [ ] Messaggi error friendly
- [ ] Empty states informativi
- [ ] Loading states non bloccanti

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader friendly
- [ ] Keyboard navigabile
- [ ] Focus visible
- [ ] No color-only information

## 🎨 Inspirazioni Design

### Riferimenti Estilo Al Ritrovo
- Ambiente caldo e accogliente
- Palette bordeaux/oro elegante
- Tipografia classica ma moderna
- Micro-interactions smooth
- Focus su usabilità prima di tutto

### Componenti da Creare/Pulire
1. **Form Pubblico**: Hero section + form layout
2. **Modal Components**: Accept/Reject/Edit
3. **Card Components**: Booking request card
4. **Dashboard Tabs**: Navigation elegante
5. **Calendar Custom CSS**: Eventi colorati
6. **Empty States**: Friendly messages
7. **Loading States**: Skeleton/spinners

## ✅ Quando Hai Finito

Aggiorna documentazione:
- Screenshot di tutti i componenti
- Update style guide
- Accessibility report
- Component library document

Comunica completamento:
```markdown
✅ UX Design Completato!

**Deliverables**:
- Form pubblico esteticamente raffinato
- Dashboard admin brand-aligned
- Calendar visual design ottimizzato
- Accessibilità WCAG 2.1 AA
- Responsive design completo

**Next Steps**:
Pronto per integrazione con backend e testing finale.
```

---

## 📚 Risorse & Strumenti

**Design Tools**:
- Figma (mockups se necessario)
- Tailwind Playground (rapid prototyping)
- Chrome DevTools (testing responsive)

**Accessibility Tools**:
- WebAIM Contrast Checker
- Lighthouse (Chrome DevTools)
- WAVE browser extension
- Screen Reader (NVDA)

**Icons**:
- Lucide React (già usato nel progetto)

**Colors**:
- Tailwind config (già configurato)

---

**Obiettivo Finale**: Un'esperienza visivamente eccellente, professionale e user-friendly che rifletta l'identità del brand Al Ritrovo, con particolare attenzione all'estetica e alla facilità d'uso. 🎨✨

