import React, { useMemo } from 'react'
import { Check } from 'lucide-react'
import { useMenuItems } from '../hooks/useMenuItems'
import type { MenuItem } from '@/types/menu'

interface MenuSelectionProps {
  selectedItems: Array<{ id: string; name: string; price: number; category: string }>
  onMenuChange: (items: Array<{ id: string; name: string; price: number; category: string }>, totalPerPerson: number) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  bevande: 'Bevande',
  antipasti: 'Antipasti',
  fritti: 'Fritti',
  primi: 'Primi Piatti',
  secondi: 'Secondi Piatti'
}

// Helper functions for menu validation
// IMPORTANT: Premium check MUST come first because "Caraffe / Drink Premium" contains "Caraffe / Drink"
// NOTA: I nomi possono avere variazioni: "Caraffe / Drink", "Caraffe drink", "Caraffe Drink Premium", ecc.
const isCaraffeDrinkPremium = (itemName: string): boolean => {
  const nameLower = itemName.toLowerCase().trim()
  // Cerca varianti di Premium (con o senza slash, case insensitive)
  return nameLower.includes('premium') && 
         (nameLower.includes('caraffe') || nameLower.includes('drink'))
}

const isCaraffeDrinkStandard = (itemName: string): boolean => {
  const nameLower = itemName.toLowerCase().trim()
  // NON è premium
  if (isCaraffeDrinkPremium(itemName)) {
    return false
  }
  // Contiene "caraffe" e "drink" ma NON "premium"
  return (nameLower.includes('caraffe') || nameLower.includes('drink')) &&
         !nameLower.includes('premium') &&
         !nameLower.includes('caffè') && // Escludi "Caffè"
         !nameLower.includes('caffe')     // Escludi anche varianti
}

const isPizzaOrFocaccia = (itemName: string): boolean => {
  const pizzaFocaccia = ['Pizza Margherita', 'Pizza rossa', 'Focaccia Rosmarino']
  return pizzaFocaccia.some(item => itemName.includes(item))
}

