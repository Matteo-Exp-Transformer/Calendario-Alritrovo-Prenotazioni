// @ts-nocheck
import { useQuery } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { BookingRequest } from '@/types/booking'

// Hook per prenotazioni pending
export const usePendingBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

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
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('status', 'accepted')
        .gte('confirmed_end', new Date().toISOString()) // Solo future
        .order('confirmed_start', { ascending: true })

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

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
      const [pendingResult, acceptedResult, totalResult] = await Promise.all([
        supabase.from('booking_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('booking_requests').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('booking_requests').select('id', { count: 'exact', head: true }),
      ])

      const stats = {
        pending: pendingResult.count || 0,
        accepted: acceptedResult.count || 0,
        total: totalResult.count || 0,
      }

      // Handle errors
      if (pendingResult.error) throw pendingResult.error
      if (acceptedResult.error) throw acceptedResult.error
      if (totalResult.error) throw totalResult.error

      return stats
    },
    refetchInterval: 30000,
  })
}

