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
import { extractTimeFromISO } from '../utils/dateUtils'

interface AcceptBookingInput {
  bookingId: string
  confirmedStart: string
  confirmedEnd: string
  desiredTime?: string // ✅ Orario inserito dal cliente (tipo TIME, senza timezone)
  numGuests?: number
  internalNotes?: string
}

interface RejectBookingInput {
  bookingId: string
  rejectionReason?: string
}

interface UpdateBookingInput {
  bookingId: string
  confirmedStart: string
  confirmedEnd: string
  numGuests: number
  specialRequests?: string
  menu?: string
  desiredTime?: string
  // New fields for complete booking details editing
  booking_type?: 'tavolo' | 'rinfresco_laurea'
  client_name?: string
  client_email?: string
  client_phone?: string
  menu_selection?: {
    items: any[]
    tiramisu_total?: number
    tiramisu_kg?: number
  }
  menu_total_per_person?: number
  menu_total_booking?: number
  dietary_restrictions?: Array<{
    restriction: string
    guest_count: number
    notes?: string
  }>
  preset_menu?: string | null
}

// Mutation per accettare una prenotazione
export const useAcceptBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcceptBookingInput) => {
      const { data, error } = await supabase
        .from('booking_requests')
        .update({
          status: 'accepted',
          confirmed_start: input.confirmedStart,
          confirmed_end: input.confirmedEnd,
          desired_time: input.desiredTime, // ✅ Preserva l'orario inserito dal cliente
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
      // Invalida tutte le queries per refresh automatico completo
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'] })
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
      console.log('✅ [useRejectBooking] Mutation successful, invalidating queries...')
      
      // Invalida tutte le queries per refresh automatico completo
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'all'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] })
      
      // Forza il refetch esplicito delle query critiche
      await queryClient.refetchQueries({ queryKey: ['bookings', 'pending'] })
      await queryClient.refetchQueries({ queryKey: ['bookings', 'stats'] })
      
      console.log('✅ [useRejectBooking] All bookings queries invalidated and refetched')
      
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

      // Client information fields
      if (input.client_name !== undefined) {
        updateData.client_name = input.client_name
      }
      if (input.client_email !== undefined) {
        updateData.client_email = input.client_email
      }
      if (input.client_phone !== undefined) {
        updateData.client_phone = input.client_phone
      }

      // Booking type
      if (input.booking_type !== undefined) {
        updateData.booking_type = input.booking_type
      }

      // Special requests and menu (legacy)
      if (input.specialRequests !== undefined) {
        updateData.special_requests = input.specialRequests
      }

      if (input.menu !== undefined) {
        updateData.menu = input.menu
      }

      // Menu selection (new system)
      if (input.menu_selection !== undefined) {
        updateData.menu_selection = input.menu_selection
      }
      if (input.menu_total_per_person !== undefined) {
        updateData.menu_total_per_person = input.menu_total_per_person
      }
      if (input.menu_total_booking !== undefined) {
        updateData.menu_total_booking = input.menu_total_booking
      }
      if (input.preset_menu !== undefined) {
        updateData.preset_menu = input.preset_menu
      }

      // Dietary restrictions
      if (input.dietary_restrictions !== undefined) {
        updateData.dietary_restrictions = input.dietary_restrictions
      }

      // Desired time
      const desiredTime =
        input.desiredTime ||
        (input.confirmedStart ? extractTimeFromISO(input.confirmedStart) : '')

      if (desiredTime) {
        updateData.desired_time = desiredTime
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
      // Invalida tutte le queries per refresh automatico completo
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'] })
      await queryClient.invalidateQueries({ queryKey: ['bookings', 'accepted'] })
      console.log('✅ [useUpdateBooking] All bookings queries invalidated')
      toast.success('Prenotazione aggiornata con successo!')
    },
    onError: (error: Error) => {
      console.error('❌ [useUpdateBooking] onError:', error)
      toast.error(error.message || 'Errore nell\'aggiornamento della prenotazione')
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
          status: 'rejected',
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
