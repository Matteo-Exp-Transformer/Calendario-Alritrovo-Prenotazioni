export interface CalendarNotification {
  id: string
  type: 'email' | 'push' | 'sms' | 'in_app'
  timing: 'at_time' | 'minutes_before' | 'hours_before' | 'days_before'
  value?: number
  enabled: boolean
}

export interface CalendarFilter {
  sources: CalendarEvent['source'][]
  priorities: CalendarEvent['extendedProps']['priority'][]
  statuses: CalendarEvent['extendedProps']['status'][]
  assignedTo?: string[]
}

// Calendar Event Types for HACCP Business Manager
// Unified schema for tasks, maintenances, and custom events

export type CalendarEventType =
  | 'maintenance'
  | 'general_task'
  | 'temperature_reading'
  | 'product_expiry'
  | 'custom'
export type CalendarEventStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled'
export type CalendarEventPriority = 'low' | 'medium' | 'high' | 'critical'

export interface CalendarEventMetadata {
  task_id?: string
  maintenance_id?: string
  temperature_reading_id?: string
  conservation_point_id?: string
  product_id?: string
  staff_id?: string
  department_id?: string
  notes?: string
  completion_data?: Record<string, any>
  assigned_to_staff_id?: string
  assigned_to_role?: string
  assigned_to_category?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end?: Date
  allDay?: boolean

  // Event classification
  type: CalendarEventType
  status: CalendarEventStatus
  priority: CalendarEventPriority
  source?:
    | 'maintenance'
    | 'task'
    | 'training'
    | 'inventory'
    | 'meeting'
    | 'temperature_reading'
    | 'general_task'
    | 'custom'
  sourceId?: string

  // Assignment and organization
  assigned_to: string[] // Staff IDs
  department_id?: string
  conservation_point_id?: string

  // Recurrence
  recurring: boolean
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
    interval: number // Every N days/weeks/months
    days_of_week?: number[] // For weekly: [0,1,2,3,4,5,6] (Sunday = 0)
    day_of_month?: number // For monthly
    end_date?: Date
    max_occurrences?: number
  }

  // Visual styling
  backgroundColor: string
  borderColor: string
  textColor: string

  // Extended metadata for FullCalendar compatibility
  extendedProps: {
    description?: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
    status?: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
    assignedTo?: string[]
    location?: string
    category?: string
    color?: string
    isRecurring?: boolean
    recurrenceRule?: string
    notifications?: CalendarNotification[]
    metadata?: Record<string, any>
  }

  // Extended metadata
  metadata: CalendarEventMetadata

  // Audit fields
  created_at: Date
  updated_at: Date
  created_by: string
  company_id: string
}

// Color scheme for different event types
export const EVENT_COLORS = {
  maintenance: {
    backgroundColor: '#FEF3C7', // yellow-100
    borderColor: '#F59E0B', // yellow-500
    textColor: '#92400E', // yellow-800
  },
  general_task: {
    backgroundColor: '#DBEAFE', // blue-100
    borderColor: '#3B82F6', // blue-500
    textColor: '#1E40AF', // blue-800
  },
  temperature_reading: {
    backgroundColor: '#DCFCE7', // green-100
    borderColor: '#10B981', // green-500
    textColor: '#065F46', // green-800
  },
  product_expiry: {
    backgroundColor: '#FEE2E2', // red-100
    borderColor: '#EF4444', // red-500
    textColor: '#991B1B', // red-800
  },
  custom: {
    backgroundColor: '#F3E8FF', // purple-100
    borderColor: '#8B5CF6', // purple-500
    textColor: '#5B21B6', // purple-800
  },
} as const

