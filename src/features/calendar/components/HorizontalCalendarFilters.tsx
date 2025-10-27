import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/calendar'

export interface CalendarFilterOptions {
  eventTypes: CalendarEvent['type'][]
  priorities: CalendarEvent['priority'][]
  statuses: CalendarEvent['status'][]
}

export interface HorizontalCalendarFiltersProps {
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
  { value: 'general_task', label: 'Mansioni', icon: '📋' },
  { value: 'temperature_reading', label: 'Controlli Temp.', icon: '🌡️' },
  { value: 'custom', label: 'Personalizzati', icon: '📅' },
]

const PRIORITY_OPTIONS: Array<{
  value: CalendarEvent['priority']
  label: string
  color: string
}> = [
  { value: 'critical', label: 'Critico', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'low', label: 'Bassa', color: 'bg-blue-100 text-blue-700 border-blue-300' },
]

const STATUS_OPTIONS: Array<{
  value: CalendarEvent['status']
  label: string
  icon: string
  color: string
}> = [
  { value: 'pending', label: 'In Attesa', icon: '⏳', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'in_progress', label: 'In Corso', icon: '🔄', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'completed', label: 'Completato', icon: '✅', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'overdue', label: 'Scaduto', icon: '⚠️', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'cancelled', label: 'Annullato', icon: '❌', color: 'bg-gray-50 text-gray-700 border-gray-200' },
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

export function HorizontalCalendarFilters({
  onFilterChange,
  initialFilters,
  className,
}: HorizontalCalendarFiltersProps) {
  const storedFilters = loadFiltersFromStorage()
  
  const defaultFilters: CalendarFilterOptions = {
    eventTypes: initialFilters?.eventTypes ||
      (storedFilters.eventTypes && storedFilters.eventTypes.length > 0 ? storedFilters.eventTypes : null) ||
      ['maintenance', 'general_task', 'temperature_reading', 'custom'],
    priorities: initialFilters?.priorities ||
      (storedFilters.priorities && storedFilters.priorities.length > 0 ? storedFilters.priorities : null) ||
      ['critical', 'high', 'medium', 'low'],
    statuses: initialFilters?.statuses ||
      (storedFilters.statuses && storedFilters.statuses.length > 0 ? storedFilters.statuses : null) ||
      ['pending', 'in_progress', 'overdue', 'completed'],
  }

  const [filters, setFilters] = useState<CalendarFilterOptions>(defaultFilters)

  // Fix: Se i filtri sono vuoti, forza il reset ai default
  useEffect(() => {
    if (filters.eventTypes.length === 0 || filters.priorities.length === 0 || filters.statuses.length === 0) {
      const resetFilters: CalendarFilterOptions = {
        eventTypes: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
        priorities: ['critical', 'high', 'medium', 'low'],
        statuses: ['pending', 'in_progress', 'overdue', 'completed'],
      }
      setFilters(resetFilters)
      return
    }
    
    onFilterChange(filters)
    saveFiltersToStorage(filters)
  }, [filters, onFilterChange])

  const toggleEventType = (type: CalendarEvent['type']) => {
    setFilters(prev => {
      const newEventTypes = prev.eventTypes.includes(type)
        ? prev.eventTypes.filter(t => t !== type)
        : [...prev.eventTypes, type]
      return {
        ...prev,
        eventTypes: newEventTypes,
      }
    })
  }

  const togglePriority = (priority: CalendarEvent['priority']) => {
    setFilters(prev => {
      const newPriorities = prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
      return {
        ...prev,
        priorities: newPriorities,
      }
    })
  }

  const toggleStatus = (status: CalendarEvent['status']) => {
    setFilters(prev => {
      const newStatuses = prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status]
      return {
        ...prev,
        statuses: newStatuses,
      }
    })
  }

  const resetFilters = () => {
    const reset: CalendarFilterOptions = {
      eventTypes: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
      priorities: ['critical', 'high', 'medium', 'low'],
      statuses: ['pending', 'in_progress', 'overdue', 'completed'],
    }
    setFilters(reset)
  }

  const activeFilterCount =
    (EVENT_TYPE_OPTIONS.length - filters.eventTypes.length) +
    (PRIORITY_OPTIONS.length - filters.priorities.length) +
    (STATUS_OPTIONS.length - filters.statuses.length)

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Filtri</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFilterCount} nascosti
            </span>
          )}
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
        >
          <X className="h-3 w-3" />
          Reset Filtri
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tipo Evento */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Tipo Evento
          </h4>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleEventType(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  filters.eventTypes.includes(option.value)
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
                {filters.eventTypes.includes(option.value) && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Priorità */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Priorità
          </h4>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => togglePriority(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  filters.priorities.includes(option.value)
                    ? option.color + ' shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                <span>{option.label}</span>
                {filters.priorities.includes(option.value) && (
                  <span>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stato */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Stato
          </h4>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleStatus(option.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  filters.statuses.includes(option.value)
                    ? option.color + ' shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
                {filters.statuses.includes(option.value) && (
                  <span>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
