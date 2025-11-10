# Responsive Design Skills - Calendario Al Ritrovo

## Panoramica

Questa cartella contiene le **skills** per gestire il design responsive nel progetto **Calendario Al Ritrovo**.

Le skills sono state create basandosi su test e fix reali eseguiti nel progetto, e contengono dati concreti, esempi di codice verificati, e pattern dimostrati funzionanti.

---

## File Disponibili

### 1. [Responsive-design-skills.md](./Responsive-design-skills.md)
**Cosa contiene**: Definizione completa di cosa significa "responsive" in questo progetto.

**Quando usarla**:
- Prima di modificare qualsiasi componente UI
- Quando si progetta una nuova feature con interfaccia
- Durante code review di modifiche UI
- Come riferimento per troubleshooting problemi responsive

**Contenuti principali**:
- Contesto progetto (tech stack, componenti chiave, pagine)
- Viewport di riferimento (mobile, tablet, desktop)
- 9 criteri responsive con esempi concreti dal progetto
- Pattern CSS/Tailwind usati e verificati
- Problemi comuni e soluzioni testate
- Riferimenti a file reali del progetto

**Dati reali inclusi**:
- Viewport testati: 360×640, 360×800, 390×844 (mobile), 768×1024 (tablet)
- Componenti critici: MenuSelection, BookingRequestForm, BookingCalendar, etc.
- Items problematici noti con lunghezze caratteri reali
- Pattern CSS verificati con codice reale

---

### 2. [Template-test-responsive](./Template-test-responsive)
**Cosa contiene**: Template completo per creare e eseguire test E2E responsive con Playwright.

**Quando usarla**:
- Dopo ogni fix UI per verificare non ci siano regressioni
- Quando si implementa una nuova feature UI
- Per creare test sistematici su nuovi componenti
- Come base per generare report di test

**Contenuti principali**:
- **PARTE 1**: Input obbligatori per agente tester
- **PARTE 2**: Esecuzione test (viewport, checklist, screenshot)
- **PARTE 3**: Struttura report markdown
- **PARTE 4**: Template completo test Playwright
- **PARTE 5**: Comandi esecuzione
- **PARTE 6**: Checklist finale

**Esempi reali inclusi**:
- Test Playwright funzionante da `e2e/responsive/test-menu-cards-text-wrapping.spec.ts`
- Report markdown da `docs/reports/RESPONSIVE_TEST_RESULTS_AFTER_FIX.md`
- Pattern di verifica usati in test reali del progetto

---

## Come Usare Queste Skills

### Per Agenti Claude Code

Quando lavori su UI nel progetto Calendario Al Ritrovo:

1. **PRIMA di modificare UI**: Leggi [Responsive-design-skills.md](./Responsive-design-skills.md)
   ```
   Read: .claude/skills/Responsive-Design/Responsive-design-skills.md
   ```

2. **Durante sviluppo**: Testa manualmente su viewport mobile (360-390px width)
   - Usa browser DevTools
   - O Playwright per screenshot

3. **DOPO modifiche**: Crea test E2E usando [Template-test-responsive](./Template-test-responsive)
   - Copia template Playwright (Parte 4)
   - Adatta per tuo componente specifico
   - Esegui test su tutti i viewport

4. **Genera report**: Usa struttura report (Parte 3) per documentare risultati

5. **PRIMA di commit/PR**: Verifica che tutti i 9 criteri responsive siano soddisfatti

---

### Per Human Developers

Quando fai modifiche UI:

1. **Consulta skill**: Leggi [Responsive-design-skills.md](./Responsive-design-skills.md) per capire i requisiti responsive

2. **Testa su mobile FIRST**: Usa DevTools per testare viewport 360px-390px

3. **Esegui test E2E**:
   ```bash
   # Test responsive esistenti
   npx playwright test e2e/responsive/

   # Crea nuovo test usando template
   cp .claude/skills/Responsive-Design/Template-test-responsive \
      e2e/responsive/test-nuovo-componente.spec.ts
   ```

4. **Genera report**: Usa template Parte 3 per documentare risultati

---

## Esempi Reali nel Progetto

Questi file mostrano come le skills sono state applicate in casi reali:

### Test E2E Responsive
- **File**: `e2e/responsive/test-menu-cards-text-wrapping.spec.ts`
- **Cosa testa**: Card menu con nomi/descrizioni lunghe
- **Problema risolto**: Scroll orizzontale e testo tagliato su mobile
- **Viewport testati**: 360×640, 360×800, 390×844

### Report Test
- **File**: `docs/reports/RESPONSIVE_TEST_RESULTS_AFTER_FIX.md`
- **Contenuto**: Report completo con 16/16 test passati dopo fix
- **Include**: Tabella risultati, statistiche, criteri verificati, verdetto

### Analisi Problemi
- **File**: `docs/reports/RESPONSIVE_TEST_MENU_CARDS_ANALYSIS.md`
- **Contenuto**: Analisi dettagliata problemi responsive su card menu
- **Include**: Problemi identificati, soluzioni applicate, test plan

### Componenti Modificati
- **File**: `src/features/booking/components/MenuSelection.tsx`
- **Fix applicati**:
  - `maxWidth: 'min(560px, calc(100% - 16px))'` per prevenire overflow
  - `whiteSpace: 'normal'` su mobile, `md:whitespace-nowrap` su desktop
  - `wordBreak: 'break-word'` e `overflowWrap: 'break-word'` per wrapping

