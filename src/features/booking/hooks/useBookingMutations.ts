// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { BookingRequest } from '@/types/booking'
import { toast } from 'react-toastify'
import {
  sendBookingAcceptedEmail,
  sendBookingRejectedEmail,
  sendBookingCancelledEmail,
  areEmailNotificationsEnabled,
} from './useEmailNotifications'

interface AcceptBookingInput {
  bookingId: string
  confirmedStart: string
  confirmedEnd: string
  desiredTime?: string
  numGuests?: number
  internalNotes?: string
}

interface RejectBookingInput {
  bookingId: string
  rejectionReason?: string
}

interface UpdateBookingInput {
  bookingId: string
  booking_type?: 'tavolo' | 'rinfresco_laurea'
  client_name?: string
  client_email?: string
  client_phone?: string
  confirmedStart: string
  confirmedEnd: string
  numGuests: number
  specialRequests?: string
  desiredTime?: string
  menu_selection?: any
  menu_total_per_person?: number
  menu_total_booking?: number
  dietary_restrictions?: any[]
  preset_menu?: string
  menu?: string
}

// Mutation per accettare una prenotazione
export const useAcceptBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcceptBookingInput) => {
      const updateData: any = {
        status: 'accepted',
        confirmed_start: input.confirmedStart,
        confirmed_end: input.confirmedEnd,
        num_guests: input.numGuests,
        updated_at: new Date().toISOString(),
      }
      
      if (input.desiredTime !== undefined) {
        updateData.desired_time = input.desiredTime
      }

      const { data, error } = await supabase
        .from('booking_requests')
        .update(updateData)
        .eq('id', input.bookingId)
        .select()
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as BookingRequest
    },
    onSuccess: async (booking: BookingRequest) => {
      // Invalida tutte le queries per refresh automatico completo
      // This will refresh the calendar automatically
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'], refetchType: 'all' }),
      ])
      console.log('✅ [useAcceptBooking] All bookings queries invalidated - calendar should refresh automatically')

      // Send email notification
      console.log('🔵 [useAcceptBooking] Checking email notifications...')
      const emailEnabled = areEmailNotificationsEnabled()
      console.log('🔵 [useAcceptBooking] Email enabled:', emailEnabled)
      
      if (emailEnabled) {
        console.log('🔵 [useAcceptBooking] Sending email to:', booking.client_email)
        try {
          const emailResult = await sendBookingAcceptedEmail(booking)
          console.log('✅ [useAcceptBooking] Email sent:', emailResult)
        } catch (error) {
          console.error('❌ [useAcceptBooking] Email error:', error)
        }
      } else {
        console.log('⚠️ [useAcceptBooking] Email disabled')
      }
    },
    onError: (error: Error) => {
      console.error('❌ [useAcceptBooking] Mutation error:', error)
      // Toast error già gestito nel componente
    },
  })
}

// Mutation per rifiutare una prenotazione
export const useRejectBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RejectBookingInput) => {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({
          status: 'rejected',
          rejection_reason: input.rejectionReason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.bookingId)
        .select()
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as BookingRequest
    },
    onSuccess: async (booking: BookingRequest) => {
      // Invalida tutte le queries per refresh automatico completo
      // This will refresh the calendar automatically
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bookings'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'], refetchType: 'all' }),
      ])
      console.log('✅ [useRejectBooking] All bookings queries invalidated - calendar should refresh automatically')
      
      // Send email notification
      if (areEmailNotificationsEnabled()) {
        await sendBookingRejectedEmail(booking)
      }
    },
    onError: (error: Error) => {
      console.error('❌ [useRejectBooking] Mutation error:', error)
      // Toast error già gestito nel componente
    },
  })
}

