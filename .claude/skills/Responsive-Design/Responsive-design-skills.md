# SKILL: responsive-design

## Scopo
Definisce cosa significa "app responsive" in **Calendario Al Ritrovo**.
Ogni agente che progetta, modifica o testa la UI deve usare questi punti come riferimento minimo.

---

## Contesto Progetto

**Calendario Al Ritrovo** è un sistema di prenotazione per ristorante con:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **Testing**: Playwright per E2E test
- **Dev Server**: `localhost:5175`

**Pagine principali**:
- [BookingRequestPage.tsx](../../../src/pages/BookingRequestPage.tsx) - Pagina pubblica prenotazioni `/prenota`
- [AdminDashboard.tsx](../../../src/pages/AdminDashboard.tsx) - Dashboard admin con tabs

**Componenti chiave**:
- [BookingRequestForm.tsx](../../../src/features/booking/components/BookingRequestForm.tsx) - Form prenotazione con menu selection
- [MenuSelection.tsx](../../../src/features/booking/components/MenuSelection.tsx) - Selezione menu con card ingredienti
- [BookingCalendar.tsx](../../../src/features/booking/components/BookingCalendar.tsx) - Calendario con FullCalendar
- [BookingRequestCard.tsx](../../../src/features/booking/components/BookingRequestCard.tsx) - Card richieste pending

---

## Viewport di Riferimento

### Mobile (PRIORITÀ MASSIMA)
- **360×640** - Smartphone piccolo (es. Galaxy S5, iPhone SE)
- **360×800** - Smartphone medio/alto (es. Pixel 2, Galaxy A series)
- **390×844** - Smartphone moderno (es. iPhone 12/13/14)

### Tablet (Se rilevante)
- **768×1024** - iPad portrait

### Desktop
- **1280×800** e superiori

**IMPORTANTE**: Il progetto è **mobile-first**. Tutti i test responsive devono verificare PRIMA i viewport mobile.

---

## Cosa significa "responsive" in questo progetto

### 1. Adattamento ai viewport ✅
La UI deve funzionare **perfettamente** su tutti i viewport mobile (360-390px larghezza).

**Componenti critici**:
- Form prenotazione: deve rimanere usabile su 360px
- Card menu: devono adattarsi senza overflow
- Modali: devono essere completamente visibili e usabili
- Tabelle admin: devono diventare scrollabili o riorganizzate

**Nessun elemento critico deve sparire o sovrapporsi cambiando larghezza.**

---

### 2. Nessuno scroll orizzontale indesiderato ⚠️
**REGOLA FERREA**: Su mobile lo scroll deve essere **SOLO verticale**.

**Problema comune**: Card con `maxWidth: '560px'` che escono dal viewport.

**Soluzione verificata**:
```tsx
// ❌ SBAGLIATO
style={{ maxWidth: '560px' }}

// ✅ CORRETTO
style={{ maxWidth: 'min(560px, calc(100% - 16px))' }}
```

**Test**: Verificare `document.documentElement.scrollWidth <= document.documentElement.clientWidth`

---

### 3. Layout che si ricompone 📱
Griglie, card, colonne, menu e form devono **ridisporre i contenuti** da desktop a mobile.

**Pattern Tailwind usati nel progetto**:
- `flex-col md:flex-row` - Colonna su mobile, riga su desktop
- `grid-cols-1 md:grid-cols-2` - 1 colonna su mobile, 2 su desktop
- `gap-2 md:gap-4` - Spacing ridotto su mobile

