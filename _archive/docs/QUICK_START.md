# Quick Start per Nuovo Agente - Progetto Rinfresco di Laurea

## 🚀 Comandi Rapidi

### Avvio Server Development
```bash
npm run dev
```
Server disponibile su: http://localhost:5175

### Esecuzione Test
```bash
# Test specifico
npx playwright test [path-to-test-file]

# Tutti i test
npx playwright test

# Test con UI interattiva
npx playwright test --ui
```

### Build Produzione
```bash
npm run build
```

## 📍 Dove Riprendere il Lavoro

### Task Principale da Completare
**Card Unificata Intolleranze** - File dettagli:
- `docs/reports/STATO_IMPLEMENTAZIONE_CARD_INTOLLERANZE.md` ← LEGGI QUESTO PRIMA!
- Test già scritto: `e2e/ui-visual/test-dietary-restrictions-unified-card.spec.ts`

### Report Completo Sessione
- `docs/reports/SESSIONE_CARD_OPACHE_INTOLLERANZE_REPORT.md`

## 🎯 Obiettivo Immediato

1. Completare implementazione card intolleranze (vedi file STATO_IMPLEMENTAZIONE)
2. Far passare il test E2E
3. Verificare su mobile e desktop
4. Deploy finale

## 🔧 File Principali da Modificare

1. `src/features/booking/components/DietaryRestrictionsSection.tsx`
2. `src/features/booking/components/BookingRequestForm.tsx`

## 📱 Test Mobile

Viewport mobile standard: 375x667 (iPhone SE)
```bash
# Test specifico mobile overflow (già passa)
npx playwright test e2e/mobile/fix-mobile-overflow.spec.ts
```

## 🎨 Stile Card Opache

Tutte le card usano:
```tsx
className="bg-white/95 backdrop-blur-md border-2 border-gray-200 rounded-xl shadow-lg p-6 md:p-8"
```

## ⚡ Suggerimenti

1. Il server dev è già in esecuzione in background (PID: 9a90ea)
2. Usa `/prenota` per testare il form pubblico
3. Seleziona "Rinfresco di Laurea" per vedere sezione intolleranze
4. I test E2E generano screenshot automaticamente in `e2e/screenshots/`

## 🐛 Debug

Se il test timeout:
1. Verifica server sia in esecuzione (porta 5175)
2. Aumenta timeout: `--timeout=60000`
3. Usa `--headed` per vedere browser: `npx playwright test --headed`

Buon lavoro! 🚀