// Status colors
export const STATUS_COLORS = {
  pending: {
    backgroundColor: '#F3F4F6', // gray-100
    borderColor: '#6B7280', // gray-500
    textColor: '#374151', // gray-700
  },
  in_progress: {
    backgroundColor: '#DBEAFE', // blue-100
    borderColor: '#3B82F6', // blue-500
    textColor: '#1E40AF', // blue-800
  },
  completed: {
    backgroundColor: '#DCFCE7', // green-100
    borderColor: '#10B981', // green-500
    textColor: '#065F46', // green-800
  },
  overdue: {
    backgroundColor: '#FEE2E2', // red-100
    borderColor: '#EF4444', // red-500
    textColor: '#991B1B', // red-800
  },
  cancelled: {
    backgroundColor: '#F9FAFB', // gray-50
    borderColor: '#9CA3AF', // gray-400
    textColor: '#6B7280', // gray-500
  },
} as const

// Priority indicators
export const PRIORITY_COLORS = {
  low: {
    backgroundColor: '#F0FDF4', // green-50
    borderColor: '#22C55E', // green-500
    textColor: '#166534', // green-700
  },
  medium: {
    backgroundColor: '#FFFBEB', // amber-50
    borderColor: '#F59E0B', // amber-500
    textColor: '#92400E', // amber-700
  },
  high: {
    backgroundColor: '#FEF2F2', // red-50
    borderColor: '#EF4444', // red-500
    textColor: '#991B1B', // red-700
  },
  critical: {
    backgroundColor: '#7F1D1D', // red-900
    borderColor: '#991B1B', // red-800
    textColor: '#FFFFFF', // white
  },
} as const

// FullCalendar Event interface (for FullCalendar integration)
export interface FullCalendarEvent {
  id: string
  title: string
  start: string | Date
  end?: string | Date
  allDay?: boolean
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps?: {
    type: CalendarEventType
    status: CalendarEventStatus
    priority: CalendarEventPriority
    assigned_to: string[]
    department_id?: string
    conservation_point_id?: string
    metadata: CalendarEventMetadata
    originalEvent: CalendarEvent
  }
}

