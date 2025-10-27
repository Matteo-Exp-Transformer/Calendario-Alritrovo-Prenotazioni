import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import { useConservationPoints } from '@/features/conservation/hooks/useConservationPoints'
import { useStaff } from '@/features/management/hooks/useStaff'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useGenericTasks, type GenericTask, type TaskCompletion } from './useGenericTasks'
import type { CalendarEvent } from '@/types/calendar'
import type { MaintenanceTask } from '@/types/conservation'
import type { Product } from '@/types/inventory'
import type { StaffMember } from '@/features/management/hooks/useStaff'
import { getEventColors } from '../utils/eventTransform'
import { generateHaccpDeadlineEvents } from '../utils/haccpDeadlineGenerator'
import { generateTemperatureCheckEvents } from '../utils/temperatureCheckGenerator'
import { addDays, addWeeks, addMonths, startOfDay, endOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

interface AggregatedEventsResult {
  events: CalendarEvent[]
  isLoading: boolean
  error: Error | null
  sources: {
    maintenance: number
    haccpExpiry: number
    productExpiry: number
    haccpDeadlines: number
    temperatureChecks: number
    genericTasks: number
    custom: number
  }
}

// Helper function per estrarre end_date dalla description
function extractEndDate(description?: string): Date | null {
  if (!description) return null
  const match = description.match(/\[END_DATE:(\d{4}-\d{2}-\d{2})\]/)
  return match ? new Date(match[1]) : null
}

export function useAggregatedEvents(fiscalYearEnd?: Date): AggregatedEventsResult {
  const { user, companyId } = useAuth()
  const { maintenanceTasks, isLoading: maintenanceLoading } =
    useMaintenanceTasks()
  const { conservationPoints, isLoading: pointsLoading } =
    useConservationPoints()
  const { staff, isLoading: staffLoading } = useStaff()
  const { products, isLoading: productsLoading } = useProducts()
  const { tasks: genericTasks, isLoading: genericTasksLoading } = useGenericTasks()
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([])

  // ✅ Debug: Log stato caricamento dati
  // console.log('🔍 useAggregatedEvents debug:', {
  //   user: !!user,
  //   companyId,
  //   maintenanceTasks: maintenanceTasks?.length || 0,
  //   conservationPoints: conservationPoints?.length || 0,
  //   staff: staff?.length || 0,
  //   products: products?.length || 0,
  //   genericTasks: genericTasks?.length || 0,
  //   taskCompletions: taskCompletions?.length || 0,
  //   loading: {
  //     maintenance: maintenanceLoading,
  //     points: pointsLoading,
  //     staff: staffLoading,
  //     products: productsLoading,
  //     generic: genericTasksLoading
  //   }
  // })

  // Carica tutti i completamenti delle mansioni
  useEffect(() => {
    if (!companyId) return

    const loadCompletions = async () => {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('company_id', companyId)

      if (!error && data) {
        setTaskCompletions(
          data.map((c: any) => ({
            id: c.id,
            company_id: c.company_id,
            task_id: c.task_id,
            completed_by: c.completed_by,
            completed_at: new Date(c.completed_at),
            period_start: new Date(c.period_start),
            period_end: new Date(c.period_end),
            notes: c.notes,
            created_at: new Date(c.created_at),
            updated_at: new Date(c.updated_at),
          }))
        )
      }
    }

    loadCompletions()
  }, [companyId])

  const isLoading =
    maintenanceLoading || staffLoading || productsLoading || pointsLoading || genericTasksLoading

  const maintenanceEvents = useMemo(() => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return []

    // ✅ Espandi attività ricorrenti per mostrare occorrenze multiple
    const events = maintenanceTasks.flatMap(task => {
      const occurrences = expandRecurringTask(task, companyId || '', user?.id || '', 'maintenance', undefined, fiscalYearEnd)
      return occurrences
    })
    
    // const _completedCount = events.filter(e => e.status === 'completed').length
    
    return events
  }, [maintenanceTasks, companyId, user?.id, fiscalYearEnd])

  const haccpExpiryEvents = useMemo(() => {
    if (!staff || staff.length === 0) return []

    return staff
      .filter(
        member =>
          member.haccp_certification &&
          typeof member.haccp_certification === 'object' &&
          'expiry_date' in member.haccp_certification
      )
      .map(member =>
        convertHaccpExpiryToEvent(member, companyId || '', user?.id || '')
      )
  }, [staff, companyId, user?.id])

  // Carica completamenti scadenze prodotti
  const [productExpiryCompletions, setProductExpiryCompletions] = useState<any[]>([])
  
  useEffect(() => {
    if (!companyId) return

    const loadProductCompletions = async () => {
      const { data, error } = await supabase
        .from('product_expiry_completions')
        .select('*')
        .eq('company_id', companyId)

      if (!error && data) {
        setProductExpiryCompletions(data)
      }
    }

    loadProductCompletions()
  }, [companyId])

  const productExpiryEvents = useMemo(() => {
    if (!products || products.length === 0) return []

    return products
      .filter(
        product =>
          product.expiry_date &&
          product.status === 'active' &&
          new Date(product.expiry_date) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .map(product =>
        convertProductExpiryToEvent(product, companyId || '', user?.id || '', productExpiryCompletions)
      )
  }, [products, companyId, user?.id, productExpiryCompletions])

  const haccpDeadlineEvents = useMemo(() => {
    if (!staff || staff.length === 0) return []
    return generateHaccpDeadlineEvents(staff, companyId || '', user?.id || '')
  }, [staff, companyId, user?.id])

  const temperatureEvents = useMemo(() => {
    if (!conservationPoints || conservationPoints.length === 0) return []
    return generateTemperatureCheckEvents(
      conservationPoints,
      companyId || '',
      user?.id || ''
    )
  }, [conservationPoints, companyId, user?.id])

  const genericTaskEvents = useMemo(() => {
    if (!genericTasks || genericTasks.length === 0) {
      return []
    }

    // ✅ Espandi attività ricorrenti per mostrare occorrenze multiple
    return genericTasks.flatMap(task =>
      expandRecurringTask(task, companyId || '', user?.id || '', 'generic', taskCompletions, fiscalYearEnd)
    )
  }, [genericTasks, companyId, user?.id, taskCompletions, fiscalYearEnd])

  const allEvents = useMemo(() => {
    return [
      ...maintenanceEvents,
      ...haccpExpiryEvents,
      ...productExpiryEvents,
      ...haccpDeadlineEvents,
      ...temperatureEvents,
      ...genericTaskEvents,
    ]
  }, [
    maintenanceEvents,
    haccpExpiryEvents,
    productExpiryEvents,
    haccpDeadlineEvents,
    temperatureEvents,
    genericTaskEvents,
  ])

  // ✅ Debug: Log risultato finale
  // console.log('🎯 useAggregatedEvents final result:', {
  //   totalEvents: allEvents.length,
  //   isLoading,
  //   sources: {
  //     maintenance: maintenanceEvents.filter(e => e.status !== 'completed').length,
  //     haccpExpiry: haccpExpiryEvents.length,
  //     productExpiry: productExpiryEvents.length,
  //     haccpDeadlines: haccpDeadlineEvents.length,
  //     temperatureChecks: temperatureEvents.length,
  //     genericTasks: genericTaskEvents.filter(e => e.status !== 'completed').length,
  //     custom: 0,
  //   },
  //   sampleEvents: allEvents.slice(0, 3).map(e => ({
  //     title: e.title,
  //     type: e.type,
  //     start: e.start
  //   }))
  // })

  return {
    events: allEvents,
    isLoading,
    error: null,
    sources: {
      maintenance: maintenanceEvents.filter(e => e.status !== 'completed').length,
      haccpExpiry: haccpExpiryEvents.length,
      productExpiry: productExpiryEvents.length,
      haccpDeadlines: haccpDeadlineEvents.length,
      temperatureChecks: temperatureEvents.length,
      genericTasks: genericTaskEvents.filter(e => e.status !== 'completed').length,
      custom: 0,
    },
  }
}

/**
 * Espande una task ricorrente in multiple occorrenze
 * Per frequenza "daily" genera un evento per ogni giorno dalla data di creazione
 */
function expandRecurringTask(
  task: MaintenanceTask | GenericTask,
  companyId: string,
  userId: string,
  type: 'maintenance' | 'generic',
  completions?: TaskCompletion[],
  fiscalYearEnd?: Date
): CalendarEvent[] {
  const frequency = task.frequency
  
  // Se non è una frequenza ricorrente, restituisci un solo evento
  if (frequency === 'as_needed' || frequency === 'custom') {
    return type === 'maintenance'
      ? [convertMaintenanceTaskToEvent(task as MaintenanceTask, companyId, userId)]
      : [convertGenericTaskToEvent(task as GenericTask, companyId, userId, undefined, completions)]
  }
  
  // Data di inizio: usa next_due se disponibile (data scelta dall'utente), altrimenti created_at
  const taskStartDate = 'next_due' in task && task.next_due ? new Date(task.next_due) : new Date(task.created_at)
  const startDate = startOfDay(taskStartDate)
  
  // Estrai end_date dalla description se presente (per generic tasks)
  const taskEndDate = type === 'generic' ? extractEndDate((task as GenericTask).description) : null
  
  // Data di fine: usa fiscal_year_end se configurato, altrimenti +90 giorni
  let endDate: Date
  if (fiscalYearEnd) {
    if (taskEndDate) {
      // Usa il minimo tra end_date specificato e fiscal_year_end
      endDate = endOfDay(taskEndDate < fiscalYearEnd ? taskEndDate : fiscalYearEnd)
    } else {
      // Usa fiscal_year_end
      endDate = endOfDay(fiscalYearEnd)
    }
  } else if (taskEndDate) {
    // Usa end_date specificato se non c'è fiscal_year_end
    endDate = endOfDay(taskEndDate)
  } else {
    // Fallback: +90 giorni se niente è configurato
    endDate = endOfDay(addDays(new Date(), 90))
  }
  
  const events: CalendarEvent[] = []
  let currentDate = startDate
  
  // Genera eventi ricorrenti in base alla frequenza
  while (currentDate <= endDate) {
    // Crea l'evento per questa data
    const event = type === 'maintenance'
      ? convertMaintenanceTaskToEvent(task as MaintenanceTask, companyId, userId, currentDate)
      : convertGenericTaskToEvent(task as GenericTask, companyId, userId, currentDate, completions)
    
    events.push(event)
    
    // Calcola la prossima occorrenza in base alla frequenza
    switch (frequency) {
      case 'daily':
        currentDate = addDays(currentDate, 1)
        break
      case 'weekly':
        currentDate = addWeeks(currentDate, 1)
        break
      case 'monthly':
        currentDate = addMonths(currentDate, 1)
        break
      case 'quarterly':
        currentDate = addMonths(currentDate, 3)
        break
      case 'biannually':
        currentDate = addMonths(currentDate, 6)
        break
      case 'annually':
      case 'annual':
        currentDate = addMonths(currentDate, 12)
        break
      default:
        // Per frequenze sconosciute, esci dal loop
        currentDate = addDays(endDate, 1)
    }
  }
  
  return events
}

function convertMaintenanceTaskToEvent(
  task: MaintenanceTask,
  companyId: string,
  userId: string,
  occurrenceDate?: Date
): CalendarEvent {
  // Usa occurrenceDate se fornito, altrimenti usa next_due
  const startDate = occurrenceDate || new Date(task.next_due)
  const endDate = new Date(
    startDate.getTime() + (task.estimated_duration || 60) * 60 * 1000
  )

  // ✅ FIX: Per manutenzioni ricorrenti, non usare task.status
  // Solo per manutenzioni AS_NEEDED usare task.status
  // Per ricorrenti, lo status deve essere calcolato in base alla data
  const status =
    task.frequency === 'as_needed' || task.frequency === 'custom'
      ? (task.status === 'completed' ? 'completed' : (startDate < new Date() ? 'overdue' : 'pending'))
      : (startDate < new Date() ? 'overdue' : 'pending')

  const colors = getEventColors(
    'maintenance',
    status,
    task.priority || 'medium'
  )

  // ✅ ID univoco per ogni occorrenza (include data)
  const eventId = occurrenceDate 
    ? `maintenance-${task.id}-${startDate.toISOString().split('T')[0]}`
    : `maintenance-${task.id}`
  
  return {
    id: eventId,
    title: task.title || 'Manutenzione',
    description: task.description,
    start: startDate,
    end: endDate,
    allDay: false,
    type: 'maintenance',
    status,
    priority: task.priority || 'medium',
    source: 'maintenance',
    sourceId: task.id,
    assigned_to: (task as any).assigned_to_staff_id ? [(task as any).assigned_to_staff_id] : [],
    conservation_point_id: task.conservation_point_id,
    department_id: (task as any).department_id || undefined,
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      maintenance_id: task.id,
      conservation_point_id: task.conservation_point_id,
      department_id: (task as any).department_id,
      assigned_to_staff_id: (task as any).assigned_to_staff_id,
      assigned_to_role: (task as any).assigned_to_role,
      assigned_to_category: (task as any).assigned_to_category,
      notes: task.description,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority: task.priority || 'medium',
      assignedTo: task.assigned_to ? [task.assigned_to] : [],
      metadata: {
        id: task.id,
        notes: task.description,
        estimatedDuration: task.estimated_duration,
      },
    },
    created_at: task.created_at,
    updated_at: task.updated_at,
    created_by: userId,
    company_id: companyId,
  }
}

