// ============================================================================
// PRODUCT EXPIRY MODAL - Gestione Scadenze Prodotti
// ============================================================================
// Modal per gestire scadenze prodotti:
// - Mostra dettagli prodotto
// - Azioni: Consumare/Cucinare | Smaltire
// - Update products.status
// - Insert product_expiry_completions

import { useState } from 'react'
import { X, ChefHat, Trash2, Package, Calendar, MapPin, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'react-toastify'
import type { Product } from '@/types/inventory'

interface ProductExpiryModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export const ProductExpiryModal = ({
  product,
  isOpen,
  onClose,
  onComplete
}: ProductExpiryModalProps) => {
  const { user, companyId } = useAuth()
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  // Calcola giorni alla scadenza
  const expiryDate = product.expiry_date ? new Date(product.expiry_date) : null
  const now = new Date()
  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const isExpired = daysUntilExpiry < 0
  const isExpiringToday = daysUntilExpiry === 0
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 3

  const handleAction = async (action: 'expired' | 'waste') => {
    if (!companyId || !user) {
      toast.error('Errore: utente non autenticato')
      return
    }

    setIsProcessing(true)

    try {
      // 1. Update product status
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          status: action,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .eq('company_id', companyId)

      if (updateError) throw updateError

      // 2. Insert product_expiry_completion
      const { error: insertError } = await supabase
        .from('product_expiry_completions')
        .insert({
          company_id: companyId,
          product_id: product.id,
          completed_by: user.id,
          action: action,
          notes: notes || null,
        })

      if (insertError) throw insertError

      // 3. Success
      const actionLabel = action === 'expired' ? 'consumato/cucinato' : 'smaltito'
      toast.success(`✅ Prodotto ${actionLabel} con successo!`)
      
      onComplete()
      onClose()
    } catch (error) {
      console.error('Errore completamento scadenza:', error)
      toast.error('❌ Impossibile completare l\'azione')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isExpired ? 'bg-red-100' :
              isExpiringToday ? 'bg-orange-100' :
              isExpiringSoon ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              <Package className={`h-6 w-6 ${
                isExpired ? 'text-red-600' :
                isExpiringToday ? 'text-orange-600' :
                isExpiringSoon ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Gestione Scadenza Prodotto
              </h2>
              <p className="text-sm text-gray-500">
                {isExpired ? '🔴 Prodotto scaduto' :
                 isExpiringToday ? '🟠 Scade oggi' :
                 isExpiringSoon ? '🟡 In scadenza' :
                 '🔵 In scadenza'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Alert Scadenza */}
          {(isExpired || isExpiringToday || isExpiringSoon) && (
            <div className={`p-4 rounded-lg border-2 ${
              isExpired ? 'bg-red-50 border-red-300' :
              isExpiringToday ? 'bg-orange-50 border-orange-300' :
              'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  isExpired ? 'text-red-600' :
                  isExpiringToday ? 'text-orange-600' :
                  'text-yellow-600'
                }`} />
                <div>
                  <p className={`font-semibold ${
                    isExpired ? 'text-red-800' :
                    isExpiringToday ? 'text-orange-800' :
                    'text-yellow-800'
                  }`}>
                    {isExpired ? 'Prodotto scaduto!' :
                     isExpiringToday ? 'Il prodotto scade oggi!' :
                     `Il prodotto scade tra ${daysUntilExpiry} giorni`}
                  </p>
                  <p className={`text-sm mt-1 ${
                    isExpired ? 'text-red-700' :
                    isExpiringToday ? 'text-orange-700' :
                    'text-yellow-700'
                  }`}>
                    Decidi se consumare/cucinare o smaltire il prodotto
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dettagli Prodotto */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
              {product.supplier_name && (
                <p className="text-sm text-gray-600">Fornitore: {product.supplier_name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantità */}
              {product.quantity && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Quantità</p>
                  <p className="text-sm text-gray-900">
                    {product.quantity} {product.unit || 'pz'}
                  </p>
                </div>
              )}

              {/* Data Scadenza */}
              {expiryDate && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Data Scadenza</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">
                      {expiryDate.toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              )}

              {/* Categoria */}
              {product.category_name && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Categoria</p>
                  <p className="text-sm text-gray-900">{product.category_name}</p>
                </div>
              )}

              {/* Reparto */}
              {product.department_name && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Reparto</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900">{product.department_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Punto Conservazione */}
            {product.conservation_point_name && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Punto di Conservazione</p>
                <p className="text-sm text-gray-900">{product.conservation_point_name}</p>
              </div>
            )}

            {/* Note Prodotto */}
            {product.notes && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Note</p>
                <p className="text-sm text-gray-700">{product.notes}</p>
              </div>
            )}
          </div>

          {/* Note Completamento */}
          <div>
            <Label>Note (opzionale)</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Es: Utilizzato per preparazione menu del giorno..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Azioni */}
          <div className="grid grid-cols-2 gap-4">
            {/* Consumare/Cucinare */}
            <Button
              onClick={() => handleAction('expired')}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <ChefHat className="h-5 w-5 mr-2" />
              {isProcessing ? 'Elaborazione...' : 'Consumare/Cucinare'}
            </Button>

            {/* Smaltire */}
            <Button
              onClick={() => handleAction('waste')}
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {isProcessing ? 'Elaborazione...' : 'Smaltire'}
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Come funziona:</strong>
            </p>
            <ul className="mt-2 text-xs text-blue-700 space-y-1">
              <li>• <strong>Consumare/Cucinare</strong>: Il prodotto sarà segnato come "Esaurito" (utilizzato)</li>
              <li>• <strong>Smaltire</strong>: Il prodotto sarà segnato come "Smaltito" (scarto)</li>
              <li>• L'evento scadenza sarà automaticamente completato nel calendario</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
            disabled={isProcessing}
          >
            Annulla
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductExpiryModal

