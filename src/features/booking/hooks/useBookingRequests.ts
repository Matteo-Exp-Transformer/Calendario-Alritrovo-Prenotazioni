// @ts-nocheck - Supabase auto-generated types are incomplete
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { supabasePublic } from '@/lib/supabasePublic'
import type { BookingRequest, BookingRequestInput } from '@/types/booking'
import { toast } from 'react-toastify'

// Lock globale per prevenire chiamate multiple simultanee alla mutation
// Usa un lock atomico con ID univoco per prevenire race conditions
let mutationLockId: string | null = null
let mutationLockTimeout: NodeJS.Timeout | null = null
const MUTATION_LOCK_TIMEOUT = 10000 // 10 secondi

// Funzione atomica per acquisire il lock della mutation
const acquireMutationLock = (): string | null => {
  const now = Date.now()
  const lockId = `${now}-${Math.random().toString(36).substring(2, 9)}`
  
  // Se c'è già un lock valido, fallisci
  if (mutationLockId) {
    console.warn('⚠️ [useCreateBookingRequest] Mutation lock già presente:', mutationLockId)
    return null
  }
  
  // Acquisisci lock
  mutationLockId = lockId
  
  // Imposta timeout di sicurezza
  if (mutationLockTimeout) {
    clearTimeout(mutationLockTimeout)
  }
  mutationLockTimeout = setTimeout(() => {
    console.log('⏰ [useCreateBookingRequest] Lock timeout scaduto, rilasciando lock')
    mutationLockId = null
    mutationLockTimeout = null
  }, MUTATION_LOCK_TIMEOUT)
  
  console.log('✅ [useCreateBookingRequest] Mutation lock ACQUISITO:', lockId)
  return lockId
}

const releaseMutationLock = (lockId: string | null) => {
  if (!lockId || mutationLockId !== lockId) {
    console.warn('⚠️ [useCreateBookingRequest] Tentativo di rilasciare lock non valido:', {
      provided: lockId,
      current: mutationLockId
    })
    return
  }
  
  if (mutationLockTimeout) {
    clearTimeout(mutationLockTimeout)
    mutationLockTimeout = null
  }
  
  mutationLockId = null
  console.log('✅ [useCreateBookingRequest] Mutation lock rilasciato:', lockId)
}

// Contatore globale per tracciare chiamate alla mutation (debug)
let mutationCallCount = 0
const mutationCallTracker: Array<{ timestamp: number; lockId: string | null; success: boolean }> = []

