import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/calendar'

export interface CalendarFilterOptions {
  eventTypes: CalendarEvent['type'][]
  priorities: CalendarEvent['priority'][]
  statuses: CalendarEvent['status'][]
}

export interface CalendarFiltersProps {
  onFilterChange: (filters: CalendarFilterOptions) => void
  initialFilters?: Partial<CalendarFilterOptions>
  className?: string
}

const STORAGE_KEY = 'calendar-filters'

const EVENT_TYPE_OPTIONS: Array<{
  value: CalendarEvent['type']
  label: string
  icon: string
}> = [
  { value: 'maintenance', label: 'Manutenzioni', icon: '🔧' },
  { value: 'general_task', label: 'Mansioni Generali', icon: '📋' },
  { value: 'temperature_reading', label: 'Controlli Temperatura', icon: '🌡️' },
  { value: 'custom', label: 'Eventi Personalizzati', icon: '📅' },
]

const PRIORITY_OPTIONS: Array<{
  value: CalendarEvent['priority']
  label: string
  color: string
}> = [
  { value: 'critical', label: 'Critico', color: 'text-red-700' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600' },
  { value: 'low', label: 'Bassa', color: 'text-blue-600' },
]

const STATUS_OPTIONS: Array<{
  value: CalendarEvent['status']
  label: string
  icon: string
}> = [
  { value: 'pending', label: 'In Attesa', icon: '⏳' },
  { value: 'completed', label: 'Completato', icon: '✅' },
  { value: 'overdue', label: 'Scaduto', icon: '⚠️' },
  { value: 'cancelled', label: 'Annullato', icon: '❌' },
]

function loadFiltersFromStorage(): Partial<CalendarFilterOptions> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveFiltersToStorage(filters: CalendarFilterOptions): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch (error) {
    console.error('Failed to save filters:', error)
  }
}

export function CalendarFilters({
  onFilterChange,
  initialFilters,
  className,
}: CalendarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    eventTypes: true,
    priorities: true,
    statuses: true,
  })

  const storedFilters = loadFiltersFromStorage()
  const defaultFilters: CalendarFilterOptions = {
    eventTypes: initialFilters?.eventTypes ||
      storedFilters.eventTypes || ['maintenance', 'general_task', 'temperature_reading', 'custom'],
    priorities: initialFilters?.priorities ||
      storedFilters.priorities || ['critical', 'high', 'medium', 'low'],
    statuses: initialFilters?.statuses ||
      storedFilters.statuses || ['pending', 'overdue', 'completed'],
  }

  const [filters, setFilters] = useState<CalendarFilterOptions>(defaultFilters)

  useEffect(() => {
    onFilterChange(filters)
    saveFiltersToStorage(filters)
  }, [filters, onFilterChange])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleEventType = (type: CalendarEvent['type']) => {
    setFilters(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter(t => t !== type)
        : [...prev.eventTypes, type],
    }))
  }

  const togglePriority = (priority: CalendarEvent['priority']) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority],
    }))
  }

  const toggleStatus = (status: CalendarEvent['status']) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }))
  }

  const resetFilters = () => {
    const reset: CalendarFilterOptions = {
      eventTypes: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
      priorities: ['critical', 'high', 'medium', 'low'],
      statuses: ['pending', 'overdue', 'completed'],
    }
    setFilters(reset)
  }

  const activeFilterCount =
    (EVENT_TYPE_OPTIONS.length - filters.eventTypes.length) +
    (PRIORITY_OPTIONS.length - filters.priorities.length) +
    (STATUS_OPTIONS.length - filters.statuses.length)

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Filtri</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="space-y-3">
            <div className="border-b pb-2">
              <button
                onClick={() => toggleSection('eventTypes')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Tipo Evento
                </span>
                {expandedSections.eventTypes ? (
                  <ChevronUp className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                )}
              </button>
              {expandedSections.eventTypes && (
                <div className="mt-2 space-y-2">
                  {EVENT_TYPE_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={filters.eventTypes.includes(option.value)}
                        onChange={() => toggleEventType(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option.icon}</span>
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b pb-2">
              <button
                onClick={() => toggleSection('priorities')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Priorità
                </span>
                {expandedSections.priorities ? (
                  <ChevronUp className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                )}
              </button>
              {expandedSections.priorities && (
                <div className="mt-2 space-y-2">
                  {PRIORITY_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priorities.includes(option.value)}
                        onChange={() => togglePriority(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={cn('text-sm font-medium', option.color)}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection('statuses')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Stato
                </span>
                {expandedSections.statuses ? (
                  <ChevronUp className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                )}
              </button>
              {expandedSections.statuses && (
                <div className="mt-2 space-y-2">
                  {STATUS_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(option.value)}
                        onChange={() => toggleStatus(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option.icon}</span>
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
