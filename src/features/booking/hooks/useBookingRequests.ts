// @ts-nocheck - Supabase auto-generated types are incomplete
import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { supabasePublic } from '@/lib/supabasePublic'
import type { BookingRequest, BookingRequestInput } from '@/types/booking'
import { toast } from 'react-toastify'

// Hook for creating booking requests (public)
export const useCreateBookingRequest = () => {
  return useMutation({
    mutationFn: async (data: BookingRequestInput) => {
      console.log('🔵 [useCreateBookingRequest] Starting mutation...')
      console.log('🔵 [useCreateBookingRequest] Input data:', data)
      
      const insertData = {
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone || null,
        event_type: data.event_type,
        desired_date: data.desired_date,
        desired_time: data.desired_time || null,
        num_guests: data.num_guests,
        special_requests: data.special_requests || null,
        status: 'pending' as const
      }

      console.log('🔵 [useCreateBookingRequest] Insert data:', insertData)
      console.log('🔵 [useCreateBookingRequest] Calling Supabase insert...')

      // Use public client to bypass RLS
      console.log('🔵 [useCreateBookingRequest] Using supabasePublic client...')

      // @ts-ignore - Supabase types are not fully generated
      const { data: result, error } = await supabasePublic
        .from('booking_requests')
        .insert(insertData)
        .select()
        .single()

      console.log('🔵 [useCreateBookingRequest] Supabase response:', { result, error })

      if (error) {
        console.error('❌ [useCreateBookingRequest] Error:', error)
        console.error('❌ [useCreateBookingRequest] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(handleSupabaseError(error))
      }

      console.log('✅ [useCreateBookingRequest] Success! Result:', result)
      return result as BookingRequest
    },
    onSuccess: () => {
      toast.success('Richiesta inviata con successo! Ti contatteremo a breve.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nell\'invio della richiesta')
    }
  })
}

// Hook for admin: fetch all booking requests
export const useBookingRequests = (status?: 'pending' | 'accepted' | 'rejected') => {
  return useQuery({
    queryKey: ['booking-requests', status],
    queryFn: async () => {
      let query = supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as BookingRequest[]
    }
  })
}

// Hook for admin: update booking status
export const useUpdateBookingStatus = () => {
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      confirmed_start, 
      confirmed_end,
      rejection_reason 
    }: {
      id: string
      status: 'accepted' | 'rejected'
      confirmed_start?: string
      confirmed_end?: string
      rejection_reason?: string
    }) => {
      const updateData: any = {
        status
      }

      if (confirmed_start) updateData.confirmed_start = confirmed_start
      if (confirmed_end) updateData.confirmed_end = confirmed_end
      if (rejection_reason) updateData.rejection_reason = rejection_reason

      // @ts-ignore - Supabase types are not fully generated
      const { data, error } = await supabase
        .from('booking_requests')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as BookingRequest
    },
    onSuccess: () => {
      toast.success('Stato aggiornato con successo')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nell\'aggiornamento')
    }
  })
}

