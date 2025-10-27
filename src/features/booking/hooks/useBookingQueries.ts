// @ts-nocheck
import { useQuery } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { BookingRequest } from '@/types/booking'

// Hook per prenotazioni pending
export const usePendingBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn: async () => {
      console.log('🔵 [usePendingBookings] Fetching pending bookings...')
      
      // Check session first
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔵 [usePendingBookings] Session:', session ? `✅ User ${session.user.email}` : '❌ No session')
      console.log('🔵 [usePendingBookings] Session token exists:', session ? !!session.access_token : false)
      console.log('🔵 [usePendingBookings] Session token preview:', session?.access_token?.substring(0, 20) || 'No token')
      
      // Use authenticated supabase client (respects RLS policies)
      const { data, error } = await supabase
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
      
      // Check session first
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔵 [useAcceptedBookings] Session:', session ? `✅ User ${session.user.email}` : '❌ No session')
      
      // Show ALL accepted bookings (past, present, and future)
      // For a restaurant calendar, we want to show historical data too
      const { data, error } = await supabase
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
      // Check session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔵 [useAllBookings] Session:', session ? `✅ User ${session.user.email}` : '❌ No session')
      
      const { data, error } = await supabase
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
      
      // Check session first  
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔵 [useBookingStats] Session:', session ? `✅ User ${session.user.email}` : '❌ No session')
      
      // Use authenticated supabase client
      const { data: allBookings, error } = await supabase
        .from('booking_requests')
        .select('id, status')

      console.log('🔵 [useBookingStats] Query result:', { data: allBookings, error })

      if (error) {
        console.error('❌ [useBookingStats] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      // Calculate stats
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const stats = {
        pending: allBookings?.filter(b => b.status === 'pending').length || 0,
        accepted: allBookings?.filter(b => b.status === 'accepted').length || 0,
        total: allBookings?.length || 0,
        totalMonth: allBookings?.filter(b => {
          const createdDate = new Date(b.created_at)
          return createdDate >= startOfMonth
        }).length || 0,
      }

      console.log('✅ [useBookingStats] Stats computed:', stats)
      return stats
    },
    refetchInterval: 30000,
  })
}