function convertHaccpExpiryToEvent(
  staffMember: StaffMember,
  companyId: string,
  userId: string
): CalendarEvent {
  const cert = staffMember.haccp_certification as {
    expiry_date: string
    level?: string
  }
  const expiryDate = new Date(cert.expiry_date)
  const now = new Date()
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const priority: CalendarEvent['priority'] =
    daysUntilExpiry <= 7
      ? 'critical'
      : daysUntilExpiry <= 30
        ? 'high'
        : 'medium'

  const status: CalendarEvent['status'] =
    expiryDate < now ? 'overdue' : 'pending'

  const colors = getEventColors('custom', status, priority)

  return {
    id: `haccp-expiry-${staffMember.id}`,
    title: `Scadenza HACCP - ${staffMember.name}`,
    description: `Certificazione HACCP ${cert.level || ''} in scadenza`,
    start: expiryDate,
    end: expiryDate,
    allDay: true,
    type: 'custom',
    status,
    priority,
    source: 'custom',
    sourceId: staffMember.id,
    assigned_to: [staffMember.id],
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      staff_id: staffMember.id,
      assigned_to_staff_id: staffMember.id,
      notes: `Scadenza certificazione HACCP - ${staffMember.name}`,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority,
      assignedTo: [staffMember.id],
      metadata: {
        staffMember: staffMember.name,
        haccpLevel: cert.level,
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
    created_by: userId,
    company_id: companyId,
  }
}

function convertProductExpiryToEvent(
  product: Product,
  companyId: string,
  userId: string,
  completions: any[] = []
): CalendarEvent {
  const expiryDate = new Date(product.expiry_date!)
  const now = new Date()
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Verifica se prodotto è stato completato (consumato o smaltito)
  const isCompleted = completions.some(c => c.product_id === product.id)

  const priority: CalendarEvent['priority'] =
    daysUntilExpiry <= 1 ? 'critical' : daysUntilExpiry <= 3 ? 'high' : 'medium'

  const status: CalendarEvent['status'] =
    isCompleted ? 'completed' : expiryDate < now ? 'overdue' : 'pending'

  const colors = getEventColors('custom', status, priority)

  return {
    id: `product-expiry-${product.id}`,
    title: `📦 Scadenza: ${product.name}`,
    description: `Prodotto in scadenza - ${product.quantity || ''} ${product.unit || ''}`,
    start: expiryDate,
    end: expiryDate,
    allDay: true,
    type: 'custom',
    status,
    priority,
    source: 'custom',
    sourceId: product.id,
    assigned_to: [],
    department_id: product.department_id,
    conservation_point_id: product.conservation_point_id,
    recurring: false,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      product_id: product.id,
      department_id: product.department_id,
      conservation_point_id: product.conservation_point_id,
      assigned_to_category: product.department_id
        ? `department:${product.department_id}`
        : 'all',
      notes: `Scadenza prodotto: ${product.name}`,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority,
      metadata: {
        productName: product.name,
        quantity: product.quantity,
        unit: product.unit,
        departmentId: product.department_id,
      },
    },
    created_at: product.created_at,
    updated_at: product.updated_at,
    created_by: userId,
    company_id: companyId,
  }
}

