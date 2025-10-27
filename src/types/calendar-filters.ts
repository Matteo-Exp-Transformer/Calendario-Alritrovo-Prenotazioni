// ============================================================================
// CALENDAR FILTERS - Type Definitions
// ============================================================================
// Definizioni TypeScript per il nuovo sistema filtri calendario

/**
 * Stati possibili di un evento nel calendario
 */
export type EventStatus = 
  | 'to_complete'   // Da completare (oggi, non completato)
  | 'completed'     // Completato (oggi, completato)
  | 'overdue'       // In ritardo (fino a 7 giorni fa, non completato)
  | 'future'        // Eventi futuri (da domani in poi)

/**
 * Tipi di evento nel calendario
 */
export type EventType = 
  | 'generic_task'       // Mansioni/Attività generiche
  | 'maintenance'        // Manutenzioni (temperature, sanitization, defrosting)
  | 'product_expiry'     // Scadenze prodotti

/**
 * Interfaccia filtri calendario
 */
export interface CalendarFilters {
  departments: string[]      // UUID dei reparti selezionati
  statuses: EventStatus[]    // Stati evento selezionati
  types: EventType[]         // Tipi evento selezionati
}

/**
 * Filtri di default (tutti vuoti = mostra tutto)
 */
export const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  departments: [],
  statuses: [],
  types: []
}

/**
 * Labels per stati evento (UI)
 */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  to_complete: 'Da completare',
  completed: 'Completato',
  overdue: 'In ritardo',
  future: 'Eventi futuri'
}

/**
 * Labels per tipi evento (UI)
 */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  generic_task: 'Mansioni',
  maintenance: 'Manutenzioni',
  product_expiry: 'Scadenze Prodotti'
}

/**
 * Icone per tipi evento (UI)
 */
export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  generic_task: '📋',
  maintenance: '🔧',
  product_expiry: '📦'
}

/**
 * Colori per stati evento (UI)
 */
export const EVENT_STATUS_COLORS: Record<EventStatus, { bg: string; text: string; border: string }> = {
  to_complete: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  overdue: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300'
  },
  future: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  }
}

/**
 * Utility: Verifica se tutti i filtri sono vuoti (mostra tutto)
 */
export function areAllFiltersEmpty(filters: CalendarFilters): boolean {
  return (
    filters.departments.length === 0 &&
    filters.statuses.length === 0 &&
    filters.types.length === 0
  )
}

/**
 * Utility: Calcola stato evento in base alla data
 */
export function calculateEventStatus(
  eventDate: Date,
  isCompleted: boolean
): EventStatus {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const eventDay = new Date(eventDate)
  eventDay.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((now.getTime() - eventDay.getTime()) / (1000 * 60 * 60 * 24))

  // Futuro (da domani in poi) - eventi futuri NON possono essere completati
  if (diffDays < 0) {
    return 'future'
  }

  // Oggi
  if (diffDays === 0) {
    return isCompleted ? 'completed' : 'to_complete'
  }

  // Passato (in ritardo)
  if (diffDays > 0) {
    return isCompleted ? 'completed' : 'overdue'
  }

  return 'to_complete'
}

/**
 * Utility: Determina tipo evento da source/metadata
 */
export function determineEventType(
  source: string,
  metadata?: { [key: string]: any }
): EventType {
  // Manutenzioni (SOLO se source è maintenance O ha maintenance_id)
  if (source === 'maintenance' || metadata?.maintenance_id) {
    return 'maintenance'
  }

  // Mansioni generiche (source general_task O task_id presente)
  if (source === 'general_task' || metadata?.task_id) {
    return 'generic_task'
  }

  // Scadenze prodotti
  if (source === 'product_expiry' || metadata?.product_id) {
    return 'product_expiry'
  }

  // Scadenze HACCP dipendenti (source custom con staff_id)
  if (source === 'custom' && metadata?.staff_id) {
    return 'product_expiry' // Trattiamo scadenze HACCP come product_expiry
  }

  // Default: generic_task
  return 'generic_task'
}

/**
 * Utility: Verifica se evento passa i filtri
 * LOGICA: AND tra categorie diverse (tipo E stato E reparto), OR dentro stessa categoria
 */
export function doesEventPassFilters(
  event: {
    department_id?: string | null
    status: EventStatus
    type: EventType
  },
  filters: CalendarFilters
): boolean {
  // Se tutti i filtri sono vuoti, mostra tutto
  if (areAllFiltersEmpty(filters)) {
    return true
  }

  // AND tra categorie: l'evento deve passare TUTTE le categorie attive

  // Filtro Reparto (OR tra reparti selezionati)
  if (filters.departments.length > 0) {
    // Se evento non ha reparto O reparto non è tra i selezionati, escludi
    if (!event.department_id || !filters.departments.includes(event.department_id)) {
      return false
    }
  }

  // Filtro Stato (OR tra stati selezionati)
  if (filters.statuses.length > 0) {
    // Se stato evento non è tra i selezionati, escludi
    if (!filters.statuses.includes(event.status)) {
      return false
    }
  }

  // Filtro Tipo (OR tra tipi selezionati)
  if (filters.types.length > 0) {
    // Se tipo evento non è tra i selezionati, escludi
    if (!filters.types.includes(event.type)) {
      return false
    }
  }

  // Se arrivato qui, l'evento passa tutti i filtri attivi
  return true
}

