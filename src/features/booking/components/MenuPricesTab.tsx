import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '../hooks/useMenuItems'
import type { MenuItem, MenuItemInput, MenuCategory } from '@/types/menu'

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  bevande: 'Bevande',
  pizza: 'Pizza',
  antipasti: 'Antipasti',
  fritti: 'Fritti',
  primi: 'Primi Piatti',
  secondi: 'Secondi Piatti',
  dolci: 'Dolci'
}

export const MenuPricesTab: React.FC = () => {
  const { data: menuItems = [], isLoading } = useMenuItems()
  const createMutation = useCreateMenuItem()
  const updateMutation = useUpdateMenuItem()
  const deleteMutation = useDeleteMenuItem()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<MenuItemInput>({
    name: '',
    category: 'bevande',
    price: 0,
    description: '',
    sort_order: 0
  })

  // Raggruppa per categoria
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<MenuCategory, MenuItem[]>)

  const handleStartEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || '',
      sort_order: item.sort_order
    })
    setIsAdding(false)
  }

  const handleStartAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setFormData({
      name: '',
      category: 'bevande',
      price: 0,
      description: '',
      sort_order: 0
    })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      name: '',
      category: 'bevande',
      price: 0,
      description: '',
      sort_order: 0
    })
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Il nome è obbligatorio')
      return
    }
    if (formData.price < 0) {
      alert('Il prezzo non può essere negativo')
      return
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData })
    } else {
      createMutation.mutate(formData)
    }

    handleCancel()
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Caricamento menu...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-warm-wood mb-2">
            Gestione Prezzi Menu
          </h2>
          <p className="text-gray-600">
            Aggiungi, modifica o elimina i prodotti del menu e i loro prezzi
          </p>
        </div>
        <Button
          variant="solid"
          size="lg"
          onClick={handleStartAdd}
          className="bg-gradient-to-r from-warm-wood to-warm-wood-dark"
        >
          <Plus className="h-5 w-5 mr-2" />
          Aggiungi Prodotto
        </Button>
      </div>

      {/* Form Aggiunta/Modifica */}
      {(isAdding || editingId) && (
        <div className="bg-gradient-to-br from-warm-cream/50 to-warm-beige/30 rounded-2xl p-6 border-2 border-warm-beige shadow-lg">
          <h3 className="text-xl font-bold text-warm-wood mb-4">
            {editingId ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Prodotto *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="es: Pizza Margherita"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const category = e.target.value as MenuCategory
                  setFormData({
                    ...formData,
                    category
                  })
                }}
                className="flex rounded-full border bg-white/50 backdrop-blur-[6px] shadow-sm transition-all text-gray-600 w-full"
                style={{ 
                  borderColor: 'rgba(0,0,0,0.2)', 
                  height: '56px',
                  padding: '16px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(6px)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8B6914'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prezzo (€) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="es: 4.50"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione (opzionale)
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="es: 2 tranci a persona"
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-warm-wood to-warm-wood-dark text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-warm-wood/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {editingId ? 'Salva Modifiche' : 'Aggiungi'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 border-2 border-warm-wood text-warm-wood font-semibold rounded-xl transition-all duration-300 hover:bg-warm-wood hover:text-white focus:outline-none focus:ring-4 focus:ring-warm-wood/30"
            >
              <X className="h-4 w-4" />
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Lista Prodotti per Categoria */}
      {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
        const items = itemsByCategory[category as MenuCategory] || []
        if (items.length === 0 && !isAdding && !editingId) return null

        return (
          <div key={category} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-warm-wood to-warm-wood-dark px-6 py-4">
              <h3 className="text-xl font-serif font-bold text-white">{label}</h3>
            </div>
            <div className="p-6">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessun prodotto in questa categoria</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <span className="text-lg font-bold text-warm-wood">
                            €{item.price.toFixed(2)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-2 border-2 border-warm-wood text-warm-wood rounded-lg hover:bg-warm-wood hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-warm-wood/30"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-2 border-2 border-terracotta text-terracotta rounded-lg hover:bg-terracotta hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-terracotta/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
