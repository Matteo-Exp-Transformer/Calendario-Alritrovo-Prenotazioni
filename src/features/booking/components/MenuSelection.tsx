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
const isCaraffeDrinkPremium = (itemName: string): boolean => {
  const premiumDrinks = [
    'Caraffe / Drink Premium'
  ]
  // Check for exact match or exact contains (with word boundaries in mind)
  return premiumDrinks.some(drink => itemName.trim() === drink || itemName.includes(drink))
}

const isCaraffeDrinkStandard = (itemName: string): boolean => {
  const standardDrinks = [
    'Caraffe / Drink'
  ]
  // Only match if it's NOT premium (premium contains standard, so we must exclude it first)
  if (isCaraffeDrinkPremium(itemName)) {
    return false
  }
  return standardDrinks.some(drink => itemName.trim() === drink || itemName.includes(drink))
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
        // Auto-deselect conflicting drink group
        // IMPORTANT: Premium check MUST come before standard because "Caraffe / Drink Premium" contains "Caraffe / Drink"
        if (isCaraffeDrinkStandard(item.name)) {
          // User selected standard drink → remove any premium drinks
          newItems = selectedItems.filter(selected =>
            !(selected.category === 'bevande' && isCaraffeDrinkPremium(selected.name))
          )
        } else if (isCaraffeDrinkPremium(item.name)) {
          // User selected premium drink → remove any standard drinks
          newItems = selectedItems.filter(selected =>
            !(selected.category === 'bevande' && isCaraffeDrinkStandard(selected.name))
          )
        } else {
          // Not a conflicting item, keep all selections
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
    <div className="space-y-6">
      {/* Titolo Sezione */}
      <h2
        className="text-3xl font-serif font-bold text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(6px)',
          padding: '12px 20px',
          borderRadius: '12px'
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
        if (category === 'antipasti') maxLimit = 3
        if (category === 'fritti') maxLimit = 3
        if (category === 'primi') maxLimit = 1
        if (category === 'secondi') maxLimit = 3

        return (
          <div key={category} className="space-y-3">
            <h3
              className="text-3xl font-bold border-b border-gray-300 pb-2 flex items-center justify-between"
              style={{
                color: '#2563EB',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(6px)',
                padding: '12px 20px',
                borderRadius: '12px'
              }}
            >
              <span>{label}</span>
              {maxLimit !== null && (
                <span className="text-sm text-gray-600">
                  ({selectedCount}/{maxLimit} selezionat{selectedCount === 1 ? 'o' : 'i'})
                </span>
              )}
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {items.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id)
                return (
                  <label
                    key={item.id}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer
                      transition-all duration-200
                    `}
                    style={{
                      minHeight: '100px',
                      backgroundColor: isSelected ? 'rgba(245, 222, 179, 0.6)' : 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(6px)',
                      borderColor: isSelected ? '#8B4513' : 'rgba(0,0,0,0.2)'
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
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`font-medium flex-1 ${isSelected ? 'text-warm-wood' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                        <span className="text-lg font-bold text-warm-wood ml-4">
                          €{item.price.toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
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
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(6px)',
            border: '2px solid rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-warm-wood">Totale a Persona:</span>
            <span className="text-3xl font-bold text-warm-wood">€{totalPerPerson.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

