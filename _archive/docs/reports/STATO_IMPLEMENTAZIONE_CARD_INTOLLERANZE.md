# Stato Implementazione Card Unificata Intolleranze

**Ultimo aggiornamento**: 2 Novembre 2025, 22:45  
**Stato**: ✅ COMPLETATO (Test passati, implementazione completata)

## 📍 Dove Siamo Rimasti

### Test E2E Già Scritto ✅
**File**: `e2e/ui-visual/test-dietary-restrictions-unified-card.spec.ts`

Il test verifica:
1. Presenza card unificata con tutti gli elementi (intolleranze + note + privacy)
2. Layout responsive (mobile vs desktop)
3. Stile corretto: `bg-white/95 backdrop-blur-md border-2 border-gray-200 rounded-xl shadow-lg`

**Stato Test**: ✅ PASSATO (GREEN phase - implementazione completata)

### Implementazione da Completare

#### 1. Modificare `DietaryRestrictionsSection.tsx`

**Aggiungi all'interface (riga ~10):**
```tsx
interface DietaryRestrictionsSectionProps {
  restrictions: DietaryRestriction[]
  onRestrictionsChange: (restrictions: DietaryRestriction[]) => void
  specialRequests: string  // NUOVO
  onSpecialRequestsChange: (value: string) => void  // NUOVO
  privacyAccepted: boolean  // NUOVO
  onPrivacyChange: (value: boolean) => void  // NUOVO
}
```

**Cambia titolo (riga ~92):**
```tsx
// DA: Intolleranze Alimentari
// A: Intolleranze e Richieste Speciali
```

**Dopo la lista intolleranze (dopo riga ~253), aggiungi:**
```tsx
{/* Note o Richieste Speciali */}
<div className="space-y-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Note o richieste speciali
  </label>
  <Textarea
    id="special_requests"
    value={specialRequests}
    onChange={(e) => onSpecialRequestsChange(e.target.value)}
    rows={4}
    placeholder="Inserisci eventuali richieste particolari..."
    className="w-full"
  />
</div>

{/* Privacy Policy */}
<div className="flex items-start gap-3">
  <div className="flex items-center h-6">
    <input
      type="checkbox"
      id="privacy-consent-dietary"
      checked={privacyAccepted}
      onChange={(e) => onPrivacyChange(e.target.checked)}
      className="h-5 w-5 rounded border-gray-300 text-al-ritrovo-primary focus:ring-al-ritrovo-primary cursor-pointer"
    />
  </div>
  <label htmlFor="privacy-consent-dietary" className="text-sm text-gray-700">
    Accetto la{' '}
    <Link
      to="/privacy"
      target="_blank"
      className="text-al-ritrovo-primary hover:text-al-ritrovo-primary-dark underline font-medium"
    >
      Privacy Policy
    </Link>
    {' '}*
  </label>
</div>

{/* Campi obbligatori */}
<p className="text-xs text-gray-500 italic">
  * I campi contrassegnati sono obbligatori
</p>
```

**Aggiungi imports necessari:**
```tsx
import { Textarea } from '@/components/ui'
import { Link } from 'react-router-dom'
```

#### 2. Modificare `BookingRequestForm.tsx`

**RIMUOVI queste sezioni (righe ~569-642):**
- Sezione "Note o richieste speciali" 
- Sezione "Privacy Policy"
- Nota "* I campi contrassegnati sono obbligatori"

**MODIFICA chiamata a DietaryRestrictionsSection (riga ~555):**
```tsx
<DietaryRestrictionsSection
  restrictions={formData.dietary_restrictions || []}
  onRestrictionsChange={(restrictions) => {
    setFormData({ ...formData, dietary_restrictions: restrictions })
  }}
  specialRequests={formData.special_requests}  // NUOVO
  onSpecialRequestsChange={(value) => {
    setFormData({ ...formData, special_requests: value })
  }}  // NUOVO
  privacyAccepted={privacyAccepted}  // NUOVO
  onPrivacyChange={setPrivacyAccepted}  // NUOVO
/>
```

## 🎯 Prossimi Step

1. **Implementa le modifiche** sopra descritte
2. **Esegui il test** per verificare GREEN phase:
   ```bash
   npx playwright test e2e/ui-visual/test-dietary-restrictions-unified-card.spec.ts
   ```
3. **Verifica form submission** funzioni con validazione privacy
4. **Screenshot** della card finale per documentazione

## ⚠️ Note Importanti

- La card esterna ha GIÀ lo stile corretto `bg-white/95...` (applicato da subagent precedente)
- Non modificare lo stile della card esterna, solo aggiungere contenuti
- Mantenere coerenza con lo stile delle altre card nella pagina
- Privacy checkbox deve essere obbligatorio per form submission

## 🔍 Per Verificare

Dopo l'implementazione:
1. Server dev: http://localhost:5175/prenota
2. Seleziona "Rinfresco di Laurea" per vedere sezione intolleranze
3. Verifica tutti gli elementi siano nella stessa card
4. Test responsive su mobile (375px) e desktop (1280px)
