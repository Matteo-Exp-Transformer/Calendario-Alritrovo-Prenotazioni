import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { activityTrackingService } from '@/services/activityTrackingService'

export interface GenericTask {
  id: string
  company_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'annual' | 'as_needed' | 'custom'
  assigned_to: string // Ruolo o ID dipendente
  assigned_to_role?: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  assignment_type?: string // 'role' | 'staff' | 'category' (dall'onboarding)
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimated_duration?: number // in minuti
  next_due?: Date
  status: string
  created_at: Date
  updated_at: Date
}

export interface TaskCompletion {
  id: string
  company_id: string
  task_id: string
  completed_by?: string
  completed_by_name?: string | null
  completed_at: Date
  period_start: Date
  period_end: Date
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface CreateGenericTaskInput {
  name: string
  frequency: GenericTask['frequency']
  assigned_to_role: string
  assigned_to_category?: string
  assigned_to_staff_id?: string
  note?: string
  custom_days?: string[] // Giorni della settimana se frequenza custom
  department_id: string // Reparto assegnato (obbligatorio)
  
  // Gestione Orario Attività
  time_management?: {
    // Fascia oraria per visibilità evento
    time_range?: {
      start_time: string // formato HH:MM
      end_time: string   // formato HH:MM
      is_overnight: boolean // true se endTime è del giorno dopo
    }
    // Opzioni di completamento
    completion_type?: 'timeRange' | 'startTime' | 'endTime' | 'none'
    completion_start_time?: string // formato HH:MM - da quando può essere completato
    completion_end_time?: string   // formato HH:MM - entro quando può essere completato
  }
}

const QUERY_KEYS = {
  genericTasks: (companyId: string) => ['generic-tasks', companyId],
}

// Mappa frequenza IT → EN per il database (allineato con onboarding)
const mapFrequency = (frequenza: string): GenericTask['frequency'] => {
  const map: Record<string, GenericTask['frequency']> = {
    'giornaliera': 'daily',
    'settimanale': 'weekly',
    'mensile': 'monthly',
    'annuale': 'annually', // DB accetta entrambi annually e annual
    'custom': 'custom',
  }
  return map[frequenza] || 'weekly'
}

// Calcola next_due in base alla frequenza e alla data di inizio
const calculateNextDue = (frequency: string, customDays?: string[], startDate?: string): Date => {
  // Se viene fornita una data di inizio, usala come base, altrimenti usa oggi
  const baseDate = startDate ? new Date(startDate) : new Date()
  
  switch (frequency) {
    case 'giornaliera':
      // Per giornaliera, se c'è una start_date usa quella, altrimenti domani
      if (startDate) {
        return baseDate
      }
      baseDate.setDate(baseDate.getDate() + 1)
      break
    case 'settimanale':
      // Per settimanale, se c'è una start_date usa quella, altrimenti fra 7 giorni
      if (startDate) {
        return baseDate
      }
      baseDate.setDate(baseDate.getDate() + 7)
      break
    case 'mensile':
      // Per mensile, se c'è una start_date usa quella, altrimenti fra un mese
      if (startDate) {
        return baseDate
      }
      baseDate.setMonth(baseDate.getMonth() + 1)
      break
    case 'annuale':
      // Per annuale, se c'è una start_date usa quella, altrimenti fra un anno
      if (startDate) {
        return baseDate
      }
      baseDate.setFullYear(baseDate.getFullYear() + 1)
      break
    case 'custom':
      // Se custom, imposta al prossimo giorno selezionato
      if (customDays && customDays.length > 0) {
        // Se c'è una start_date usa quella, altrimenti logica semplificata: prossima settimana
        if (startDate) {
          return baseDate
        }
        baseDate.setDate(baseDate.getDate() + 7)
      }
      break
    default:
      // Default: se c'è una start_date usa quella, altrimenti fra 7 giorni
      if (startDate) {
        return baseDate
      }
      baseDate.setDate(baseDate.getDate() + 7)
  }
  
  return baseDate
}

export const useGenericTasks = () => {
  const { user, companyId, sessionId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch generic tasks
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.genericTasks(companyId || ''),
    queryFn: async (): Promise<GenericTask[]> => {
      if (!companyId) {
        return []
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading tasks:', error)
        throw error
      }

      return (data || []).map((task: any) => ({
        id: task.id,
        company_id: task.company_id,
        name: task.name,
        description: task.description,
        frequency: task.frequency,
        assigned_to: task.assigned_to,
        assigned_to_role: task.assigned_to_role,
        assigned_to_category: task.assigned_to_category,
        assigned_to_staff_id: task.assigned_to_staff_id,
        assignment_type: task.assignment_type,
        priority: task.priority || 'medium',
        estimated_duration: task.estimated_duration,
        next_due: task.next_due ? new Date(task.next_due) : undefined,
        status: task.status || 'pending',
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      }))
    },
    enabled: !!companyId && !!user,
  })

