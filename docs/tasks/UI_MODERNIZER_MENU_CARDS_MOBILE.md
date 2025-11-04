# 🎨 Task UI Modernizer: Menu Cards Responsive Layout

**Assegnato a**: ui-modernizer agent
**Priority**: 🔥 P0 - CRITICO
**Stima tempo**: 30-45 minuti
**Data**: 2025-01-04

---

## 🎯 Obiettivo

Implementare layout responsive per menu cards nella pagina `/prenota` per risolvere problema critico di altezza eccessiva su mobile (1602px → target ~85-100px).

**Vincoli**:
- ✅ Desktop layout DEVE rimanere invariato (app quasi ultimata)
- ✅ Testare sia Android che iPhone (375px, 412px)
- ✅ Supportare edge case iPhone 5/SE (320px)
- ✅ Tutti i test E2E devono continuare a passare

---

## 🐛 Problema Identificato

### Stato Attuale (BEFORE)

**File**: `src/features/booking/components/MenuSelection.tsx` (righe 296-310)

**Problema**: Layout 3 colonne hardcoded identico su desktop e mobile
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: '180px 1fr 100px',  // ❌ Hardcoded, non responsive
  gap: '8px'
}}>
  <span className="font-bold">{item.name}</span>
  <div style={{ minHeight: '68px' }}>     // ⚠️ Causa altezza eccessiva
    {item.description && <p>{item.description}</p>}
  </div>
  <span>€{item.price.toFixed(2)}</span>
</div>
```

**Metriche misurate**:
- 🔴 **Mobile card height**: 1602px (CRITICO - occupa >2 viewport!)
- ⚠️ **Padding verticale**: 6px (target >= 24px)
- ✅ Desktop card height: 84px (OK)

**Screenshot BEFORE**:
- `e2e/screenshots/menu-cards-before-desktop.png`
- `e2e/screenshots/menu-cards-before-mobile-375.png`
- `e2e/screenshots/menu-cards-before-mobile-320.png`

---

## ✅ Soluzione Scelta: Opzione B (Stack Vertical Mobile)

**Descrizione**: Desktop mantiene 3 colonne, mobile diventa layout verticale (stack).

**Vantaggi**:
- ✅ Risolve problema altezza (1602px → ~85px)
- ✅ Massima leggibilità mobile
- ✅ Desktop completamente invariato
- ✅ Pattern già usato nel progetto

**Target metriche**:
- 📐 Mobile card height: 80-100px
- 📐 Padding verticale: >= 16px
- 📐 Font size: >= 14px
- 📐 No overflow viewport 320px

---

## 📝 Implementazione Step-by-Step

### STEP 1: Backup e Preparazione (2 min)

```bash
# Crea branch per modifiche
git checkout -b feature/menu-cards-responsive

# Verifica stato corrente
npx playwright test e2e/mobile/test-menu-cards-before-mobile.spec.ts
```

**Checklist**:
- [ ] Branch creato
- [ ] Screenshot BEFORE verificati

---

### STEP 2: Modifica File MenuSelection.tsx (15 min)

**File**: `src/features/booking/components/MenuSelection.tsx`
**Righe target**: 296-310

**Trova questo codice** (circa riga 296):
```tsx
{/* Layout interno card */}
<div className="flex-1 flex items-center w-full"
     style={{
       display: 'grid',
       gridTemplateColumns: '180px 1fr 100px',
       gap: '8px',
       alignItems: 'center'
     }}>
  <span className="font-bold">{item.name}</span>
  <div className="flex justify-center items-center"
       style={{ width: '100%', minHeight: '68px' }}>
    {item.description ? (
      <p className="font-bold text-gray-600 text-center">
        {item.description}
      </p>
    ) : null}
  </div>
  <span className="text-sm md:text-base font-bold text-warm-wood whitespace-nowrap">
    €{item.price.toFixed(2)}
  </span>
