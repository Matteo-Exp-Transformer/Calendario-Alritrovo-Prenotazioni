// @ts-nocheck - Supabase auto-generated types
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import type { MenuItem, MenuItemInput } from '@/types/menu'
import { toast } from 'react-toastify'

// Hook for fetching all menu items
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true })

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as MenuItem[]
    }
  })
}

// Hook for fetching menu items by category
export const useMenuItemsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['menu-items', category],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as MenuItem[]
    },
    enabled: true
  })
}

// Hook for creating a new menu item
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: MenuItemInput) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: item.name,
          category: item.category,
          price: item.price,
          description: item.description || null,
          sort_order: item.sort_order || 0
        })
        .select()
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as MenuItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Prodotto aggiunto con successo')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nell\'aggiunta del prodotto')
    }
  })
}

// Hook for updating a menu item
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenuItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return data as MenuItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Prodotto aggiornato con successo')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nell\'aggiornamento del prodotto')
    }
  })
}

// Hook for deleting a menu item
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(handleSupabaseError(error))
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Prodotto eliminato con successo')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Errore nell\'eliminazione del prodotto')
    }
  })
}













