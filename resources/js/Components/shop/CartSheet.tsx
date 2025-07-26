import { useCart } from '@/contexts/CartContext'
import SafeButton from '@/Components/SafeButton'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Link } from '@inertiajs/react'

export function CartSheet() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <p className="text-gray-500 mb-4">Votre panier est vide</p>
        <Link href="/">
          <SafeButton>Continuer vos achats</SafeButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Liste des produits */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Image */}
              {item.product.image_url && (
                <img 
                  src={item.product.image_url} 
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              
              {/* Détails */}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.product.name}</h4>
                <p className="text-sm font-semibold mt-1">
                  {formatPrice(item.product.effective_price || item.product.price_ttc || 0)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                {/* Quantité */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 flex items-center justify-center border rounded hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 flex items-center justify-center border rounded hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4 space-y-4">
        {/* Frais de livraison */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-800">
            Vous êtes à {formatPrice(3500 - totalAmount)} de la livraison gratuite
          </p>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-lg font-bold text-green-600">
            {formatPrice(totalAmount)}
          </span>
        </div>

        {/* Bouton checkout */}
        <Link href="/checkout" className="block">
          <SafeButton className="w-full" size="lg">
            Passer la commande ({formatPrice(totalAmount)})
          </SafeButton>
        </Link>
      </div>
    </div>
  )
}