</div>
```

**Sostituisci con**:
```tsx
{/* Layout interno card - RESPONSIVE */}
<div className="flex-1 w-full">
  {/* Desktop: 3 colonne (hidden su mobile) */}
  <div className="hidden md:grid md:items-center"
       style={{
         gridTemplateColumns: '180px 1fr 100px',
         gap: '8px'
       }}>
    <span className="font-bold">{item.name}</span>
    <div className="flex justify-center items-center">
      {item.description && (
        <p className="font-bold text-gray-600 text-center">
          {item.description}
        </p>
      )}
    </div>
    <span className="text-sm md:text-base font-bold text-warm-wood whitespace-nowrap text-right">
      €{item.price.toFixed(2)}
    </span>
  </div>

  {/* Mobile: Stack verticale (hidden su desktop) */}
  <div className="flex flex-col gap-2 md:hidden">
    {/* Riga 1: Titolo + Prezzo */}
    <div className="flex items-center justify-between">
      <span className="font-bold text-base">{item.name}</span>
      <span className="font-bold text-base text-warm-wood whitespace-nowrap">
        €{item.price.toFixed(2)}
      </span>
    </div>
    {/* Riga 2: Dettagli (se presenti) */}
    {item.description && (
      <p className="text-sm text-gray-600 pl-1">
        {item.description}
      </p>
    )}
  </div>
</div>
```

**Modifiche chiave**:
1. ✅ Rimosso `minHeight: '68px'` (causava altezza eccessiva)
2. ✅ Desktop: `hidden md:grid` (solo su desktop)
3. ✅ Mobile: `flex flex-col gap-2 md:hidden` (solo su mobile)
4. ✅ Layout mobile: 2 righe (Titolo+Prezzo | Dettagli)
5. ✅ Spacing migliorato: `gap-2` (8px)

**Checklist**:
- [ ] Codice vecchio identificato
- [ ] Codice nuovo inserito
- [ ] Salvato file

---

### STEP 3: Test Visuale Manuale (5 min)

**Avvia app**:
```bash
npm run dev
```

**Testa su browser**:
1. Vai a `http://localhost:5173/prenota`
2. Seleziona "Rinfresco Laurea" nel dropdown
3. Scroll fino ai menu cards

**Verifica Desktop (1920x1080)**:
- [ ] Layout 3 colonne (Titolo | Dettagli | Prezzo)
- [ ] Card altezza ~84px (invariata)
- [ ] Tutto leggibile e allineato

**Verifica Mobile (DevTools 375x667)**:
- [ ] Layout 2 righe (Titolo+Prezzo sopra, Dettagli sotto)
- [ ] Card altezza ~80-100px (NON 1602px!)
- [ ] Nessun overflow orizzontale
- [ ] Testo tutto leggibile

**Verifica Mobile Small (320x568)**:
- [ ] Layout funziona anche su viewport piccolo
- [ ] Nessun overflow
- [ ] Testo non troncato

---

### STEP 4: Esegui Test E2E (10 min)

**Test 1: Menu functionality**:
```bash
npx playwright test e2e/menu/test-menu-selection-limits.spec.ts
npx playwright test e2e/menu/test-caraffe-mutual-exclusion.spec.ts
```
**Atteso**: ✅ Tutti test passano (funzionalità invariata)

**Test 2: Core tests** (non deve rompere funzionalità base):
```bash
npx playwright test e2e/core-tests/
```
**Atteso**: ✅ 2/2 test passano

**Test 3: Screenshot AFTER** (verifica visuale):
```bash
# Rinomina test per generare screenshot "after"
cp e2e/mobile/test-menu-cards-before-mobile.spec.ts e2e/mobile/test-menu-cards-after-mobile.spec.ts

# Modifica file per salvare con nome "after"
# Cambia 'menu-cards-before-' in 'menu-cards-after-' nei path screenshot

# Esegui test
npx playwright test e2e/mobile/test-menu-cards-after-mobile.spec.ts
```

