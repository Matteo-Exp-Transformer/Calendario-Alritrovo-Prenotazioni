import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useMaintenanceTasks } from '@/features/conservation/hooks/useMaintenanceTasks'
import { useProducts } from '@/features/inventory/hooks/useProducts'
import { useGenericTasks, type TaskCompletion } from './useGenericTasks'
import type { MaintenanceTask } from '@/types/conservation'
import type { Product } from '@/types/inventory'
import type { GenericTask } from './useGenericTasks'
import { supabase } from '@/lib/supabase/client'
import type { CalendarFilters, EventStatus } from '@/types/calendar-filters'
import { areAllFiltersEmpty } from '@/types/calendar-filters'

export type MacroCategory = 'maintenance' | 'generic_tasks' | 'product_expiry'

export interface MacroCategoryEvent {
  date: string
  category: MacroCategory
  count: number
  items: MacroCategoryItem[]
}

export interface MacroCategoryItem {
  id: string
  title: string
  description?: string
  dueDate: Date
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  assignedToRole?: string
  assignedToCategory?: string
  assignedToStaffId?: string
  frequency?: string
  metadata: {
    category: MacroCategory
    sourceId: string
    notes?: string
    [key: string]: any
  }
}

interface MacroCategoryResult {
  events: MacroCategoryEvent[]
  isLoading: boolean
  getEventsForDate: (date: Date) => MacroCategoryEvent[]
  getCategoryForDate: (date: Date, category: MacroCategory) => MacroCategoryEvent | null
}

// Helper function per estrarre end_date dalla description
function extractEndDate(description?: string): Date | null {
  if (!description) return null
  const match = description.match(/\[END_DATE:(\d{4}-\d{2}-\d{2})\]/)
  return match ? new Date(match[1]) : null
}

// Helper function per verificare visibilità evento basata su orario
function isEventVisibleByTime(timeManagement?: any): boolean {
  if (!timeManagement?.time_range) {
    // Se non configurato, usa orario di apertura azienda (default)
    return true
  }

  const { start_time, end_time, is_overnight } = timeManagement.time_range
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes() // minuti dall'inizio del giorno
  const startMinutes = parseInt(start_time.split(':')[0]) * 60 + parseInt(start_time.split(':')[1])
  const endMinutes = parseInt(end_time.split(':')[0]) * 60 + parseInt(end_time.split(':')[1])

  if (is_overnight) {
    // Orario notturno: da start_time a mezzanotte + da mezzanotte a end_time
    return currentTime >= startMinutes || currentTime <= endMinutes
  } else {
    // Orario normale: da start_time a end_time
    return currentTime >= startMinutes && currentTime <= endMinutes
  }
}

// Helper function per verificare autorizzazione utente per evento
function isUserAuthorizedForEvent(
  assignedToRole?: string, 
  assignedToCategory?: string, 
  assignedToStaffId?: string,
  userRole?: string,
  userStaffId?: string,
  userDepartments?: string[],
  userCategories?: string[]
): boolean {
  // Admin e responsabili vedono tutto
  if (userRole === 'admin' || userRole === 'responsabile') {
    return true
  }

  // Se non c'è ruolo assegnato all'evento OPPURE è assegnato a "Tutti", tutti possono vederlo
  if (!assignedToRole || assignedToRole === 'all') {
    return true
  }

  // Se l'utente non ha ruolo (guest), non può vedere eventi con ruolo specifico
  if (!userRole || userRole === 'guest') {
    return false
  }

  // Controlla se l'utente corrisponde ad ALMENO UNA delle condizioni:
  
  // 1. Ruolo corrisponde
  if (userRole === assignedToRole) {
    return true
  }

  // 2. Categoria corrisponde (se utente appartiene a quella categoria)
  if (assignedToCategory && assignedToCategory !== 'all' && userCategories?.includes(assignedToCategory)) {
    return true
  }

  // 3. Reparto corrisponde (se utente è assegnato a quel reparto)
  if (userDepartments && userDepartments.length > 0) {
    // Qui dovremmo controllare se l'evento è assegnato a uno dei reparti dell'utente
    // Per ora assumiamo che se l'utente ha reparti, può vedere eventi senza reparto specifico
    return true
  }

  // 4. Dipendente specifico corrisponde
  if (assignedToStaffId && userStaffId === assignedToStaffId) {
    return true
  }

  // Se nessuna condizione è soddisfatta, non può vedere l'evento
  return false
}