export const MenuSelection: React.FC<MenuSelectionProps> = ({
  selectedItems,
  onMenuChange
}) => {
  const { data: menuItems = [], isLoading, error } = useMenuItems()

  // Raggruppa per categoria
  const itemsByCategory = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, MenuItem[]>)
  }, [menuItems])

  // Calcola totale a persona
  const totalPerPerson = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0)
  }, [selectedItems])

  // Rimosso useEffect che causava loop infinito
  // Il callback viene chiamato direttamente da handleItemToggle e handleBisPrimiToggle

  const handleItemToggle = (item: MenuItem) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id)

    let newItems: typeof selectedItems = selectedItems

    if (isSelected) {
      // Remove item - always allowed
      newItems = selectedItems.filter(selected => selected.id !== item.id)
    } else {
      // Add item - apply category-specific rules

      // === BEVANDE RULES ===
      if (item.category === 'bevande') {
        // Mutual exclusion per Caraffe / Drink e Caraffe / Drink Premium (come primi piatti)
        // Se è una caraffe, rimuovi tutte le altre caraffe (standard e premium)
        if (isCaraffeDrinkStandard(item.name) || isCaraffeDrinkPremium(item.name)) {
          // Rimuovi tutte le bevande che sono caraffe (sia standard che premium)
          newItems = selectedItems.filter(selected =>
            !(selected.category === 'bevande' && 
              (isCaraffeDrinkStandard(selected.name) || isCaraffeDrinkPremium(selected.name)))
          )
        } else {
          // Non è una caraffe, mantieni tutte le selezioni
          newItems = selectedItems
        }

        // Add the new item (only if not already present)
        const itemAlreadyExists = newItems.some(selected => selected.id === item.id)
        if (!itemAlreadyExists) {
          newItems = [...newItems, {
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category
          }]
        }

        // Calculate total and return early
        const newTotal = newItems.reduce((sum, item) => sum + item.price, 0)
        onMenuChange(newItems, newTotal)
        return
      }

      // === ANTIPASTI RULES ===
      if (item.category === 'antipasti') {
        const antipastiCount = selectedItems.filter(s => s.category === 'antipasti').length

        // Check max 3 limit
        if (antipastiCount >= 3) {
          alert('Puoi scegliere massimo 3 antipasti')
          return
        }

        // Auto-deselect other pizza/focaccia if selecting one
        if (isPizzaOrFocaccia(item.name)) {
          // Remove any other pizza/focaccia
          newItems = selectedItems.filter(selected =>
            !(selected.category === 'antipasti' && isPizzaOrFocaccia(selected.name))
          )
        }
      }

      // === FRITTI RULES ===
      if (item.category === 'fritti') {
        const frittiCount = selectedItems.filter(s => s.category === 'fritti').length
        if (frittiCount >= 3) {
          alert('Puoi scegliere massimo 3 fritti')
          return
        }
      }

      // === PRIMI RULES ===
      // Auto-deselect existing primo when selecting a new one (mutual exclusion)
      if (item.category === 'primi') {
        // Remove any existing primi (user can only select one primo at a time)
        newItems = selectedItems.filter(selected => selected.category !== 'primi')
      }

      // === SECONDI RULES ===
      if (item.category === 'secondi') {
        const secondiCount = selectedItems.filter(s => s.category === 'secondi').length
        if (secondiCount >= 3) {
          alert('Puoi scegliere massimo 3 secondi')
          return
        }
      }

      // All validations passed - add item
      // newItems may have been filtered (for pizza/focaccia), or still equals selectedItems
      newItems = [...newItems, {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category
      }]
    }

    // Calculate new total - simple sum
    const newTotal = newItems.reduce((sum, item) => sum + item.price, 0)
    onMenuChange(newItems, newTotal)
  }

  if (isLoading) {
    return <div className="text-center py-4 text-gray-600">Caricamento menu...</div>
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 font-semibold mb-2">Errore nel caricamento del menu</p>
        <p className="text-sm text-gray-600">Contatta l&apos;amministratore</p>
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Titolo Sezione */}
      <h2
        className="text-2xl md:text-3xl font-serif text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(1px)',
          padding: '12px 24px',
          borderRadius: '16px',
          fontWeight: '700'
        }}
      >
        Menù
      </h2>

      {/* Lista per Categoria */}
      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        const items = itemsByCategory[category] || []
        if (items.length === 0) return null

        // Count selected items in this category
        const selectedCount = selectedItems.filter(i => i.category === category).length

        // Determine max limit for counter display
        let maxLimit: number | null = null
        if (category === 'bevande') {
          // Controlla se ci sono caraffe selezionate
          const hasCaraffe = selectedItems.some(i => i.category === 'bevande' && 
            (isCaraffeDrinkStandard(i.name) || isCaraffeDrinkPremium(i.name)))
          // Mostra sempre il count per le bevande
          maxLimit = hasCaraffe ? 1 : null // maxLimit null permette di mostrare il count senza limite massimo
        }
        if (category === 'antipasti') maxLimit = 3
        if (category === 'fritti') maxLimit = 3
        if (category === 'primi') maxLimit = 1
        if (category === 'secondi') maxLimit = 3

        return (
          <div key={category} className="space-y-3 w-full">
            <h3
              className="text-lg md:text-xl border-b border-gray-300 pb-2 flex items-center justify-between w-full"
              style={{
                color: '#2563EB',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(1px)',
                padding: '8px 16px',
                borderRadius: '12px',
                width: '100%',
                fontWeight: '700'
              }}
            >
              <span>{label}</span>
              {category === 'bevande' || maxLimit !== null ? (
                <span className="text-sm text-gray-600">
                  {category === 'bevande' && maxLimit === null ? (
                    `(${selectedCount} selezionat${selectedCount === 1 ? 'a' : 'e'})`
                  ) : (
                    `(${selectedCount}/${maxLimit} selezionat${selectedCount === 1 ? 'o' : 'i'})`
                  )}
                </span>
              ) : null}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {items.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id)
                return (
                  <label
                    key={item.id}
                    className={`
                      flex items-center gap-4 rounded-xl border-2 cursor-pointer w-full
                      transition-all duration-200
                    `}
                    style={{
                      minHeight: item.description ? '80px' : '80px',
                      maxHeight: 'none',
                      backgroundColor: isSelected ? 'rgba(245, 222, 179, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(1px)',
                      borderColor: isSelected ? '#8B4513' : 'rgba(0,0,0,0.2)',
                      paddingTop: '6px',
                      paddingBottom: '6px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      borderRadius: '16px',
                      marginBottom: '4px',
                      width: '100%',
                      maxWidth: '1800px',
                      height: item.description ? 'auto' : '80px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemToggle(item)}
                      className="peer sr-only"
                    />
                    <div className={`
                      flex h-6 w-6 flex-shrink-0 items-center justify-center
                      border-2 shadow-sm transition-all duration-300
                      ${isSelected
                        ? 'border-warm-orange bg-warm-orange shadow-lg'
                        : 'border-warm-wood/40 bg-white hover:border-warm-wood'
                      }
                    `}>
                      {isSelected && (
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex-1 flex items-center w-full" style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '0px', paddingBottom: '0px', minWidth: 0, height: '100%', display: 'grid', gridTemplateColumns: '180px 1fr 100px', gap: '8px', alignItems: 'center' }}>
                      <span className={`font-bold ${isSelected ? 'text-warm-wood' : 'text-gray-700'}`} style={{ fontWeight: '700', whiteSpace: 'nowrap', fontSize: '20px' }}>
                        {item.name}
                      </span>
                      <div className="flex justify-center items-center" style={{ width: '100%', minHeight: '68px' }}>
                        {item.description ? (
                          <p className="font-bold text-gray-600 text-center" style={{ fontWeight: '700', wordBreak: 'break-word', lineHeight: '1.3', fontSize: '20px', width: '100%', margin: 0 }}>
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-sm md:text-base font-bold text-warm-wood whitespace-nowrap" style={{ fontWeight: '700', textAlign: 'right' }}>
                        €{item.price.toFixed(2)}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Totale a Persona */}
      {selectedItems.length > 0 && (
        <div
          className="w-full"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(1px)',
            border: '2px solid rgba(0, 0, 0, 0.2)',
            padding: '28px 32px',
            borderRadius: '16px'
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-2xl md:text-3xl text-warm-wood" style={{ fontWeight: '700' }}>Totale a Persona:</span>
            <span className="text-4xl md:text-5xl text-warm-wood" style={{ fontWeight: '700' }}>€{totalPerPerson.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