**Componenti che usano questo pattern**:
- [MenuSelection.tsx:510](../../../src/features/booking/components/MenuSelection.tsx#L510) - Card menu
- [BookingRequestPage.tsx:150](../../../src/pages/BookingRequestPage.tsx#L150) - Info box a 2 colonne

---

### 4. Testo sempre leggibile 📖
**Nessun testo tagliato, troppo piccolo o schiacciato.**

**Requisiti minimi**:
- Font size >= 12px per testo corpo
- Font size >= 14px per nomi/titoli
- Font size >= 16px per input e bottoni

**Problema comune**: `whiteSpace: 'nowrap'` su nomi lunghi.

**Soluzioni verificate**:
```tsx
// ❌ SBAGLIATO - Testo tagliato su mobile
style={{ whiteSpace: 'nowrap' }}

// ✅ CORRETTO - Wrapping su mobile, nowrap su desktop
style={{ whiteSpace: 'normal' }}
className="md:whitespace-nowrap"

// ✅ CORRETTO - Word breaking
style={{
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
  hyphens: 'auto'
}}
```

**Items problematici noti** (da verificare sempre):
- Panelle (Farina di Ceci fritta, Specialità Siciliana) - 58 caratteri
- Caraffe / Drink Premium con descrizione lunga - 67 caratteri
- Polpette Vegane di Lenticchie e Curry - 42 caratteri

---

### 5. Click/touch utilizzabili 👆
Elementi interattivi sufficientemente grandi e distanziati.

**Dimensioni minime**:
- Bottoni: 44×44px (Apple HIG) o 48×48px (Material Design)
- Checkbox/Radio: minimo 24×24px con area cliccabile 44×44px
- Link in testo: line-height >= 1.5 per evitare tocchi accidentali

**Spacing minimo**: 8px tra elementi cliccabili adiacenti

---

### 6. Immagini e icone fluide 🖼️
Niente deformazioni, niente immagini che escono dal container.

**Pattern usati**:
```css
/* Immagini responsive */
img {
  max-width: 100%;
  height: auto;
}

/* Background images */
background-size: cover;
background-position: center;
```

**Esempio dal progetto**: [BookingRequestPage.tsx:85](../../../src/pages/BookingRequestPage.tsx#L85) - Mobile vintage background

---

### 7. Componenti complessi gestiti bene 🧩

**Modali**:
- Full screen su mobile (<768px)
- Centered con max-width su desktop

**Tabelle**:
- Scrollabili orizzontalmente con indicatore chiaro
- O riorganizzate in card su mobile

**Tab Navigation** (AdminDashboard):
- Scrollabile orizzontalmente su mobile
- Indicatore tab attiva sempre visibile

**Calendar (FullCalendar)**:
- Responsive options configurate
- Vista giorno/settimana su mobile

---

### 8. Cambio orientamento stabile 🔄
Passando portrait ⇄ landscape il layout resta **coerente** e non si rompe.

**Test verificato**: 390×844 (portrait) ⇄ 844×390 (landscape)

**Pattern**: Usare `viewport height` dinamico per modali e overlay.

---

### 9. Coerenza visiva 🎨
Stili, spaziature, effetti e comportamenti devono restare **uniformi** tra le varie risoluzioni.

**Design System usato**:
- Tailwind CSS con custom colors (warm-wood, terracotta, warm-orange)
- Radix UI per componenti complessi
- Glassmorphism: `backdrop-blur-xl` + `bg-white/30`

**Font**: Font serif per titoli, font sans per corpo

---

## Quando l'interfaccia NON è responsive ❌

Se **uno solo** di questi casi si verifica, l'interfaccia NON è considerata responsive:

1. ❌ Scroll orizzontale presente su mobile
2. ❌ Testo tagliato o non leggibile (font < 12px)
3. ❌ Elementi interattivi impossibili da cliccare
4. ❌ Card o contenuti che escono dal viewport
5. ❌ Layout rotto cambiando orientamento
6. ❌ Immagini deformate o che escono dal container
7. ❌ Modali non usabili su mobile
8. ❌ Inconsistenze visive tra viewport

---

## Riferimenti Progetto

- **Test E2E esistenti**: `e2e/responsive/test-menu-cards-text-wrapping.spec.ts`
- **Report test**: `docs/reports/RESPONSIVE_TEST_RESULTS_AFTER_FIX.md`
- **Analisi problemi**: `docs/reports/RESPONSIVE_TEST_MENU_CARDS_ANALYSIS.md`
- **Template test**: `.claude/skills/Responsive-Design/Template-test-responsive`

---

## Prossimi Passi per Agenti

1. **Prima di modificare UI**: Leggere questa skill
2. **Durante sviluppo**: Testare su viewport mobile (360-390px)
3. **Dopo modifiche**: Eseguire test E2E responsive
4. **Se problemi**: Consultare report esistenti per pattern di fix

**IMPORTANTE**: Ogni modifica UI deve essere testata su mobile PRIMA di considerarla completa.