export function useMacroCategoryEvents(fiscalYearEnd?: Date, filters?: CalendarFilters, refreshKey?: number): MacroCategoryResult {
  const { companyId, userRole } = useAuth()
  const { maintenanceTasks, isLoading: maintenanceLoading } = useMaintenanceTasks()
  const { products, isLoading: productsLoading } = useProducts()
  const { tasks: genericTasks, isLoading: genericTasksLoading } = useGenericTasks()
  
  // Usa React Query per i task completions invece di useState locale
  const { data: taskCompletions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['task-completions', companyId, refreshKey], // ✅ Aggiunge refreshKey per forzare il refetch
    queryFn: async (): Promise<TaskCompletion[]> => {
      if (!companyId) return []

      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('company_id', companyId)

      if (error) {
        console.error('Error loading task completions:', error)
        throw error
      }

      return (data || []).map((c: any) => ({
        id: c.id,
        company_id: c.company_id,
        task_id: c.task_id,
        completed_by: c.completed_by,
        completed_by_name: c.completed_by_name || null,
        completed_at: new Date(c.completed_at),
        period_start: new Date(c.period_start),
        period_end: new Date(c.period_end),
        notes: c.notes,
        created_at: new Date(c.created_at),
        updated_at: new Date(c.updated_at),
      }))
    },
    enabled: !!companyId,
  })

  const isLoading = maintenanceLoading || productsLoading || genericTasksLoading || completionsLoading

  const maintenanceItems = useMemo(() => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return []

    const items = maintenanceTasks.map(task =>
      convertMaintenanceToItem(task)
    )

    // Applica filtro di autorizzazione
    const authorizedItems = items.filter(item => {
      return isUserAuthorizedForEvent(
        item.assignedToRole,
        item.assignedToCategory,
        item.assignedToStaffId,
        userRole
      )
    })

    // Apply filters if provided
    if (!filters || areAllFiltersEmpty(filters)) {
      return authorizedItems
    }

    return authorizedItems.filter(item => {
      // Filter by department
      if (filters.departments.length > 0) {
        const deptId = item.metadata.departmentId as string | undefined
        if (!deptId || !filters.departments.includes(deptId)) {
          return false
        }
      }

      // Filter by status
      if (filters.statuses.length > 0) {
        const eventStatus: EventStatus = item.status === 'completed' ? 'completed' :
                                        item.status === 'overdue' ? 'overdue' : 'to_complete'
        if (!filters.statuses.includes(eventStatus)) {
          return false
        }
      }

      // Filter by type (maintenance)
      if (filters.types.length > 0) {
        if (!filters.types.includes('maintenance')) {
          return false
        }
      }

      return true
    })
  }, [maintenanceTasks, filters, userRole, refreshKey]) // ✅ Aggiunge refreshKey per forzare il refresh

  const genericTaskItems = useMemo(() => {
    if (!genericTasks || genericTasks.length === 0) return []

    const items = genericTasks.flatMap(task =>
      expandTaskWithCompletions(task, taskCompletions, fiscalYearEnd)
    )

    // Applica filtri di visibilità e autorizzazione
    const visibleItems = items.filter(item => {
      // Verifica se l'evento è visibile in base all'orario configurato
      const task = genericTasks.find(t => t.id === item.metadata.sourceId)
      const isVisibleByTime = isEventVisibleByTime((task as any)?.time_management)
      
      // Verifica se l'utente è autorizzato a vedere l'evento
      const isAuthorized = isUserAuthorizedForEvent(
        item.assignedToRole,
        item.assignedToCategory,
        item.assignedToStaffId,
        userRole
      )
      
      return isVisibleByTime && isAuthorized
    })

    // Apply filters if provided
    if (!filters || areAllFiltersEmpty(filters)) {
      return visibleItems
    }

    return visibleItems.filter(item => {
      // Filter by department
      if (filters.departments.length > 0) {
        const deptId = item.metadata.departmentId as string | undefined
        if (!deptId || !filters.departments.includes(deptId)) {
          return false
        }
      }

      // Filter by status
      if (filters.statuses.length > 0) {
        const eventStatus: EventStatus = item.status === 'completed' ? 'completed' :
                                        item.status === 'overdue' ? 'overdue' : 'to_complete'
        if (!filters.statuses.includes(eventStatus)) {
          return false
        }
      }

      // Filter by type (generic_task)
      if (filters.types.length > 0) {
        if (!filters.types.includes('generic_task')) {
          return false
        }
      }

      return true
    })
  }, [genericTasks, taskCompletions, fiscalYearEnd, filters, userRole, refreshKey]) // ✅ Aggiunge refreshKey per forzare il refresh

  const productExpiryItems = useMemo(() => {
    if (!products || products.length === 0) return []

    const items = products
      .filter(product =>
        product.expiry_date &&
        product.status === 'active' &&
        new Date(product.expiry_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .map(product =>
        convertProductToItem(product)
      )

    // Apply filters if provided
    if (!filters || areAllFiltersEmpty(filters)) {
      return items
    }

    return items.filter(item => {
      // Filter by department
      if (filters.departments.length > 0) {
        const deptId = item.metadata.departmentId as string | undefined
        if (!deptId || !filters.departments.includes(deptId)) {
          return false
        }
      }

      // Filter by status (product expiry can only be pending or overdue)
      if (filters.statuses.length > 0) {
        const eventStatus: EventStatus = item.status === 'overdue' ? 'overdue' : 'to_complete'
        if (!filters.statuses.includes(eventStatus)) {
          return false
        }
      }

      // Filter by type (product_expiry)
      if (filters.types.length > 0) {
        if (!filters.types.includes('product_expiry')) {
          return false
        }
      }

      return true
    })
  }, [products, filters, refreshKey]) // ✅ Aggiunge refreshKey per forzare il refresh

  const events = useMemo(() => {
    const allItems = [
      ...maintenanceItems,
      ...genericTaskItems,
      ...productExpiryItems,
    ]

    const eventsByDateAndCategory = new Map<string, Map<MacroCategory, MacroCategoryItem[]>>()

    allItems.forEach(item => {
      const dateKey = item.dueDate.toISOString().split('T')[0]

      if (!eventsByDateAndCategory.has(dateKey)) {
        eventsByDateAndCategory.set(dateKey, new Map())
      }

      const categoryMap = eventsByDateAndCategory.get(dateKey)!

      if (!categoryMap.has(item.metadata.category)) {
        categoryMap.set(item.metadata.category, [])
      }

      categoryMap.get(item.metadata.category)!.push(item)
    })

    const result: MacroCategoryEvent[] = []

    eventsByDateAndCategory.forEach((categoryMap, dateKey) => {
      categoryMap.forEach((items, category) => {
        const activeItems = items.filter(i => i.status !== 'completed')
        
        result.push({
          date: dateKey,
          category,
          count: activeItems.length, // Count solo per attività attive (non completate)
          items: items.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          }),
        })
      })
    })

    return result.sort((a, b) => a.date.localeCompare(b.date))
  }, [maintenanceItems, genericTaskItems, productExpiryItems, refreshKey]) // ✅ Aggiunge refreshKey per forzare il refresh

  const getEventsForDate = (date: Date): MacroCategoryEvent[] => {
    const dateKey = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateKey)
  }

  const getCategoryForDate = (date: Date, category: MacroCategory): MacroCategoryEvent | null => {
    const dateKey = date.toISOString().split('T')[0]
    return events.find(event => event.date === dateKey && event.category === category) || null
  }

  return {
    events,
    isLoading,
    getEventsForDate,
    getCategoryForDate,
  }
}

