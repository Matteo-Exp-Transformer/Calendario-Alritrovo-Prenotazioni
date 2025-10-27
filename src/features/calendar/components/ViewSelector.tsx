import { useState, useEffect } from 'react'
import { Calendar, CalendarDays, CalendarClock, CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarViewType = 'year' | 'month' | 'week' | 'day'

export interface ViewSelectorProps {
  currentView: CalendarViewType
  onChange: (view: CalendarViewType) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const STORAGE_KEY = 'calendar-view-preference'

const VIEW_OPTIONS: Array<{
  value: CalendarViewType
  label: string
  icon: typeof Calendar
}> = [
  { value: 'year', label: 'Anno', icon: CalendarRange },
  { value: 'month', label: 'Mese', icon: Calendar },
  { value: 'week', label: 'Settimana', icon: CalendarDays },
  { value: 'day', label: 'Giorno', icon: CalendarClock },
]

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-2',
  lg: 'text-base px-4 py-2.5',
}

const ICON_SIZE = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

function loadViewPreference(): CalendarViewType {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['year', 'month', 'week', 'day'].includes(stored)) {
      return stored as CalendarViewType
    }
  } catch {
    // Ignore errors
  }
  return 'month'
}

function saveViewPreference(view: CalendarViewType): void {
  try {
    localStorage.setItem(STORAGE_KEY, view)
  } catch (error) {
    console.error('Failed to save view preference:', error)
  }
}

export function ViewSelector({
  currentView,
  onChange,
  className,
  size = 'md',
}: ViewSelectorProps) {
  const handleViewChange = (view: CalendarViewType) => {
    onChange(view)
    saveViewPreference(view)
  }

  return (
    <div
      className={cn(
        'inline-flex items-center bg-white rounded-lg border border-gray-200 shadow-sm',
        className
      )}
      role="group"
      aria-label="Vista calendario"
    >
      {VIEW_OPTIONS.map(option => {
        const Icon = option.icon
        const isSelected = currentView === option.value

        return (
          <button
            key={option.value}
            onClick={() => handleViewChange(option.value)}
            className={cn(
              'inline-flex items-center gap-2 font-medium transition-all border-r border-gray-200 last:border-r-0 first:rounded-l-lg last:rounded-r-lg',
              SIZE_CLASSES[size],
              isSelected
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
            aria-pressed={isSelected}
            aria-label={`Vista ${option.label}`}
          >
            <Icon className={cn(ICON_SIZE[size])} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function useCalendarView(
  initialView?: CalendarViewType
): [CalendarViewType, (view: CalendarViewType) => void] {
  const [view, setView] = useState<CalendarViewType>(
    initialView || loadViewPreference()
  )

  useEffect(() => {
    saveViewPreference(view)
  }, [view])

  return [view, setView]
}

export interface CompactViewSelectorProps {
  currentView: CalendarViewType
  onChange: (view: CalendarViewType) => void
  className?: string
}

export function CompactViewSelector({
  currentView,
  onChange,
  className,
}: CompactViewSelectorProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {VIEW_OPTIONS.map(option => {
        const Icon = option.icon
        const isSelected = currentView === option.value

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isSelected
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            aria-pressed={isSelected}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
