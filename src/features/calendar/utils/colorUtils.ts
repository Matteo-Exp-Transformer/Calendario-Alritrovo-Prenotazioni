import {
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventPriority,
  EVENT_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from '@/types/calendar'

/**
 * Get color scheme for event type
 */
export function getTypeColors(type: CalendarEventType) {
  return EVENT_COLORS[type]
}

/**
 * Get color scheme for event status
 */
export function getStatusColors(status: CalendarEventStatus) {
  return STATUS_COLORS[status]
}

/**
 * Get color scheme for event priority
 */
export function getPriorityColors(priority: CalendarEventPriority) {
  return PRIORITY_COLORS[priority]
}

/**
 * Get the appropriate color based on type, status, and priority hierarchy
 */
export function getEventColor(
  type: CalendarEventType,
  status: CalendarEventStatus,
  priority: CalendarEventPriority
): { backgroundColor: string; borderColor: string; textColor: string } {
  // Critical priority always takes precedence
  if (priority === 'critical') {
    return PRIORITY_COLORS.critical
  }

  // Status-based colors for specific states
  switch (status) {
    case 'completed':
      return STATUS_COLORS.completed
    case 'overdue':
      return STATUS_COLORS.overdue
    case 'cancelled':
      return STATUS_COLORS.cancelled
    case 'pending':
      // For pending, use priority or type colors
      if (priority === 'high') {
        return {
          backgroundColor: PRIORITY_COLORS.high.backgroundColor,
          borderColor: EVENT_COLORS[type].borderColor,
          textColor: PRIORITY_COLORS.high.textColor,
        }
      }
      return EVENT_COLORS[type]
    default:
      return EVENT_COLORS[type]
  }
}

/**
 * Generate CSS class names for event styling
 */
export function getEventClassNames(
  type: CalendarEventType,
  status: CalendarEventStatus,
  priority: CalendarEventPriority
): string[] {
  const classes = [
    `event-type-${type}`,
    `event-status-${status}`,
    `event-priority-${priority}`,
  ]

  // Add special classes for visual emphasis
  if (priority === 'critical') {
    classes.push('event-critical')
  }

  if (status === 'overdue') {
    classes.push('event-overdue', 'animate-pulse')
  }

  if (status === 'completed') {
    classes.push('event-completed')
  }

  return classes
}

/**
 * Get icon for event type
 */
export function getTypeIcon(type: CalendarEventType): string {
  const icons = {
    maintenance: '🔧',
    general_task: '📋',
    temperature_reading: '🌡️',
    product_expiry: '📦',
    custom: '📌',
  }

  return icons[type] || '📌'
}

/**
 * Get icon for event status
 */
export function getStatusIcon(status: CalendarEventStatus): string {
  const icons = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    overdue: '⚠️',
    cancelled: '❌',
  }

  return icons[status] || '⏳'
}

/**
 * Get icon for event priority
 */
export function getPriorityIcon(priority: CalendarEventPriority): string {
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  }

  return icons[priority] || '🟢'
}

/**
 * Generate Tailwind CSS classes for event badge
 */
export function getEventBadgeClasses(
  type: CalendarEventType,
  status: CalendarEventStatus,
  priority: CalendarEventPriority
): string {
  let baseClasses =
    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'

  // Priority-based styling
  if (priority === 'critical') {
    return `${baseClasses} bg-red-900 text-white border border-red-800`
  }

  // Status-based styling
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
    case 'overdue':
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200`
    case 'cancelled':
      return `${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`
    case 'pending':
      if (priority === 'high') {
        return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`
      }
    // Fall through to type-based styling
  }

  // Type-based styling for pending events
  switch (type) {
    case 'maintenance':
      return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`
    case 'general_task':
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`
    case 'temperature_reading':
      return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
    case 'custom':
      return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`
  }
}

/**
 * Generate progress bar color based on completion status
 */
export function getProgressBarColor(completionRate: number): string {
  if (completionRate >= 90) return 'bg-green-500'
  if (completionRate >= 70) return 'bg-blue-500'
  if (completionRate >= 50) return 'bg-yellow-500'
  if (completionRate >= 30) return 'bg-orange-500'
  return 'bg-red-500'
}

/**
 * Generate color for department-based grouping
 */
export function getDepartmentColor(departmentId: string): {
  backgroundColor: string
  borderColor: string
} {
  // Generate consistent colors based on department ID hash
  const colors = [
    { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }, // yellow
    { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' }, // blue
    { backgroundColor: '#DCFCE7', borderColor: '#10B981' }, // green
    { backgroundColor: '#F3E8FF', borderColor: '#8B5CF6' }, // purple
    { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }, // red
    { backgroundColor: '#E0F2FE', borderColor: '#0891B2' }, // sky
    { backgroundColor: '#FDF2F8', borderColor: '#EC4899' }, // pink
    { backgroundColor: '#F0FDF4', borderColor: '#22C55E' }, // emerald
  ]

  // Simple hash function to get consistent color for department
  let hash = 0
  for (let i = 0; i < departmentId.length; i++) {
    const char = departmentId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * Adjust color opacity for different states
 */
export function adjustColorOpacity(color: string, opacity: number): string {
  // Convert hex to rgba if needed
  if (color.startsWith('#')) {
    const hex = color.substring(1)
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // If already rgba, adjust opacity
  if (color.startsWith('rgba')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`)
  }

  // If rgb, convert to rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
  }

  return color
}
