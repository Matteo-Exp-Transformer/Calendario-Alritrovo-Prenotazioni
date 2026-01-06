# Test Responsive: Menu Cards Text Wrapping - Analisi e Test Plan

## Riepilogo
**Data**: 2025-01-XX  
**Componente Testato**: Pagina "Prenota" - Sezione Menu - Card Ingredienti  
**Problema Identificato**: Alcune card degli ingredienti del menù non vanno a capo correttamente il testo, impedendo la visualizzazione completa nella card su viewport mobile.

## Analisi del Problema

### Componente Analizzato
- **File**: `src/features/booking/components/MenuSelection.tsx`
- **Righe critiche**: 509-538 (struttura card con nome e descrizione)

### Problemi Identificati nel Codice

1. **Nome Item con `whiteSpace: 'nowrap'`** (riga 514)
   - Il nome dell'item ha `whiteSpace: 'nowrap'` che può causare overflow su mobile
   - Su viewport stretti, nomi lunghi possono uscire dalla card

2. **Descrizione con `wordBreak: 'break-word'`** (riga 527)
   - La descrizione ha `wordBreak: 'break-word'` ma potrebbe non essere sufficiente
   - Manca `overflow-wrap: break-word` esplicito
   - Il container flex potrebbe limitare il wrapping

3. **Layout Flex Complesso** (riga 510)
   - Layout flex con `md:flex-row` che cambia su desktop
   - Su mobile: `flex-col` ma potrebbe avere problemi con contenuti lunghi
   - `minWidth: 0` presente ma potrebbe non essere sufficiente

4. **Items Problematici Identificati**:
   - **Panelle (Farina di Ceci fritta, Specialità Siciliana)**: Nome molto lungo (58 caratteri)
   - **Caraffe / Drink Premium**: Descrizione lunga con elenco (67 caratteri)
   - **Salumi con piadina**: Descrizione con dettagli multipli (42 caratteri)
   - **Cannelloni Ricotta e Spinaci**: Nome lungo senza descrizione (32 caratteri)
   - **Polpette Vegane di Lenticchie e Curry**: Nome molto lungo (42 caratteri)

### Struttura Card (da MenuSelection.tsx)

```tsx
<label style={{ maxWidth: '560px', width: '100%' }}>
  <div className="flex-1 w-full flex flex-col gap-2 md:flex-row">
    <div className="flex items-center justify-between">
      <span style={{ whiteSpace: 'nowrap', fontSize: '20px' }}>
        {item.name}  // ⚠️ PROBLEMA: nowrap su mobile
      </span>
    </div>
    {item.description && (
      <p style={{ wordBreak: 'break-word', fontSize: '20px', width: '100%' }}>
        {item.description}  // ⚠️ PROBLEMA: potrebbe non wrappare correttamente
      </p>
    )}
  </div>
</label>
```

## Test Plan Creato

### File Test
- **Path**: `e2e/responsive/test-menu-cards-text-wrapping.spec.ts`
- **Tipo**: Test E2E Playwright con focus responsive

### Viewport Testati (secondo template Responsive-Design)
- ✅ 360×640 (Smartphone piccolo)
- ✅ 360×800 (Smartphone medio/alto)
- ✅ 390×844 (Smartphone moderno)

### Test Cases Implementati

1. **Layout Generale**
   - Verifica assenza scroll orizzontale
   - Verifica visibilità categorie
   - Verifica card completamente nel viewport

2. **Card Menu - Nessun Testo Tagliato**
   - Verifica bounding box card
   - Verifica nome dentro card
   - Verifica descrizione dentro card
   - Verifica font size leggibile (>= 12px)

3. **Items Problematici Specifici**
   - Test dedicato per ogni item con nome/descrizione lunga
   - Verifica overflow del testo
   - Verifica leggibilità

4. **Proprietà CSS Wrapping**
   - Verifica `wordBreak` o `overflowWrap` configurati
   - Verifica gestione overflow

5. **Screenshot per Verifica Visiva**
   - Screenshot sezione menu completa
   - Screenshot card specifiche con descrizioni lunghe

6. **Cambio Orientamento**
   - Verifica layout coerente portrait → landscape

## Criteri di Successo (da Responsive-Design Skills)

✅ **Nessuno scroll orizzontale indesiderato**  
✅ **Testo sempre leggibile** (font size >= 12px, nessun taglio)  
✅ **Layout che si ricompone** (card adattate al viewport)  
✅ **Nessun elemento critico sparisce o si sovrappone**  
✅ **Cambio orientamento stabile**

## Prossimi Passi

1. **Eseguire il test**:
   ```bash
   npm run test:e2e e2e/responsive/test-menu-cards-text-wrapping.spec.ts
   ```

2. **Analizzare risultati**:
   - Verificare screenshot generati
   - Identificare card con problemi di wrapping
   - Documentare problemi trovati

3. **Fix CSS se necessario**:
   - Rimuovere `whiteSpace: 'nowrap'` su mobile per nomi lunghi
   - Aggiungere `overflow-wrap: break-word` esplicito
   - Verificare `min-width: 0` su tutti i flex container
   - Considerare `hyphens: auto` per parole lunghe

4. **Rieseguire test** dopo fix per verifica

## Note Tecniche

- Il test usa `scrollIntoViewIfNeeded()` per assicurarsi che le card siano visibili
- Verifica bounding box con margine di tolleranza di 5px per arrotondamenti
- Test limitato a 10 card per performance (può essere esteso)
- Screenshot salvati in `e2e/screenshots/responsive-*`

## Riferimenti

- **Skills**: `.claude/skills/Responsive-Design/Responsive-design-skills.md`
- **Template**: `.claude/skills/Responsive-Design/Template-test-responsive`
- **Componente**: `src/features/booking/components/MenuSelection.tsx`
- **Pagina**: `src/pages/BookingRequestPage.tsx`

