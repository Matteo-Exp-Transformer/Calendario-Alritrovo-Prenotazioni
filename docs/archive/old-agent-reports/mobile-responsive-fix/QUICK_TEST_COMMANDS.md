# ⚡ Quick Test Commands - Mobile Responsive

## 🚀 Esegui Test (Scegli uno)

### Opzione 1: PowerShell (Windows) - CONSIGLIATO
```powershell
# Tutti i test con output verbose
.\scripts\test-mobile-responsive.ps1 run

# Un singolo test
.\scripts\test-mobile-responsive.ps1 single-test "Scroll orizzontale"

# Modalità debug interattivo
.\scripts\test-mobile-responsive.ps1 debug

# Dashboard UI
.\scripts\test-mobile-responsive.ps1 ui

# Browser visibile
.\scripts\test-mobile-responsive.ps1 headed

# Apri report HTML
.\scripts\test-mobile-responsive.ps1 show-report

# Aiuto
.\scripts\test-mobile-responsive.ps1 list
```

### Opzione 2: Bash (Linux/Mac)
```bash
# Tutti i test
bash scripts/test-mobile-responsive.sh run

# Un singolo test
bash scripts/test-mobile-responsive.sh single-test "Scroll orizzontale"

# Debug interattivo
bash scripts/test-mobile-responsive.sh debug

# Dashboard UI
bash scripts/test-mobile-responsive.sh ui

# Browser visibile
bash scripts/test-mobile-responsive.sh headed

# Apri report HTML
bash scripts/test-mobile-responsive.sh show-report
```

### Opzione 3: npm/npx diretto
```bash
# Tutti i test
npx playwright test e2e/responsive/test-menu-mobile-responsive.spec.ts --reporter=verbose --reporter=html

# Un singolo test
npx playwright test e2e/responsive/test-menu-mobile-responsive.spec.ts --grep "Scroll orizzontale" --reporter=verbose

# Debug mode
npx playwright test e2e/responsive/test-menu-mobile-responsive.spec.ts --debug

# Test UI
npx playwright test e2e/responsive/test-menu-mobile-responsive.spec.ts --ui

# Browser visibile
npx playwright test e2e/responsive/test-menu-mobile-responsive.spec.ts --headed

# Apri report
npx playwright show-report
```

---

## 🧪 Singoli Test Disponibili

```powershell
# Test di scroll orizzontale (il più importante!)
.\scripts\test-mobile-responsive.ps1 scroll-test

# Test di espansione card
.\scripts\test-mobile-responsive.ps1 card-test

# Test di leggibilità testo
.\scripts\test-mobile-responsive.ps1 text-test
```

---

## 📱 Verificare Manualmente su Browser

1. **Apri DevTools**: `F12` (o `Ctrl+Shift+I`)
2. **Abilita device emulation**: `Ctrl+Shift+M`
3. **Seleziona**: iPhone 12 (390x844px)
4. **Naviga a**: `http://localhost:5173/booking`
5. **Seleziona**: "Rinfresco di Laurea"
6. **Verifica**:
   - ✅ Card occupano ~95% larghezza
   - ✅ Nessuno scroll orizzontale
   - ✅ Testo non è tagliato
   - ✅ Apri Console (F12 > Console)
   - ✅ Vedi output debug

---

## 🔍 Output Debug Atteso

### Nel Browser Console
```
📐 [MenuSelection] Viewport & Layout Debug
Viewport: 390x844px
scrollWidth: 390px
clientWidth: 390px
Has horizontal scroll: ✅ NO
Breakpoint < 510px: 📱 SMALL MOBILE

📦 First Card Metrics:
  Width: 366px
  Height: 80px
  Padding: 12px 12px
  MaxWidth: calc(100% - 24px)
```

### Nel Terminal Durante Test
```
═════════════════════════════════════════════════════════════════════
🧪 TEST: Scroll orizzontale non dovrebbe verificarsi su 390px
📱 Viewport: MOBILE SMALL (390x844px)
═════════════════════════════════════════════════════════════════════

📊 SCROLL METRICS:
   scrollWidth: 390px
   clientWidth: 390px
   Has Horizontal Scroll: ✅ NO
   Expected Max-Width: 366px
   Overflow Amount: 0px ✅
```

---

## 📋 Checklist Test Rapido

- [ ] `npm run dev` è in esecuzione su `http://localhost:5173`
- [ ] DevTools mostra viewport 390px
- [ ] Console browser mostra "✅ NO" per horizontal scroll
- [ ] Card width è ~366px (calc(100% - 24px))
- [ ] Testo non è tagliato/troncato
- [ ] Padding è 12px L/R (non 24px)
- [ ] Test Playwright completati con PASS

---

## 🆘 Se Qualcosa Non Funziona

### Scroll orizzontale persiste
```bash
# Controlla questi file:
# 1. src/index.css - Verifica media query @510px
# 2. src/features/booking/components/MenuSelection.tsx - Classe menu-card-mobile presente?
# 3. DevTools > Computed - Verifica overflow: hidden, box-sizing: border-box

# Pulisci cache e ricomincia
npm run dev
# F12 > Ctrl+Shift+Delete > Cancella cache
```

### Test Playwright non trova elementi
```bash
# Assicurati che:
# 1. Dev server gira su http://localhost:5173
# 2. Browser è su /booking
# 3. "Rinfresco di Laurea" è selezionato
# 4. Menu è caricato (aspetta 5 secondi)

# Ricomincia test
.\scripts\test-mobile-responsive.ps1 run
```

### Console debug non mostra
```bash
# Apri F12 > Console
# Naviga a http://localhost:5173/booking su mobile viewport (390px)
# Seleziona Rinfresco di Laurea
# Scrollina il form per far compare il menu
# Vedi il console.group output
```

---

## 📚 Documentation

- **Guida completa**: `docs/MOBILE_RESPONSIVE_DEBUG.md`
- **Riepilogo implementazione**: `IMPLEMENTATION_SUMMARY.md`
- **Plan originale**: `fix-mobile-car.plan.md`

---

## ✅ Criterio di Successo

Tutti questi devono essere ✅:

- [ ] Test #1: Nessuno scroll orizzontale (390px)
- [ ] Test #2: Card espanse correttamente (366px)
- [ ] Test #3: Testo leggibile (non tagliato)
- [ ] Test #4: Nessuna regressione (768px)
- [ ] Test #5: Transizione fluida
- [ ] Test #6: Breakpoint 510px funziona
- [ ] Test #7: Form responsive
- [ ] Browser: Console mostra debug info

---

**Per iniziare subito**:
```powershell
npm run dev  # Terminal 1
.\scripts\test-mobile-responsive.ps1 run  # Terminal 2
```

Poi apri `http://localhost:5173/booking` sul browser e verifica manualmente! 🎯

