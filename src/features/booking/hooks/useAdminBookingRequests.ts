// @ts-nocheck - Supabase auto-generated types are incomplete
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { BookingRequest, BookingRequestInput } from '@/types/booking'
import { toast } from 'react-toastify'

// Hook for creating booking requests directly as ACCEPTED (admin only)
export const useCreateAdminBooking = () => {
  return useMutation({
    mutationFn: async (data: BookingRequestInput) => {
      console.log('🔵 [useCreateAdminBooking] Starting mutation...')
      console.log('🔵 [useCreateAdminBooking] Input data:', data)
      
      // Extract time from desired_time string
      const timeMatch = data.desired_time?.match(/^(\d{2}):(\d{2})/)
      const hours = timeMatch ? parseInt(timeMatch[1]) : 12
      const minutes = timeMatch ? parseInt(timeMatch[2]) : 0
      
      // Create confirmed_start datetime
      const confirmedStart = new Date(`${data.desired_date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`)
      
      // Calculate confirmed_end (add 2 hours by default)
      const confirmedEnd = new Date(confirmedStart)
      confirmedEnd.setHours(confirmedEnd.getHours() + 2)
      
      const insertData = {
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone || null,
        booking_type: data.booking_type,
        event_type: data.event_type,
        desired_date: data.desired_date,
        desired_time: data.desired_time || null,
        num_guests: data.num_guests,
        special_requests: data.special_requests || null,
        menu_selection: data.menu_selection || null,
        menu_total_per_person: data.menu_total_per_person || null,
        menu_total_booking: data.menu_total_booking || null,
        preset_menu: data.preset_menu || null,
        dietary_restrictions: data.dietary_restrictions || null,
        status: 'accepted' as const,
        confirmed_start: confirmedStart.toISOString(),
        confirmed_end: confirmedEnd.toISOString()
      }

      console.log('🔵 [useCreateAdminBooking] Insert data:', insertData)
      console.log('🔵 [useCreateAdminBooking] Calling Supabase insert...')

      // Use authenticated supabase client (admin only)
      const { data: result, error } = await supabase
        .from('booking_requests')
        .insert(insertData)
        .select()
        .single()

      console.log('🔵 [useCreateAdminBooking] Supabase response:', { result, error })

      if (error) {
        console.error('❌ [useCreateAdminBooking] Error:', error)
        throw new Error(error.message)
      }

      console.log('✅ [useCreateAdminBooking] Success! Result:', result)
      return result as BookingRequest
    },
    onError: (error: Error) => {
      console.error('Error creating admin booking:', error)
      toast.error('Errore nella creazione della prenotazione')
    }
  })
}

