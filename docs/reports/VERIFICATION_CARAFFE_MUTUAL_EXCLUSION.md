# Report Verifica Empirica: Logica Caraffe Mutual Exclusion

**Data**: 2025-01-XX  
**Skill Utilizzato**: `verification-before-completion`  
**Test Eseguiti**: `e2e/menu/test-caraffe-mutual-exclusion-visual.spec.ts`

## ✅ RISULTATO: PASSATO

Tutti i 3 test empirici sono **PASSATI** con successo.

---

## 🔍 Problema Identificato

Il test iniziale falliva perché:
1. I nomi nel database sono: `"Caraffe / Drink"` e `"Caraffe / Drink Premium"` (con slash)
2. I nomi visualizzati nel frontend sono: `"Caraffe drink"` e `"Caraffe Drink Premium"` (senza slash, con variazioni di case)
3. Le funzioni helper `isCaraffeDrinkPremium()` e `isCaraffeDrinkStandard()` cercavano match esatti con slash

## 🔧 Correzioni Applicate

### 1. Funzioni Helper in `MenuSelection.tsx`

**Prima** (match esatto):
```typescript
const isCaraffeDrinkPremium = (itemName: string): boolean => {
  const premiumDrinks = ['Caraffe / Drink Premium']
  return premiumDrinks.some(drink => itemName.trim() === drink || itemName.includes(drink))
}

const isCaraffeDrinkStandard = (itemName: string): boolean => {
  const standardDrinks = ['Caraffe / Drink']
  if (isCaraffeDrinkPremium(itemName)) return false
  return standardDrinks.some(drink => itemName.trim() === drink || itemName.includes(drink))
}
```

**Dopo** (case-insensitive, più flessibile):
```typescript
const isCaraffeDrinkPremium = (itemName: string): boolean => {
  const nameLower = itemName.toLowerCase().trim()
  return nameLower.includes('premium') && 
         (nameLower.includes('caraffe') || nameLower.includes('drink'))
}

const isCaraffeDrinkStandard = (itemName: string): boolean => {
  const nameLower = itemName.toLowerCase().trim()
  if (isCaraffeDrinkPremium(itemName)) return false
  return (nameLower.includes('caraffe') || nameLower.includes('drink')) &&
         !nameLower.includes('premium') &&
         !nameLower.includes('caffè') &&
         !nameLower.includes('caffe')
}
```

### 2. Test Playwright

Aggiornati i selettori per cercare:
- Standard: `label` con testo che contiene "Caraffe.*drink" (case-insensitive) ma NON "Premium"
- Premium: `label` con testo che contiene "Caraffe.*Drink.*Premium" (case-insensitive)

### 3. Configurazione Playwright

Aggiornata `baseURL` da `http://localhost:5175` a `http://localhost:5173` per questa sessione.

---

## 📊 Test Results

### Test 1: Selezione Caraffe/Drink rimuove Caraffe/Drink Premium ✅

**Scenario**:
1. Seleziona "Rinfresco di Laurea"
2. Seleziona "Caraffe Drink Premium" → Premium selezionato
3. Seleziona "Caraffe drink" (standard)
4. **Verifica**: Premium deve essere deselezionato, Standard selezionato

**Output**:
```
🔍 Trovate 1 label con "Caraffe Drink Premium"
✅ Premium selezionato: true
🔍 Trovate 1 label con "Caraffe drink" (senza Premium)
✅ Standard selezionato: true
✅ Premium ancora selezionato dopo click Standard: false
✅ TEST PASSATO: Caraffe/Drink rimuove Premium correttamente
```

### Test 2: Selezione Caraffe/Drink Premium rimuove Caraffe/Drink ✅

**Scenario**:
1. Seleziona "Rinfresco di Laurea"
2. Seleziona "Caraffe drink" (standard) → Standard selezionato
3. Seleziona "Caraffe Drink Premium"
4. **Verifica**: Standard deve essere deselezionato, Premium selezionato

**Output**:
```
✅ TEST PASSATO: Caraffe/Drink Premium rimuove Standard correttamente
```

### Test 3: Solo una caraffe può essere selezionata alla volta ✅

**Scenario**:
1. Seleziona "Rinfresco di Laurea"
2. Seleziona "Caraffe Drink Premium"
3. Tenta di selezionare anche "Caraffe drink"
4. **Verifica**: Solo una caraffe deve essere selezionata (Premium)

**Output**:
```
🔍 Standard checked: false
🔍 Premium checked: true
✅ Totale caraffe selezionate: 1
✅ TEST PASSATO: Solo una caraffe può essere selezionata
```

---

## 🎯 Logica Implementata

La logica di mutual exclusion è implementata in `handleItemToggle` in `MenuSelection.tsx`:

```typescript
if (item.category === 'bevande') {
  // Mutual exclusion per Caraffe / Drink e Caraffe / Drink Premium (come primi piatti)
  if (isCaraffeDrinkStandard(item.name) || isCaraffeDrinkPremium(item.name)) {
    // Rimuovi tutte le bevande che sono caraffe (sia standard che premium)
    newItems = selectedItems.filter(selected =>
      !(selected.category === 'bevande' && 
        (isCaraffeDrinkStandard(selected.name) || isCaraffeDrinkPremium(selected.name)))
    )
  }
  // ... aggiungi nuovo item
}
```

Il counter per "Bevande" imposta `maxLimit = 1` se è selezionata una caraffe:

```typescript
if (category === 'bevande') {
  const hasCaraffe = selectedItems.some(i => i.category === 'bevande' && 
    (isCaraffeDrinkStandard(i.name) || isCaraffeDrinkPremium(i.name)))
  if (hasCaraffe) maxLimit = 1
}
```

---

## ✅ Verifica Finale

- ✅ Funzioni helper riconoscono correttamente "Caraffe drink" e "Caraffe Drink Premium"
- ✅ Mutual exclusion funziona: selezionare una caraffe deseleziona l'altra
- ✅ Counter mostra limite 1 quando una caraffe è selezionata
- ✅ Test empirici confermano il comportamento corretto

---

## 📝 Note

- La logica è identica a quella dei "Primi Piatti" (selezione di un primo deseleziona gli altri)
- Le funzioni helper sono case-insensitive e gestiscono variazioni di formattazione
- Il test debug (`test-caraffe-debug-names.spec.ts`) è stato utilizzato per identificare i nomi esatti nel frontend