**Output atteso**:
- `e2e/screenshots/menu-cards-after-desktop.png` (altezza ~84px)
- `e2e/screenshots/menu-cards-after-mobile-375.png` (altezza ~80-100px)
- `e2e/screenshots/menu-cards-after-mobile-320.png` (altezza ~80-100px)

**Checklist**:
- [ ] Test menu: ✅ PASS
- [ ] Test core: ✅ PASS
- [ ] Screenshot after generati
- [ ] Metriche migliorate (altezza ~80-100px)

---

### STEP 5: Comparazione Before/After (3 min)

**Apri screenshot side-by-side**:

**Desktop**:
- Before: `e2e/screenshots/menu-cards-before-desktop.png`
- After: `e2e/screenshots/menu-cards-after-desktop.png`
- **Verifica**: ✅ Layout identico (nessuna differenza visibile)

**Mobile 375px**:
- Before: `e2e/screenshots/menu-cards-before-mobile-375.png` (1602px altezza)
- After: `e2e/screenshots/menu-cards-after-mobile-375.png` (~80-100px)
- **Verifica**: ✅ Altezza drasticamente ridotta

**Mobile 320px**:
- Before: `e2e/screenshots/menu-cards-before-mobile-320.png` (1602px)
- After: `e2e/screenshots/menu-cards-after-mobile-320.png` (~80-100px)
- **Verifica**: ✅ Funziona anche su viewport piccolo

**Checklist**:
- [ ] Desktop invariato
- [ ] Mobile altezza ridotta (target raggiunto)
- [ ] Leggibilità migliorata

---

### STEP 6: Quality Gates (5 min)

**Gate 1: Linting**:
```bash
npm run lint
```
**Atteso**: ✅ 0 errori

**Gate 2: TypeScript**:
```bash
npm run build
```
**Atteso**: ✅ 0 errori TypeScript

**Gate 3: E2E Completo**:
```bash
npx playwright test e2e/menu/
npx playwright test e2e/core-tests/
```
**Atteso**: ✅ 100% pass rate

**Checklist**:
- [ ] Linting: ✅ PASS
- [ ] TypeScript: ✅ PASS
- [ ] E2E tests: ✅ PASS

---

## 📊 Metriche di Successo

### Target Metrics

| Metrica | Before | Target | After |
|---------|--------|--------|-------|
| **Mobile card height (375px)** | 🔴 1602px | ~85-100px | ✅ ___px |
| **Mobile card height (320px)** | 🔴 1602px | ~85-100px | ✅ ___px |
| **Desktop card height** | ✅ 84px | ~84px | ✅ ___px |
| **Padding vertical** | ⚠️ 6px | >= 16px | ✅ ___px |
| **Font size min** | ✅ 16px | >= 14px | ✅ ___px |
| **Overflow 320px** | ✅ NO | NO | ✅ ___ |
| **Test E2E pass rate** | ✅ 100% | 100% | ✅ ___ |

### Success Criteria

- ✅ Mobile card height <= 120px
- ✅ Desktop layout completamente invariato
- ✅ Tutti test E2E passano (100%)
- ✅ 0 errori linting
- ✅ 0 errori TypeScript
- ✅ No overflow viewport 320px

---

## 🚨 Troubleshooting

### Problema: Layout desktop cambiato

**Sintomo**: Desktop mostra layout diverso dopo modifiche

**Debug**:
```bash
# Screenshot desktop
npx playwright test e2e/mobile/test-menu-cards-after-mobile.spec.ts -g "Desktop"

# Confronta con before
# Apri: e2e/screenshots/menu-cards-before-desktop.png
# vs:   e2e/screenshots/menu-cards-after-desktop.png
```

**Soluzione**:
- Verifica `hidden md:grid` su layout desktop
- Assicurati che `md:hidden` sia su layout mobile
- Testa viewport >= 768px con DevTools

---

