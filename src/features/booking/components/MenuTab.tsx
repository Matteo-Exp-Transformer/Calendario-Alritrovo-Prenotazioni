import React, { useMemo } from 'react'
import { CollapsibleSection } from './CollapsibleSection'
import { MenuSelection } from './MenuSelection'
import type { SelectedMenuItem } from '@/types/menu'

interface MenuTabProps {
  booking: any
  isEditMode: boolean
  menuSelection?: {
    items: SelectedMenuItem[]
    tiramisu_total?: number
    tiramisu_kg?: number
  }
  numGuests: number
  presetMenu?: string | null
  isMenuExpanded: boolean
  onMenuExpandToggle: () => void
  onMenuChange: (payload: {
    items: SelectedMenuItem[]
    totalPerPerson: number
    tiramisuTotal: number
    tiramisuKg: number
  }) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  bevande: '🍹',
  pizza: '🍕',
  antipasti: '🥗',
  fritti: '🍟',
  primi: '🍝',
  secondi: '🥩',
  dolci: '🍰'
}

const CATEGORY_LABELS: Record<string, string> = {
  bevande: 'BEVANDE',
  pizza: 'PIZZA',
  antipasti: 'ANTIPASTI',
  fritti: 'FRITTI',
  primi: 'PRIMI',
  secondi: 'SECONDI',
  dolci: 'DOLCI'
}

export const MenuTab: React.FC<MenuTabProps> = ({
  booking: _booking,
  isEditMode,
  menuSelection,
  numGuests,
  presetMenu,
  isMenuExpanded,
  onMenuExpandToggle,
  onMenuChange
}) => {
  // Group menu items by category
  const groupedItems = useMemo(() => {
    if (!menuSelection?.items) return {}

    const grouped: Record<string, SelectedMenuItem[]> = {}
    menuSelection.items.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = []
      }
      grouped[item.category].push(item)
    })
    return grouped
  }, [menuSelection?.items])

  // Calculate totals
  const { totalPerPerson, totalBooking, itemCount } = useMemo(() => {
    if (!menuSelection?.items) return { totalPerPerson: 0, totalBooking: 0, itemCount: 0 }

    const baseTotal = menuSelection.items
      .filter((item) => !item.name.toLowerCase().includes('tiramis'))
      .reduce((sum, item) => sum + item.price, 0)

    const tiramisuTotal = menuSelection.tiramisu_total || 0
    const totalBooking = baseTotal * numGuests + tiramisuTotal

    return {
      totalPerPerson: baseTotal,
      totalBooking,
      itemCount: menuSelection.items.length
    }
  }, [menuSelection, numGuests])

  // Menu summary (always visible)
  const menuSummary = (
    <div className="space-y-1 text-sm">
      <p className="font-semibold text-gray-700">
        {itemCount} {itemCount === 1 ? 'item selezionato' : 'items selezionati'}
      </p>
      <p className="text-gray-600">
        Totale a persona: <span className="font-bold text-gray-900">€{totalPerPerson.toFixed(2)}</span>
      </p>
      <p className="text-gray-600">
        Totale prenotazione: <span className="font-bold text-gray-900">€{totalBooking.toFixed(2)}</span>
        {' '}<span className="text-xs">({numGuests} ospiti)</span>
      </p>
    </div>
  )

  // Menu expanded content (view mode)
  const menuContent = isEditMode ? (
    <MenuSelection
      selectedItems={menuSelection?.items || []}
      numGuests={numGuests}
      onMenuChange={onMenuChange}
    />
  ) : (
    <div className="space-y-4">
      {Object.entries(groupedItems).map(([category, items]) => {
        const categoryTotal = items.reduce((sum, item) => {
          if (item.name.toLowerCase().includes('tiramis')) {
            return sum + (item.totalPrice || 0)
          }
          return sum + item.price
        }, 0)

        return (
          <div key={category} className="space-y-2">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>{CATEGORY_ICONS[category] || '📦'}</span>
              <span>{CATEGORY_LABELS[category] || category.toUpperCase()}</span>
              <span className="text-sm text-gray-600">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
              <span className="ml-auto text-sm font-bold text-gray-700">€{categoryTotal.toFixed(2)}</span>
            </h4>
            <ul className="space-y-1 pl-6">
              {items.map((item, idx) => {
                const isTiramisu = item.name.toLowerCase().includes('tiramis')
                const displayPrice = isTiramisu && item.totalPrice
                  ? `€${item.totalPrice.toFixed(2)}`
                  : `€${item.price.toFixed(2)}`
                const quantityLabel = isTiramisu && item.quantity
                  ? ` ${item.quantity} Kg -`
                  : ''

                return (
                  <li key={`${item.id}-${idx}`} className="text-sm text-gray-700 flex items-center justify-between">
                    <span>
                      • {item.name}{quantityLabel}
                    </span>
                    <span className="font-semibold">{displayPrice}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Preset Menu Badge (if applicable) */}
      {presetMenu && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-blue-900">
            📋 Menu Predefinito: <span className="uppercase">{presetMenu.replace('_', ' ')}</span>
          </p>
        </div>
      )}

      {/* Collapsible Menu Section */}
      {menuSelection?.items && menuSelection.items.length > 0 ? (
        <CollapsibleSection
          title="Menu Selezionato"
          icon="🍽️"
          summary={menuSummary}
          isExpanded={isEditMode || isMenuExpanded}
          onToggle={onMenuExpandToggle}
        >
          {menuContent}
        </CollapsibleSection>
      ) : (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-6 text-center">
          <p className="text-gray-600">Nessun menu selezionato</p>
        </div>
      )}
    </div>
  )
}