---

## Pattern CSS/Tailwind Verificati

Questi pattern sono stati testati e funzionano nel progetto:

### 1. Prevenire Scroll Orizzontale
```tsx
// ❌ SBAGLIATO
style={{ maxWidth: '560px' }}

// ✅ CORRETTO
style={{ maxWidth: 'min(560px, calc(100% - 16px))' }}
```

### 2. Testo Wrapping
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

### 3. Layout Responsive
```tsx
// Colonna su mobile, riga su desktop
className="flex flex-col md:flex-row gap-2 md:gap-4"

// 1 colonna su mobile, 2 su desktop
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

### 4. Container Flex con Overflow
```tsx
style={{
  overflow: 'hidden',    // Prevenire overflow
  minWidth: 0,           // Permettere ridimensionamento
  flex: '1 1 auto'       // Flex grow/shrink
}}
```

---

## Viewport di Riferimento

### Mobile (PRIORITÀ MASSIMA - testare sempre)
- **360×640** - Smartphone piccolo (Galaxy S5, iPhone SE)
- **360×800** - Smartphone medio/alto (Pixel 2, Galaxy A series)
- **390×844** - Smartphone moderno (iPhone 12/13/14)

### Tablet (se rilevante)
- **768×1024** - iPad portrait

### Desktop
- **1280×800** e superiori

**IMPORTANTE**: Il progetto è **mobile-first**. Testare sempre prima i viewport mobile.

---

## Criteri Responsive (Quick Reference)

1. ✅ **Adattamento ai viewport** - Funziona su 360-390px width
2. ⚠️ **Nessuno scroll orizzontale** - REGOLA FERREA per mobile
3. 📱 **Layout che si ricompone** - Grid/flex adattano da desktop a mobile
4. 📖 **Testo sempre leggibile** - Font >= 12px, nessun taglio
5. 👆 **Click/touch utilizzabili** - Bottoni >= 44×44px, spacing >= 8px
6. 🖼️ **Immagini fluide** - max-width: 100%, no deformazioni
7. 🧩 **Componenti complessi gestiti** - Modali, tabelle, calendar responsive
8. 🔄 **Cambio orientamento stabile** - Portrait ⇄ landscape non si rompe
9. 🎨 **Coerenza visiva** - Stili uniformi tra viewport

**Se uno solo fallisce → NON è responsive ❌**

---

## Comandi Utili

```bash
# Eseguire tutti i test responsive
npx playwright test e2e/responsive/

# Eseguire singolo test
npx playwright test e2e/responsive/test-menu-cards-text-wrapping.spec.ts

# Debug mode
npx playwright test e2e/responsive/test-name.spec.ts --debug

# UI mode (interattivo)
npx playwright test e2e/responsive/test-name.spec.ts --ui

# Solo viewport specifico
npx playwright test e2e/responsive/test-name.spec.ts -g "360×640"

# Generare HTML report
npx playwright test e2e/responsive/ --reporter=html
npx playwright show-report
```

---

## Struttura Directory

```
.claude/skills/Responsive-Design/
├── README.md                      # Questo file
├── Responsive-design-skills.md    # Definizione responsive per il progetto
└── Template-test-responsive       # Template test E2E Playwright

Riferimenti nel progetto:
e2e/responsive/
├── test-menu-cards-text-wrapping.spec.ts  # Test esempio reale

docs/reports/
├── RESPONSIVE_TEST_RESULTS_AFTER_FIX.md        # Report test completo
├── RESPONSIVE_TEST_MENU_CARDS_ANALYSIS.md      # Analisi problemi
└── RESPONSIVE_TEST_RESULTS_MENU_CARDS.md       # Risultati iniziali

src/features/booking/components/
├── MenuSelection.tsx              # Componente con fix responsive
├── BookingRequestForm.tsx         # Form con layout responsive
└── BookingRequestCard.tsx         # Card con layout responsive
```

---

## Aggiornamenti e Manutenzione

Queste skills sono basate su **dati reali del progetto** alla data: **08/11/2025**

**Quando aggiornare le skills**:
- Dopo fix importanti di problemi responsive
- Quando si aggiungono nuovi pattern CSS/Tailwind
- Se cambiano i viewport di riferimento
- Quando si scoprono nuovi problemi comuni

**Come aggiornare**:
1. Aggiungere esempi reali in Responsive-design-skills.md
2. Aggiornare template con nuovi pattern di test
3. Linkare nuovi file di esempio dal progetto
4. Aggiornare questo README con riferimenti

---

## Feedback e Contributi

Se trovi problemi responsive non coperti da queste skills, o pattern che funzionano meglio:

1. Documenta il problema/soluzione in `docs/reports/`
2. Aggiorna le skills con i nuovi pattern
3. Crea test E2E per verificare il fix
4. Aggiorna questo README

---

## Licenza e Credits

Queste skills sono parte del progetto **Calendario Al Ritrovo**.

Creato basandosi su test e fix reali eseguiti durante lo sviluppo del progetto.

---

**Per domande o chiarimenti sulle skills responsive, consulta:**
- [Responsive-design-skills.md](./Responsive-design-skills.md) per la definizione completa
- [Template-test-responsive](./Template-test-responsive) per creare test
- `docs/reports/RESPONSIVE_TEST_*` per esempi di report
- `e2e/responsive/` per test E2E esistenti
