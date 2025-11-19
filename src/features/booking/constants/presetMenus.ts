/**
 * Menu Predefiniti per Rinfresco di Laurea
 * 
 * Definizioni dei menu predefiniti che possono essere selezionati
 * dall'admin per velocizzare la creazione di prenotazioni.
 */

export type PresetMenuType = 'menu_1' | 'menu_2' | 'menu_3' | 'menu_4' | null

export interface PresetMenu {
  id: Exclude<PresetMenuType, null>
  label: string
  itemNames: string[] // Nomi esatti degli items come nel database
}

/**
 * Menù 1: Base
 * Caraffe drink + Pizza Margherita
 */
export const MENU_1: PresetMenu = {
  id: 'menu_1',
  label: 'Menù 1 Rinfresco Leggero',
  itemNames: [
    'Caraffe drink',
    'Pizza Margherita'
  ]
}

/**
 * Menù 2: Medio
 * Caraffe drink + Pizza Margherita + Farinata + Olive Ascolana + Anelli di Cipolla + Patatine Fritte
 */
export const MENU_2: PresetMenu = {
  id: 'menu_2',
  label: 'Menù 2 Rinfresco Completo',
  itemNames: [
    'Caraffe drink',
    'Pizza Margherita',
    'Farinata',
    'Olive Ascolana',
    'Anelli di Cipolla',
    'Patatine fritte'
  ]
}

/**
 * Menù 3: Completo
 * Menù 2 + Cannelloni Ricotta e Spinaci
 */
export const MENU_3: PresetMenu = {
  id: 'menu_3',
  label: 'Menù 3 Pranzo o Cena',
  itemNames: [
    'Caraffe drink',
    'Pizza Margherita',
    'Farinata',
    'Anelli di Cipolla',
    'Patatine fritte',
    'Olive Ascolana',
    'Cannelloni Ricotta e Spinaci'
  ]
}

/**
 * Menù 4: Gourmet
 * Caraffe Premium + Panelle + Camembert + Lasagne Ragù + Polpette vegane di Lenticchie e Curry + Cannoli siciliani
 */
export const MENU_4: PresetMenu = {
  id: 'menu_4',
  label: 'Menù 4 Gourmet',
  itemNames: [
    'Caraffe Premium',
    'Panelle',
    'Camembert',
    'Lasagne Ragù',
    'Polpette vegane di Lenticchie e Curry',
    'Cannoli siciliani'
  ]
}

/**
 * Mappa di tutti i menu predefiniti (senza null)
 */
export const PRESET_MENUS: Record<Exclude<PresetMenuType, null>, PresetMenu> = {
  menu_1: MENU_1,
  menu_2: MENU_2,
  menu_3: MENU_3,
  menu_4: MENU_4
}

/**
 * Array di menu predefiniti disponibili
 */
export const PRESET_MENUS_ARRAY: PresetMenu[] = [MENU_1, MENU_2, MENU_3, MENU_4]

/**
 * Helper per ottenere un preset menu per tipo
 */
export const getPresetMenu = (type: PresetMenuType): PresetMenu | null => {
  if (!type) return null
  return PRESET_MENUS[type] || null
}

/**
 * Helper per ottenere label di un preset menu
 */
export const getPresetMenuLabel = (type: PresetMenuType): string => {
  if (!type) return 'Scegli un menu predefinito'
  return PRESET_MENUS[type].label || 'Menu Sconosciuto'
}