function convertMaintenanceToItem(task: MaintenanceTask): MacroCategoryItem {
  const dueDate = new Date(task.next_due)
  const now = new Date()

  const status: MacroCategoryItem['status'] =
    task.status === 'completed' ? 'completed' :
    dueDate < now ? 'overdue' : 'pending'

  return {
    id: task.id,
    title: task.title || 'Manutenzione',
    description: task.description,
    dueDate,
    status,
    priority: task.priority || 'medium',
    assignedTo: task.assigned_to,
    assignedToRole: (task as any).assigned_to_role,
    assignedToCategory: (task as any).assigned_to_category,
    assignedToStaffId: (task as any).assigned_to_staff_id,
    frequency: task.frequency,
    metadata: {
      category: 'maintenance',
      sourceId: task.id,
      notes: task.description,
      conservationPointId: task.conservation_point_id,
      departmentId: (task as any).department_id,
      estimatedDuration: task.estimated_duration,
      instructions: (task as any).instructions,
    },
  }
}

function expandTaskWithCompletions(
  task: GenericTask,
  completions: TaskCompletion[],
  fiscalYearEnd?: Date
): MacroCategoryItem[] {
  if (task.frequency === 'as_needed' || task.frequency === 'custom') {
    return [convertGenericTaskToItem(task, task.next_due ? new Date(task.next_due) : new Date(), completions)]
  }

  const items: MacroCategoryItem[] = []
  const now = new Date()
  
  // Usa next_due se disponibile (data di inizio impostata dall'utente), altrimenti usa created_at
  const startDate = task.next_due ? new Date(task.next_due) : new Date(task.created_at)
  
  // Estrai end_date dalla description se presente
  const taskEndDate = extractEndDate(task.description)
  
  // Determina data finale per espansione:
  // 1. Se c'è fiscalYearEnd, usalo come limite
  // 2. Se c'è taskEndDate (dall'utente), usa il minimo tra taskEndDate e fiscalYearEnd
  // 3. Altrimenti default a +90 giorni (fallback se non configurato)
  let endDate: Date
  if (fiscalYearEnd) {
    if (taskEndDate) {
      // Usa il minimo tra end_date specificato e fiscal_year_end
      endDate = taskEndDate < fiscalYearEnd ? taskEndDate : fiscalYearEnd
    } else {
      // Usa fiscal_year_end
      endDate = fiscalYearEnd
    }
  } else if (taskEndDate) {
    // Usa end_date specificato se non c'è fiscal_year_end
    endDate = taskEndDate
  } else {
    // Fallback: +90 giorni se niente è configurato
    endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  }

  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    items.push(convertGenericTaskToItem(task, new Date(currentDate), completions))

    switch (task.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3)
        break
      case 'biannually':
        currentDate.setMonth(currentDate.getMonth() + 6)
        break
      case 'annually':
      case 'annual':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
      default:
        currentDate = new Date(endDate.getTime() + 1)
    }
  }

  return items
}