// Filter options for calendar views
export interface CalendarFilters {
  types: CalendarEventType[]
  statuses: CalendarEventStatus[]
  priorities: CalendarEventPriority[]
  departments: string[]
  assignees: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface CalendarSettings {
  defaultView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'
  weekStartsOn: 0 | 1
  timeFormat: '12h' | '24h'
  firstDayOfWeek: number
  colorScheme: Record<NonNullable<CalendarEvent['source']>, string>
  businessHours: {
    daysOfWeek: number[]
    startTime: string
    endTime: string
  }
  notifications: {
    enabled: boolean
    defaultTimings: CalendarNotification['timing'][]
  }
}

// Calendar view configuration
export interface CalendarViewConfig {
  defaultView: 'multiMonthYear' | 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'
  headerToolbar: {
    left: string
    center: string
    right: string
  }
  height: number | 'auto'
  locale: string
  firstDay: number // 0 = Sunday, 1 = Monday
  slotMinTime: string
  slotMaxTime: string
  businessHours: {
    daysOfWeek: number[]
    startTime: string
    endTime: string
  }
  notifications: {
    enabled: boolean
    defaultTimings: CalendarNotification['timing'][]
  }
  colorScheme: Record<NonNullable<CalendarEvent['source']>, string>
}

// Event creation/editing interfaces
export interface CreateCalendarEventInput {
  title: string
  description?: string
  start: Date
  end?: Date
  allDay?: boolean
  type: CalendarEventType
  priority: CalendarEventPriority
  assigned_to: string[]
  department_id?: string
  conservation_point_id?: string
  recurring?: boolean
  recurrence_pattern?: CalendarEvent['recurrence_pattern']
  metadata?: Partial<CalendarEventMetadata>
}

export interface UpdateCalendarEventInput
  extends Partial<CreateCalendarEventInput> {
  id: string
  status?: CalendarEventStatus
}

// Quick action interfaces
export interface QuickActionConfig {
  label: string
  icon: string
  action: 'complete' | 'reschedule' | 'assign' | 'cancel' | 'edit' | 'delete'
  requiresConfirmation: boolean
  allowedRoles: string[]
  showFor: {
    types: CalendarEventType[]
    statuses: CalendarEventStatus[]
  }
}

export const DEFAULT_QUICK_ACTIONS: QuickActionConfig[] = [
  {
    label: 'Completa',
    icon: 'check',
    action: 'complete',
    requiresConfirmation: false,
    allowedRoles: ['admin', 'responsabile', 'dipendente'],
    showFor: {
      types: ['maintenance', 'general_task', 'temperature_reading'],
      statuses: ['pending', 'overdue'],
    },
  },
  {
    label: 'Riprogramma',
    icon: 'clock',
    action: 'reschedule',
    requiresConfirmation: false,
    allowedRoles: ['admin', 'responsabile'],
    showFor: {
      types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
      statuses: ['pending', 'overdue'],
    },
  },
  {
    label: 'Riassegna',
    icon: 'user',
    action: 'assign',
    requiresConfirmation: false,
    allowedRoles: ['admin', 'responsabile'],
    showFor: {
      types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
      statuses: ['pending', 'overdue'],
    },
  },
  {
    label: 'Annulla',
    icon: 'x',
    action: 'cancel',
    requiresConfirmation: true,
    allowedRoles: ['admin', 'responsabile'],
    showFor: {
      types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
      statuses: ['pending', 'overdue'],
    },
  },
  {
    label: 'Modifica',
    icon: 'edit',
    action: 'edit',
    requiresConfirmation: false,
    allowedRoles: ['admin', 'responsabile'],
    showFor: {
      types: ['maintenance', 'general_task', 'temperature_reading', 'custom'],
      statuses: ['pending', 'overdue', 'completed'],
    },
  },
  {
    label: 'Elimina',
    icon: 'trash',
    action: 'delete',
    requiresConfirmation: true,
    allowedRoles: ['admin'],
    showFor: {
      types: ['custom'],
      statuses: ['pending', 'cancelled'],
    },
  },
]

// ============================================================================
// COMPANY CALENDAR SETTINGS
// ============================================================================

/**
 * SECURITY NOTICE:
 * - Tutti i dati configurazione calendario sono isolati per company_id
 * - Le RLS policies sul database garantiscono che ogni azienda veda SOLO i propri dati
 * - Nessun dato può essere condiviso tra aziende diverse (multi-tenant isolation)
 */

/**
 * Fascia oraria singola
 * Rappresenta un intervallo di apertura (es: 09:00-22:00)
 */
export interface BusinessHourSlot {
  /** Orario apertura in formato HH:mm (es: "09:00") */
  open: string

  /** Orario chiusura in formato HH:mm (es: "22:00") */
  close: string
}

/**
 * Orari di apertura per tutti i giorni della settimana
 * Key: numero giorno (0=domenica, 1=lunedì, ..., 6=sabato)
 * Value: array di fasce orarie (1-2 fasce per giorno)
 *
 * @example
 * {
 *   "1": [{ "open": "09:00", "close": "22:00" }],                    // Lunedì: 1 fascia
 *   "2": [{ "open": "08:00", "close": "12:30" }, { "open": "16:30", "close": "23:00" }]  // Martedì: 2 fasce
 * }
 */
export interface BusinessHours {
  [weekday: string]: BusinessHourSlot[]
}

/**
 * Configurazione calendario aziendale completa
 *
 * SECURITY:
 * - RLS sul database filtra automaticamente per company_id dell'utente autenticato
 * - Solo membri azienda possono leggere (policy: is_company_member)
 * - Solo admin possono creare (policy: is_admin)
 * - Solo admin/responsabile possono modificare (policy: has_management_role)
 */
export interface CompanyCalendarSettings {
  /** ID univoco configurazione */
  id: string

  /**
   * ID azienda
   * ⚠️ RLS: Automaticamente filtrato per active_company_id dell'utente
   */
  company_id: string

  /**
   * Data inizio anno lavorativo
   * Formato: YYYY-MM-DD (es: "2025-01-01")
   * Il calendario mostrerà eventi a partire da questa data
   */
  fiscal_year_start: string

  /**
   * Data fine anno lavorativo
   * Formato: YYYY-MM-DD (es: "2025-12-31")
   * Il calendario mostrerà eventi fino a questa data
   */
  fiscal_year_end: string

