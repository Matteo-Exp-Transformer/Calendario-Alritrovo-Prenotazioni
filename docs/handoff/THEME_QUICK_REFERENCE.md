# 🎨 Quick Reference: Mapping Classi → Variabili Tema

**Guida rapida** per convertire classi Tailwind hardcoded in variabili CSS tema.

---

## 📋 Tabella di Mapping

### Backgrounds / Surface Colors

| Classe Tailwind | Variabile CSS Tema | Fallback | Uso |
|----------------|-------------------|----------|-----|
| `bg-white` | `var(--theme-surface-elevated)` | `#ffffff` | Cards, modals, contenitori |
| `bg-gray-50` | `var(--theme-surface-page)` | `#f9fafb` | Background pagina |
| `bg-gray-100` | `var(--theme-surface-hover)` | `#f3f4f6` | Hover states |
| `bg-gray-200` | `var(--theme-surface-pressed)` | `#e5e7eb` | Active/pressed |

### Borders

| Classe Tailwind | Variabile CSS Tema | Fallback | Uso |
|----------------|-------------------|----------|-----|
| `border-gray-200` | `var(--theme-border-default)` | `#e5e7eb` | Bordi standard |
| `border-gray-300` | `var(--theme-border-strong)` | `#d1d5db` | Bordi enfatizzati |
| `border-blue-500` | `var(--theme-border-nav-active)` | `#3b82f6` | Nav attiva |

### Text Colors

| Classe Tailwind | Variabile CSS Tema | Fallback | Uso |
|----------------|-------------------|----------|-----|
| `text-gray-900` | `var(--theme-text-primary)` | `#111827` | Titoli, testi principali |
| `text-gray-600` | `var(--theme-text-secondary)` | `#4b5563` | Testi secondari |
| `text-gray-500` | `var(--theme-text-tertiary)` | `#6b7280` | Labels, testi terziari |
| `text-blue-500` | `var(--theme-text-accent)` | `#3b82f6` | Testi accent |

### Accent Colors

| Classe Tailwind | Variabile CSS Tema | Fallback | Uso |
|----------------|-------------------|----------|-----|
| `bg-blue-600` | `var(--theme-accent-primary)` | `#3b82f6` | Pulsanti primary |
| `bg-blue-700` / `hover:bg-blue-700` | `var(--theme-accent-primary-hover)` | `#2563eb` | Hover primary |
| `bg-violet-500` | `var(--theme-accent-secondary)` | `#8b5cf6` | Accent secondario |
| `bg-cyan-500` | `var(--theme-accent-tertiary)` | `#06b6d4` | Accent terziario |

### Shadows

| Classe Tailwind | Variabile CSS Tema | Uso |
|----------------|-------------------|-----|
| `shadow-sm` | `var(--theme-shadow-sm)` | Shadow piccoli |
| `shadow-md` | `var(--theme-shadow-md)` | Shadow medi |
| `shadow-lg` | `var(--theme-shadow-lg)` | Shadow grandi |
| `shadow-xl` | `var(--theme-shadow-xl)` | Shadow extra grandi |

---

## 🔧 Esempi Pratici

### Esempio 1: Container Card

```tsx
// PRIMA:
<div className="bg-white border border-gray-200 rounded-lg shadow-md p-4">

// DOPO:
<div 
  className="rounded-lg p-4"
  style={{
    backgroundColor: 'var(--theme-surface-elevated, #ffffff)',
    borderColor: 'var(--theme-border-default, #e5e7eb)',
    borderWidth: '1px',
    boxShadow: 'var(--theme-shadow-md)'
  }}
>
```

### Esempio 2: Testi

```tsx
// PRIMA:
<h2 className="text-gray-900 font-bold">Titolo</h2>
<p className="text-gray-600">Descrizione</p>
<span className="text-gray-500 text-sm">Label</span>

// DOPO:
<h2 
  className="font-bold"
  style={{ color: 'var(--theme-text-primary, #111827)' }}
>
  Titolo
</h2>
<p style={{ color: 'var(--theme-text-secondary, #4b5563)' }}>
  Descrizione
</p>
<span 
  className="text-sm"
  style={{ color: 'var(--theme-text-tertiary, #6b7280)' }}
>
  Label
</span>
```

### Esempio 3: Pulsante Primary

```tsx
// PRIMA:
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Salva
</button>

// DOPO:
<button
  className="text-white px-4 py-2 rounded-lg"
  style={{
    backgroundColor: 'var(--theme-accent-primary, #3b82f6)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--theme-accent-primary-hover, #2563eb)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--theme-accent-primary, #3b82f6)'
  }}
>
  Salva
</button>
```

### Esempio 4: Nav Item

```tsx
// PRIMA:
<button className="bg-white border-2 border-gray-200 text-gray-600">
  Nav Item
</button>

// DOPO:
<button
  className="border-2"
  style={{
    backgroundColor: 'var(--theme-surface-nav-inactive, #ffffff)',
    borderColor: 'var(--theme-border-nav-inactive, #e5e7eb)',
    color: 'var(--theme-text-nav-inactive, #4b5563)'
  }}
>
  Nav Item
</button>
```

### Esempio 5: Hover State

