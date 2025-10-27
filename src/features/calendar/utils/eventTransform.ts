import {
  CalendarEvent,
  FullCalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventPriority,
  EVENT_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from '@/types/calendar'

/**
 * Transform CalendarEvent to FullCalendar format
 */
export function transformToFullCalendarEvent(
  event: CalendarEvent
): FullCalendarEvent {
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: event.backgroundColor,
    borderColor: event.borderColor,
    textColor: event.textColor,
    extendedProps: {
      type: event.type,
      status: event.status,
      priority: event.priority,
      assigned_to: event.assigned_to,
      department_id: event.department_id,
      conservation_point_id: event.conservation_point_id,
      metadata: event.metadata,
      originalEvent: event,
    },
  }
}

/**
 * Transform multiple CalendarEvents to FullCalendar format
 */
export function transformToFullCalendarEvents(
  events: CalendarEvent[]
): FullCalendarEvent[] {
  return events.map(transformToFullCalendarEvent)
}

/**
 * Get colors for an event based on type, status, and priority
 */
export function getEventColors(
  type: CalendarEventType,
  status: CalendarEventStatus,
  priority: CalendarEventPriority
): { backgroundColor: string; borderColor: string; textColor: string } {
  // Priority overrides for critical events
  if (priority === 'critical') {
    return PRIORITY_COLORS.critical
  }

  // Status overrides for completed/overdue/cancelled
  if (status === 'completed') {
    return STATUS_COLORS.completed
  }

  if (status === 'overdue') {
    return STATUS_COLORS.overdue
  }

  if (status === 'cancelled') {
    return STATUS_COLORS.cancelled
  }

  // High priority gets special treatment
  if (priority === 'high') {
    return {
      backgroundColor: PRIORITY_COLORS.high.backgroundColor,
      borderColor: EVENT_COLORS[type].borderColor,
      textColor: PRIORITY_COLORS.high.textColor,
    }
  }

  // Default to type colors
  return EVENT_COLORS[type]
}

/**
 * Generate event title with status and priority indicators
 */
export function generateEventTitle(
  baseTitle: string,
  status: CalendarEventStatus,
  priority: CalendarEventPriority,
  assignedCount: number
): string {
  let title = baseTitle

  // Add priority indicator
  if (priority === 'critical') {
    title = `🔴 ${title}`
  } else if (priority === 'high') {
    title = `🟠 ${title}`
  } else if (priority === 'medium') {
    title = `🟡 ${title}`
  }

  // Add status indicator
  if (status === 'completed') {
    title = `✅ ${title}`
  } else if (status === 'overdue') {
    title = `⚠️ ${title}`
  } else if (status === 'cancelled') {
    title = `❌ ${title}`
  }

  // Add assignment indicator
  if (assignedCount > 1) {
    title = `${title} (${assignedCount})`
  }

  return title
}

/**
 * Check if an event is overdue
 */
export function isEventOverdue(event: CalendarEvent): boolean {
  if (event.status === 'completed' || event.status === 'cancelled') {
    return false
  }

  const now = new Date()
  const eventEnd = event.end || event.start

  return eventEnd < now
}

/**
 * Update event status based on current time
 */
export function updateEventStatus(event: CalendarEvent): CalendarEvent {
  if (isEventOverdue(event) && event.status === 'pending') {
    return {
      ...event,
      status: 'overdue',
      backgroundColor: STATUS_COLORS.overdue.backgroundColor,
      borderColor: STATUS_COLORS.overdue.borderColor,
      textColor: STATUS_COLORS.overdue.textColor,
    }
  }

  return event
}

/**
 * Filter events based on criteria
 */
export function filterEvents(
  events: CalendarEvent[],
  filters: {
    types?: CalendarEventType[]
    statuses?: CalendarEventStatus[]
    priorities?: CalendarEventPriority[]
    departments?: string[]
    assignees?: string[]
    searchTerm?: string
  }
): CalendarEvent[] {
  return events.filter(event => {
    // Type filter
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(event.type)) return false
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(event.status)) return false
    }

    // Priority filter
    if (filters.priorities && filters.priorities.length > 0) {
      if (!filters.priorities.includes(event.priority)) return false
    }

    // Department filter
    if (filters.departments && filters.departments.length > 0) {
      if (
        !event.department_id ||
        !filters.departments.includes(event.department_id)
      ) {
        return false
      }
    }

    // Assignee filter
    if (filters.assignees && filters.assignees.length > 0) {
      const hasAssignee = filters.assignees.some(assigneeId =>
        event.assigned_to.includes(assigneeId)
      )
      if (!hasAssignee) return false
    }

    // Search term filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesTitle = event.title.toLowerCase().includes(searchLower)
      const matchesDescription = event.description
        ?.toLowerCase()
        .includes(searchLower)
      const matchesNotes = event.metadata.notes
        ?.toLowerCase()
        .includes(searchLower)

      if (!matchesTitle && !matchesDescription && !matchesNotes) {
        return false
      }
    }

    return true
  })
}

/**
 * Sort events by priority and start time
 */
export function sortEventsByPriority(events: CalendarEvent[]): CalendarEvent[] {
  const priorityOrder: Record<CalendarEventPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return [...events].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then by start time
    return a.start.getTime() - b.start.getTime()
  })
}

/**
 * Group events by type
 */
export function groupEventsByType(
  events: CalendarEvent[]
): Record<CalendarEventType, CalendarEvent[]> {
  return events.reduce(
    (groups, event) => {
      if (!groups[event.type]) {
        groups[event.type] = []
      }
      groups[event.type].push(event)
      return groups
    },
    {} as Record<CalendarEventType, CalendarEvent[]>
  )
}

/**
 * Group events by status
 */
export function groupEventsByStatus(
  events: CalendarEvent[]
): Record<CalendarEventStatus, CalendarEvent[]> {
  return events.reduce(
    (groups, event) => {
      if (!groups[event.status]) {
        groups[event.status] = []
      }
      groups[event.status].push(event)
      return groups
    },
    {} as Record<CalendarEventStatus, CalendarEvent[]>
  )
}

/**
 * Get events for a specific date range
 */
export function getEventsInRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = event.start
    const eventEnd = event.end || event.start

    // Check if event overlaps with the range
    return eventStart <= endDate && eventEnd >= startDate
  })
}

/**
 * Calculate event statistics
 */
export function calculateEventStats(events: CalendarEvent[]) {
  const total = events.length

  const byStatus = groupEventsByStatus(events)
  const byType = groupEventsByType(events)

  const completed = byStatus.completed?.length || 0
  const pending = byStatus.pending?.length || 0
  const overdue = byStatus.overdue?.length || 0
  const cancelled = byStatus.cancelled?.length || 0

  const completionRate = total > 0 ? (completed / total) * 100 : 0
  const overdueRate = total > 0 ? (overdue / total) * 100 : 0

  return {
    total,
    completed,
    pending,
    overdue,
    cancelled,
    completionRate,
    overdueRate,
    byType,
    byStatus,
  }
}
