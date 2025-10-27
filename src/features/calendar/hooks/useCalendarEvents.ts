import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '@/types/calendar'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import {
  // updateEventStatus,
  filterEvents,
  calculateEventStats,
  getEventColors,
} from '../utils/eventTransform'


/**
 * Hook for managing calendar events
 */
export function useCalendarEvents() {
  const { companyId } = useAuth()
  const queryClient = useQueryClient()

  // Fetch all calendar events
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendar-events', companyId],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!companyId) {
        console.warn('⚠️ No company_id available, cannot load calendar events')
        throw new Error('No company ID available')
      }

      // Loading calendar events from Supabase

      // Load maintenance tasks from Supabase and convert to calendar events
      const { data: tasks, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select(
          `
          *,
          conservation_points(id, name, departments(id, name))
        `
        )
        .eq('company_id', companyId)
        .order('next_due', { ascending: true })

      if (tasksError) {
        console.error('❌ Error loading maintenance tasks:', tasksError)
        throw tasksError
      }

      // Loaded maintenance tasks from Supabase

      // Convert maintenance tasks to calendar events
      type SupabaseMaintenanceTask = {
        id: string
        title?: string
        instructions?: string
        next_due: string
        estimated_duration?: number
        status?: 'pending' | 'completed' | 'overdue'
        priority?: CalendarEvent['priority']
        assigned_to?: string
        conservation_point_id?: string
        frequency: string
        created_at: string
        updated_at: string
        created_by?: string
        company_id: string
        conservation_points?: {
          id: string
          name?: string
          departments?: { id: string; name?: string } | null
        } | null
      }

      const calendarEvents: CalendarEvent[] = (tasks || []).map(
        (task: SupabaseMaintenanceTask) => {
          const startDate = new Date(task.next_due)
          const endDate = new Date(
            startDate.getTime() + (task.estimated_duration || 60) * 60 * 1000
          )

          const event: CalendarEvent = {
            id: `task-${task.id}`,
            title: task.title || 'Manutenzione',
            description:
              task.instructions || 'Attività di manutenzione programmata',
            start: startDate,
            end: endDate,
            allDay: false,
            type: 'maintenance',
            status:
              task.status === 'completed'
                ? 'completed'
                : startDate < new Date()
                  ? 'overdue'
                  : 'pending',
            priority: task.priority || 'medium',
            assigned_to: task.assigned_to ? [task.assigned_to] : [],
            department_id: task.conservation_points?.departments?.id,
            conservation_point_id: task.conservation_point_id,
            recurring: task.frequency !== 'once',
            recurrence_pattern:
              task.frequency === 'daily'
                ? { frequency: 'daily', interval: 1 }
                : task.frequency === 'weekly'
                  ? { frequency: 'weekly', interval: 1 }
                  : task.frequency === 'monthly'
                    ? { frequency: 'monthly', interval: 1 }
                    : undefined,
            backgroundColor: '#FEF3C7',
            borderColor: '#F59E0B',
            textColor: '#92400E',
            metadata: {
              conservation_point_id: task.conservation_point_id,
              notes: task.instructions,
              task_id: task.id,
            },
            source: 'maintenance',
            sourceId: task.id,
            extendedProps: {
              status:
                task.status === 'completed'
                  ? 'completed'
                  : startDate < new Date()
                    ? 'overdue'
                    : 'scheduled',
              priority: task.priority || 'medium',
              assignedTo: task.assigned_to ? [task.assigned_to] : [],
              metadata: {
                id: task.id,
                notes: task.instructions,
                conservationPoint: task.conservation_points?.name,
                estimatedDuration: task.estimated_duration,
              },
            },
            created_at: new Date(task.created_at),
            updated_at: new Date(task.updated_at),
            created_by: task.created_by || 'system',
            company_id: task.company_id,
          }

          // Apply colors based on status
          const colors = getEventColors(
            event.type,
            event.status,
            event.priority
          )
          return {
            ...event,
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            textColor: colors.textColor,
          }
        }
      )

      return calendarEvents
    },
    enabled: !!companyId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })

  // Create new event
  const createEventMutation = useMutation({
    mutationFn: async (
      input: CreateCalendarEventInput
    ): Promise<CalendarEvent> => {
      if (!companyId) throw new Error('No company ID available')

      // For now, we only support creating maintenance tasks as calendar events
      if (input.type === 'maintenance' && input.conservation_point_id) {
        const payload = {
          company_id: companyId,
          conservation_point_id: input.conservation_point_id,
          title: input.title,
          instructions: input.description,
          next_due: input.start.toISOString(),
          estimated_duration: Math.ceil(((input.end || input.start).getTime() - input.start.getTime()) / (1000 * 60)), // minutes
          frequency: input.recurring ? 'daily' : 'once',
          priority: input.priority,
          assigned_to: input.assigned_to?.[0],
          status: 'scheduled',
        }

        const { data, error } = await supabase
          .from('maintenance_tasks')
          .insert([payload])
          .select(
            `
            *,
            conservation_points(id, name, departments(id, name))
          `
          )
          .single()

        if (error) {
          console.error('❌ Error creating maintenance task:', error)
          throw error
        }

        // Convert the created task to a calendar event
        const colors = getEventColors(input.type, 'pending', input.priority)
        const newEvent: CalendarEvent = {
          id: `task-${data.id}`,
          title: data.title || 'Manutenzione',
          description: data.instructions || 'Attività di manutenzione programmata',
          start: new Date(data.next_due),
          end: new Date(new Date(data.next_due).getTime() + (data.estimated_duration || 60) * 60 * 1000),
          allDay: false,
          type: 'maintenance',
          status: 'pending',
          priority: data.priority || 'medium',
          assigned_to: data.assigned_to ? [data.assigned_to] : [],
          department_id: data.conservation_points?.departments?.id,
          conservation_point_id: data.conservation_point_id,
          recurring: data.frequency !== 'once',
          recurrence_pattern: data.frequency === 'daily' ? { frequency: 'daily', interval: 1 } : undefined,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          textColor: colors.textColor,
          metadata: {
            conservation_point_id: data.conservation_point_id,
            notes: data.instructions,
            task_id: data.id,
          },
          source: 'maintenance',
          sourceId: data.id,
          extendedProps: {},
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          created_by: data.created_by || '',
          company_id: data.company_id,
        }

        return newEvent
      } else {
        throw new Error('Only maintenance events are supported for creation')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      toast.success('Evento creato con successo')
    },
    onError: error => {
      console.error('Errore nella creazione evento:', error)
      toast.error("Errore nella creazione dell'evento")
    },
  })

  // Update event
  const updateEventMutation = useMutation({
    mutationFn: async (
      input: UpdateCalendarEventInput
    ): Promise<CalendarEvent> => {
      // Extract task ID from calendar event ID
      const taskId = input.id.replace('task-', '')

      const updateData: any = {}
      if (input.title) updateData.title = input.title
      if (input.description) updateData.instructions = input.description
      if (input.start) updateData.next_due = input.start.toISOString()
      if (input.priority) updateData.priority = input.priority
      if (input.status === 'completed') updateData.status = 'completed'
      if (input.status === 'pending') updateData.status = 'scheduled'

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select(
          `
          *,
          conservation_points(id, name, departments(id, name))
        `
        )
        .single()

      if (error) {
        console.error('❌ Error updating maintenance task:', error)
        throw error
      }

      // Convert back to calendar event
      const colors = getEventColors('maintenance', input.status || 'pending', data.priority || 'medium')
      const updatedEvent: CalendarEvent = {
        id: `task-${data.id}`,
        title: data.title || 'Manutenzione',
        description: data.instructions || 'Attività di manutenzione programmata',
        start: new Date(data.next_due),
        end: new Date(new Date(data.next_due).getTime() + (data.estimated_duration || 60) * 60 * 1000),
        allDay: false,
        type: 'maintenance',
        status: data.status === 'completed' ? 'completed' : 'pending',
        priority: data.priority || 'medium',
        assigned_to: data.assigned_to ? [data.assigned_to] : [],
        department_id: data.conservation_points?.departments?.id,
        conservation_point_id: data.conservation_point_id,
        recurring: data.frequency !== 'once',
        recurrence_pattern: data.frequency === 'daily' ? { frequency: 'daily', interval: 1 } : undefined,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        textColor: colors.textColor,
        metadata: {
          conservation_point_id: data.conservation_point_id,
          notes: data.instructions,
          task_id: data.id,
        },
        source: 'maintenance',
        sourceId: data.id,
        extendedProps: {},
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        created_by: data.created_by || 'system',
        company_id: data.company_id,
      }

      return updatedEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      toast.success('Evento aggiornato con successo')
    },
    onError: error => {
      console.error("Errore nell'aggiornamento evento:", error)
      toast.error("Errore nell'aggiornamento dell'evento")
    },
  })

  // Delete event
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string): Promise<void> => {
      // Extract task ID from calendar event ID
      const taskId = eventId.replace('task-', '')

      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('❌ Error deleting maintenance task:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
      toast.success('Evento eliminato con successo')
    },
    onError: error => {
      console.error("Errore nell'eliminazione evento:", error)
      toast.error("Errore nell'eliminazione dell'evento")
    },
  })

  // Helper functions
  const getFilteredEvents = (
    filters?: Partial<Parameters<typeof filterEvents>[1]>
  ) => {
    if (!filters) return events
    return filterEvents(events, filters)
  }

  const getEventStats = () => {
    return calculateEventStats(events)
  }

  const getEventsForDate = (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return events.filter(event => {
      const eventStart = event.start
      const eventEnd = event.end || event.start
      return eventStart <= endOfDay && eventEnd >= startOfDay
    })
  }

  const getUpcomingEvents = (days: number = 7) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return events.filter(event => {
      return (
        event.start >= now &&
        event.start <= futureDate &&
        event.status === 'pending'
      )
    })
  }

  const getOverdueEvents = () => {
    return events.filter(event => event.status === 'overdue')
  }

  return {
    // Data
    events,
    isLoading,
    error,

    // Mutations
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,

    // Loading states
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,

    // Helper functions
    refetch,
    getFilteredEvents,
    getEventStats,
    getEventsForDate,
    getUpcomingEvents,
    getOverdueEvents,
  }
}
