import React, { useMemo, useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { useMenuItems } from '../hooks/useMenuItems'
import type { MenuCategory, SelectedMenuItem } from '@/types/menu'
import type { PresetMenuType } from '../constants/presetMenus'

interface MenuSelectionProps {
  selectedItems: SelectedMenuItem[]
  numGuests: number
  onMenuChange: (payload: {
    items: SelectedMenuItem[]
    totalPerPerson: number
    tiramisuTotal: number
    tiramisuKg: number
  }) => void
  presetMenu?: PresetMenuType
  onPresetMenuChange?: (preset: PresetMenuType) => void
  bookingType?: 'tavolo' | 'rinfresco_laurea'
}

type NormalizedMenuItem = {
  id: string
  name: string
  price: number
  category: MenuCategory
  description?: string
  sort_order: number
  priceSuffix?: string
}

const ORDERED_CATEGORIES: MenuCategory[] = [
  'bevande',
  'pizza',
  'antipasti',
  'fritti',
  'primi',
  'secondi',
  'dolci'
]

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  bevande: 'Bevande',
  pizza: 'Pizza',
  antipasti: 'Antipasti',
  fritti: 'Fritti',
  primi: 'Primi Piatti',
  secondi: 'Secondi Piatti',
  dolci: 'Dolci'
}

const CATEGORY_LIMITS: Partial<Record<MenuCategory, number>> = {
  bevande: 1,
  pizza: 1,
  antipasti: 3,
  fritti: 3,
  primi: 1,
  secondi: 3
}

const FALLBACK_DESSERT_ITEMS: NormalizedMenuItem[] = [
  {
    id: 'fallback-dolci-cannoli',
    name: 'Cannoli siciliani',
    price: 3,
    category: 'dolci',
    description: undefined,
    sort_order: 1000
  },
  {
    id: 'fallback-dolci-tiramisu',
    name: 'Tiramisù',
    price: 20,
    category: 'dolci',
    description: 'Consigliato 1Kg x 10 Persone',
    sort_order: 1010,
    priceSuffix: ' al Kg'
  }
]

const isTiramisuItem = (itemName: string): boolean =>
  itemName.toLowerCase().includes('tiramis')

const TIRAMISU_MIN_KG = 1
const TIRAMISU_MAX_KG = 7
const DEFAULT_TIRAMISU_KG = 1

