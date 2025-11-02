import { useQuery } from '@tanstack/react-query'
import { supabasePublic } from '@/lib/supabasePublic'
import { parseBusinessHours, getDefaultBusinessHours, type BusinessHours } from '@/lib/businessHours'

/**
 * Hook to fetch business hours from restaurant_settings
 * Uses public client (anon key) for access
 * Returns default hours if settings unavailable
 */
export const useBusinessHours = () => {
  return useQuery({
    queryKey: ['restaurant_settings', 'business_hours'],
    queryFn: async (): Promise<BusinessHours> => {
      console.log('🔵 [useBusinessHours] Fetching business hours...')
      
      // @ts-ignore - Supabase types are not fully generated
      const { data, error } = await supabasePublic
        .from('restaurant_settings')
        .select('setting_value')
        .eq('setting_key', 'business_hours')
        .single()
      
      if (error) {
        console.warn('⚠️ [useBusinessHours] Error fetching settings:', error)
        console.log('🟡 [useBusinessHours] Using default hours as fallback')
        return getDefaultBusinessHours()
      }
      
      if (!data || !(data as any).setting_value) {
        console.warn('⚠️ [useBusinessHours] No business_hours setting found')
        console.log('🟡 [useBusinessHours] Using default hours as fallback')
        return getDefaultBusinessHours()
      }
      
      // Parse and validate structure
      const parsed = parseBusinessHours((data as any).setting_value)
      
      if (!parsed) {
        console.warn('⚠️ [useBusinessHours] Invalid business_hours structure')
        console.log('🟡 [useBusinessHours] Using default hours as fallback')
        return getDefaultBusinessHours()
      }
      
      console.log('✅ [useBusinessHours] Successfully loaded business hours')
      return parsed
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (hours don't change often)
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