function convertGenericTaskToEvent(
  task: GenericTask,
  companyId: string,
  userId: string,
  occurrenceDate?: Date,
  completions?: TaskCompletion[]
): CalendarEvent {
  // Usa occurrenceDate se fornito, altrimenti usa next_due o data corrente
  const startDate = occurrenceDate || (task.next_due ? new Date(task.next_due) : new Date())
  const endDate = new Date(
    startDate.getTime() + (task.estimated_duration || 60) * 60 * 1000
  )

  // Calcola period_start e period_end per verificare completamento
  let period_start: Date
  let period_end: Date

  switch (task.frequency) {
    case 'daily':
      period_start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
      period_end = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59)
      break
    case 'weekly': {
      const dayOfWeek = startDate.getDay() || 7
      const monday = new Date(startDate)
      monday.setDate(startDate.getDate() - (dayOfWeek - 1))
      period_start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      period_end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59)
      break
    }

    case 'monthly':
      period_start = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0)
      period_end = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59)
      break
    case 'annually':
    case 'annual':
      period_start = new Date(startDate.getFullYear(), 0, 1, 0, 0, 0)
      period_end = new Date(startDate.getFullYear(), 11, 31, 23, 59, 59)
      break
    default:
      period_start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
      period_end = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59, 59)
  }

  // Verifica se esiste un completamento per questo periodo
  // Controlla se startDate cade dentro il periodo di un completamento
  const isCompletedInPeriod = completions?.some(c => {
    if (c.task_id !== task.id) return false

    // Controlla se startDate è dentro il range period_start - period_end
    const completionStart = c.period_start.getTime()
    const completionEnd = c.period_end.getTime()
    const eventTime = startDate.getTime()

    return eventTime >= completionStart && eventTime <= completionEnd
  }) ?? false

  const status: CalendarEvent['status'] =
    isCompletedInPeriod
      ? 'completed'
      : startDate < new Date()
        ? 'overdue'
        : 'pending'

  const colors = getEventColors(
    'general_task',
    status,
    task.priority || 'medium'
  )

  // ✅ ID univoco per ogni occorrenza (include data)
  const eventId = occurrenceDate 
    ? `generic-task-${task.id}-${startDate.toISOString().split('T')[0]}`
    : `generic-task-${task.id}`

  return {
    id: eventId,
    title: task.name,
    description: task.description,
    start: startDate,
    end: endDate,
    allDay: false,
    type: 'general_task',
    status,
    priority: task.priority || 'medium',
    source: 'general_task',
    sourceId: task.id,
    assigned_to: (task as any).assigned_to_staff_id ? [(task as any).assigned_to_staff_id] : [],
    department_id: (task as any).department_id || undefined,
    recurring: task.frequency !== 'as_needed',
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    textColor: colors.textColor,
    metadata: {
      task_id: task.id,
      department_id: (task as any).department_id,
      assigned_to_role: task.assigned_to_role,
      assigned_to_category: task.assigned_to_category,
      assigned_to_staff_id: (task as any).assigned_to_staff_id,
      notes: task.description,
    },
    extendedProps: {
      status: status as
        | 'scheduled'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      priority: task.priority || 'medium',
      assignedTo: (task as any).assigned_to_staff_id ? [(task as any).assigned_to_staff_id] : [],
      // isCompletedInPeriod,
      metadata: {
        id: task.id,
        task_id: task.id,
        notes: task.description,
        estimatedDuration: task.estimated_duration,
        frequency: task.frequency,
        period_start,
        period_end,
      },
    },
    created_at: task.created_at,
    updated_at: task.updated_at,
    created_by: userId,
    company_id: companyId,
  }
}
