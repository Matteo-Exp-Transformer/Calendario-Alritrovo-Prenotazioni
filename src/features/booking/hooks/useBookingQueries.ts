// @ts-nocheck
import { useQuery } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { supabasePublic } from '@/lib/supabasePublic'
import type { BookingRequest } from '@/types/booking'

// Hook per prenotazioni pending
export const usePendingBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn: async () => {
      console.log('🔵 [usePendingBookings] Fetching pending bookings...')
      
      // TEMP: Use supabasePublic to bypass RLS until we fix the policy
      const { data, error } = await supabasePublic
        .from('booking_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      console.log('🔵 [usePendingBookings] Query result:', { data, error, count: data?.length })

      if (error) {
        console.error('❌ [usePendingBookings] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      console.log('✅ [usePendingBookings] Returning', data?.length, 'bookings')
      return data as BookingRequest[]
    },
    refetchInterval: 30000, // Refetch ogni 30s
  })
}

// Hook per prenotazioni accettate (per calendario)
export const useAcceptedBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'accepted'],
    queryFn: async () => {
      console.log('🔵 [useAcceptedBookings] Fetching accepted bookings...')
      
      // Show ALL accepted bookings (past, present, and future)
      // For a restaurant calendar, we want to show historical data too
      const { data, error } = await supabasePublic
        .from('booking_requests')
        .select('*')
        .eq('status', 'accepted')
        .order('confirmed_start', { ascending: true })

      console.log('🔵 [useAcceptedBookings] Query result:', { 
        data, 
        error, 
        count: data?.length
      })

      if (error) {
        console.error('❌ [useAcceptedBookings] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      console.log('✅ [useAcceptedBookings] Returning', data?.length, 'accepted bookings')
      return data as BookingRequest[]
    },
    refetchInterval: 60000, // Refetch ogni minuto
  })
}

// Hook per archivio (tutte le prenotazioni)
export const useAllBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: async () => {
      const { data, error } = await supabasePublic
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as BookingRequest[]
    },
    refetchInterval: 60000,
  })
}

// Hook per statistiche
export const useBookingStats = () => {
  return useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: async () => {
      console.log('🔵 [useBookingStats] Fetching stats...')
      
      // TEMP: Use supabasePublic to bypass RLS until we fix the policy
      const { data: allBookings, error } = await supabasePublic
        .from('booking_requests')
        .select('id, status')

      console.log('🔵 [useBookingStats] Query result:', { data: allBookings, error })

      if (error) {
        console.error('❌ [useBookingStats] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      const stats = {
        pending: allBookings?.filter(b => b.status === 'pending').length || 0,
        accepted: allBookings?.filter(b => b.status === 'accepted').length || 0,
        total: allBookings?.length || 0,
      }

      console.log('✅ [useBookingStats] Stats computed:', stats)
      return stats
    },
    refetchInterval: 30000,
  })
}

