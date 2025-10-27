import { Check } from 'lucide-react'
import type { CalendarFilter as CalendarFilterType } from '@/types/calendar'

interface CalendarFilterProps {
  filter: CalendarFilterType
  onFilterChange: (filter: Partial<CalendarFilterType>) => void
  totalEvents: number
}

const sourceLabels = {
  maintenance: 'Manutenzioni',
  task: 'Attività',
  training: 'Formazione',
  inventory: 'Inventario',
  meeting: 'Riunioni',
}

const priorityLabels = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
}

const statusLabels = {
  scheduled: 'Programmato',
  in_progress: 'In Corso',
  completed: 'Completato',
  overdue: 'In Ritardo',
  cancelled: 'Annullato',
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export function CalendarFilter({
  filter,
  onFilterChange,
  totalEvents,
}: CalendarFilterProps) {
  const toggleSource = (source: keyof typeof sourceLabels) => {
    const newSources = filter.sources.includes(source)
      ? filter.sources.filter(s => s !== source)
      : [...filter.sources, source]
    onFilterChange({ sources: newSources })
  }

  const togglePriority = (priority: keyof typeof priorityLabels) => {
    const newPriorities = filter.priorities.includes(priority)
      ? filter.priorities.filter(p => p !== priority)
      : [...filter.priorities, priority]
    onFilterChange({ priorities: newPriorities })
  }

  const toggleStatus = (status: keyof typeof statusLabels) => {
    const newStatuses = filter.statuses.includes(status)
      ? filter.statuses.filter(s => s !== status)
      : [...filter.statuses, status]
    onFilterChange({ statuses: newStatuses })
  }

  const clearAllFilters = () => {
    onFilterChange({
      sources: Object.keys(sourceLabels) as Array<keyof typeof sourceLabels>,
      priorities: Object.keys(priorityLabels) as Array<
        keyof typeof priorityLabels
      >,
      statuses: Object.keys(statusLabels) as Array<keyof typeof statusLabels>,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Visualizzati {totalEvents} eventi
        </div>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Mostra Tutto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sources Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Tipologia Eventi
          </h3>
          <div className="space-y-2">
            {Object.entries(sourceLabels).map(([source, label]) => {
              const isSelected = filter.sources.includes(source as any)
              return (
                <button
                  key={source}
                  onClick={() =>
                    toggleSource(source as keyof typeof sourceLabels)
                  }
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Priorities Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Priorità</h3>
          <div className="space-y-2">
            {Object.entries(priorityLabels).map(([priority, label]) => {
              const isSelected = filter.priorities.includes(priority as any)
              return (
                <button
                  key={priority}
                  onClick={() =>
                    togglePriority(priority as keyof typeof priorityLabels)
                  }
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? `${priorityColors[priority as keyof typeof priorityColors]} border`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Stato</h3>
          <div className="space-y-2">
            {Object.entries(statusLabels).map(([status, label]) => {
              const isSelected = filter.statuses.includes(status as any)
              return (
                <button
                  key={status}
                  onClick={() =>
                    toggleStatus(status as keyof typeof statusLabels)
                  }
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? `${statusColors[status as keyof typeof statusColors]} border`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