function convertGenericTaskToItem(
  task: GenericTask,
  dueDate: Date,
  completions: TaskCompletion[]
): MacroCategoryItem {
  const now = new Date()

  // let _period_start: Date
  // let _period_end: Date

  switch (task.frequency) {
    case 'daily':
      // _period_start = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 0, 0, 0)
      // _period_end = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59)
      break
    case 'weekly': {
      const dayOfWeek = dueDate.getDay() || 7
      const monday = new Date(dueDate)
      monday.setDate(dueDate.getDate() - (dayOfWeek - 1))
      // _period_start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      // _period_end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59)
      break
    }
    case 'monthly':
      // _period_start = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1, 0, 0, 0)
      // _period_end = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0, 23, 59, 59)
      break
    case 'annually':
    case 'annual':
      // _period_start = new Date(dueDate.getFullYear(), 0, 1, 0, 0, 0)
      // _period_end = new Date(dueDate.getFullYear(), 11, 31, 23, 59, 59)
      break
    default:
      // _period_start = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 0, 0, 0)
      // _period_end = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59)
  }

  // Trova il completamento per questo periodo
  const completion = completions?.find(c => {
    if (c.task_id !== task.id) return false

    const completionStart = c.period_start.getTime()
    const completionEnd = c.period_end.getTime()
    const eventTime = dueDate.getTime()

    // Migliora la logica di matching: controlla se l'evento cade nel periodo del completamento
    // oppure se il completamento è stato fatto nello stesso giorno dell'evento
    const eventDayStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 0, 0, 0).getTime()
    const eventDayEnd = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59, 59).getTime()
    
    return (eventTime >= completionStart && eventTime <= completionEnd) ||
           (c.completed_at.getTime() >= eventDayStart && c.completed_at.getTime() <= eventDayEnd)
  })

  const isCompletedInPeriod = !!completion

  const status: MacroCategoryItem['status'] =
    isCompletedInPeriod ? 'completed' :
    dueDate < now ? 'overdue' : 'pending'

  const itemId = `generic-task-${task.id}-${dueDate.toISOString().split('T')[0]}`

  return {
    id: itemId,
    title: task.name,
    description: task.description,
    dueDate,
    status,
    priority: task.priority || 'medium',
    assignedTo: task.assigned_to,
    assignedToRole: task.assigned_to_role,
    assignedToCategory: task.assigned_to_category,
    assignedToStaffId: task.assigned_to_staff_id,
    frequency: task.frequency,
    metadata: {
      category: 'generic_tasks',
      sourceId: task.id,
      notes: task.description,
      departmentId: undefined,
      estimatedDuration: task.estimated_duration,
      taskId: task.id,
      // Aggiungi informazioni di completamento se disponibili
      ...(completion && {
        completedBy: completion.completed_by,
        completedByName: completion.completed_by_name,
        completedAt: completion.completed_at,
        completionNotes: completion.notes,
        completionId: completion.id,
      }),
    },
  }
}

function convertProductToItem(product: Product): MacroCategoryItem {
  const expiryDate = new Date(product.expiry_date!)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const status: MacroCategoryItem['status'] =
    expiryDate < now ? 'overdue' : 'pending'

  const priority: MacroCategoryItem['priority'] =
    daysUntilExpiry <= 1 ? 'critical' :
    daysUntilExpiry <= 3 ? 'high' : 'medium'

  return {
    id: product.id,
    title: `Scadenza: ${product.name}`,
    description: `Prodotto in scadenza - ${product.quantity || ''} ${product.unit || ''}`,
    dueDate: expiryDate,
    status,
    priority,
    metadata: {
      category: 'product_expiry',
      sourceId: product.id,
      notes: product.notes,
      productName: product.name,
      quantity: product.quantity,
      unit: product.unit,
      departmentId: product.department_id,
      conservationPointId: product.conservation_point_id,
      barcode: product.barcode,
      sku: product.sku,
      supplierName: product.supplier_name,
      purchaseDate: product.purchase_date,
    },
  }
}
