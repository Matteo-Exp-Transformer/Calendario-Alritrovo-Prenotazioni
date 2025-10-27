// @ts-nocheck
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { supabasePublic } from '@/lib/supabasePublic'
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
  numGuests?: number
  internalNotes?: string
}

interface RejectBookingInput {
  bookingId: string
  rejectionReason?: string
}

interface UpdateBookingInput {
  bookingId: string
  confirmedStart?: string
  confirmedEnd?: string
  numGuests?: number
  specialRequests?: string
}

// Mutation per accettare una prenotazione
export const useAcceptBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcceptBookingInput) => {
      const { data, error } = await supabasePublic
        .from('booking_requests')
        .update({
          status: 'accepted',
          confirmed_start: input.confirmedStart,
          confirmed_end: input.confirmedEnd,
          num_guests: input.numGuests,
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
      // Invalida tutte le queries per refresh automatico
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      console.log('✅ [useAcceptBooking] All bookings queries invalidated')

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
      const { data, error } = await supabasePublic
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
      // Invalida tutte le queries per refresh automatico
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      console.log('✅ [useRejectBooking] All bookings queries invalidated')
      
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
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (input.confirmedStart) updateData.confirmed_start = input.confirmedStart
      if (input.confirmedEnd) updateData.confirmed_end = input.confirmedEnd
      if (input.numGuests) updateData.num_guests = input.numGuests
      if (input.specialRequests !== undefined) updateData.special_requests = input.specialRequests

      const { data, error } = await supabasePublic
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Prenotazione aggiornata con successo!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nell\'aggiornamento della prenotazione')
    },
  })
}

// Mutation per cancellare una prenotazione
export const useCancelBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, cancellationReason }: { bookingId: string; cancellationReason?: string }) => {
      const { data, error } = await supabasePublic
        .from('booking_requests')
        .update({
          status: 'cancelled',
          cancellation_reason: cancellationReason || null,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as BookingRequest
    },
    onSuccess: async (booking: BookingRequest) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Prenotazione cancellata con successo!')

      // Send email notification
      if (areEmailNotificationsEnabled()) {
        await sendBookingCancelledEmail(booking)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nella cancellazione della prenotazione')
    },
  })
}

