import React, { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { useMenuItems } from '../hooks/useMenuItems'
import type { MenuCategory, SelectedMenuItem } from '@/types/menu'

interface MenuSelectionProps {
  selectedItems: SelectedMenuItem[]
  numGuests: number
  onMenuChange: (payload: {
    items: SelectedMenuItem[]
    totalPerPerson: number
    tiramisuTotal: number
    tiramisuKg: number
  }) => void
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
    name: 'Tiramis\u00f9',
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
const TIRAMISU_MAX_KG = 6
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
  onMenuChange
}) => {
  const { data: menuItems = [], isLoading, error } = useMenuItems()

  // 🔍 DEBUG: Traccia il viewport e gli stili responsive
  React.useEffect(() => {
    const logViewportDebug = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const scrollWidth = document.documentElement.scrollWidth
      const clientWidth = document.documentElement.clientWidth
      const hasHorizontalScroll = scrollWidth > clientWidth

      console.group('📐 [MenuSelection] Viewport & Layout Debug')
      console.log(`Viewport: ${vw}x${vh}px`)
      console.log(`scrollWidth: ${scrollWidth}px`)
      console.log(`clientWidth: ${clientWidth}px`)
      console.log(`Has horizontal scroll: ${hasHorizontalScroll ? '⚠️ YES' : '✅ NO'}`)
      console.log(`Breakpoint < 510px: ${vw < 510 ? '📱 SMALL MOBILE' : '📱 REGULAR/DESKTOP'}`)
      
      // Traccia le card
      const cards = document.querySelectorAll('.menu-card-mobile')
      if (cards.length > 0) {
        const firstCard = cards[0] as HTMLElement
        const cardBox = firstCard.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(firstCard)
        
        console.log(`\n📦 First Card Metrics:`)
        console.log(`  Width: ${cardBox.width}px`)
        console.log(`  Height: ${cardBox.height}px`)
        console.log(`  Left offset: ${cardBox.left}px`)
        console.log(`  Padding: ${computedStyle.paddingLeft} ${computedStyle.paddingRight}`)
        console.log(`  MaxWidth (CSS): ${computedStyle.maxWidth}`)
        console.log(`  Overflow (CSS): ${computedStyle.overflow}`)
        console.log(`  BoxSizing: ${computedStyle.boxSizing}`)
      }
      console.groupEnd()
    }

    // Log su mount e resize
    logViewportDebug()
    window.addEventListener('resize', logViewportDebug)
    
    return () => window.removeEventListener('resize', logViewportDebug)
  }, [])

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

    const parsed = Number.parseInt(trimmed, 10)
    if (Number.isNaN(parsed)) {
      return
    }

    const clamped = clampTiramisuQuantity(parsed)
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
          € x Persona
        </span>
      </h2>

      {/* Lista per Categoria */}
      {ORDERED_CATEGORIES.map((category) => {
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

        return (
          <div key={category} className="space-y-3 w-full flex flex-col items-stretch menu-grid-container">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full justify-items-center md:max-w-5xl md:mx-auto">
              {items.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id)
                const isTiramisu = isTiramisuItem(item.name)
                const tiramisuValue = tiramisuKg > 0 ? String(tiramisuKg) : ''
                return (
                  <div key={item.id} className="w-full flex flex-col items-stretch gap-2">
                    <label
                      className={`
                        flex items-center gap-4 rounded-xl border-2 cursor-pointer w-full menu-card-mobile
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
                        className="w-full max-w-[560px] bg-white/85 border border-warm-beige rounded-xl px-4 py-3 shadow-sm flex flex-col gap-2"
                        style={{ backdropFilter: 'blur(1px)' }}
                      >
                        <label
                          htmlFor="tiramisu-quantity"
                          className="text-sm font-semibold text-warm-wood"
                        >
                          Quanti Kg di Tiramis\u00f9 desideri? (1-6)
                        </label>
                        <input
                          id="tiramisu-quantity"
                          type="number"
                          min={TIRAMISU_MIN_KG}
                          max={TIRAMISU_MAX_KG}
                          inputMode="numeric"
                          value={tiramisuValue}
                          onChange={(event) => handleTiramisuQuantityChange(event.target.value)}
                          className="w-full rounded-lg border border-warm-wood/40 px-3 py-2 text-base font-semibold text-gray-800 focus:border-warm-wood focus:ring-2 focus:ring-warm-wood/30"
                        />
                        <p className="text-xs text-gray-500">
                          Il tiramis\u00f9 viene preparato in teglie da 1 Kg. Ogni Kg corrisponde a €{tiramisuUnitPrice.toFixed(2)}.
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
            className="w-full max-w-[560px] border-2 border-warm-beige rounded-2xl bg-white/90 shadow-lg"
            style={{ backdropFilter: 'blur(2px)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-beige/60">
              <h3 className="text-xl font-semibold text-warm-wood">Riepilogo Scelte</h3>
              <span className="text-sm font-medium text-gray-600">{selectedItems.length} elementi</span>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-3">
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
            className="w-full max-w-[560px] border-2 border-warm-beige rounded-2xl bg-gradient-to-br from-warm-cream/70 to-warm-beige/40 shadow-xl"
            style={{ backdropFilter: 'blur(2px)' }}
          >
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold text-warm-wood">
                <span>Prezzo a persona</span>
                <span>{formatCurrency(totalPerPerson)}</span>
              </div>
              {tiramisuTotal > 0 && (
                <div className="flex items-center justify-between text-lg font-semibold text-warm-wood">
                  <span>Tiramis\u00f9</span>
                  <span>{formatCurrency(tiramisuTotal)}</span>
                </div>
              )}
              <div className="h-px bg-warm-beige/60" />
              <div className="flex items-center justify-between text-2xl font-bold text-warm-wood">
                <span>Prezzo totale rinfresco</span>
                <span>
                  {formatCurrency(totalPerPerson * Math.max(numGuests, 0) + tiramisuTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

