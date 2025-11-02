// Type definitions for Menu Items

export type MenuCategory = 'bevande' | 'antipasti' | 'fritti' | 'primi' | 'secondi'

export interface MenuItem {
  id: string
  created_at: string
  updated_at: string
  name: string
  category: MenuCategory
  price: number
  description?: string
  sort_order: number
}

export interface MenuItemInput {
  name: string
  category: MenuCategory
  price: number
  description?: string
  sort_order?: number
}

// Dietary restriction types
export const DIETARY_RESTRICTIONS = [
  'No Lattosio',
  'Vegano',
  'Vegetariano',
  'No Glutine',
  'No Frutta secca',
  'Altro'
] as const

export type DietaryRestrictionType = typeof DIETARY_RESTRICTIONS[number]