```tsx
// PRIMA:
<div className="bg-white hover:bg-gray-100 border border-gray-200">
  Content
</div>

// DOPO:
<div
  className="border"
  style={{
    backgroundColor: 'var(--theme-surface-elevated, #ffffff)',
    borderColor: 'var(--theme-border-default, #e5e7eb)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--theme-surface-hover, #f3f4f6)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--theme-surface-elevated, #ffffff)'
  }}
>
  Content
</div>
```

---

## ⚠️ Note Importanti

### 1. Sempre Usare Fallback

```tsx
// ✅ CORRETTO:
var(--theme-surface-elevated, #ffffff)

// ❌ SBAGLIATO:
var(--theme-surface-elevated)
```

### 2. Mantenere Classi Utility Tailwind

Non rimuovere classi layout/utility:
- ✅ Mantieni: `rounded-lg`, `p-4`, `flex`, `gap-2`, etc.
- ❌ Rimuovi: `bg-white`, `text-gray-*`, `border-gray-*`

### 3. Stati Speciali

Per errori/warning/success, usa colori semantici ma parametrizzabili:

```tsx
// Errore:
style={{
  backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red-50
  borderColor: 'var(--theme-border-strong, #ef4444)',
  color: '#991b1b' // Red-800
}}

// Success:
style={{
  backgroundColor: 'rgba(16, 185, 129, 0.1)', // Green-50
  borderColor: '#10b981', // Green-500
  color: '#065f46' // Green-800
}}
```

### 4. Input Fields

```tsx
// PRIMA:
<input className="border border-gray-300 focus:border-blue-500" />

// DOPO:
<input
  style={{
    borderColor: 'var(--theme-border-input, #d1d5db)',
    borderWidth: '1px'
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = 'var(--theme-border-input-focus, #3b82f6)'
  }}
  onBlur={(e) => {
    e.currentTarget.style.borderColor = 'var(--theme-border-input, #d1d5db)'
  }}
/>
```

---

## 🔍 Come Trovare Classi da Sostituire

### Pattern da Cercare (grep/ricerca)

```bash
# Cerca classi hardcoded:
bg-white|bg-gray-|text-gray-|border-gray-

# Esempi:
grep -r "bg-white" src/
grep -r "text-gray-" src/
grep -r "border-gray-" src/
```

### File da Controllare

1. **Componenti UI**:
   - `src/components/ui/CollapsibleCard.tsx`
   - `src/components/ui/ThemeToggle.tsx` (già fatto)

2. **Pages**:
   - `src/pages/AdminDashboard.tsx`
   - `src/pages/AdminLoginPage.tsx`

3. **Feature Components**:
   - `src/features/booking/components/*.tsx`

---

## 📚 Variabili Disponibili

### Surface
- `--theme-surface-page` - Background pagina
- `--theme-surface-elevated` - Cards, modals
- `--theme-surface-header` - Header
- `--theme-surface-nav-active` - Nav item attivo
- `--theme-surface-nav-inactive` - Nav item inattivo
- `--theme-surface-hover` - Hover state
- `--theme-surface-pressed` - Pressed/active state

### Border
- `--theme-border-default` - Bordi standard
- `--theme-border-strong` - Bordi enfatizzati
- `--theme-border-nav-active` - Bordo nav attiva
- `--theme-border-nav-inactive` - Bordo nav inattiva
- `--theme-border-input` - Bordo input
- `--theme-border-input-focus` - Bordo input focus

### Text
- `--theme-text-primary` - Testi principali
- `--theme-text-secondary` - Testi secondari
- `--theme-text-tertiary` - Testi terziari
- `--theme-text-accent` - Testi accent
- `--theme-text-nav-active` - Testo nav attiva
- `--theme-text-nav-inactive` - Testo nav inattiva

### Accent
- `--theme-accent-primary` - Colore primary
- `--theme-accent-primary-hover` - Hover primary
- `--theme-accent-secondary` - Accent secondario
- `--theme-accent-tertiary` - Accent terziario

### Shadow
- `--theme-shadow-sm` - Shadow piccolo
- `--theme-shadow-md` - Shadow medio
- `--theme-shadow-lg` - Shadow grande
- `--theme-shadow-xl` - Shadow extra grande

### Stats Cards (AdminDashboard)
- `--theme-stats-bg` - Background stats card
- `--theme-stats-border-week` - Bordo settimana
- `--theme-stats-border-today` - Bordo oggi
- `--theme-stats-border-month` - Bordo mese
- `--theme-stats-border-rejected` - Bordo rifiutate
- `--theme-stats-text-label` - Testo label
- `--theme-stats-text-value` - Testo valore

### User Badge
- `--theme-user-badge-bg` - Background badge
- `--theme-user-badge-border` - Bordo badge
- `--theme-user-badge-border-hover` - Bordo hover
- `--theme-user-badge-avatar-gradient` - Gradiente avatar
- `--theme-user-badge-text` - Testo badge
- `--theme-user-badge-role-bg` - Background ruolo
- `--theme-user-badge-role-text` - Testo ruolo

---

**Vedi anche**: 
- `docs/handoff/THEME_IMPLEMENTATION_PLAN.md` - Piano dettagliato
- `docs/handoff/THEME_STATUS_SUMMARY.md` - Riepilogo situazione
- `src/index.css` (righe 358-490) - Definizioni variabili





