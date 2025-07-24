import { PropsWithChildren, useState } from 'react'
import { MobileHeader } from '@/Components/shop/MobileHeader'
import { BottomNavigation } from '@/Components/shop/BottomNavigation'
import { CartProvider } from '@/contexts/CartContext'

export default function ShopLayout({ children }: PropsWithChildren) {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header mobile et desktop */}
        <MobileHeader onCartClick={() => setIsCartOpen(true)} />
        
        {/* Contenu principal */}
        <main className="pb-20 md:pb-0">
          {children}
        </main>
        
        {/* Navigation bottom pour mobile uniquement */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    </CartProvider>
  )
}