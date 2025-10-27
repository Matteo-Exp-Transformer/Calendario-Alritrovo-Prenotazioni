import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LegendItem {
  label: string
  color: string
  icon?: string
  description?: string
}

const DEFAULT_PRIORITY_LEGEND: LegendItem[] = [
  {
    label: 'Critico/Scaduto',
    color: 'bg-red-900 border-red-800',
    icon: '🔴',
    description: 'Richiede azione immediata',
  },
  {
    label: 'Alta Priorità',
    color: 'bg-red-50 border-red-500',
    icon: '🟠',
    description: 'Importante, da completare presto',
  },
  {
    label: 'Media Priorità',
    color: 'bg-amber-50 border-amber-500',
    icon: '🟡',
    description: 'Normale',
  },
  {
    label: 'Bassa Priorità',
    color: 'bg-green-50 border-green-500',
    icon: '🔵',
    description: 'Non urgente',
  },
  {
    label: 'Completato',
    color: 'bg-green-100 border-green-500',
    icon: '🟢',
    description: 'Attività completata',
  },
]

const DEFAULT_EVENT_TYPE_LEGEND: LegendItem[] = [
  {
    label: 'Manutenzione',
    color: 'bg-yellow-100 border-yellow-500',
    icon: '🔧',
  },
  {
    label: 'Mansione Generale',
    color: 'bg-blue-100 border-blue-500',
    icon: '📋',
  },
  {
    label: 'Controllo Temperatura',
    color: 'bg-green-100 border-green-500',
    icon: '🌡️',
  },
  {
    label: 'Scadenza HACCP',
    color: 'bg-purple-100 border-purple-500',
    icon: '📜',
  },
  {
    label: 'Scadenza Prodotto',
    color: 'bg-orange-100 border-orange-500',
    icon: '📦',
  },
]

export interface CalendarLegendProps {
  showPriority?: boolean
  showEventType?: boolean
  customItems?: LegendItem[]
  defaultExpanded?: boolean
  className?: string
}

export function CalendarLegend({
  showPriority = true,
  showEventType = true,
  customItems,
  defaultExpanded = false,
  className,
}: CalendarLegendProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const renderLegendItems = (items: LegendItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={cn(
              'h-4 w-4 rounded border-2 flex-shrink-0',
              item.color
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {item.icon && <span className="text-sm">{item.icon}</span>}
              <span className="text-sm font-medium text-gray-700 truncate">
                {item.label}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 truncate">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        className
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <h3 className="text-sm font-semibold text-gray-900">Legenda Eventi</h3>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {customItems && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Personalizzato
              </h4>
              {renderLegendItems(customItems)}
            </div>
          )}

          {showPriority && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Priorità
              </h4>
              {renderLegendItems(DEFAULT_PRIORITY_LEGEND)}
            </div>
          )}

          {showEventType && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Tipo Evento
              </h4>
              {renderLegendItems(DEFAULT_EVENT_TYPE_LEGEND)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function CompactCalendarLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <span className="text-xs font-semibold text-gray-700">Legenda:</span>
      {DEFAULT_PRIORITY_LEGEND.slice(0, 4).map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div className={cn('h-3 w-3 rounded border', item.color)} />
          <span className="text-xs text-gray-600">{item.icon}</span>
        </div>
      ))}
    </div>
  )
}