  // Create generic task
  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateGenericTaskInput) => {
      if (!companyId) throw new Error('No company ID available')

      const frequency = mapFrequency(input.frequency)
      const next_due = calculateNextDue(input.frequency, input.custom_days, (input as any).start_date)

      // Payload allineato esattamente con schema onboarding (riga 998-1024 onboardingHelpers.ts)
      const payload: any = {
        company_id: companyId,
        name: input.name,
        frequency: frequency,
        assigned_to: input.assigned_to_staff_id && input.assigned_to_staff_id !== 'none'
          ? input.assigned_to_staff_id
          : input.assigned_to_role || '',
        assignment_type: input.assigned_to_staff_id && input.assigned_to_staff_id !== 'none' ? 'staff' : 'role',
      }

      // Campi opzionali - aggiungi solo se presenti
      if (input.note) payload.description = input.note
      if (input.assigned_to_staff_id && input.assigned_to_staff_id !== 'none') {
        payload.assigned_to_staff_id = input.assigned_to_staff_id
      }
      if (input.assigned_to_role) {
        payload.assigned_to_role = input.assigned_to_role
      }
      if (input.assigned_to_category && input.assigned_to_category !== 'all') {
        payload.assigned_to_category = input.assigned_to_category
      }
      // department_id è ora obbligatorio
      payload.department_id = input.department_id
      if (next_due) payload.next_due = next_due.toISOString()
      
      // Gestione Orario Attività - aggiungi solo se configurato
      if (input.time_management) {
        payload.time_management = input.time_management
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.genericTasks(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events', companyId],
      })
      toast.success('Attività creata con successo')
    },
    onError: (error: Error) => {
      console.error('Error creating task:', error)
      toast.error('Errore nella creazione dell\'attività')
    },
  })

  // Delete generic task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!companyId) throw new Error('No company ID available')

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('company_id', companyId)

      if (error) {
        console.error('Error deleting task:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.genericTasks(companyId || ''),
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events', companyId],
      })
      toast.success('Attività eliminata')
    },
    onError: (error: Error) => {
      console.error('Error deleting task:', error)
      toast.error('Errore nell\'eliminazione dell\'attività')
    },
  })

  // Complete task
  const completeTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      notes,
    }: {
      taskId: string
      notes?: string
    }) => {
      if (!companyId || !user) throw new Error('No company ID or user available')

      // Trova il task per determinare il periodo
      const task = tasks.find(t => t.id === taskId)
      if (!task) throw new Error('Task not found')

      // Usa next_due se disponibile, altrimenti usa data corrente
      // Questo permette di completare una mansione "per la sua scadenza" anche se fatta in anticipo
      const referenceDate = task.next_due ? new Date(task.next_due) : new Date()
      
      // Calcola period_start e period_end basato sulla frequenza
      let period_start: Date
      let period_end: Date

      switch (task.frequency) {
        case 'daily':
          // Periodo: giorno di riferimento
          period_start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 0, 0, 0)
          period_end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 23, 59, 59)
          break
        case 'weekly': {
          // Periodo: settimana di riferimento (lunedì-domenica)
          const dayOfWeek = referenceDate.getDay() || 7 // 0=domenica -> 7
          const monday = new Date(referenceDate)
          monday.setDate(referenceDate.getDate() - (dayOfWeek - 1))
          period_start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0)
          const sunday = new Date(monday)
          sunday.setDate(monday.getDate() + 6)
          period_end = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59)
          break
        }

        case 'monthly':
          // Periodo: mese di riferimento
          period_start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1, 0, 0, 0)
          period_end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59)
          break
        case 'annually':
        case 'annual':
          // Periodo: anno di riferimento
          period_start = new Date(referenceDate.getFullYear(), 0, 1, 0, 0, 0)
          period_end = new Date(referenceDate.getFullYear(), 11, 31, 23, 59, 59)
          break
        default:
          // Per altre frequenze, usa giorno di riferimento
          period_start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 0, 0, 0)
          period_end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 23, 59, 59)
      }


      // Ottieni il nome dell'utente dai metadata
      const { data: userData } = await supabase.auth.getUser()
      const completedByName = userData.user?.user_metadata?.first_name && userData.user?.user_metadata?.last_name
        ? `${userData.user.user_metadata.first_name} ${userData.user.user_metadata.last_name}`
        : userData.user?.email || null

      const { data, error } = await supabase
        .from('task_completions')
        .insert({
          company_id: companyId,
          task_id: taskId,
          completed_by: user.id,
          completed_by_name: completedByName,
          period_start: period_start.toISOString(),
          period_end: period_end.toISOString(),
          notes,
        })
        .select()
        .single()

      if (error) throw error

      if (user?.id && companyId) {
        await activityTrackingService.logActivity(
          user.id,
          companyId,
          'task_completed',
          {
            task_id: taskId,
            task_name: task.name,
            task_type: 'generic',
            frequency: task.frequency,
            completed_at: new Date().toISOString(),
            period_start: period_start.toISOString(),
            period_end: period_end.toISOString(),
            notes: notes || undefined,
          },
          {
            sessionId: sessionId || undefined,
            entityType: 'generic_task',
            entityId: taskId,
          }
        )
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.genericTasks(companyId || ''),
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events'],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: ['task-completions'],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: ['macro-category-events'],
        refetchType: 'all',
      })
      toast.success('✅ Mansione completata - Calendario aggiornato')
    },
    onError: (error: Error) => {
      console.error('Error completing task:', error)
      toast.error('Errore nel completamento della mansione')
    },
  })

  // Uncomplete task (rimuove il completamento)
  const uncompleteTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      completionId,
    }: {
      taskId: string
      completionId?: string
    }) => {
      if (!companyId || !user) throw new Error('No company ID or user available')

      // Se è fornito un completionId specifico, elimina quello
      // Altrimenti elimina tutti i completamenti del task per il giorno corrente
      const now = new Date()
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      let query = supabase
        .from('task_completions')
        .delete()
        .eq('company_id', companyId)
        .eq('task_id', taskId)

      if (completionId) {
        query = query.eq('id', completionId)
      } else {
        // Elimina completamenti del giorno corrente
        query = query
          .gte('period_start', dayStart.toISOString())
          .lte('period_end', dayEnd.toISOString())
      }

      const { error } = await query

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.genericTasks(companyId || ''),
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: ['task-completions'],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: ['calendar-events'],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: ['macro-category-events'],
        refetchType: 'all',
      })
      toast.success('🔄 Mansione ripristinata - Calendario aggiornato')
    },
    onError: (error: Error) => {
      console.error('Error uncompleting task:', error)
      toast.error('Errore nel ripristino della mansione')
    },
  })

  // Fetch completions for a task
  const fetchCompletions = async (taskId: string): Promise<TaskCompletion[]> => {
    if (!companyId) return []

    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('company_id', companyId)
      .eq('task_id', taskId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching task completions:', error)
      return []
    }

    return (data || []).map((completion: any) => ({
      id: completion.id,
      company_id: completion.company_id,
      task_id: completion.task_id,
      completed_by: completion.completed_by,
      completed_at: new Date(completion.completed_at),
      period_start: new Date(completion.period_start),
      period_end: new Date(completion.period_end),
      notes: completion.notes,
      created_at: new Date(completion.created_at),
      updated_at: new Date(completion.updated_at),
    }))
  }

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask: createTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    uncompleteTask: uncompleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
    isUncompleting: uncompleteTaskMutation.isPending,
    fetchCompletions,
  }
}