  /**
   * Array di date di chiusura (festività, manutenzioni)
   * Formato: YYYY-MM-DD per ogni data
   * Nessun evento verrà schedulato in questi giorni
   *
   * @example ["2025-08-15", "2025-12-25", "2025-12-26"]
   */
  closure_dates: string[]

  /**
   * Giorni della settimana in cui l'azienda è aperta
   * Valori: 0-6 (0=domenica, 1=lunedì, ..., 6=sabato)
   *
   * @example [1,2,3,4,5] = lunedì-venerdì
   * @example [1,2,3,4,5,6] = lunedì-sabato
   */
  open_weekdays: number[]

  /**
   * Orari di apertura per ogni giorno della settimana
   * Supporta 1-2 fasce orarie per giorno
   */
  business_hours: BusinessHours

  /**
   * Flag che indica se il calendario è stato configurato
   * false = mostra wizard configurazione
   * true = calendario attivo
   */
  is_configured: boolean

  /** Data creazione configurazione */
  created_at: Date

  /** Data ultima modifica (auto-aggiornato da trigger DB) */
  updated_at: Date
}

/**
 * Input per creazione/aggiornamento configurazione calendario
 * Usato nel form di onboarding e settings
 */
export interface CalendarConfigInput {
  /** Data inizio anno lavorativo (YYYY-MM-DD) */
  fiscal_year_start: string

  /** Data fine anno lavorativo (YYYY-MM-DD) */
  fiscal_year_end: string

  /** Array di date chiusura (YYYY-MM-DD[]) */
  closure_dates: string[]

  /** Giorni settimana aperti (0-6[]) */
  open_weekdays: number[]

  /** Orari apertura */
  business_hours: BusinessHours
}

/**
 * Costanti: Giorni della settimana
 */
export const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const

/**
 * Nomi giorni settimana in italiano
 * Key: numero giorno (0-6)
 * Value: nome italiano
 */
export const WEEKDAY_NAMES = {
  0: 'Domenica',
  1: 'Lunedì',
  2: 'Martedì',
  3: 'Mercoledì',
  4: 'Giovedì',
  5: 'Venerdì',
  6: 'Sabato',
} as const

/**
 * Nomi brevi giorni settimana in italiano
 */
export const WEEKDAY_NAMES_SHORT = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Gio',
  5: 'Ven',
  6: 'Sab',
} as const

/**
 * Tipo per giorni settimana
 */
export type Weekday = (typeof WEEKDAYS)[number]

/**
 * Configurazione calendario di default
 * Usata quando l'azienda non ha ancora configurato il calendario
 */
export const DEFAULT_CALENDAR_CONFIG: CalendarConfigInput = {
  fiscal_year_start: `${new Date().getFullYear()}-01-01`,
  fiscal_year_end: `${new Date().getFullYear()}-12-31`,
  closure_dates: [],
  open_weekdays: [1, 2, 3, 4, 5, 6], // Lunedì-Sabato
  business_hours: {
    '1': [{ open: '09:00', close: '22:00' }], // Lunedì
    '2': [{ open: '09:00', close: '22:00' }], // Martedì
    '3': [{ open: '09:00', close: '22:00' }], // Mercoledì
    '4': [{ open: '09:00', close: '22:00' }], // Giovedì
    '5': [{ open: '09:00', close: '22:00' }], // Venerdì
    '6': [{ open: '09:00', close: '22:00' }], // Sabato
  },
}

/**
 * Errori di validazione configurazione calendario
 */
export interface CalendarConfigValidationErrors {
  fiscal_year_start?: string
  fiscal_year_end?: string
  closure_dates?: string
  open_weekdays?: string
  business_hours?: string
}

/**
 * Helper type: Status configurazione calendario
 */
export type CalendarConfigStatus =
  | 'not_configured' // Calendario non ancora configurato
  | 'configured' // Calendario configurato e attivo
  | 'error' // Errore nel caricamento configurazione