// Mutation per aggiornare una prenotazione
export const useUpdateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateBookingInput) => {
      console.log('🔵 [useUpdateBooking] Updating booking:', input.bookingId)
      console.log('🔵 [useUpdateBooking] Data:', input)
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
        confirmed_start: input.confirmedStart,
        confirmed_end: input.confirmedEnd,
        num_guests: input.numGuests,
      }

      // Update client information if provided
      if (input.client_name !== undefined) {
        updateData.client_name = input.client_name
      }
      if (input.client_email !== undefined) {
        // Permetti di salvare email vuota/null (ora che il campo è nullable)
        // Se è null, salviamo null (email cancellata)
        // Se è stringa vuota, salviamo null
        // Se è una stringa valida, salviamo quella
        updateData.client_email = input.client_email === null || input.client_email === '' 
          ? null 
          : input.client_email.trim() || null
      }
      if (input.client_phone !== undefined) {
        updateData.client_phone = input.client_phone || null
      }

      // Update booking type if provided
      if (input.booking_type !== undefined) {
        updateData.booking_type = input.booking_type
      }

      // Update desired_time if provided
      if (input.desiredTime !== undefined) {
        updateData.desired_time = input.desiredTime || null
      }

      // Update special requests if provided
      if (input.specialRequests !== undefined) {
        updateData.special_requests = input.specialRequests || null
      }
      
      // Update menu fields if provided
      if (input.menu !== undefined) {
        updateData.menu = input.menu || null
      }
      if (input.menu_selection !== undefined) {
        updateData.menu_selection = input.menu_selection || null
      }
      if (input.menu_total_per_person !== undefined) {
        updateData.menu_total_per_person = input.menu_total_per_person || null
      }
      if (input.menu_total_booking !== undefined) {
        updateData.menu_total_booking = input.menu_total_booking || null
      }
      if (input.dietary_restrictions !== undefined) {
        updateData.dietary_restrictions = input.dietary_restrictions || null
      }
      if (input.preset_menu !== undefined) {
        updateData.preset_menu = input.preset_menu || null
      }
      
      console.log('🔵 [useUpdateBooking] Update payload:', updateData)

      const { data, error } = await supabase
        .from('booking_requests')
        .update(updateData)
        .eq('id', input.bookingId)
        .select()
        .single()

      console.log('🔵 [useUpdateBooking] Supabase response:', { data, error })

      if (error) {
        console.error('❌ [useUpdateBooking] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      console.log('✅ [useUpdateBooking] Booking updated successfully:', data)
      return data as BookingRequest
    },
    onSuccess: async (data) => {
      console.log('✅ [useUpdateBooking] onSuccess triggered:', data)
      
      // Aggiorna direttamente la cache con i dati aggiornati per tutte le query che potrebbero contenere questa prenotazione
      // Usa un approccio sicuro che gestisce diversi formati di dati nella cache
      queryClient.setQueriesData(
        { queryKey: ['bookings'] },
        (oldData: any) => {
          if (!oldData) return oldData
          // Verifica che oldData sia un array
          if (Array.isArray(oldData)) {
            return oldData.map((booking: BookingRequest) => 
              booking.id === data.id ? data : booking
            )
          }
          // Se non è un array, restituisci i dati originali (potrebbe essere un oggetto o altro formato)
          return oldData
        }
      )
      
      queryClient.setQueriesData(
        { queryKey: ['bookings', 'pending'] },
        (oldData: any) => {
          if (!oldData) return oldData
          if (Array.isArray(oldData)) {
            return oldData.map((booking: BookingRequest) => 
              booking.id === data.id ? data : booking
            )
          }
          return oldData
        }
      )
      
      queryClient.setQueriesData(
        { queryKey: ['bookings', 'accepted'] },
        (oldData: any) => {
          if (!oldData) return oldData
          if (Array.isArray(oldData)) {
            return oldData.map((booking: BookingRequest) => 
              booking.id === data.id ? data : booking
            )
          }
          return oldData
        }
      )
      
      // Invalida anche le query per forzare un refetch e assicurarsi che tutto sia sincronizzato
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'] })
      console.log('✅ [useUpdateBooking] Cache updated and queries invalidated')
      toast.success('Prenotazione aggiornata con successo!')
    },
    onError: (error: Error) => {
      console.error('❌ [useUpdateBooking] onError:', error)
      toast.error(error.message || 'Errore nell\'aggiornamento della prenotazione')
    },
  })
}

// Mutation per ripristinare una prenotazione eliminata
export const useRestoreBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (bookingId: string) => {
      console.log('🔵 [useRestoreBooking] Restoring booking:', bookingId)

      const { data, error } = await supabase
        .from('booking_requests')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        console.error('❌ [useRestoreBooking] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      console.log('✅ [useRestoreBooking] Booking restored:', data)
      return data as BookingRequest
    },
    onSuccess: async () => {
      // Invalida tutte le queries per refresh automatico completo
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'] })
      console.log('✅ [useRestoreBooking] All bookings queries invalidated')
      toast.success('Prenotazione reinserita con successo!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nel reinserimento della prenotazione')
    },
  })
}

// Mutation per cancellare una prenotazione
export const useCancelBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, cancellationReason }: { bookingId: string; cancellationReason?: string }) => {
      console.log('🔵 [useCancelBooking] Cancelling booking:', bookingId)
      
      const { data, error } = await supabase
        .from('booking_requests')
        .update({
          status: 'deleted',
          cancellation_reason: cancellationReason || null,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        console.error('❌ [useCancelBooking] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      console.log('✅ [useCancelBooking] Booking cancelled:', data)
      return data as BookingRequest
    },
    onSuccess: async (booking: BookingRequest) => {
      // Invalida tutte le queries per refresh automatico completo
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'] })
      console.log('✅ [useCancelBooking] All bookings queries invalidated')
      toast.success('Prenotazione cancellata con successo!')

      // Email notification disabled for cancellation
      // No email will be sent when a booking is cancelled
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nella cancellazione della prenotazione')
    },
  })
}

