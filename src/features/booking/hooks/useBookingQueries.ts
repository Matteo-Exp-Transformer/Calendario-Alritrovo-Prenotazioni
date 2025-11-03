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
      // ✅ IMPORTANTE: Selezioniamo tutti i campi incluso desired_time per preservare l'orario originale
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*') // Include tutti i campi incluso desired_time
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
      
      // Use authenticated supabase client - fetch confirmed_start for accepted bookings
      const { data: allBookings, error } = await supabase
        .from('booking_requests')
        .select('id, status, confirmed_start')

      console.log('🔵 [useBookingStats] Query result:', { data: allBookings, error })

      if (error) {
        console.error('❌ [useBookingStats] Error:', error)
        throw new Error(handleSupabaseError(error))
      }

      // Calculate stats
      const now = new Date()
      
      // Calculate start and end of current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)
      
      // Calculate start of week (Monday)
      const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Adjust for Monday = 0
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - daysToMonday)
      startOfWeek.setHours(0, 0, 0, 0)
      
      // Calculate end of week (Sunday)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      // Calculate start and end of today
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      
      // Filter bookings based on confirmed_start date for accepted bookings
      // Use confirmed_start for accepted bookings to show when bookings actually happen
      const acceptedBookings = allBookings?.filter(b => b.status === 'accepted') || []
      
      // Helper to extract date from ISO string to avoid timezone issues
      const getBookingDate = (confirmedStart: string | null): Date | null => {
        if (!confirmedStart) return null
        // Extract date directly from ISO string to avoid timezone conversion
        const dateMatch = confirmedStart.match(/(\d{4})-(\d{2})-(\d{2})/)
        if (!dateMatch) return null
        
        // Create date in local timezone using the extracted date components
        const year = parseInt(dateMatch[1])
        const month = parseInt(dateMatch[2]) - 1 // JS months are 0-indexed
        const day = parseInt(dateMatch[3])
        
        return new Date(year, month, day)
      }
      
      const stats = {
        pending: allBookings?.filter(b => b.status === 'pending').length || 0,
        accepted: acceptedBookings.length,
        rejected: allBookings?.filter(b => b.status === 'rejected').length || 0,
        total: allBookings?.length || 0,
        totalMonth: acceptedBookings.filter(b => {
          const bookingDate = getBookingDate(b.confirmed_start)
          if (!bookingDate) return false
          return bookingDate >= startOfMonth && bookingDate <= endOfMonth
        }).length,
        totalWeek: acceptedBookings.filter(b => {
          const bookingDate = getBookingDate(b.confirmed_start)
          if (!bookingDate) return false
          return bookingDate >= startOfWeek && bookingDate <= endOfWeek
        }).length,
        totalDay: acceptedBookings.filter(b => {
          const bookingDate = getBookingDate(b.confirmed_start)
          if (!bookingDate) return false
          return bookingDate >= startOfDay && bookingDate <= endOfDay
        }).length,
      }

      console.log('✅ [useBookingStats] Stats computed:', stats)
      return stats
    },
    refetchInterval: 30000,
  })
}

