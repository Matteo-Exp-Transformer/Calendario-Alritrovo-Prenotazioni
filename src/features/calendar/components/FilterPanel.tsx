import React, { useState } from 'react'
import { X, Filter, RefreshCw } from 'lucide-react'
import {
  CalendarFilters,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventPriority,
} from '@/types/calendar'
import {
  getTypeIcon,
  getStatusIcon,
  getPriorityIcon,
} from '../utils/colorUtils'

interface FilterPanelProps {
  filters: CalendarFilters
  onFiltersChange: (filters: CalendarFilters) => void
  onClose: () => void
}

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: 'maintenance', label: 'Manutenzioni' },
  { value: 'general_task', label: 'Mansioni Generali' },
  { value: 'temperature_reading', label: 'Rilevazioni Temperatura' },
  { value: 'custom', label: 'Eventi Personalizzati' },
]

const EVENT_STATUSES: { value: CalendarEventStatus; label: string }[] = [
  { value: 'pending', label: 'In Attesa' },
  { value: 'completed', label: 'Completato' },
  { value: 'overdue', label: 'In Ritardo' },
  { value: 'cancelled', label: 'Annullato' },
]

const EVENT_PRIORITIES: { value: CalendarEventPriority; label: string }[] = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Critica' },
]

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<CalendarFilters>(filters)

  const handleTypeToggle = (type: CalendarEventType) => {
    const newTypes = localFilters.types.includes(type)
      ? localFilters.types.filter(t => t !== type)
      : [...localFilters.types, type]

    setLocalFilters({ ...localFilters, types: newTypes })
  }

  const handleStatusToggle = (status: CalendarEventStatus) => {
    const newStatuses = localFilters.statuses.includes(status)
      ? localFilters.statuses.filter(s => s !== status)
      : [...localFilters.statuses, status]

    setLocalFilters({ ...localFilters, statuses: newStatuses })
  }

  const handlePriorityToggle = (priority: CalendarEventPriority) => {
    const newPriorities = localFilters.priorities.includes(priority)
      ? localFilters.priorities.filter(p => p !== priority)
      : [...localFilters.priorities, priority]

    setLocalFilters({ ...localFilters, priorities: newPriorities })
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleResetFilters = () => {
    const resetFilters: CalendarFilters = {
      types: [],
      statuses: [],
      priorities: [],
      departments: [],
      assignees: [],
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const hasActiveFilters =
    localFilters.types.length > 0 ||
    localFilters.statuses.length > 0 ||
    localFilters.priorities.length > 0 ||
    localFilters.departments.length > 0 ||
    localFilters.assignees.length > 0

  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Filtri Calendario
            </h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filtri attivi
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Event Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Tipo di Evento
            </h4>
            <div className="space-y-2">
              {EVENT_TYPES.map(type => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.types.includes(type.value)}
                    onChange={() => handleTypeToggle(type.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <span className="mr-2">{getTypeIcon(type.value)}</span>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Event Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Stato</h4>
            <div className="space-y-2">
              {EVENT_STATUSES.map(status => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.statuses.includes(status.value)}
                    onChange={() => handleStatusToggle(status.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <span className="mr-2">{getStatusIcon(status.value)}</span>
                    {status.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Event Priority */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Priorità</h4>
            <div className="space-y-2">
              {EVENT_PRIORITIES.map(priority => (
                <label key={priority.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.priorities.includes(priority.value)}
                    onChange={() => handlePriorityToggle(priority.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <span className="mr-2">
                      {getPriorityIcon(priority.value)}
                    </span>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Filtri Rapidi
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setLocalFilters({
                  ...localFilters,
                  statuses: ['pending', 'overdue'],
                })
              }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
            >
              ⏳ Solo Da Completare
            </button>
            <button
              onClick={() => {
                setLocalFilters({
                  ...localFilters,
                  statuses: ['overdue'],
                })
              }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
            >
              ⚠️ Solo In Ritardo
            </button>
            <button
              onClick={() => {
                setLocalFilters({
                  ...localFilters,
                  priorities: ['high', 'critical'],
                })
              }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
            >
              🔥 Alta Priorità
            </button>
            <button
              onClick={() => {
                setLocalFilters({
                  ...localFilters,
                  types: ['maintenance'],
                })
              }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              🔧 Solo Manutenzioni
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filtri
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annulla
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Applica Filtri
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="text-sm font-medium text-blue-900 mb-2">
              Filtri Attivi:
            </h5>
            <div className="flex flex-wrap gap-2">
              {localFilters.types.map(type => (
                <span
                  key={type}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {getTypeIcon(type)}{' '}
                  {EVENT_TYPES.find(t => t.value === type)?.label}
                </span>
              ))}
              {localFilters.statuses.map(status => (
                <span
                  key={status}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {getStatusIcon(status)}{' '}
                  {EVENT_STATUSES.find(s => s.value === status)?.label}
                </span>
              ))}
              {localFilters.priorities.map(priority => (
                <span
                  key={priority}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {getPriorityIcon(priority)}{' '}
                  {EVENT_PRIORITIES.find(p => p.value === priority)?.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
