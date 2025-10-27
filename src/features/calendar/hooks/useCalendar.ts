import { useState, useCallback, useMemo } from 'react'
import {
  CalendarFilters,
  CalendarViewConfig,
  CalendarEvent,
} from '@/types/calendar'
import { useCalendarEvents } from './useCalendarEvents'
import { useAggregatedEvents } from './useAggregatedEvents'
import { useFilteredEvents } from './useFilteredEvents'
import { filterEvents, sortEventsByPriority } from '../utils/eventTransform'

const defaultFilters: CalendarFilters = {
  types: [],
  statuses: [],
  priorities: [],
  departments: [],
  assignees: [],
}

const defaultViewConfig: CalendarViewConfig = {
  defaultView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  height: 'auto',
  locale: 'it',
  firstDay: 1, // Monday
  slotMinTime: '06:00:00',
  slotMaxTime: '24:00:00',
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
    startTime: '08:00',
    endTime: '22:00',
  },
  notifications: {
    enabled: true,
    defaultTimings: ['minutes_before', 'hours_before'],
  },
  colorScheme: {
    maintenance: '#F59E0B',
    task: '#3B82F6',
    training: '#10B981',
    inventory: '#8B5CF6',
    meeting: '#EF4444',
    temperature_reading: '#06B6D4',
    general_task: '#84CC16',
    custom: '#F97316',
  },
}

/**
 * Main calendar management hook
 * Combines event management with filtering, view configuration, and UI state
 */
export function useCalendar(config?: Partial<CalendarViewConfig>) {
  const [filters, setFilters] = useState<CalendarFilters>(defaultFilters)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [currentView, setCurrentView] = useState<string>(
    config?.defaultView || 'dayGridMonth'
  )
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const {
    events: customEvents,
    isLoading: customLoading,
    error: customError,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
    refetch,
  } = useCalendarEvents()

  const {
    events: aggregatedEvents,
    isLoading: aggregatedLoading,
    sources,
  } = useAggregatedEvents()

  const allEventsUnfiltered = useMemo(() => {
    return [...customEvents, ...aggregatedEvents]
  }, [customEvents, aggregatedEvents])

  const {
    filteredEvents: userFilteredEvents,
    isLoading: filterLoading,
    canViewAllEvents,
    userStaffMember,
  } = useFilteredEvents(allEventsUnfiltered)

  const isLoading = customLoading || aggregatedLoading || filterLoading
  const error = customError

  // Merge view configuration
  const viewConfig = useMemo(() => {
    return { ...defaultViewConfig, ...config }
  }, [config])

  const filteredEvents = useMemo(() => {
    if (!userFilteredEvents) return []

    const filtered = filterEvents(userFilteredEvents, {
      types: filters.types.length > 0 ? filters.types : undefined,
      statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
      priorities:
        filters.priorities.length > 0 ? filters.priorities : undefined,
      departments:
        filters.departments.length > 0 ? filters.departments : undefined,
      assignees: filters.assignees.length > 0 ? filters.assignees : undefined,
    })

    // Sort by priority and time
    return sortEventsByPriority(filtered)
  }, [userFilteredEvents, filters])

  // Calendar event handlers
  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
  }, [])

  const handleEventUpdate = useCallback(
    (updatedEvent: CalendarEvent) => {
      updateEvent(updatedEvent)
      setSelectedEvent(null)
    },
    [updateEvent]
  )

  const handleEventDelete = useCallback(
    (eventId: string) => {
      deleteEvent(eventId)
      setSelectedEvent(null)
    },
    [deleteEvent]
  )

  const handleDateSelect = useCallback(
    (start: Date, end: Date) => {
      // Create a new event with the selected date range
      createEvent({
        title: 'Nuovo Evento',
        start,
        end,
        allDay: start.getHours() === 0 && end.getHours() === 0,
        type: 'custom',
        priority: 'medium',
        assigned_to: [],
      })
    },
    [createEvent]
  )

  // Filter management
  const updateFilters = useCallback((newFilters: CalendarFilters) => {
    setFilters(newFilters)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.departments.length > 0 ||
      filters.assignees.length > 0
    )
  }, [filters])

  // Quick filter presets
  const applyQuickFilter = useCallback(
    (preset: string) => {
      switch (preset) {
        case 'pending':
          setFilters({
            ...filters,
            statuses: ['pending', 'overdue'],
          })
          break
        case 'overdue':
          setFilters({
            ...filters,
            statuses: ['overdue'],
          })
          break
        case 'high_priority':
          setFilters({
            ...filters,
            priorities: ['high', 'critical'],
          })
          break
        case 'maintenance':
          setFilters({
            ...filters,
            types: ['maintenance'],
          })
          break
        case 'today':
          setFilters({
            ...filters,
            dateRange: {
              start: new Date(),
              end: new Date(),
            },
          })
          break
        default:
          clearFilters()
      }
    },
    [filters, clearFilters]
  )

  // View management
  const changeView = useCallback((view: string) => {
    setCurrentView(view)
  }, [])

  const navigateToDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const todayEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return filteredEvents.filter(
      event => event.start >= today && event.start < tomorrow
    )
  }, [filteredEvents])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return filteredEvents.filter(
      event =>
        event.start >= now &&
        event.start <= futureDate &&
        event.status === 'pending'
    )
  }, [filteredEvents])

  const overdueEvents = useMemo(() => {
    return filteredEvents.filter(event => event.status === 'overdue')
  }, [filteredEvents])

  // Calendar utilities
  const getEventsForCurrentView = useCallback(() => {
    switch (currentView) {
      case 'dayGridMonth': {
        // Return events for the current month
        const monthStart = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        )
        const monthEnd = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        )
        return filteredEvents.filter(
          event => event.start >= monthStart && event.start <= monthEnd
        )
      }
      case 'timeGridWeek': {
        // Return events for the current week
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1) // Monday
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6) // Sunday
        return filteredEvents.filter(
          event => event.start >= weekStart && event.start <= weekEnd
        )
      }
      case 'timeGridDay': {
        const dayStart = new Date(currentDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setDate(dayEnd.getDate() + 1)
        return filteredEvents.filter(
          event => event.start >= dayStart && event.start < dayEnd
        )
      }
      default:
        return filteredEvents
    }
  }, [currentView, currentDate, filteredEvents])

  return {
    // Events data
    events: filteredEvents,
    allEvents: allEventsUnfiltered,
    selectedEvent,

    // User context
    canViewAllEvents,
    userStaffMember,
    eventSources: sources,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    // Event handlers
    onEventClick: handleEventClick,
    onEventUpdate: handleEventUpdate,
    onEventDelete: handleEventDelete,
    onDateSelect: handleDateSelect,
    createEvent,
    updateEvent: handleEventUpdate,
    deleteEvent: handleEventDelete,

    // Event selection
    setSelectedEvent,
    clearSelection: () => setSelectedEvent(null),

    // Filters
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    applyQuickFilter,

    // View configuration
    viewConfig,
    currentView,
    currentDate,
    changeView,
    navigateToDate,
    navigateToToday,

    // Statistics and summaries
    todayEvents,
    upcomingEvents,
    overdueEvents,
    getEventsForCurrentView,

    // Utilities
    refetch,
  }
}