// Hook for creating booking requests (public - needs to use ANON key)
export const useCreateBookingRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    // Disabilita retry per prevenire chiamate multiple automatiche
    retry: false,
    mutationFn: async (data: BookingRequestInput) => {
      // Traccia chiamata
      mutationCallCount++
      const callTimestamp = Date.now()
      
      console.log(`🚨 [useCreateBookingRequest] ========== MUTATION CALL #${mutationCallCount} ==========`)
      console.log(`🚨 [useCreateBookingRequest] Timestamp: ${callTimestamp}`)
      console.log(`🚨 [useCreateBookingRequest] Stack:`, new Error().stack?.split('\n').slice(1, 6).join('\n'))
      
      // ✅ Protezione atomica a livello di mutation
      const lockId = acquireMutationLock()
      
      console.log(`🚨 [useCreateBookingRequest] Lock acquisition:`, lockId ? `✅ ACQUIRED ${lockId.substring(0, 20)}` : '❌ FAILED')
      
      if (!lockId) {
        mutationCallTracker.push({ timestamp: callTimestamp, lockId: null, success: false })
        console.error('❌ [useCreateBookingRequest] Impossibile acquisire lock, mutation già in corso')
        console.error('❌ [useCreateBookingRequest] Current lock:', mutationLockId)
        console.error('❌ [useCreateBookingRequest] Recent calls:', mutationCallTracker.slice(-5))
        throw new Error('Una richiesta è già in corso. Attendi qualche secondo.')
      }
      
      try {
        console.log('🔵 [useCreateBookingRequest] Starting mutation with lock:', lockId.substring(0, 20))
        console.log('🔵 [useCreateBookingRequest] Input data:', data)
        
        // Normalizza desired_time a formato HH:MM (rimuove secondi se presenti)
        const normalizedTime = data.desired_time 
          ? data.desired_time.split(':').slice(0, 2).join(':')
          : null

        const insertData: any = {
          client_name: data.client_name,
          client_email: data.client_email,
          client_phone: data.client_phone || null,
          desired_date: data.desired_date,
          desired_time: normalizedTime,
          num_guests: data.num_guests,
          special_requests: data.special_requests || null,
          booking_source: 'public',
          status: 'pending' as const
        }

        // Nuovi campi per sistema menu
        if (data.booking_type) {
          insertData.booking_type = data.booking_type
        }

        // Retrocompatibilità: se event_type esiste, lo manteniamo
        if (data.event_type) {
          insertData.event_type = data.event_type
        }

        // Menu selection (solo per rinfresco_laurea)
        if (data.booking_type === 'rinfresco_laurea' && data.menu_selection) {
          insertData.menu_selection = data.menu_selection
          insertData.menu_total_per_person = data.menu_total_per_person || 0
          insertData.menu_total_booking = data.menu_total_booking || 0
        }

        // Dietary restrictions
        // IMPORTANTE: I guest_count nelle intolleranze sono separati da num_guests.
        // num_guests è il totale ospiti della prenotazione (calcolo capacità, ecc.)
        // I guest_count nelle intolleranze servono solo per associare quante persone hanno quella specifica intolleranza.
        // NON vengono sommati al totale.
        if (data.dietary_restrictions && data.dietary_restrictions.length > 0) {
          insertData.dietary_restrictions = data.dietary_restrictions
        }

        // Traccia questo tentativo di insert
        const insertAttemptId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        
        console.log('🔵 [useCreateBookingRequest] ========== INSERT ATTEMPT START ==========')
        console.log('🔵 [useCreateBookingRequest] Insert attempt ID:', insertAttemptId)
        console.log('🔵 [useCreateBookingRequest] Lock ID:', lockId)
        console.log('🔵 [useCreateBookingRequest] Insert data:', {
          client_name: insertData.client_name,
          desired_date: insertData.desired_date,
          desired_time: insertData.desired_time,
          num_guests: insertData.num_guests
        })

        // Use supabasePublic client (ANON key) for public form submissions
        // This respects the INSERT policy for anon role
        console.log('🔵 [useCreateBookingRequest] Calling Supabase insert...')

        // ⚠️ CRITICO: Verifica lock PRIMA di inserire
        if (mutationLockId !== lockId) {
          console.error('❌ [useCreateBookingRequest] Lock perso! Lock ID non corrisponde:', {
            expected: lockId,
            current: mutationLockId,
            insertAttemptId
          })
          throw new Error('Lock perso durante l\'inserimento - possibile doppio submit')
        }

        console.log('🔵 [useCreateBookingRequest] Lock verificato, procedendo con INSERT...')
        console.log('🔵 [useCreateBookingRequest] Current lock state:', mutationLockId)

        // @ts-ignore - Supabase types are not fully generated
        const { data: result, error } = await supabasePublic
          .from('booking_requests')
          .insert(insertData)
          .select()
          .single()
        
        console.log('🔵 [useCreateBookingRequest] INSERT eseguito, verificando lock...')
        
        // Verifica lock DOPO l'insert per assicurarsi che non sia cambiato
        if (mutationLockId !== lockId) {
          console.error('❌ [useCreateBookingRequest] Lock cambiato durante INSERT!', {
            expected: lockId,
            current: mutationLockId,
            insertAttemptId
          })
        }

        console.log('🔵 [useCreateBookingRequest] Supabase INSERT completato')
        console.log('🔵 [useCreateBookingRequest] Response:', { 
          result: result ? { id: result.id, client_name: result.client_name } : null, 
          error: error ? { message: error.message, code: error.code } : null 
        })

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

        console.log('✅ [useCreateBookingRequest] Success! Result ID:', result?.id)
        console.log(`🚨 [useCreateBookingRequest] ========== MUTATION CALL #${mutationCallCount} COMPLETED ==========`)
        
        mutationCallTracker.push({ timestamp: Date.now(), lockId, success: true })
        
        // Rilascia lock immediatamente dopo successo
        releaseMutationLock(lockId)
        
        return result as BookingRequest
      } catch (error) {
        console.error(`❌ [useCreateBookingRequest] ========== MUTATION CALL #${mutationCallCount} FAILED ==========`)
        mutationCallTracker.push({ timestamp: Date.now(), lockId, success: false })
        
        // Rilascia lock in caso di errore
        releaseMutationLock(lockId)
        throw error
      }
    },
    onSuccess: async () => {
      // Invalida le query per refresh automatico (non blocca se admin non è loggato)
      try {
        await queryClient.invalidateQueries({ queryKey: ['bookings', 'pending'] })
        await queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] })
        console.log('✅ [useCreateBookingRequest] Queries invalidated')
      } catch (error) {
        // Non critico se fallisce (ad esempio se admin non è loggato)
        console.warn('⚠️ [useCreateBookingRequest] Query invalidation failed (non critico):', error)
      }
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

