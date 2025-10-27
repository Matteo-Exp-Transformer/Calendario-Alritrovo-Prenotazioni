import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface EmailLog {
  id: string
  booking_id: string | null
  email_type: string
  recipient_email: string
  status: 'sent' | 'failed' | 'pending'
  provider_response: any
  error_message: string | null
  sent_at: string
}

/**
 * Hook to fetch email logs from database
 */
export const useEmailLogs = (limit: number = 50) => {
  return useQuery({
    queryKey: ['email_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(error.message)
      }

      return data as EmailLog[]
    },
    refetchInterval: 30000, // Refetch ogni 30s
  })
}