const clampTiramisuQuantity = (qty: number): number => {
  if (Number.isNaN(qty) || qty <= 0) {
    return 0
  }
  return Math.min(TIRAMISU_MAX_KG, Math.max(TIRAMISU_MIN_KG, qty))
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

const PIZZA_ITEM_NAMES = ['Pizza Margherita', 'Pizza rossa', 'Focaccia Rosmarino']

const isPizzaOrFocaccia = (itemName: string): boolean => {
  const nameLower = itemName.toLowerCase()
  return PIZZA_ITEM_NAMES.some(item => nameLower.includes(item.toLowerCase()))
}

const isKnownCategory = (category: string): category is MenuCategory =>
  ORDERED_CATEGORIES.includes(category as MenuCategory)

export const MenuSelection: React.FC<MenuSelectionProps> = ({
  selectedItems,
  numGuests,
  onMenuChange,
  presetMenu,
  onPresetMenuChange,
  bookingType
}) => {
  const { data: menuItems = [], isLoading, error } = useMenuItems()

  const formatPrice = (item: NormalizedMenuItem) =>
    `€${item.price.toFixed(2)}${item.priceSuffix ?? ''}`
  const formatCurrency = (value: number) => `€${value.toFixed(2)}`

  const normalizedMenuItems = useMemo<NormalizedMenuItem[]>(() => {
    const mapped = menuItems.map<NormalizedMenuItem>((item) => {
      const category = isPizzaOrFocaccia(item.name)
        ? 'pizza'
        : isKnownCategory(item.category)
          ? item.category
          : 'antipasti'
      const lowerName = item.name.toLowerCase()
      const priceSuffix =
        lowerName.includes('tiramis') && category === 'dolci'
          ? ' al Kg'
          : undefined

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        category,
        description: item.description ?? undefined,
        sort_order: item.sort_order ?? 0,
        priceSuffix
      }
    })

    const existingNames = new Set(
      mapped.map((item) => item.name.toLowerCase().trim())
    )

    FALLBACK_DESSERT_ITEMS.forEach((fallback) => {
      const fallbackKey = fallback.name.toLowerCase().trim()
      if (!existingNames.has(fallbackKey)) {
        mapped.push({ ...fallback })
      }
    })

    return mapped
  }, [menuItems])

  const tiramisuUnitPrice = useMemo(() => {
    const tiramisuItem = normalizedMenuItems.find((item) => isTiramisuItem(item.name))
    return tiramisuItem?.price ?? 20
  }, [normalizedMenuItems])

  // Raggruppa per categoria
  const itemsByCategory = useMemo(() => {
    const grouped = ORDERED_CATEGORIES.reduce((acc, category) => {
      acc[category] = []
      return acc
    }, {} as Record<MenuCategory, NormalizedMenuItem[]>)

    normalizedMenuItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })

    ORDERED_CATEGORIES.forEach((category) => {
      grouped[category]?.sort((a, b) => {
        if (a.sort_order === b.sort_order) {
          return a.name.localeCompare(b.name)
        }
        return a.sort_order - b.sort_order
      })
    })

    return grouped
  }, [normalizedMenuItems])

  const { totalPerPerson, tiramisuKg, tiramisuTotal } = useMemo(() => {
    const tiramisuSelection = selectedItems.find((item) => isTiramisuItem(item.name))
    const quantity = tiramisuSelection?.quantity ?? 0
    const totalForTiramisu = quantity > 0 ? tiramisuUnitPrice * quantity : 0

    const baseTotal = selectedItems
      .filter((item) => !isTiramisuItem(item.name))
      .reduce((sum, item) => sum + item.price, 0)

    return {
      totalPerPerson: baseTotal,
      tiramisuKg: quantity,
      tiramisuTotal: totalForTiramisu
    }
  }, [selectedItems, tiramisuUnitPrice])

  // Stato locale per l'input del tiramisù per permettere digitazione libera
  const [localTiramisuValue, setLocalTiramisuValue] = useState<string>('')
  const isInitializedRef = React.useRef<boolean>(false)

  // Inizializza lo stato locale solo una volta quando tiramisuKg è disponibile
  useEffect(() => {
    if (!isInitializedRef.current && tiramisuKg > 0) {
      setLocalTiramisuValue(String(tiramisuKg))
      isInitializedRef.current = true
    } else if (tiramisuKg === 0 && localTiramisuValue !== '') {
      // Reset solo se tiramisuKg è 0 e il valore locale non è vuoto (caso di rimozione tiramisù)
      setLocalTiramisuValue('')
    }
  }, [tiramisuKg])

  // Rimosso useEffect che causava loop infinito
  // Il callback viene chiamato direttamente da handleItemToggle e handleBisPrimiToggle

  const emitMenuSelectionChange = (items: SelectedMenuItem[]) => {
    const itemsWithTotals = items.map((selected) => {
      if (isTiramisuItem(selected.name)) {
        const rawQuantity = selected.quantity ?? DEFAULT_TIRAMISU_KG
        const clampedQuantity = clampTiramisuQuantity(rawQuantity)
        const totalPrice = clampedQuantity > 0 ? tiramisuUnitPrice * clampedQuantity : 0
        return {
          ...selected,
          quantity: clampedQuantity > 0 ? clampedQuantity : undefined,
          totalPrice: totalPrice > 0 ? totalPrice : undefined
        }
      }

      return {
        ...selected,
        totalPrice: selected.totalPrice ?? selected.price
      }
    })

    const tiramisuSelection = itemsWithTotals.find((item) => isTiramisuItem(item.name))
    const tiramisuQuantity = tiramisuSelection?.quantity ?? 0
    const tiramisuTotalValue = tiramisuSelection?.totalPrice ?? 0

    const baseTotal = itemsWithTotals
      .filter((item) => !isTiramisuItem(item.name))
      .reduce((sum, item) => sum + item.price, 0)

    onMenuChange({
      items: itemsWithTotals,
      totalPerPerson: baseTotal,
      tiramisuTotal: tiramisuTotalValue,
      tiramisuKg: tiramisuQuantity
    })
  }

  const handleItemToggle = (item: NormalizedMenuItem) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id)

    if (isSelected) {
      const remainingItems = selectedItems.filter(selected => selected.id !== item.id)
      emitMenuSelectionChange(remainingItems)
      return
    }

    let updatedItems: SelectedMenuItem[] = selectedItems

    // === BEVANDE RULES ===
    if (item.category === 'bevande') {
      const isCaraffe = isCaraffeDrinkStandard(item.name) || isCaraffeDrinkPremium(item.name)
      if (isCaraffe) {
        updatedItems = selectedItems.filter(selected =>
          !(
            selected.category === 'bevande' &&
            (isCaraffeDrinkStandard(selected.name) || isCaraffeDrinkPremium(selected.name))
          )
        )
      }
    }

    // === ANTIPASTI RULES ===
    if (item.category === 'antipasti') {
      const antipastiCount = selectedItems.filter(s => s.category === 'antipasti').length
      if (antipastiCount >= 3) {
        alert('Puoi scegliere massimo 3 antipasti')
        return
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

    // === PIZZA RULES ===
    if (item.category === 'pizza') {
      updatedItems = updatedItems.filter(selected => selected.category !== 'pizza')
    }

    // === PRIMI RULES ===
    if (item.category === 'primi') {
      updatedItems = updatedItems.filter(selected => selected.category !== 'primi')
    }

    // === SECONDI RULES ===
    if (item.category === 'secondi') {
      const secondiCount = selectedItems.filter(s => s.category === 'secondi').length
      if (secondiCount >= 3) {
        alert('Puoi scegliere massimo 3 secondi')
        return
      }
    }

    const newItem: SelectedMenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category
    }

    if (isTiramisuItem(item.name)) {
      newItem.quantity = DEFAULT_TIRAMISU_KG
    }

    emitMenuSelectionChange([
      ...updatedItems.filter(selected => selected.id !== item.id),
      newItem
    ])
  }

  const handleRemoveSelectedItem = (itemId: string) => {
    const remainingItems = selectedItems.filter(item => item.id !== itemId)
    emitMenuSelectionChange(remainingItems)
  }

  const handleTiramisuQuantityChange = (value: string) => {
    // Aggiorna immediatamente lo stato locale per permettere digitazione libera
    setLocalTiramisuValue(value)

    const trimmed = value.trim()
    const isEmpty = trimmed === ''

    if (isEmpty) {
      const itemsWithoutQuantity = selectedItems.map((item) =>
        isTiramisuItem(item.name)
          ? { ...item, quantity: undefined, totalPrice: undefined }
          : item
      )
      emitMenuSelectionChange(itemsWithoutQuantity)
      return
    }

    // Permetti solo numeri
    if (!/^\d+$/.test(trimmed)) {
      return
    }

    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    // Se il numero è fuori range (0 o > 7)
    if (parsed < TIRAMISU_MIN_KG || parsed > TIRAMISU_MAX_KG) {
      // Se è chiaramente fuori range (es. > 7), clampalo immediatamente
      if (parsed > TIRAMISU_MAX_KG) {
        const clamped = TIRAMISU_MAX_KG
        setLocalTiramisuValue(String(clamped))
        const updatedItems = selectedItems.map((item) =>
          isTiramisuItem(item.name)
            ? {
                ...item,
                quantity: clamped,
                totalPrice: clamped > 0 ? tiramisuUnitPrice * clamped : undefined
              }
            : item
        )
        emitMenuSelectionChange(updatedItems)
      }
      // Se è < 1, lascia che l'utente continui a digitare (potrebbe voler digitare 1, 2, etc.)
      return
    }

    // Valore valido (1-7), aggiorna immediatamente
    const updatedItems = selectedItems.map((item) =>
      isTiramisuItem(item.name)
        ? {
            ...item,
            quantity: parsed,
            totalPrice: parsed > 0 ? tiramisuUnitPrice * parsed : undefined
          }
        : item
    )
    emitMenuSelectionChange(updatedItems)
  }

  const handleTiramisuQuantityBlur = () => {
    // Al blur, assicurati che il valore sia valido
    const trimmed = localTiramisuValue.trim()
    if (trimmed === '') {
      const itemsWithoutQuantity = selectedItems.map((item) =>
        isTiramisuItem(item.name)
          ? { ...item, quantity: undefined, totalPrice: undefined }
          : item
      )
      emitMenuSelectionChange(itemsWithoutQuantity)
      return
    }

    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed) || parsed < TIRAMISU_MIN_KG) {
      // Se vuoto o invalido, imposta a default
      const clamped = DEFAULT_TIRAMISU_KG
      setLocalTiramisuValue(String(clamped))
      const updatedItems = selectedItems.map((item) =>
        isTiramisuItem(item.name)
          ? {
              ...item,
              quantity: clamped,
              totalPrice: clamped > 0 ? tiramisuUnitPrice * clamped : undefined
            }
          : item
      )
      emitMenuSelectionChange(updatedItems)
    } else if (parsed > TIRAMISU_MAX_KG) {
      // Se troppo grande, clampalo
      const clamped = TIRAMISU_MAX_KG
      setLocalTiramisuValue(String(clamped))
      const updatedItems = selectedItems.map((item) =>
        isTiramisuItem(item.name)
          ? {
              ...item,
              quantity: clamped,
              totalPrice: clamped > 0 ? tiramisuUnitPrice * clamped : undefined
            }
          : item
      )
      emitMenuSelectionChange(updatedItems)
    } else {
      // Valore valido, assicurati che sia sincronizzato
      const updatedItems = selectedItems.map((item) =>
        isTiramisuItem(item.name)
          ? {
              ...item,
              quantity: parsed,
              totalPrice: parsed > 0 ? tiramisuUnitPrice * parsed : undefined
            }
          : item
      )
      emitMenuSelectionChange(updatedItems)
    }
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
    <div className="isolate">
      {/* Titolo Sezione */}
      <h2
        className="booking-section-title booking-section-title-mobile text-lg md:text-xl font-serif text-warm-wood mb-4 pb-3 border-b-2 border-warm-beige"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(1px)',
          padding: '12px 16px',
          borderRadius: '16px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          maxWidth: 'min(560px, calc(100% - 16px))',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <span style={{ flexShrink: 0 }}>Menù</span>
        <span className="text-xs md:text-sm font-sans font-semibold text-warm-wood/80" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', flexShrink: 1, minWidth: 0, textAlign: 'right' }}>
          € a Persona
        </span>
      </h2>

      {/* Menù Consigliati dallo Staff - Solo per Rinfresco di Laurea */}
      {bookingType === 'rinfresco_laurea' && onPresetMenuChange && (
        <div 
          className="w-full flex flex-col items-center px-1 sm:px-2"
          style={{ 
            paddingTop: '1rem', 
            paddingBottom: '0',
            marginTop: '0',
            marginBottom: '0'
          }}
        >
          <label
            className="block text-base md:text-lg text-warm-wood mb-2 w-full"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'inline-block',
              fontWeight: '700',
              maxWidth: 'min(560px, calc(100% - 16px))',
              margin: '0 auto',
              marginBottom: '0.5rem'
            }}
          >
            Menù Consigliati dallo Staff
          </label>
          <select
            id="preset_menu"
            value={presetMenu || ''}
            onChange={(e) => {
              const value = e.target.value
              onPresetMenuChange(value === '' ? null : (value as Exclude<PresetMenuType, null>))
            }}
            className="block rounded-full border shadow-sm transition-all w-full"
            style={{
              borderColor: 'rgba(0,0,0,0.2)',
              height: '56px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              color: 'black',
              maxWidth: 'min(560px, calc(100% - 16px))',
              margin: '0 auto'
            }}
            onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#8B6914'}
            onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = 'rgba(0,0,0,0.2)'}
          >
            <option value="">Scegli un menù consigliato dallo staff</option>
            <option value="menu_1">Menù 1 Rinfresco Leggero</option>
            <option value="menu_2">Menù 2 Rinfresco Completo</option>
            <option value="menu_3">Menù 3 Pranzo o Cena</option>
            <option value="menu_4">Menù 4 Gourmet</option>
          </select>
        </div>
      )}

      {/* Lista per Categoria */}
      {ORDERED_CATEGORIES.map((category, index) => {
        const label = CATEGORY_LABELS[category]
        const items = itemsByCategory[category] || []
        if (!items || items.length === 0) return null

        const selectedCount = selectedItems.filter(i => i.category === category).length

        let counterText: string | null = null
        if (category === 'bevande') {
          const caraffeCount = selectedItems.filter(i =>
            i.category === 'bevande' &&
            (isCaraffeDrinkStandard(i.name) || isCaraffeDrinkPremium(i.name))
          ).length
          const limit = CATEGORY_LIMITS[category]
          if (typeof limit === 'number') {
            counterText = `(${caraffeCount}/${limit} selezionat${caraffeCount === 1 ? 'a' : 'e'})`
          } else {
            counterText = `(${caraffeCount} selezionat${caraffeCount === 1 ? 'a' : 'e'})`
          }
        } else {
          const limit = CATEGORY_LIMITS[category]
          if (typeof limit === 'number') {
            counterText = `(${selectedCount}/${limit} selezionat${selectedCount === 1 ? 'o' : 'i'})`
          } else if (selectedCount > 0) {
            counterText = `(${selectedCount} selezionat${selectedCount === 1 ? 'o' : 'i'})`
          }
        }

        // Padding condizionale: prima categoria (Bevande) ha padding extra se c'è dropdown sopra
        const hasDropdownAbove = bookingType === 'rinfresco_laurea' && onPresetMenuChange
        const isFirstCategory = index === 0
        
        // Calcola padding top: se è la prima categoria e c'è dropdown, padding extra
        const paddingTop = isFirstCategory && hasDropdownAbove
          ? '0.75rem' // Padding extra per prima categoria (Bevande) se c'è dropdown sopra
          : isFirstCategory
          ? '0' // Nessun padding se è la prima e non c'è dropdown
          : '1.5rem' // Padding normale per altre categorie

        return (
          <div 
            key={category} 
            className="w-full flex flex-col items-center px-1 sm:px-2 menu-grid-container"
            style={{ paddingTop, paddingBottom: '0' }}
          >
            <h3
              className="text-lg md:text-xl border-b border-gray-300 pb-2 flex items-center justify-between w-full booking-section-title-mobile"
              style={{
                color: '#2563EB',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(1px)',
                padding: '8px 16px',
                borderRadius: '12px',
                width: '100%',
                maxWidth: 'min(560px, calc(100% - 16px))',
                margin: '0 auto',
                boxSizing: 'border-box',
                fontWeight: '700'
              }}
            >
              <span>{label}</span>
              {counterText ? (
                <span className="text-sm text-gray-600">
                  {counterText}
                </span>
              ) : null}
            </h3>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full justify-items-center md:max-w-5xl mx-auto"
              style={{ paddingTop: '0.5rem', marginTop: '0' }}
            >
              {items.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id)
                const isTiramisu = isTiramisuItem(item.name)
                return (
                  <div key={item.id} className="w-full flex flex-col items-stretch gap-2">
                    <label
                      className={`
                        flex items-center gap-4 rounded-xl border-2 cursor-pointer w-full menu-card-mobile
                        ${isTiramisu && isSelected ? 'menu-card-with-ingredient' : ''}
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
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        borderRadius: '16px',
                        marginBottom: '4px',
                        width: '100%',
                        maxWidth: '560px',
                        height: item.description ? 'auto' : '80px',
                        boxSizing: 'border-box',
                        overflow: 'hidden'
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
                      <div
                        className="flex-1 w-full flex flex-col gap-2 md:flex-row md:items-center md:gap-4 md:justify-between"
                        style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '0px', paddingBottom: '0px', minWidth: 0, height: '100%', overflow: 'hidden' }}
                      >
                        <div className="flex items-center justify-between gap-2 md:gap-4 md:w-[180px] md:flex-shrink-0" style={{ minWidth: 0, flex: '1 1 auto' }}>
                          <span className={`font-bold text-base md:text-lg ${isSelected ? 'text-warm-wood' : 'text-gray-700'} md:whitespace-nowrap`} style={{ fontWeight: '700', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', flex: '1 1 auto', minWidth: 0 }}>
                            {item.name}
                          </span>
                          <span
                            className="text-sm font-bold text-warm-wood whitespace-nowrap md:hidden"
                            style={{ fontWeight: '700', textAlign: 'right' }}
                          >
                            {formatPrice(item)}
                          </span>
                        </div>
                        {item.description ? (
                          <p
                            className="text-base md:text-lg font-bold text-gray-600 leading-snug md:text-center md:flex-1"
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.3', width: '100%', margin: 0, hyphens: 'auto' }}
                          >
                            {item.description}
                          </p>
                        ) : null}
                        <span
                          className="hidden md:block text-base md:text-lg font-bold text-warm-wood whitespace-nowrap"
                          style={{ fontWeight: '700', textAlign: 'right' }}
                        >
                          {formatPrice(item)}
                        </span>
                      </div>
                    </label>
                    {isTiramisu && isSelected && (
                      <div
                        className="w-full max-w-[560px] bg-white/85 border-2 rounded-xl px-4 py-3 flex flex-col gap-2 tiramisu-ingredient-card transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.85)',
                          backdropFilter: 'blur(1px)',
                          borderColor: 'rgba(0,0,0,0.2)',
                          borderRadius: '16px',
                          marginTop: '0.5rem',
                          paddingTop: '0.75rem'
                        }}
                      >
                        <label
                          htmlFor="tiramisu-quantity"
                          className="text-sm font-semibold text-warm-wood"
                        >
                          Quanti Kg di Tiramisù desideri? (1-7)
                        </label>
                        <input
                          id="tiramisu-quantity"
                          type="number"
                          min={TIRAMISU_MIN_KG}
                          max={TIRAMISU_MAX_KG}
                          inputMode="numeric"
                          value={localTiramisuValue}
                          onChange={(event) => handleTiramisuQuantityChange(event.target.value)}
                          onBlur={handleTiramisuQuantityBlur}
                          className="w-full rounded-lg border border-warm-wood/40 px-3 py-2 text-base font-semibold text-gray-800 focus:border-warm-wood focus:ring-2 focus:ring-warm-wood/30"
                        />
                        <p className="text-xs text-gray-500">
                          Il tiramisù viene preparato in teglie da 1 Kg. Ogni Kg corrisponde a €{tiramisuUnitPrice.toFixed(2)}.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Riepilogo Scelte */}
      {selectedItems.length > 0 && (
        <div className="w-full flex justify-center">
          <div
            className="w-full max-w-[560px] border-2 rounded-xl bg-white/85 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              borderColor: 'rgba(0,0,0,0.2)',
              borderRadius: '16px'
            }}
          >
            <div className="flex items-center justify-between border-b border-warm-beige/60" style={{ paddingLeft: '22px', paddingRight: '22px', paddingTop: '22px', paddingBottom: '22px' }}>
              <h3 className="text-xl font-semibold text-warm-wood">Riepilogo Scelte</h3>
              <span className="text-sm font-medium text-gray-600">{selectedItems.length} elementi</span>
            </div>
            <div style={{ paddingLeft: '22px', paddingRight: '22px', paddingTop: '18px', paddingBottom: '18px' }}>
              <div className="flex flex-wrap" style={{ gap: '16px' }}>
                {selectedItems.map((item) => {
                  const isTiramisu = isTiramisuItem(item.name)
                  const quantityLabel = isTiramisu && item.quantity ? ` - ${item.quantity} Kg` : ''
                  const chipLabel = `${item.name}${quantityLabel}`
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRemoveSelectedItem(item.id)}
                      className="group flex items-center gap-2 rounded-full border border-warm-wood/40 bg-white/80 px-4 py-2 text-sm font-semibold text-warm-wood shadow-sm transition-all hover:border-warm-wood hover:bg-warm-beige/30"
                    >
                      <span className="truncate max-w-[180px] text-left">{chipLabel}</span>
                      <X className="h-4 w-4 text-warm-wood/80 transition-colors group-hover:text-warm-wood" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Totali */}
      {selectedItems.length > 0 && (
        <div className="w-full flex justify-center">
          <div
            className="w-full max-w-[560px] border-2 rounded-xl bg-white/85 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(1px)',
              borderColor: 'rgba(0,0,0,0.2)',
              borderRadius: '16px'
            }}
          >
            <div className="space-y-4" style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', paddingBottom: '30px' }}>
              <div className="flex items-center justify-between text-lg font-semibold text-warm-wood">
                <span>Prezzo a persona</span>
                <span>{formatCurrency(totalPerPerson)}</span>
              </div>
              {numGuests > 0 && (
                <div className="flex items-center justify-between text-lg font-semibold text-warm-wood">
                  <span>Coperto ({numGuests} {numGuests === 1 ? 'persona' : 'persone'})</span>
                  <span>{formatCurrency(2.00 * numGuests)}</span>
                </div>
              )}
              {tiramisuTotal > 0 && (
                <div className="flex items-center justify-between text-lg font-semibold text-warm-wood">
                  <span>Tiramisù</span>
                  <span>{formatCurrency(tiramisuTotal)}</span>
                </div>
              )}
              <div className="h-px bg-warm-beige/60" />
              <div className="flex items-center justify-between text-2xl font-bold text-warm-wood">
                <span>Prezzo totale rinfresco</span>
                <span>
                  {formatCurrency(totalPerPerson * Math.max(numGuests, 0) + (2.00 * Math.max(numGuests, 0)) + tiramisuTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