### Problema: Test menu falliscono

**Sintomo**: `test-menu-selection-limits.spec.ts` o `test-caraffe-mutual-exclusion.spec.ts` falliscono

**Causa comune**: Selector non trovano elementi per cambio struttura HTML

**Debug**:
```bash
npx playwright test e2e/menu/test-menu-selection-limits.spec.ts --headed --debug
```

**Soluzione**:
- Verifica che checkbox sia ancora visibile
- Verifica che label contenga ancora prezzo (`text=/€/`)
- Struttura interna cambiata ma label wrapper invariato

---

### Problema: Card ancora troppo alta su mobile

**Sintomo**: After screenshot mostra altezza > 120px

**Debug**:
```typescript
// Nel test, aggiungi log altezza
const cardBox = await menuCard.boundingBox()
console.log('Card height:', cardBox?.height)
```

**Possibili cause**:
- `minHeight` non rimosso completamente
- `gap` troppo grande (usa `gap-2` o `gap-3` max)
- Padding eccessivo nelle row

**Soluzione**:
- Rimuovi tutti `minHeight` inline styles
- Usa `gap-2` (8px) o `gap-3` (12px)
- Padding verticale max `py-3` (12px)

---

### Problema: Overflow su 320px

**Sintomo**: Card eccede viewport width su mobile small

**Debug**:
```typescript
const box = await element.boundingBox()
console.log('Right edge:', box.x + box.width, 'Viewport:', 320)
```

**Soluzione**:
- Aggiungi `max-w-full` su container
- Usa `whitespace-nowrap` solo su prezzo
- Titolo deve poter wrappare: rimuovi `whitespace-nowrap` se presente

---

## 📋 Commit Checklist

Prima di committare:

- [ ] Desktop layout invariato (screenshot confrontati)
- [ ] Mobile altezza ridotta (<= 120px)
- [ ] Test E2E menu: 100% pass
- [ ] Test E2E core: 100% pass
- [ ] Linting: 0 errori
- [ ] TypeScript build: 0 errori
- [ ] Screenshot after generati (3 viewport)
- [ ] Metriche misurate e documentate

**Commit message**:
```bash
git add src/features/booking/components/MenuSelection.tsx
git add e2e/mobile/test-menu-cards-after-mobile.spec.ts
git add e2e/screenshots/menu-cards-after-*.png

git commit -m "feat: implement responsive layout for menu cards (mobile)

PROBLEM:
- Menu cards had excessive height on mobile (1602px)
- Same hardcoded 3-column layout for desktop and mobile
- Poor UX: user scrolls >2 viewports per card

SOLUTION:
- Desktop: maintain 3-column layout (Title | Details | Price)
- Mobile: stack vertical (Title+Price row, Details below)
- Remove minHeight: 68px causing excessive height
- Use Tailwind responsive utilities (hidden md:grid / md:hidden)

IMPACT:
- Mobile card height: 1602px → ~85px (94% reduction!)
- Desktop layout: unchanged (✅ constraint met)
- Better mobile UX: readable, compact, no overflow

TESTING:
- All E2E tests pass (menu, core: 100%)
- Screenshot comparison done (3 viewports)
- Metrics verified (height, padding, font-size)

Fixes #[issue-number] (se applicable)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📞 Supporto

**In caso di blocco**:
1. Consulta report: `docs/reports/MOBILE_TESTING_REPORT_MENU_CARDS.md`
2. Verifica pattern simili: `grep -r "hidden md:grid" src/`
3. Test in UI mode: `npx playwright test --ui`
4. Screenshot intermediate per debug

**Riferimenti**:
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Playwright Testing](https://playwright.dev/)
- [Project E2E Tests](../../e2e/README.md)

---

**Task creato da**: Plan Agent + Mobile Testing
**Data**: 2025-01-04
**Priority**: 🔥 P0 - CRITICO
**Status**: 🟡 READY FOR IMPLEMENTATION